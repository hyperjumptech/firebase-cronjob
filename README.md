# Cronjob for Firebase

## Setup

Requirement: Node.js v10 or later.

After repository clone, run `npm install`.

### Firebase Project

Create a new project from [Firebase Console](https://console.firebase.google.com).

Go to _Project Overview_ and then click on the `</>` icon. Enter the nickname under _Register app_. Make sure to check the box _Also set up Firebase Hosting_.

From Firebase Console, go to _Database_ and proceed to setup the Firestore database. Use the _Production_ security rules right away.

### Quick Check

Deploy the Firebase project as usual.

To quickly check that it is working, trigger the `ping` cloud function, e.g. by opening the URL in a web browser, such as `YOURFIREBASEPROJECT.firebaseapp.com/ping` and it should display `OK` following by the timestamp (Unix epoch).

### Local Testing

Launch Firebase Emulators first (and keep it running):
```
npm run firebase -- emulators:start
```

Run the integration tests:
```
npm run test
```

### Deployment from Azure Pipelines

To initiate deployment to Firebase from Azure Pipelines, first grab the deployment token:
```
npm run firebase -- login:ci
```
Copy the value, set is as variable `FIREBASE_TOKEN` at Azure Pipelines, Pipelines, Edit button, Variables button.

Set another variable the similar way, `FIREBASE_PROJECT`, with the name of the project (from Firebase Console).