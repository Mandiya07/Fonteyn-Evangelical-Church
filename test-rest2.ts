import firebaseConfig from './firebase-applet-config.json';
async function run() {
  const url1 = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/assets?key=${firebaseConfig.apiKey}`;
  const res1 = await fetch(url1);
  console.log('(default) status:', res1.status, await res1.text());

  const url2 = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/assets?key=${firebaseConfig.apiKey}`;
  const res2 = await fetch(url2);
  console.log('named status:', res2.status, await res2.text());
}
run().catch(console.error);
