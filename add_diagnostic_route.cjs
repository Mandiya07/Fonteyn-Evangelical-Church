const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const diagnosticRoute = `
app.get('/api/diagnostic', async (req: Request, res: Response) => {
  try {
    const memberSnap = await db.collection('members').get();
    
    res.json({
      projectId: firebaseConfig?.projectId || 'Unknown',
      storageBucket: firebaseConfig?.storageBucket || 'Unknown',
      adminSdk: isAdminInitialized,
      clientSdk: !!clientDb,
      adminStorage: !!adminStorage,
      clientStorage: !!storage,
      demoDataCount: memberSnap.docs.length,
      isVercel: !!process.env.VERCEL
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', `;

if (!code.includes('/api/diagnostic')) {
  code = code.replace("app.get('/api/health', ", diagnosticRoute);
  fs.writeFileSync('server.ts', code);
  console.log('Added diagnostic route');
} else {
  console.log('Diagnostic route already exists');
}
