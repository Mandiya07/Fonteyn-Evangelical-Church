import firebaseConfig from './firebase-applet-config.json';
const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/assets?key=${firebaseConfig.apiKey}`;
async function run() {
  const res = await fetch(url);
  const data = await res.json();
  console.log('Docs:', data.documents ? data.documents.length : data);
}
run().catch(console.error);
