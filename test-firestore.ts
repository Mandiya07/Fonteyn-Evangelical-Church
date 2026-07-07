import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, initializeFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);

async function check() {
  const assets = await getDocs(collection(db, 'assets'));
  console.log('Total assets:', assets.size);
}
check().catch(console.error);
