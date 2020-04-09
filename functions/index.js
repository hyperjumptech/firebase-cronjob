const admin = require('firebase-admin');
const functions = require('firebase-functions');

const task = require('./task');

exports.ping = functions.https.onRequest((request, response) => {
    response.send(`OK ${Date.now()}`);
});

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

exports.showJobCounter = functions.https.onRequest(async (request, response) => {
    try {
        var doc = await db.collection('jobConfig').doc('counter').get();
        var counter = doc.data().value;
        console.log(`Counter is ${counter}`);
        response.send(`Counter is ${counter}`);
    } catch (err) {
        console.error(`Failed to obtain the counter: ${err.toString()}`);
        response.send(`EXCEPTION: ${err.toString()}`);
    }
});

async function incrementJobCounter() {
    let counter = 0;
    const doc = await db.collection('jobConfig').doc('counter').get();
    if (doc.data()) {
        counter = doc.data().value;
        ++counter;
    } else {
        console.log('Counter does not exist yet.');
    }
    const data = {
        value: counter,
        timestamp: Date.now(),
    };
    await db.collection('jobConfig').doc('counter').set(data);
    console.log(`Increment counter to ${counter}`);
    return counter;
}

exports.incrementJobCounter = functions.https.onRequest(async (request, response) => {
    try {
        const counter = await incrementJobCounter();
        response.send(`Counter is now ${counter}`);
    } catch (err) {
        console.error(`Failed to increment the counter: ${err.toString()}`);
        response.send(`EXCEPTION: ${err.toString()}`);
    }
});

const JOB_PERIOD = 1; // minute

exports.autoIncrementJobCounter = functions.pubsub.schedule(`every ${JOB_PERIOD} minutes`).onRun(incrementJobCounter);

exports.addJobConfig = functions.https.onRequest(async (request, response) => {
    try {
        let config = request.query;
        if (!config || Object.keys(config).length === 0) {
            console.log('Adding a sample job config...');
            config = {
                task: 'ConvertCase',
                period: 30,
                input: 'Hello, world!',
            };
        }
        await db.collection('jobConfig').add(config);
        console.log(`added: ${JSON.stringify(config)}`);
        response.send(`added: ${JSON.stringify(config)}`);
    } catch (err) {
        console.error(`Failed to add example job: ${err.toString()}`);
        response.send(`EXCEPTION: ${err.toString()}`);
    }
});

exports.generateQueues = functions.firestore.document('jobConfig/counter').onUpdate(async (change, context) => {
    try {
        const counter = (await change.after.ref.get()).data().value;
        console.log(`Job counter is ${counter}`);
        const docIds = [];
        const allJobs = await db.collection('jobConfig').get();
        allJobs.forEach((doc) => {
            if (doc.id !== 'counter') docIds.push(doc.id);
        });
        await Promise.all(
            docIds.map(async (id) => {
                const doc = await db.collection('jobConfig').doc(id).get();
                const job = doc.data();
                const period = job.period;
                if (counter % job.period === 0) {
                    console.log(`Queueing ${job.task} (${period} mins)`);
                    const queue = {
                        jobId: doc.id,
                        timestamp: Date.now(),
                        index: counter / job.period,
                    };
                    return db.collection('jobQueues').add(queue);
                }
            })
        );
    } catch (err) {
        console.error(`Failed to generate new queue: ${err.toString()}`);
    }
});

exports.runJob = functions.firestore.document('jobQueues/{id}').onCreate(async (snap, context) => {
    try {
        const queue = snap.data();
        const doc = await db.collection('jobConfig').doc(queue.jobId).get();
        const config = doc.data();
        config.timeout = config.timeout || 5 * 60;
        let result;
        const now = Date.now();
        switch (config.task) {
            case 'ConvertCase':
                result = await task.convertCase(config.input);
                break;
            default:
                throw new Error(`Unknown task ${config.task}`);
        }
        const elapsed = Date.now() - now;
        const run = {
            jobId: queue.jobId,
            index: queue.index,
            timestamp: Date.now(),
            elapsed: elapsed,
            result: result,
        };
        console.log(`new run: ${JSON.stringify(run)}`);
        await db.collection('jobRuns').add(run);
        db.collection('jobQueues').doc(context.params.id).delete();
    } catch (err) {
        console.error(`Failed to run job: ${err.toString()}`);
    }
});

// ----- for running in the emulators only

const { PubSub } = require('@google-cloud/pubsub');
const pubsub = new PubSub();

const inEmulators = process.env.FUNCTIONS_EMULATOR === 'true';

async function triggerScheduledIncrementJobCounter() {
    const topic = 'firebase-schedule-autoIncrementJobCounter';
    try {
        console.log(`Emulated pubsub: trigger topic ${topic}`);
        await pubsub.topic(topic).publishJSON({});
    } catch (err) {
        console.log(`Emulated pubsub: ERROR triggering topic ${topic}`);
    }
}

if (inEmulators) {
    console.log('------- RUNNING IN EMULATOR -------');
    console.log('PubSub scheduled is emulated with setInterval');
    const intervalInMs = JOB_PERIOD * 60 * 1000;
    setInterval(triggerScheduledIncrementJobCounter, intervalInMs);
}

// convenient for integration test, so there is no need to wait for a long time
exports.triggerScheduledIncrementJobCounter = functions.https.onRequest(async (request, response) => {
    if (inEmulators) {
        await triggerScheduledIncrementJobCounter();
        response.send('triggered');
    } else {
        response.send('ERROR: usable only in emulators');
    }
});

exports.showQueueLength = functions.https.onRequest(async (request, response) => {
    if (inEmulators) {
        const allQueues = await db.collection('jobQueues').get();
        let totalQueues = 0;
        allQueues.forEach((queue) => {
            console.log(`Queue ${totalQueues}: ${queue.id}`);
            ++totalQueues;
        });
        console.log(`Queue length is ${totalQueues}`);
        response.send(`Queue length is ${totalQueues}`);
    } else {
        response.send('ERROR: usable only in emulators');
    }
});
