const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace all seeding logic in app.get endpoints
const regex = /if\s*\(\s*snapshot\.empty\s*&&\s*([a-zA-Z0-9_]+)\s*&&\s*\1\.length\s*>\s*0\s*\)\s*\{\s*for\s*\(\s*const\s+item\s+of\s+\1\s*\)\s*\{\s*const\s+docId\s*=\s*item\.id\s*\|\|\s*`[^`]+`;\s*await\s+db\.collection\('[^']+'\)\.doc\(docId\)\.set\(item\);\s*\}\s*const\s+newSnap\s*=\s*await\s+db\.collection\('[^']+'\)\.get\(\);\s*return\s+res\.json\(newSnap\.docs\.map\(d\s*=>\s*\(\{\s*id:\s*d\.id,\s*\.\.\.d\.data\(\)\s*\}\)\)\);\s*\}/g;

let count = 0;
code = code.replace(regex, (match) => {
    count++;
    return '';
});

console.log(`Replaced ${count} seeding blocks.`);
fs.writeFileSync('server.ts', code);
