const admin = require('firebase-admin');
const functions = require('firebase-functions');

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
