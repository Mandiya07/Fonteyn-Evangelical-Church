const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'let isStorageDisabled = false;',
  'let isStorageDisabled = !firebaseConfig?.storageBucket;'
);

code = code.replace(
  /console\.warn\(`Firebase Storage Client SDK is not enabled or permission is denied\. Gracefully falling back to robust Firestore document persistence\. Info:`, storageErr\);/g,
  'console.log(`Firebase Storage Client SDK not active. Using robust Firestore document persistence.`);'
);

code = code.replace(
  /console\.warn\(`Firebase Storage is not enabled or permission is denied\. Skipping Storage backups and gracefully using Firestore document backup\. Info:`, storageErr\);/g,
  'console.log(`Firebase Storage not active. Using Firestore document backup.`);'
);

fs.writeFileSync('server.ts', code);
console.log('Updated server.ts storage warnings');
