
import fs from 'fs';
import path from 'path';

console.log('--- Environment Check ---');
console.log('GOOGLE_CLOUD_PROJECT:', process.env.GOOGLE_CLOUD_PROJECT);
console.log('NODE_ENV:', process.env.NODE_ENV);

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
if (fs.existsSync(configPath)) {
  console.log('firebase-applet-config.json exists');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  console.log('Config ProjectId:', config.projectId);
  console.log('Config DatabaseId:', config.firestoreDatabaseId);
} else {
  console.log('firebase-applet-config.json NOT found');
}
