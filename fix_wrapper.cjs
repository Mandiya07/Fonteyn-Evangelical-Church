const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
`    const wrapper = {
      orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {`,
`    const wrapper = {
      where(field: string, op: any, value: any) {
        clientConstraints.push(where(field, op, value));
        if (adminQueryBuilder) {
          adminQueryBuilder = adminQueryBuilder.where(field, op, value);
        }
        return this;
      },
      orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {`);

code = code.replace(
`      doc(docId: string) {
        return {
          id: docId,
          async get() {
            if (adminDb) {
              try {
                const docSnap = await adminDb.collection(collectionName).doc(docId).get();
                return {
                  exists: docSnap.exists,
                  data() {
                    return docSnap.data();
                  }
                };`,
`      doc(docId?: string) {
        const generatedId = docId || \`auto-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
        return {
          id: generatedId,
          async get() {
            if (adminDb) {
              try {
                const docSnap = await adminDb.collection(collectionName).doc(generatedId).get();
                return {
                  id: generatedId,
                  exists: docSnap.exists,
                  data() {
                    return docSnap.data();
                  }
                };`);

code = code.replace(
`            if (!clientDb) throw new Error("Firestore client is not initialized.");
            const dRef = doc(clientDb, collectionName, docId);
            const docSnap = await getDoc(dRef);
            return {
              exists: docSnap.exists(),
              data() {
                return docSnap.data();
              }
            };
          },
          async set(data: any, options?: any) {
            if (adminDb) {
              return adminDb.collection(collectionName).doc(docId).set(data, options);
            }
            if (!clientDb) throw new Error("Firestore client is not initialized.");
            const dRef = doc(clientDb, collectionName, docId);
            return setDoc(dRef, data, options);
          },
          async delete() {
            if (adminDb) {
              return adminDb.collection(collectionName).doc(docId).delete();
            }
            if (!clientDb) throw new Error("Firestore client is not initialized.");
            const dRef = doc(clientDb, collectionName, docId);
            return deleteDoc(dRef);
          }
        };`,
`            if (!clientDb) throw new Error("Firestore client is not initialized.");
            const dRef = doc(clientDb, collectionName, generatedId);
            const docSnap = await getDoc(dRef);
            return {
              id: generatedId,
              exists: docSnap.exists(),
              data() {
                return docSnap.data();
              }
            };
          },
          async set(data: any, options?: any) {
            if (adminDb) {
              return adminDb.collection(collectionName).doc(generatedId).set(data, options);
            }
            if (!clientDb) throw new Error("Firestore client is not initialized.");
            const dRef = doc(clientDb, collectionName, generatedId);
            return setDoc(dRef, data, options);
          },
          async delete() {
            if (adminDb) {
              return adminDb.collection(collectionName).doc(generatedId).delete();
            }
            if (!clientDb) throw new Error("Firestore client is not initialized.");
            const dRef = doc(clientDb, collectionName, generatedId);
            return deleteDoc(dRef);
          }
        };`);

fs.writeFileSync('server.ts', code);
console.log('Fixed wrapper');
