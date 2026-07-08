const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace("import React, { useEffect } from 'react';\nimport DiagnosticTool from './DiagnosticTool';\n { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport DiagnosticTool from './DiagnosticTool';");
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
