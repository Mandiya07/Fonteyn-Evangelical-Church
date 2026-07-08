const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    if (doc.exists) {
      const data = doc.data() as any;
      const base64Str = data.base64;
      
      const { contentType, buffer } = parseBase64DataUrl(base64Str);`;

const replacement = `    if (doc.exists) {
      const data = doc.data() as any;
      const base64Str = data.base64;
      
      if (!base64Str && data.storagePath) {
        // If image is too large and was saved to storage only, redirect to public storage URL
        const bucket = firebaseConfig?.storageBucket;
        if (bucket) {
           return res.redirect(\`https://firebasestorage.googleapis.com/v0/b/\${bucket}/o/\${encodeURIComponent(data.storagePath)}?alt=media\`);
        }
      }
      
      const { contentType, buffer } = parseBase64DataUrl(base64Str);`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log('Fixed image uploads fallback');
} else {
    console.log('Target not found');
}
