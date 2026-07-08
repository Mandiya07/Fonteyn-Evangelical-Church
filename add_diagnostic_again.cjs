const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  '<div className="animate-fade-in space-y-8">',
  '<div className="animate-fade-in space-y-8">\n              <DiagnosticTool />'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
