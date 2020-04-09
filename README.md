# Cronjob for Firebase

## Principle of Operation

Using the [Scheduled functions feature](https://firebase.google.com/docs/functions/schedule-functions), the function `autoIncrementJobCounter` gets executed _once every minute_. This function does a very simple thing, i.e. it increments the value of `jobConfig/counter` in the Firestore database.

In addition, using the [Cloudstore triggers feature](https://firebase.google.com/docs/functions/firestore-events), another function, `generateQueues`, gets executed whenever the above counter is changed (effectively, also executed once per minute). This function iterates through all the entries in job configuration collection, `jobConfig` in the Firestore database, and check the corresponding `period` of each job config. If the modulus of the `counter` by the `period` is `0`, then a new queue is created in the `jobQueues` collection.

Note that each job config must have at least _two_ mandatory properties: `task` and `period`, describing the type of task to be carried out and the period (in minutes) to schedule the task, respectively. Practically, a job config also has an `input` property which can store the input data for the corresponding task.

With same trigger on the `jobQueues` collection, each new queue will invoke the `runJob` function. This is where the actual work takes place. In this sample implementation, there is only one type of job (defined by its `task` property): to convert all the letters in a string to uppercase. Once the job is completed, a new run is created in the `jobRuns` collection.

Each job run will have the following properties:
* `jobId`: the unique string associated with the job config
* `timestamp`: the starting time right before the execution (Unix epoch)
* `elasped`: the duration of the task execution (in milliseconds)
* `result`: the output of executing the task

## Setup

Requirement: Node.js v10 or later.

After repository clone, run `npm install`.

### Firebase Project

Create a new project from [Firebase Console](https://console.firebase.google.com).

From Firebase Console, _Update_ the project from Spark to Blaze (this requires payment information) as this is necessary to make scheduled Cloud Function working properly.

Go to _Project Overview_ and then click on the `</>` icon. Enter the nickname under _Register app_. Make sure to check the box _Also set up Firebase Hosting_.

From Firebase Console, go to _Database_ and proceed to setup the Firestore database. Use the _Production_ security rules right away.

### Quick Check

Deploy the Firebase project as usual.

To quickly check that it is working, trigger the `ping` cloud function, e.g. by opening the URL in a web browser, such as `YOURFIREBASEPROJECT.firebaseapp.com/ping` and it should display `OK` following by the timestamp (Unix epoch).

### Local Testing

Run the integration tests (which uses Firebase emulators):
```
npm run firebase -- emulators:exec "npm test" --project YOURFIREBASEPROJECT
```
where `YOURFIREBASEPROJECT` is the name of the Firebase project.

### Deployment from Azure Pipelines

To initiate deployment to Firebase from Azure Pipelines, first grab the deployment token:
```
npm run firebase -- login:ci
```
Copy the value, set is as variable `FIREBASE_TOKEN` at Azure Pipelines, Pipelines, Edit button, Variables button.

Set another variable the similar way, `FIREBASE_PROJECT`, with the name of the project (from Firebase Console).