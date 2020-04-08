# Cronjob for Firebase

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