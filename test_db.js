const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDocFromServer } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    console.log("Testing connection to", config.firestoreDatabaseId);
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Success (or permission denied as expected)");
  } catch (e) {
    console.error("Error:", e.code, e.message);
  }
}
test();
