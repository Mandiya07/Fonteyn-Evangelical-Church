const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

if (!code.includes('DiagnosticTool')) {
  code = code.replace("import React,", "import React, { useEffect } from 'react';\nimport DiagnosticTool from './DiagnosticTool';\n");
  
  const target = `{/* Overview Tab */}`;
  const replacement = `{/* Overview Tab */}\n        {activeTab === 'overview' && <DiagnosticTool />}\n`;
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/AdminDashboard.tsx', code);
  console.log("Added DiagnosticTool to AdminDashboard");
} else {
  console.log("DiagnosticTool already exists");
}
