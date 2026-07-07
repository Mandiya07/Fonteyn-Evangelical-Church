const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.(get|post|put|delete)\('(\/api\/[^']+)'/g;
let match;
const routes = {};
while ((match = regex.exec(code)) !== null) {
  const method = match[1];
  const path = match[2];
  if (!routes[path]) routes[path] = [];
  routes[path].push(method);
}
console.log(routes);
