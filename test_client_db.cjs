const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace('const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;', 'const serviceAccountKey = undefined;');
code = code.replace('} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {', '} else if (false) {');
fs.writeFileSync('server_test.ts', code);
