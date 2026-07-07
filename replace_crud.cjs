const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

function replaceEndpoint(path, collectionName, memoryArrayName, postExtras) {
  // Try to remove old endpoints
  const getRegex = new RegExp(`app\\.get\\('${path}',.*?res\\.json\\(${memoryArrayName}\\);\\s*\\}\\);`, 's');
  const postRegex = new RegExp(`app\\.post\\('${path}',.*?res\\.status\\(201\\)\\.json\\(.*?\\);\\s*\\}\\);`, 's');
  const putRegex = new RegExp(`app\\.put\\('${path}/:id',.*?res\\.json\\(.*?\\);\\s*\\}\\s*else\\s*\\{.*?\\}\\s*\\}\\);`, 's');
  const delRegex = new RegExp(`app\\.delete\\('${path}/:id',.*?res\\.json\\(\\{ success: true \\}\\);\\s*\\}\\);`, 's');
  
  let newCode = code;
  let success = true;
  if (getRegex.test(newCode)) newCode = newCode.replace(getRegex, ''); else success = false;
  if (postRegex.test(newCode)) newCode = newCode.replace(postRegex, ''); else success = false;
  if (putRegex.test(newCode)) newCode = newCode.replace(putRegex, ''); else success = false;
  if (delRegex.test(newCode)) newCode = newCode.replace(delRegex, ''); else success = false;

  const crudCode = `
app.get('${path}', async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('${collectionName}').get();
    if (snapshot.empty && ${memoryArrayName} && ${memoryArrayName}.length > 0) {
      for (const item of ${memoryArrayName}) {
        const docId = item.id || \`auto-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
        await db.collection('${collectionName}').doc(docId).set(item);
      }
      const newSnap = await db.collection('${collectionName}').get();
      return res.json(newSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    res.json(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.post('${path}', async (req: Request, res: Response) => {
  try {
    const docRef = db.collection('${collectionName}').doc();
    const body = req.body;
    const newItem = { id: docRef.id, ${postExtras ? postExtras + ', ' : ''}...body };
    await docRef.set(newItem);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create' });
  }
});

app.put('${path}/:id', async (req: Request, res: Response) => {
  try {
    await db.collection('${collectionName}').doc(req.params.id).set(req.body, { merge: true });
    const doc = await db.collection('${collectionName}').doc(req.params.id).get();
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

app.delete('${path}/:id', async (req: Request, res: Response) => {
  try {
    await db.collection('${collectionName}').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});
`;

  if (success) {
    code = newCode + crudCode;
  } else {
    console.log(`Failed to match all endpoints for ${path}`);
  }
}

replaceEndpoint('/api/users', 'users', 'users', 'status: "Active", joinedDate: new Date().toISOString().split("T")[0]');
replaceEndpoint('/api/events', 'events', 'events', 'registeredCount: 0, rsvps: [], volunteers: []');
replaceEndpoint('/api/blog', 'blog', 'blogPosts', 'likes: 0, tags: []');
replaceEndpoint('/api/donations', 'donations', 'donations', 'date: new Date().toISOString().split("T")[0], status: "Completed"');
replaceEndpoint('/api/members', 'members', 'members', 'joinedDate: new Date().toISOString().split("T")[0]');
replaceEndpoint('/api/ministries', 'ministries', 'ministries', '');
replaceEndpoint('/api/v2/branches', 'branches', 'branches', '');
replaceEndpoint('/api/v2/education/schools', 'schools', 'schoolInstitutions', '');
replaceEndpoint('/api/v2/media/radio', 'radio', 'broadcastStations', '');
replaceEndpoint('/api/v2/store/products', 'products', 'bookstoreProducts', '');
replaceEndpoint('/api/v2/community/projects', 'projects', 'communityProjects', '');

fs.writeFileSync('server.ts', code);
console.log('Done replacement script');
