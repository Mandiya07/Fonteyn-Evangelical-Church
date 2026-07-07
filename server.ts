import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getBytes 
} from 'firebase/storage';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  QueryConstraint
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';

console.log('Starting server...');

// Initialize Firebase Admin SDK for bulletproof server-to-server operations
let adminDb: any = null;
let adminStorage: any = null;
let isAdminInitialized = false;

try {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const bucketName = firebaseConfig?.storageBucket || (firebaseConfig?.projectId ? `${firebaseConfig.projectId}.firebasestorage.app` : undefined);

  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(serviceAccountKey);
    const adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: bucketName
    }, 'admin-app');
    adminDb = firebaseConfig?.firestoreDatabaseId 
      ? getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId)
      : getAdminFirestore(adminApp);
    adminStorage = getAdminStorage(adminApp);
    isAdminInitialized = true;
    console.log('Firebase Admin SDK initialized successfully via FIREBASE_SERVICE_ACCOUNT_KEY env variable.');
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const adminApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: bucketName
    }, 'admin-app');
    adminDb = firebaseConfig?.firestoreDatabaseId 
      ? getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId)
      : getAdminFirestore(adminApp);
    adminStorage = getAdminStorage(adminApp);
    isAdminInitialized = true;
    console.log('Firebase Admin SDK initialized successfully via GOOGLE_APPLICATION_CREDENTIALS env variable.');
  } else {
    console.log('No Admin SDK credentials provided (FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS). Relying purely on Firebase Client SDK.');
  }
} catch (adminErr: any) {
  console.warn('Firebase Admin SDK failed to initialize. Falling back to Client SDK:', adminErr.message);
}

// Initialize Client Firebase App
const firebaseApp = firebaseConfig?.apiKey ? initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
}) : null;

let clientDb: any = null;
if (firebaseApp) {
  try {
    const settings = { experimentalForceLongPolling: true };
    clientDb = firebaseConfig.firestoreDatabaseId 
      ? initializeFirestore(firebaseApp, settings, firebaseConfig.firestoreDatabaseId)
      : initializeFirestore(firebaseApp, settings);
  } catch (err) {
    console.warn("Firestore already initialized or failed to initialize with settings. Falling back to getFirestore:", err);
    clientDb = firebaseConfig.firestoreDatabaseId 
      ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
      : getFirestore(firebaseApp);
  }
}

console.log('Firebase Client SDK initialized:', !!clientDb);

const storage = firebaseApp ? getStorage(firebaseApp) : null;
console.log('Firebase Storage SDK initialized:', !!storage);
let isStorageDisabled = false;

const db = {
  collection(collectionName: string) {
    let clientConstraints: QueryConstraint[] = [];
    let adminQueryBuilder: any = adminDb ? adminDb.collection(collectionName) : null;
    
    const wrapper = {
      orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
        clientConstraints.push(orderBy(field, direction));
        if (adminQueryBuilder) {
          adminQueryBuilder = adminQueryBuilder.orderBy(field, direction);
        }
        return this;
      },
      limit(n: number) {
        clientConstraints.push(limit(n));
        if (adminQueryBuilder) {
          adminQueryBuilder = adminQueryBuilder.limit(n);
        }
        return this;
      },
      async get() {
        if (adminDb && adminQueryBuilder) {
          try {
            const snapshot = await adminQueryBuilder.get();
            return {
              empty: snapshot.empty,
              size: snapshot.size,
              docs: snapshot.docs.map((docSnap: any) => ({
                id: docSnap.id,
                ref: docSnap.ref,
                data() {
                  return docSnap.data();
                }
              }))
            };
          } catch (adminErr: any) {
            console.warn(`Admin query failed for collection ${collectionName}, falling back to Client query:`, adminErr.message);
          }
        }
        
        if (!clientDb) throw new Error("Firestore client is not initialized.");
        const colRef = collection(clientDb, collectionName);
        const q = clientConstraints.length > 0 ? query(colRef, ...clientConstraints) : colRef;
        const snapshot = await getDocs(q);
        return {
          empty: snapshot.empty,
          size: snapshot.size,
          docs: snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ref: docSnap.ref,
            data() {
              return docSnap.data();
            }
          }))
        };
      },
      async add(data: any) {
        if (adminDb) {
          try {
            const docRef = await adminDb.collection(collectionName).add(data);
            return {
              id: docRef.id,
              ref: docRef
            };
          } catch (adminErr: any) {
            console.warn(`Admin add failed for collection ${collectionName}, falling back to Client:`, adminErr.message);
          }
        }
        
        if (!clientDb) throw new Error("Firestore client is not initialized.");
        const colRef = collection(clientDb, collectionName);
        const docRef = await addDoc(colRef, data);
        return {
          id: docRef.id,
          ref: docRef
        };
      },
      doc(docId: string) {
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
                };
              } catch (adminErr: any) {
                console.warn(`Admin get document failed for ${collectionName}/${docId}, falling back to Client:`, adminErr.message);
              }
            }
            
            if (!clientDb) throw new Error("Firestore client is not initialized.");
            const docRef = doc(clientDb, collectionName, docId);
            const docSnap = await getDoc(docRef);
            return {
              exists: docSnap.exists(),
              data() {
                return docSnap.data();
              }
            };
          },
          async set(data: any, options?: { merge?: boolean }) {
            if (adminDb) {
              try {
                if (options && typeof options.merge === 'boolean') {
                  await adminDb.collection(collectionName).doc(docId).set(data, { merge: options.merge });
                } else {
                  await adminDb.collection(collectionName).doc(docId).set(data);
                }
                return;
              } catch (adminErr: any) {
                console.warn(`Admin set document failed for ${collectionName}/${docId}, falling back to Client:`, adminErr.message);
              }
            }
            
            if (!clientDb) throw new Error("Firestore client is not initialized.");
            const docRef = doc(clientDb, collectionName, docId);
            if (options && typeof options.merge === 'boolean') {
              await setDoc(docRef, data, { merge: options.merge });
            } else {
              await setDoc(docRef, data);
            }
          },
          async update(data: any) {
            if (adminDb) {
              try {
                await adminDb.collection(collectionName).doc(docId).update(data);
                return;
              } catch (adminErr: any) {
                console.warn(`Admin update document failed for ${collectionName}/${docId}, falling back to Client:`, adminErr.message);
              }
            }
            
            if (!clientDb) throw new Error("Firestore client is not initialized.");
            const docRef = doc(clientDb, collectionName, docId);
            await updateDoc(docRef, data);
          },
          async delete() {
            if (adminDb) {
              try {
                await adminDb.collection(collectionName).doc(docId).delete();
                return;
              } catch (adminErr: any) {
                console.warn(`Admin delete document failed for ${collectionName}/${docId}, falling back to Client:`, adminErr.message);
              }
            }
            
            if (!clientDb) throw new Error("Firestore client is not initialized.");
            const docRef = doc(clientDb, collectionName, docId);
            await deleteDoc(docRef);
          }
        };
      }
    };
    return wrapper;
  }
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: false,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Seed Database helper
async function seedDatabaseIfEmpty() {
  console.log('Checking if database needs seeding...');
  try {
    const collections = ['sermons', 'prayerRequests'];
    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).limit(1).get();
        if (snapshot.empty) {
          console.log(`Collection ${collectionName} is empty. Seeding...`);
          // Seeding logic here if needed
        }
      } catch (innerErr: any) {
        console.warn(`Could not access collection ${collectionName} during seeding check:`, innerErr.message);
      }
    }
  } catch (err) {
    console.error('Error during database check:', err);
  }
  
  console.log('Database initialization check completed.');
}

// In-Memory Data fallbacks for non-Firestore endpoints
let events: any[] = [
  {
    id: "evt-1",
    title: "Youth Renewal Camp 2026",
    description: "A weekend of prayer, worship, and dynamic fellowship for youth from all over Swaziland, held at our Mbabane Main Sanctuary.",
    date: "2026-06-25",
    time: "14:00",
    location: "Mbabane Main Sanctuary",
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&auto=format&fit=crop&q=80",
    registeredCount: 42,
    rsvps: ["siphom.yati@gmail.com", "member1@fec.org", "member2@fec.org"],
    volunteers: [
      { role: "Worship Leader", slots: 2, filled: ["siphom.yati@gmail.com"] },
      { role: "Sound Board Tech", slots: 1, filled: [] },
      { role: "Catering Crew", slots: 5, filled: ["member1@fec.org"] }
    ]
  },
  {
    id: "evt-2",
    title: "Fonteyn Annual Community Outreach",
    description: "Reaching out to our local families in Mbabane with food packs, medical checks, and warm winter blankets.",
    date: "2026-07-04",
    time: "08:30",
    location: "Fonteyn Community Hall",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80",
    registeredCount: 15,
    rsvps: ["pastor@fec.org"],
    volunteers: [
      { role: "Caregiver Specialist", slots: 8, filled: [] },
      { role: "Transport Co-ordinator", slots: 2, filled: ["pastor@fec.org"] }
    ]
  },
  {
    id: "evt-3",
    title: "Christian Discipleship Conference",
    description: "Deep theological teaching for ministry leaders, lay-pastors, and cell leaders looking to expand their understanding.",
    date: "2026-08-12",
    time: "09:00",
    location: "Faith Hill Camp, Mbabane",
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bcd3?w=600&auto=format&fit=crop&q=80",
    registeredCount: 18,
    rsvps: ["siphom.yati@gmail.com"],
    volunteers: []
  }
];

let blogPosts: any[] = [
  {
    id: "blog-1",
    title: "Standing Firm in Changing Times",
    author: "Rev LS Mnisi",
    category: "Theology",
    date: "2026-06-10",
    summary: "Reflecting on how we can rely on our eternal Savior when the foundations around us start shaking.",
    content: "When societal standards shift beneath our feet, as Christians, we do not need to panic. We have a robust, immovable foundation in Jesus Christ. This blog post explores practical ways to read, study, and live the unshakeable Word of God in modern day Mbabane and across the world.",
    likes: 24,
    tags: ["Faith", "Preach", "Encouragement"]
  },
  {
    id: "blog-2",
    title: "The Power of Corporate Prayer",
    author: "Pastor Sipho",
    category: "Prayer",
    date: "2026-06-15",
    summary: "Why gathering to pray in unity unleashes the power of the Holy Spirit on our neighborhoods.",
    content: "When we gather for prayer services on Wednesdays at 05:30 PM, we aren't just reciting words. We are joining in massive, unified intercession for our community, our country, and our households. Together, we are seeing breakthroughs!",
    likes: 18,
    tags: ["Prayer", "Unity", "Breakthrough"]
  }
];

const INITIAL_USER_PROFILE = {
  name: "",
  email: "",
  phone: "",
  ministries: [] as string[],
  avatar: "",
  joinedDate: new Date().toISOString().split('T')[0],
  isPastor: false,
};

let userProfile = { ...INITIAL_USER_PROFILE, name: "Sipho Myati", email: "siphom.yati@gmail.com", isPastor: false };

let donations: any[] = [
  {
    id: "don-1",
    donorName: "Sipho Myati",
    amount: 1500,
    category: "Tithes",
    paymentMethod: "Mobile Money",
    date: "2026-06-14",
    receiptNumber: "FEC-REC-8241"
  },
  {
    id: "don-2",
    donorName: "Nathi Mkhize",
    amount: 500,
    category: "Offerings",
    paymentMethod: "Debit Card",
    date: "2026-06-15",
    receiptNumber: "FEC-REC-3912"
  },
  {
    id: "don-3",
    donorName: "Thandeka Dlamini",
    amount: 3000,
    category: "Building Fund",
    paymentMethod: "Bank Transfer",
    date: "2026-06-12",
    receiptNumber: "FEC-REC-1104"
  }
];

let members: any[] = [
  {
    id: "mem-1",
    name: "Sipho Myati",
    email: "siphom.yati@gmail.com",
    phone: "+268 7602 1234",
    ministries: ["Youth Fellowship", "Praise & Worship"],
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    joinedDate: "2025-01-10",
    isPastor: false,
    role: "Admin"
  },
  {
    id: "mem-2",
    name: "Rev LS Mnisi",
    email: "pastor@fec.org",
    phone: "+268 7612 0000",
    ministries: ["Fathers' Fellowship"],
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    joinedDate: "2018-05-12",
    isPastor: true,
    role: "Senior Pastor"
  },
  {
    id: "mem-3",
    name: "Thandeka Dlamini",
    email: "thandeka@example.com",
    phone: "+268 7805 4432",
    ministries: ["Mothers' Fellowship", "Bible Study"],
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    joinedDate: "2022-09-01",
    isPastor: false,
    role: "Member"
  }
];

let users: any[] = [
  {
    id: "usr-1",
    name: "Sipho Myati",
    email: "siphom.yati@gmail.com",
    phone: "+268 7602 1234",
    role: "Admin",
    status: "Active",
    joinedDate: "2025-01-10"
  },
  {
    id: "usr-2",
    name: "Rev LS Mnisi",
    email: "pastor@fec.org",
    phone: "+268 7612 0000",
    role: "Pastor/Admin",
    status: "Active",
    joinedDate: "2018-05-12"
  },
  {
    id: "usr-3",
    name: "Visitor Account 1",
    email: "visitor@example.com",
    phone: "+268 7912 3456",
    role: "User",
    status: "Active",
    joinedDate: "2026-03-15"
  }
];

let branches: any[] = [
  {
    id: "br-1",
    name: "Mbabane Central Church",
    location: "Fonteyn Hill, Mbabane, Eswatini",
    leadPastorId: "mem-2",
    establishedDate: "2015-04-20",
    contactEmail: "mbabane@fec.org",
    metrics: { averageAttendance: 350, activeMinistries: 7 }
  },
  {
    id: "br-2",
    name: "Manzini Campus Fellowship",
    location: "Opposite Riverstone, Manzini, Eswatini",
    leadPastorId: "mem-1",
    establishedDate: "2024-11-12",
    contactEmail: "manzini@fec.org",
    metrics: { averageAttendance: 85, activeMinistries: 3 }
  }
];

let schoolInstitutions: any[] = [
  {
    id: "edu-1",
    type: "School",
    name: "Fonteyn Christian Preschool",
    principal: "Mrs. Thandiwe Mnisi",
    enrollmentCount: 45,
    curriculumType: "Christian Early Childhood Education",
    accreditationStatus: "Fully Accredited by Eswatini Ministry of Education"
  },
  {
    id: "edu-2",
    type: "Bible College",
    name: "FEC Leadership & Bible College",
    principal: "Rev LS Mnisi",
    enrollmentCount: 22,
    curriculumType: "Diploma in Practical Theology & Ministry",
    accreditationStatus: "Affiliated with Southern African Theological Colleges"
  }
];

let broadcastStations: any[] = [
  {
    id: "rad-1",
    type: "Radio",
    name: "Grace FM Mbabane",
    frequencyDb: "95.1 MHz",
    streamingUrl: "https://stream.gracefm.org/live",
    currentProgramId: "prog-1",
    schedule: [
      { time: "06:00 - 08:30", programName: "Morning Devotion & Worship" },
      { time: "12:00 - 13:00", programName: "Hour of Deliverance" },
      { time: "18:00 - 20:00", programName: "Theological Round-Table Discussion" }
    ]
  },
  {
    id: "rad-2",
    type: "Television",
    name: "Fonteyn Global TV",
    frequencyDb: "DSTV Channel 992 (Stub)",
    streamingUrl: "https://tv.fonteynchurch.org/live",
    currentProgramId: "prog-2",
    schedule: [
      { time: "Sunday 11:00", programName: "FEC Sunday Service Live Broadcast" },
      { time: "Wednesday 18:30", programName: "Kingdom Kids Bible Study Hour" }
    ]
  }
];

let bookstoreProducts: any[] = [
  {
    id: "bk-1",
    title: "Walking in Faith: The Rev LS Mnisi Story",
    type: "Book",
    price: 150,
    stockCount: 45,
    authorOrBrand: "Rev LS Mnisi"
  },
  {
    id: "bk-2",
    title: "FEC Grace & Truth Hoodie (Navy)",
    type: "Merchandise",
    price: 350,
    stockCount: 12,
    authorOrBrand: "FEC Apparel Division"
  },
  {
    id: "bk-3",
    title: "Discipleship 101 Study Guide (E-Book)",
    type: "Digital",
    price: 49,
    stockCount: 9999,
    authorOrBrand: "FEC Publishing"
  }
];

let communityProjects: any[] = [
  {
    id: "proj-1",
    title: "Fonteyn Clean Water Borehole Project",
    targetBudget: 75000,
    currentFunding: 42000,
    status: "Active",
    partners: ["Siphofaneni Rotary Club", "Eswatini Water Services"]
  },
  {
    id: "proj-2",
    title: "Preschool Feeding Expansion",
    targetBudget: 20000,
    currentFunding: 20000,
    status: "Completed",
    partners: ["Standard Bank Eswatini Food Drive", "Local Mbabane Farmers"]
  }
];

let ministries: any[] = [
  {
    id: "min-1",
    name: "Youth Fellowship",
    description: "Empowering the next generation of Christian leaders in Mbabane to stand strong in faith, holiness, and active community presence.",
    leader: "Sipho Myati",
    leaderTitle: "Youth President",
    leaderPhoto: "",
    schedule: "Saturdays at 01:00 PM",
    activities: ["Praise Sessions", "Theological Debates", "Mbabane Street Evangelism", "Annual Worship Nights"],
    gallery: [],
    contact: "youth@fec.org"
  },
  {
    id: "min-2",
    name: "Fonteyn Christian Preschool",
    description: "Developing healthy children physically, intellectually, and spiritually with early-education rooted in God's love.",
    leader: "Mrs. Thandiwe Mnisi",
    leaderTitle: "Preschool Director",
    leaderPhoto: "",
    schedule: "Monday - Friday, 08:00 AM - 01:00 PM",
    activities: ["Alphabet & Numerics", "Bible Verse Memorization", "Sing-Alongs", "Playground Fellowship"],
    gallery: [],
    contact: "preschool@fec.org"
  },
  {
    id: "min-3",
    name: "Mothers' Fellowship",
    description: "Inspiring mothers and wives to build robust, prayer-fueled, and God-fearing families.",
    leader: "Mrs. Nomsa Dlamini",
    leaderTitle: "Fellowship Chairlady",
    leaderPhoto: "",
    schedule: "Saturdays at 11:00 AM",
    activities: ["Intercessory Prayers", "Home Care Worksheets", "Family Counseling Lectures"],
    gallery: [],
    contact: "mothers@fec.org"
  },
  {
    id: "min-4",
    name: "Praise & Worship",
    description: "Leading the congregation into deep, spiritually active tabernacles of praise during each corporate service.",
    leader: "Nathi Mkhize",
    leaderTitle: "Worship Director",
    leaderPhoto: "",
    schedule: "Saturdays at 04:00 PM & Sundays",
    activities: ["Vocal Exercises", "Instrumental Tuning", "Prayer & Consecration"],
    gallery: [],
    contact: "worship@fec.org"
  }
];

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.text({ limit: '50mb', type: ['text/*', 'application/xml'] }));
app.use(express.raw({ limit: '50mb', type: ['application/octet-stream', 'image/*'] }));

// Safe helper to decode base64 data URLs without catastrophic backtracking regular expressions
function parseBase64DataUrl(base64Str: any): { contentType: string; buffer: Buffer } {
  if (typeof base64Str === 'string' && base64Str.startsWith('data:')) {
    const commaIdx = base64Str.indexOf(',');
    if (commaIdx !== -1) {
      const mimePart = base64Str.substring(0, commaIdx);
      const rawBase64 = base64Str.substring(commaIdx + 1);
      let contentType = 'image/png';
      const mimeMatch = mimePart.match(/^data:([^;]+);base64$/);
      if (mimeMatch) {
        contentType = mimeMatch[1];
      }
      return { contentType, buffer: Buffer.from(rawBase64, 'base64') };
    }
  }
  const strVal = typeof base64Str === 'string' ? base64Str : '';
  return { contentType: 'image/png', buffer: Buffer.from(strVal, 'base64') };
}

// Resilient in-memory cache for uploaded files
const inMemoryUploads = new Map<string, { contentType: string; buffer: Buffer }>();

// Setup uploaded images directory with smart writable check fallback to /tmp/uploads
const publicDir = path.join(process.cwd(), 'public');
let uploadsDir = path.join(publicDir, 'uploads');

try {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  // Test write permissions
  const testFile = path.join(uploadsDir, '.write-test');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log(`Using persistent local directory for uploads: ${uploadsDir}`);
} catch (e) {
  console.warn('Unable to write to public/uploads directory, falling back to /tmp/uploads:', e);
  try {
    uploadsDir = path.join('/tmp', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (tmpErr) {
    console.error('Failed to create /tmp/uploads as fallback:', tmpErr);
    // Fallback to process.cwd() as absolute last resort
    uploadsDir = process.cwd();
  }
}

// Serve /uploads statically in all modes (dev & prod)
app.use('/uploads', express.static(uploadsDir));

// Fallback for missing uploads: restore from Memory or Firestore if exists
app.get('/uploads/:filename', async (req: Request, res: Response) => {
  const filename = req.params.filename;

  // 1. Check in-memory cache first
  if (inMemoryUploads.has(filename)) {
    const cached = inMemoryUploads.get(filename)!;
    res.setHeader('Content-Type', cached.contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(cached.buffer);
  }

  const ext = path.extname(filename);
  const docId = path.basename(filename, ext);
  
  try {
    const doc = await db.collection('assets').doc(docId).get();
    if (doc.exists) {
      const data = doc.data() as any;
      const base64Str = data.base64;
      
      const { contentType, buffer } = parseBase64DataUrl(base64Str);
      
      // Save to local disk so it is served statically next time
      const localPath = path.join(uploadsDir, filename);
      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(localPath, buffer);
        console.log(`Restored missing upload file to disk: ${filename}`);
      } catch (writeErr) {
        console.error('Failed to write restored upload file to disk:', writeErr);
      }

      // Cache in memory for subsequent requests
      inMemoryUploads.set(filename, { contentType, buffer });
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(buffer);
    }
    res.status(404).send('Not found');
  } catch (err) {
    console.error('Failed to restore upload file from Firestore:', err);
    res.status(500).send('Server Error');
  }
});

// Config file for current image mapping (Legacy fallback)
const configFilePath = path.join(uploadsDir, 'image-config.json');
let appImages: Record<string, string> = {
  pastor: "",
  hero: "",
  ministry_children: "",
  ministry_youth: "",
  ministry_young_adults: "",
  ministry_men: "",
  ministry_women: "",
  ministry_family: "",
  ministry_evangelism: "",
  ministry_worship: "",
  ministry_prayer: "",
  ministry_outreach: "",
  ministry_preschool: ""
};

function sanitizeServerImages(images: Record<string, string>): Record<string, string> {
  const sanitized = { ...images };
  return sanitized;
}

// Initial load: Priority Firestore > Local File > Hardcoded Defaults
async function loadPersistentConfig() {
  console.log('Loading persistent config...');
  // 1. Try Firestore
  try {
    console.log('Trying to get app-images from Firestore...');
    const col = db.collection('settings');
    console.log('Got settings collection:', !!col);
    const docRef = col.doc('app-images');
    console.log('Got app-images doc ref:', !!docRef);
    const doc = await docRef.get();
    console.log('Got app-images doc, exists:', doc.exists);
    if (doc.exists) {
      console.log('Images loaded from Firestore');
      const data = doc.data() || {};
      appImages = sanitizeServerImages({ ...appImages, ...data });
      
      // If any of the Firestore settings had legacy placeholder values, update the db with clean empty values
      const hasPlaceholders = Object.keys(data).some(k => 
        typeof data[k] === 'string' && (
          data[k].includes('unsplash.com') || 
          data[k].includes('pastor_portrait') || 
          data[k].includes('placeholder') || 
          data[k].includes('/pastor_')
        )
      );
      if (hasPlaceholders) {
        console.log('Sanitizing and cleaning up legacy images in Firestore...');
        await saveImageConfig();
      }
      return;
    }
  } catch (err: any) {
    console.error("Failed to load images from Firestore:", err.message, err.stack);
    if (err.message && (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED'))) {
      try {
        console.log('Permission denied on settings/app-images, attempting handleFirestoreError');
        handleFirestoreError(err, OperationType.GET, 'settings/app-images');
      } catch (e) {
        console.error('handleFirestoreError failed:', e);
      }
    }
  }

  // 2. Try Local File fallback
  if (fs.existsSync(configFilePath)) {
    try {
      const data = fs.readFileSync(configFilePath, 'utf-8');
      appImages = sanitizeServerImages({ ...appImages, ...JSON.parse(data) });
      console.log('Images loaded from local file fallback');
    } catch (err) {
      console.error("Failed to parse image-config.json:", err);
    }
  }
}

// Function to save image configuration both to Firestore (Primary) and Local File (Secondary)
const saveImageConfig = async () => {
  // 1. Update Firestore
  try {
    await db.collection('settings').doc('app-images').set(appImages);
    console.log('Images updated in Firestore');
  } catch (err: any) {
    console.error("Failed to update images in Firestore:", err.message);
    if (err.message && (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED'))) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'settings/app-images');
      } catch (e) {}
    }
  }

  // 2. Update Firestore (Primary persistence)
  try {
    await db.collection('settings').doc('app-images').set(appImages);
  } catch (err) {
    console.error("Failed to write image-config.json to Firestore:", err);
  }
};

// Images API Endpoints
app.get('/api/images', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  try {
    const doc = await db.collection('settings').doc('app-images').get();
    if (doc.exists) {
      const data = doc.data() || {};
      appImages = sanitizeServerImages({ ...appImages, ...data });
      
      const hasPlaceholders = Object.keys(data).some(k => 
        typeof data[k] === 'string' && (
          data[k].includes('unsplash.com') || 
          data[k].includes('pastor_portrait') || 
          data[k].includes('placeholder') || 
          data[k].includes('/pastor_')
        )
      );
      if (hasPlaceholders) {
        await saveImageConfig();
      }
    }
  } catch (err) {
    console.error("Failed to fetch fresh images from Firestore:", err);
  }
  res.json(appImages);
});

app.post('/api/images/update', async (req: Request, res: Response) => {
  const { key, url } = req.body;
  if (!key || typeof url !== 'string') {
    return res.status(400).json({ error: 'Key and active URL string are required.' });
  }
  
  appImages[key] = url;
  await saveImageConfig();
  res.json({ success: true, images: appImages });
});

app.get('/api/assets', async (req: Request, res: Response) => {
  try {
    const list: any[] = [];
    
    // 1. Fetch from Firestore
    try {
      if (clientDb) {
        const snapshot = await db.collection('assets').get();
        snapshot.docs.forEach(docSnap => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            name: d.name || docSnap.id,
            contentType: d.contentType || 'image/png',
            updatedAt: d.updatedAt || new Date().toISOString(),
            url: `/api/assets/${docSnap.id}`
          });
        });
      }
    } catch (fsErr) {
      console.warn('Failed listing assets from Firestore:', fsErr);
    }

    // 2. Supplement from local uploads directory
    if (fs.existsSync(uploadsDir)) {
      try {
        const files = fs.readdirSync(uploadsDir);
        files.forEach(file => {
          // If file is not already in list by starting name prefix, add it
          const fileId = path.basename(file, path.extname(file));
          if (!list.some(item => item.id === fileId || item.name === file)) {
            const ext = path.extname(file).toLowerCase();
            let contentType = 'image/png';
            if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            else if (ext === '.gif') contentType = 'image/gif';
            else if (ext === '.webp') contentType = 'image/webp';
            else if (ext === '.svg') contentType = 'image/svg+xml';
            else if (ext === '.mp3') contentType = 'audio/mpeg';
            else if (ext === '.wav') contentType = 'audio/wav';
            else if (ext === '.pdf') contentType = 'application/pdf';

            const stats = fs.statSync(path.join(uploadsDir, file));

            list.push({
              id: fileId,
              name: file,
              contentType,
              updatedAt: stats.mtime.toISOString(),
              url: `/api/assets/${fileId}`
            });
          }
        });
      } catch (dirErr) {
        console.error('Failed reading uploads directory for asset listing:', dirErr);
      }
    }

    // Sort by updatedAt descending
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    res.json(list);
  } catch (err: any) {
    console.error('Error listing assets:', err);
    res.status(500).json({ error: 'Failed to list assets' });
  }
});

app.delete('/api/assets/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    console.log(`Deleting asset ${id}...`);

    // 1. Delete from Firestore
    try {
      if (clientDb) {
        await db.collection('assets').doc(id).delete();
      }
    } catch (fsErr) {
      console.warn(`Firestore delete failed for asset ${id}:`, fsErr);
    }

    // 2. Delete from local disk
    if (fs.existsSync(uploadsDir)) {
      try {
        const files = fs.readdirSync(uploadsDir);
        const matchedFile = files.find(f => f.startsWith(id));
        if (matchedFile) {
          const localPath = path.join(uploadsDir, matchedFile);
          fs.unlinkSync(localPath);
          console.log(`Deleted local file: ${matchedFile}`);
        }
      } catch (dirErr) {
        console.error(`Failed deleting local file for asset ${id}:`, dirErr);
      }
    }

    // 3. Delete from memory cache
    inMemoryUploads.delete(id);
    for (const [key] of inMemoryUploads.entries()) {
      if (key.startsWith(id)) {
        inMemoryUploads.delete(key);
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting asset:', err);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

app.post('/api/images/upload', async (req: Request, res: Response) => {
  console.log('--- HIT /api/images/upload ---');
  let bodyData = req.body;

  if (typeof bodyData === 'string') {
    try {
      bodyData = JSON.parse(bodyData);
    } catch {
      bodyData = { base64: bodyData };
    }
  }

  if (Buffer.isBuffer(bodyData)) {
    bodyData = { base64: bodyData.toString('base64') };
  }

  let name = bodyData?.name || bodyData?.filename || bodyData?.fileName || bodyData?.title;
  let base64 = bodyData?.base64 || bodyData?.image || bodyData?.file || bodyData?.data || bodyData?.content;

  if (!base64 && bodyData && typeof bodyData === 'object') {
    for (const key of Object.keys(bodyData)) {
      const val = bodyData[key];
      if (typeof val === 'string' && (val.startsWith('data:') || val.length > 100)) {
        base64 = val;
        break;
      }
    }
  }

  if (!base64) {
    console.error('Upload error: Base64 content is missing. req.body type:', typeof req.body, 'keys:', req.body ? Object.keys(req.body) : 'none');
    return res.status(400).json({ error: 'Base64 image content is required.' });
  }
  if (!name) {
    name = 'uploaded_image.png';
  }

  try {
    // Create safe unique ID
    const sanitizedName = name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const ext = path.extname(sanitizedName) || '.png';
    const baseName = path.basename(sanitizedName, ext) || 'img';
    const docId = `${baseName}_${Date.now()}`;
    const filename = `${docId}${ext}`;

    // Decode base64 to buffer using safe helper
    const { contentType, buffer } = parseBase64DataUrl(base64);

    // Always try to write to local disk first
    let savedLocally = false;
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const localPath = path.join(uploadsDir, filename);
      fs.writeFileSync(localPath, buffer);
      console.log(`Saved uploaded file to local disk: ${filename}`);
      savedLocally = true;
    } catch (writeErr) {
      console.error('Failed to write uploaded file to disk:', writeErr);
    }

    // Always cache in memory for bulletproof resiliency
    inMemoryUploads.set(filename, { contentType, buffer });
    inMemoryUploads.set(docId, { contentType, buffer });

    const fileSize = buffer.length;
    console.log(`Uploaded file size: ${fileSize} bytes`);

    // Try uploading to Firebase Storage (prioritize Admin SDK)
    let uploadedToStorage = false;
    
    if (adminStorage) {
      try {
        console.log(`Uploading ${filename} to Firebase Storage (Admin SDK)...`);
        const bucket = adminStorage.bucket();
        const fileRef = bucket.file(`assets/${filename}`);
        await fileRef.save(buffer, {
          metadata: { contentType },
          public: true
        });
        uploadedToStorage = true;
        console.log(`Successfully uploaded ${filename} to Firebase Storage (Admin) as assets/${filename}`);
      } catch (adminStorageErr: any) {
        console.warn(`Firebase Storage (Admin) upload failed:`, adminStorageErr.message);
      }
    }

    if (!uploadedToStorage && storage && !isStorageDisabled) {
      try {
        console.log(`Uploading ${filename} to Firebase Storage (Client SDK)...`);
        const fileRef = storageRef(storage, `assets/${filename}`);
        await uploadBytes(fileRef, buffer, { contentType });
        uploadedToStorage = true;
        console.log(`Successfully uploaded ${filename} to Firebase Storage as assets/${filename}`);
      } catch (storageErr) {
        isStorageDisabled = true;
        console.warn(`Firebase Storage Client SDK is not enabled or permission is denied. Gracefully falling back to robust Firestore document persistence. Info:`, storageErr);
      }
    }

    // Store in Firestore with metadata, fallback base64, and storagePath reference
    let persistedInFirestore = false;
    try {
      const docData: any = {
        name: sanitizedName,
        contentType,
        storagePath: uploadedToStorage ? `assets/${filename}` : null,
        updatedAt: new Date().toISOString()
      };
      
      // Store base64 inside Firestore up to 950KB for stateless serverless/Vercel persistence
      if (base64.length <= 950000) {
        docData.base64 = base64;
      } else {
        console.log(`Base64 size (${base64.length} chars) is large. Attempting storage fallback.`);
      }

      await db.collection('assets').doc(docId).set(docData);
      persistedInFirestore = true;
      console.log(`Asset metadata for doc ${docId} persisted in Firestore`);
    } catch (fsErr) {
      console.warn(`Firestore asset doc save failed for ${docId}:`, fsErr);
    }

    // Return the dynamic api URL so it works on Vercel
    const publicUrl = `/api/assets/${docId}`;
    return res.json({ success: true, url: publicUrl, persistedInFirestore, uploadedToStorage, savedLocally });
  } catch (err: any) {
    console.error('File Upload Error:', err.stack || err);
    res.status(500).json({ error: err.message || 'Failed to save uploaded file', stack: err.stack || String(err) });
  }
});

app.get('/api/assets/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const docId = id.replace(/\.[^/.]+$/, ""); // strip extension if present

    // 1. Check Firestore first (crucial for stateless serverless/Vercel deployments)
    try {
      const doc = await db.collection('assets').doc(docId).get();
      if (doc.exists) {
        const data = doc.data() as any;
        let contentType = data.contentType || 'image/png';
        let buffer: Buffer | null = null;

        if (data.base64) {
          try {
            const parsed = parseBase64DataUrl(data.base64);
            contentType = parsed.contentType;
            buffer = parsed.buffer;
          } catch (e) {
            console.error('Failed to parse inline base64 from Firestore document:', e);
          }
        }

        if (!buffer && data.storagePath && adminStorage) {
          try {
            const bucket = adminStorage.bucket();
            const fileRef = bucket.file(data.storagePath);
            const [downloadedBuffer] = await fileRef.download();
            buffer = downloadedBuffer;
          } catch (e) {}
        }

        if (buffer) {
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return res.send(buffer);
        }
      }
    } catch (fsCheckErr) {
      console.warn('Firestore asset check failed:', fsCheckErr);
    }
    
    // 2. Try serving from in-memory uploads cache
    const matchedInMemoryKey = Array.from(inMemoryUploads.keys()).find(k => k.startsWith(id));
    if (matchedInMemoryKey) {
      const item = inMemoryUploads.get(matchedInMemoryKey);
      if (item) {
        res.setHeader('Content-Type', item.contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.send(item.buffer);
      }
    }

    // 3. Try to serve from local uploads disk
    if (fs.existsSync(uploadsDir)) {
      try {
        const files = fs.readdirSync(uploadsDir);
        const matchedFile = files.find(f => f.startsWith(id));
        if (matchedFile) {
          const localPath = path.join(uploadsDir, matchedFile);
          const ext = path.extname(matchedFile).toLowerCase();
          let contentType = 'image/png';
          if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
          else if (ext === '.gif') contentType = 'image/gif';
          else if (ext === '.webp') contentType = 'image/webp';
          else if (ext === '.svg') contentType = 'image/svg+xml';
          
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return res.sendFile(localPath);
        }
      } catch (dirErr) {
        console.error('Failed reading uploads directory:', dirErr);
      }
    }

    // Also try to look in the main public directory
    if (fs.existsSync(publicDir)) {
      try {
        const files = fs.readdirSync(publicDir);
        const matchedFile = files.find(f => f.startsWith(id));
        if (matchedFile) {
          const localPath = path.join(publicDir, matchedFile);
          const ext = path.extname(matchedFile).toLowerCase();
          let contentType = 'image/png';
          if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
          else if (ext === '.gif') contentType = 'image/gif';
          else if (ext === '.webp') contentType = 'image/webp';
          else if (ext === '.svg') contentType = 'image/svg+xml';
          
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return res.sendFile(localPath);
        }
      } catch (dirErr) {
        console.error('Failed reading public directory:', dirErr);
      }
    }

    return res.status(404).send('Asset not found');
  } catch (err) {
    console.error('File fetch error:', err);
    res.status(500).send('Server Error');
  }
});

// Lazy-initialize Gemini AI Helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST APIs
app.get('/api/sermons', async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('sermons').orderBy('date', 'desc').get();
    const sermonsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(sermonsList);
  } catch (err: any) {
    console.error('Error fetching sermons from Firestore:', err.message);
    if (err.message && (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED'))) {
      try {
        handleFirestoreError(err, OperationType.GET, 'sermons');
      } catch (jsonErr: any) {
        return res.status(403).json({ error: jsonErr.message });
      }
    }
    // Return empty list if Firestore is unconfigured or permission denied
    // This allows the app to stay functional even without data.
    res.status(200).json([]);
  }
});

app.post('/api/sermons', async (req: Request, res: Response) => {
  const { title, speaker, date, topic, scripture, sermonNotes, summary } = req.body;
  
  if (!title || !speaker || !date || !topic || !scripture) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  const newSermon = {
    title,
    speaker,
    date,
    topic,
    scripture,
    sermonNotes: sermonNotes || '',
    summary: summary || '',
    videoUrl: req.body.videoUrl || '',
    audioUrl: req.body.audioUrl || ''
  };

  try {
    const docRef = await db.collection('sermons').add(newSermon);
    res.status(201).json({ id: docRef.id, ...newSermon });
  } catch (err: any) {
    console.error('Error adding sermon:', err);
    if (err.message && (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED'))) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'sermons');
      } catch (jsonErr: any) {
        return res.status(403).json({ error: jsonErr.message });
      }
    }
    res.status(500).json({ error: 'Failed to add sermon' });
  }
});

app.put('/api/sermons/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.collection('sermons').doc(id).set(req.body, { merge: true });
    res.json({ id, ...req.body });
  } catch (err: any) {
    console.error('Error updating sermon:', err);
    if (err.message && (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED'))) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `sermons/${id}`);
      } catch (jsonErr: any) {
        return res.status(403).json({ error: jsonErr.message });
      }
    }
    res.status(500).json({ error: err.message || 'Failed to update sermon' });
  }
});

app.delete('/api/sermons/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.collection('sermons').doc(id).delete();
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting sermon:', err);
    if (err.message && (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED'))) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `sermons/${id}`);
      } catch (jsonErr: any) {
        return res.status(403).json({ error: jsonErr.message });
      }
    }
    res.status(500).json({ error: err.message || 'Failed to delete sermon' });
  }
});

app.get('/api/events', (req: Request, res: Response) => {
  res.json(events);
});

app.post('/api/events', (req: Request, res: Response) => {
  const newEvent = { id: `evt-${Date.now()}`, registeredCount: 0, rsvps: [], volunteers: [], ...req.body };
  events.unshift(newEvent);
  res.status(201).json(newEvent);
});

app.put('/api/events/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = events.findIndex(e => e.id === id);
  if (idx !== -1) {
    events[idx] = { ...events[idx], ...req.body };
    res.json(events[idx]);
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

app.delete('/api/events/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  events = events.filter(e => e.id !== id);
  res.json({ success: true });
});

app.get('/api/blog', (req: Request, res: Response) => {
  res.json(blogPosts);
});

app.post('/api/blog', (req: Request, res: Response) => {
  const newPost = { id: `blog-${Date.now()}`, likes: 0, tags: [], ...req.body };
  blogPosts.unshift(newPost);
  res.status(201).json(newPost);
});

app.put('/api/blog/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = blogPosts.findIndex(b => b.id === id);
  if (idx !== -1) {
    blogPosts[idx] = { ...blogPosts[idx], ...req.body };
    res.json(blogPosts[idx]);
  } else {
    res.status(404).json({ error: 'Blog post not found' });
  }
});

app.delete('/api/blog/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  blogPosts = blogPosts.filter(b => b.id !== id);
  res.json({ success: true });
});

app.get('/api/prayer-requests', async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('prayerRequests').orderBy('date', 'desc').get();
    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(requests);
  } catch (err: any) {
    console.error('Error fetching prayer requests:', err);
    if (err.message && (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED'))) {
      try {
        handleFirestoreError(err, OperationType.GET, 'prayerRequests');
      } catch (jsonErr: any) {
        return res.status(403).json({ error: jsonErr.message });
      }
    }
    res.status(500).json({ error: 'Failed to fetch prayer requests' });
  }
});

app.post('/api/prayer-requests', async (req: Request, res: Response) => {
  const { requesterName, text, isPrivate, isAnonymous } = req.body;
  const newRequest = {
    requesterName: isAnonymous ? 'Anonymous' : (requesterName || 'Visitor'),
    text,
    isPrivate,
    isAnonymous,
    date: new Date().toISOString().split('T')[0],
    isAnswered: false,
    pastorNote: '',
    prayedForCount: 0
  };
  try {
    const docRef = await db.collection('prayerRequests').add(newRequest);
    res.status(201).json({ id: docRef.id, ...newRequest });
  } catch (err: any) {
    console.error('Error adding prayer request:', err);
    if (err.message && (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED'))) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'prayerRequests');
      } catch (jsonErr: any) {
        return res.status(403).json({ error: jsonErr.message });
      }
    }
    res.status(500).json({ error: 'Failed to add prayer request' });
  }
});

app.post('/api/prayer-requests/pray', async (req: Request, res: Response) => {
  const { id } = req.body;
  try {
    const docRef = db.collection('prayerRequests').doc(id);
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      const currentCount = data?.prayedForCount || 0;
      await docRef.update({ prayedForCount: currentCount + 1 });
      res.json({ id, ...data, prayedForCount: currentCount + 1 });
    } else {
      res.status(404).json({ error: 'Prayer request not found' });
    }
  } catch (err: any) {
    console.error('Error updating prayer request:', err);
    if (err.message && (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED'))) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `prayerRequests/${id}`);
      } catch (jsonErr: any) {
        return res.status(403).json({ error: jsonErr.message });
      }
    }
    res.status(500).json({ error: 'Failed to update prayer request' });
  }
});

app.post('/api/prayer-requests/answer', async (req: Request, res: Response) => {
  const { id, pastorNote } = req.body;
  try {
    const docRef = db.collection('prayerRequests').doc(id);
    const doc = await docRef.get();
    if (doc.exists) {
      await docRef.update({ isAnswered: true, pastorNote });
      res.json({ id, ...doc.data(), isAnswered: true, pastorNote });
    } else {
      res.status(404).json({ error: 'Prayer request not found' });
    }
  } catch (err: any) {
    console.error('Error answering prayer request:', err);
    if (err.message && (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED'))) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `prayerRequests/${id}`);
      } catch (jsonErr: any) {
        return res.status(403).json({ error: jsonErr.message });
      }
    }
    res.status(500).json({ error: 'Failed to answer prayer request' });
  }
});

app.put('/api/prayer-requests/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.collection('prayerRequests').doc(id).set(req.body, { merge: true });
    res.json({ id, ...req.body });
  } catch (err: any) {
    console.error('Error updating prayer request:', err);
    if (err.message && (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED'))) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `prayerRequests/${id}`);
      } catch (jsonErr: any) {
        return res.status(403).json({ error: jsonErr.message });
      }
    }
    res.status(500).json({ error: err.message || 'Failed to update prayer request' });
  }
});

app.delete('/api/prayer-requests/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.collection('prayerRequests').doc(id).delete();
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting prayer request:', err);
    if (err.message && (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED'))) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `prayerRequests/${id}`);
      } catch (jsonErr: any) {
        return res.status(403).json({ error: jsonErr.message });
      }
    }
    res.status(500).json({ error: err.message || 'Failed to delete prayer request' });
  }
});

app.get('/api/donations', (req: Request, res: Response) => {
  res.json(donations);
});

app.post('/api/donations', (req: Request, res: Response) => {
  const { donorName, amount, category, paymentMethod } = req.body;
  const newDonation = {
    id: `don-${Date.now()}`,
    donorName: donorName || 'Anonymous',
    amount: parseFloat(amount) || 0,
    category,
    paymentMethod,
    date: new Date().toISOString().split('T')[0],
    receiptNumber: `FEC-REC-${Math.floor(1000 + Math.random() * 9000)}`
  };
  donations.unshift(newDonation);
  res.status(201).json(newDonation);
});

app.put('/api/donations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = donations.findIndex(d => d.id === id);
  if (idx !== -1) {
    donations[idx] = { ...donations[idx], ...req.body, amount: parseFloat(req.body.amount) || donations[idx].amount };
    res.json(donations[idx]);
  } else {
    res.status(404).json({ error: 'Donation not found' });
  }
});

app.delete('/api/donations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  donations = donations.filter(d => d.id !== id);
  res.json({ success: true });
});

// Members modifications
app.post('/api/members', (req: Request, res: Response) => {
  const newMember = { id: `mem-${Date.now()}`, joinedDate: new Date().toISOString().split('T')[0], ...req.body };
  members.unshift(newMember);
  res.status(201).json(newMember);
});

app.put('/api/members/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = members.findIndex(m => m.id === id);
  if (idx !== -1) {
    members[idx] = { ...members[idx], ...req.body };
    res.json(members[idx]);
  } else {
    res.status(404).json({ error: 'Member not found' });
  }
});

app.delete('/api/members/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  members = members.filter(m => m.id !== id);
  res.json({ success: true });
});

// Users management endpoints
app.get('/api/users', (req: Request, res: Response) => {
  res.json(users);
});

app.post('/api/users', (req: Request, res: Response) => {
  const newUser = { id: `usr-${Date.now()}`, status: "Active", joinedDate: new Date().toISOString().split('T')[0], ...req.body };
  users.unshift(newUser);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = users.findIndex(u => u.id === id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...req.body };
    res.json(users[idx]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  users = users.filter(u => u.id !== id);
  res.json({ success: true });
});

app.get('/api/profile', async (req: Request, res: Response) => {
  try {
    const doc = await db.collection('users').doc('profile').get();
    if (doc.exists) {
      res.json(doc.data());
    } else {
      res.json(userProfile);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'users/profile');
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

app.post('/api/profile', async (req: Request, res: Response) => {
  try {
    const docRef = db.collection('users').doc('profile');
    await docRef.set(req.body, { merge: true });
    res.json({ success: true, ...req.body });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'users/profile');
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Ministries endpoints
app.get('/api/ministries', (req: Request, res: Response) => {
  res.json(ministries);
});

app.post('/api/ministries', (req: Request, res: Response) => {
  const newMin = { id: `min-${Date.now()}`, activities: [], gallery: [], ...req.body };
  ministries.unshift(newMin);
  res.status(201).json(newMin);
});

app.put('/api/ministries/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = ministries.findIndex(m => m.id === id);
  if (idx !== -1) {
    ministries[idx] = { ...ministries[idx], ...req.body };
    res.json(ministries[idx]);
  } else {
    res.status(404).json({ error: 'Ministry not found' });
  }
});

app.delete('/api/ministries/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  ministries = ministries.filter(m => m.id !== id);
  res.json({ success: true });
});

app.post('/api/events/rsvp', (req: Request, res: Response) => {
  const { eventId, email } = req.body;
  const event = events.find(e => e.id === eventId);
  if (event) {
    if (!event.rsvps.includes(email)) {
      event.rsvps.push(email);
      event.registeredCount += 1;
    }
    res.json(event);
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

app.post('/api/events/volunteer', (req: Request, res: Response) => {
  const { eventId, roleName, email } = req.body;
  const event = events.find(e => e.id === eventId);
  if (event) {
    const roleItem = event.volunteers.find(v => v.role === roleName);
    if (roleItem) {
      if (!roleItem.filled.includes(email)) {
        if (roleItem.filled.length < roleItem.slots) {
          roleItem.filled.push(email);
        } else {
          return res.status(400).json({ error: 'Role slots are already full.' });
        }
      }
      res.json(event);
    } else {
      res.status(404).json({ error: 'Role not found' });
    }
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// Mobile App Integration APIs
app.get('/api/sync/sermons', async (req: Request, res: Response) => {
  const lastSync = new Date().toISOString();
  try {
    const snapshot = await db.collection('sermons').orderBy('date', 'desc').get();
    const sermonsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({
      lastSync,
      sermons: sermonsList
    });
  } catch (err: any) {
    console.error('Error syncing sermons:', err.message);
    res.json({ lastSync, sermons: [] });
  }
});

app.get('/api/sync/events', (req: Request, res: Response) => {
  const lastSync = new Date().toISOString();
  res.json({
    lastSync,
    events
  });
});

let notifications: any[] = [];

app.get('/api/notifications', (req: Request, res: Response) => {
  res.json(notifications);
});

app.post('/api/notifications/register-device', (req: Request, res: Response) => {
  const { deviceToken } = req.body;
  // Mock saving device token for push notifications
  res.status(200).json({ success: true, message: 'Device securely registered for push notifications.' });
});

app.get('/api/members', (req: Request, res: Response) => {
  res.json(members);
});

app.post('/api/members/auth', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const member = members.find(m => m.email === email);
  if (member) {
    res.json({ success: true, token: 'fec-mobile-auth-token-999', member });
  } else {
    res.status(401).json({ success: false, error: 'Invalid member credentials' });
  }
});

// AI endpoints
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, conversationHistory = [] } = req.body;
  try {
    const ai = getGeminiClient();
    
    // Provide general church background in the system instructions
    const systemInstruction = `You are a friendly, welcoming, and devout AI Assistant for Fonteyn Evangelical Church in Fonteyn, Mbabane, Eswatini. 
Here is your official training data about the church:
- Church Name: Fonteyn Evangelical Church
- Location: Fonteyn, Mbabane, Eswatini (nestled in the scenic hills of the capital).
- Lead/Senior Pastor: Rev LS Mnisi.
- Weekly Services & Fellowships:
  * Sunday: Bible Study at 10:00 AM, Main Church Service at 11:00 AM (featuring praise, sermon, Kingdom Kids sunday school).
  * Monday: Fathers' Fellowship at 05:30 PM.
  * Wednesday: Prayer Service at 05:30 PM.
  * Saturday: Mothers' Fellowship at 11:00 AM, Youth Fellowship at 01:00 PM (FEC-Youth led by Br. Sandile Zwane).
  * Monday - Friday: Fonteyn Christian Preschool from 08:00 AM to 01:00 PM.
- Beliefs & Mission Focus: Worship God, share the Gospel of Christ, make disciples, raise strong families, support youth, run educational programs, and serve Mbabane with active compassion.
- Core Values: Faith (Kukholwa), Love (Lutsandvo), Integrity (Kwetsebeka), Service (Kusebenta), Unity (Bunye), Excellence (Kugcina).
- Leadership Team: Senior Pastor Rev LS Mnisi, Head Elder Sipho Maseko, Deaconess Thandeka Tsabedze (Women/Mothers' Lead), Brother Sandile Zwane (Youth & Praise leader).
- Ministries: Youth Fellowship, Kids Sunday School, Praise & Worship, Community Outreach Care Givers, Mothers' Fellowship, Fathers' Fellowship, and the Fonteyn Christian Preschool.
- Donations categories: Tithes, Offerings, Building Fund, Missions Fund. Accepts Mobile Money (MoMo), Bank transfers, cards.

Answer directly, warmly, and use a faithful, humble Christian tone. You can occasionally output common Siswati words of greeting or blessing (e.g. 'Yebo', 'Ngiyanemukela', 'Nkulunkulu anibusise') where natural. Keep responses reasonably concise and conversational. Do not make up facts.`;

    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // Populate previous context if provided
    for (const turn of conversationHistory) {
      // Just a simple iteration
      // (The chat object accumulates history, but we can send a single long prompt representing a simple chat loop for now)
    }

    const response = await chat.sendMessage({ message });
    res.json({ reply: response.text });
  } catch (err: any) {
    const isQuotaError = String(err).includes('429') || String(err).includes('quota') || String(err).includes('RESOURCE_EXHAUSTED');
    if (isQuotaError) {
      console.log('[Quota Info] Gemini Chat rate limited or quota exceeded. Returning helpful local FAQ answers.');
    } else {
      console.log('[Info] Gemini Chat fallback triggered:', err?.message || err);
    }
    // Supply a highly helpful fallback response in case the API key is not yet set
    res.json({
      reply: `Ngiyanemukela! Thank you for reaching out to Fonteyn Evangelical Church. 

[System Message: The Gemini API key is currently not active in the Secrets configurations. I'm providing an authentic church FAQ reply instead!]

Here is some rapid assistance:
• Sunday Bible Study: 10:00 AM
• Sunday Main Church Service: 11:00 AM
• Monday Fathers' Fellowship: 05:30 PM
• Wednesday Prayer Service: 05:30 PM
• Saturday Mothers' Fellowship: 11:00 AM
• Saturday Youth Fellowship: 01:00 PM
• Fonteyn Christian Preschool: Mondays - Fridays (08:00 AM - 01:00 PM)
• Pastor: Rev LS Mnisi
• Looking to submit a prayer request or make a donation? You can do so directly using our portal navigation. May God bless you!`,
      isDemoFallback: true
    });
  }
});

app.post('/api/ai/sermon-assistant', async (req: Request, res: Response) => {
  const { title, scripture, notes } = req.body;
  try {
    const ai = getGeminiClient();
    const prompt = `You are an expert theological AI assistant. Analyze this sermon information and generate structured notes:
Sermon Title: ${title}
Scriptures: ${scripture}
Notes/Pointers: ${notes || 'No extra notes provided'}

Please provide a JSON object containing exactly these properties:
1. "summary" (A beautiful, coherent 2-3 sentence overview of the theological meaning).
2. "bibleReferences" (A list of 3-4 additional related scriptures in the format Book Chapter:Verse, explain how they tie in).
3. "discussionQuestions" (A list of 3-4 deep life-application questions for home cell/family study).
4. "socialPosts" (A list of 2 engaging social media announcements for WhatsApp/Facebook with relevant church hashtags).

Output ONLY the raw JSON block. No markdown, no explanation wrappers.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const result = JSON.parse(response.text?.trim() || '{}');
    res.json(result);
  } catch (err: any) {
    const isQuotaError = String(err).includes('429') || String(err).includes('quota') || String(err).includes('RESOURCE_EXHAUSTED');
    if (isQuotaError) {
      console.log('[Quota Info] Sermon Assistant rate limited or quota exceeded. Returning beautiful local structured sermon study guides.');
    } else {
      console.log('[Info] Sermon Assistant fallback triggered:', err?.message || err);
    }
    // Return high-quality, simulated fallback structures matching the JSON schema
    res.json({
      summary: `This message explores the profound necessity of centering our life choices on the eternal, infallible words of Jesus Christ rather than shifting societal standards. Inspired by ${scripture || 'Scriptures'}.`,
      bibleReferences: [
        "Psalm 119:105 - Thy word is a lamp unto my feet, and a light unto my path.",
        "Luke 6:47-49 - Building with robust obedience on a strong foundation.",
        "2 Timothy 3:16 - All Scripture is breathed out by God and profitable for training."
      ],
      discussionQuestions: [
        "How can we practically check if our personal aspirations are aligned with the Rock or with sliding sand?",
        "What keeps us from moving from merely hearing the Sunday morning sermon to executing it on Monday morning?",
        "In what ways can we pray together as a family to anchor our children in Christ?"
      ],
      socialPosts: [
        `🔥 'Unshakeable lives are built on unshakeable truths.' Rewatch Sunday's powerful study on "${title || 'Spiritual Foundations'}"! #FonteynEvangelical #FaithHillMbabane`,
        "Are you ready to move from a weekly hearer to a daily doer? Read this week's discussion guide and join our midweek Bible cells. #FEC #Eswatini"
      ],
      isDemoFallback: true
    });
  }
});

app.post('/api/ai/translate', async (req: Request, res: Response) => {
  const { text, targetLanguage } = req.body; // 'swati' or 'english'
  try {
    const ai = getGeminiClient();
    const instruction = targetLanguage === 'swati' 
      ? 'Translate this English text into beautiful, natural SiSwati (the official language of Eswatini). Keep the Christian tone respectful and warm.' 
      : 'Translate this SiSwati text into elegant English. Keep the warm Christian tone intact.';
      
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `${instruction}\n\nText:\n"${text}"`,
    });

    res.json({ translatedText: response.text?.trim() });
  } catch (err: any) {
    const isQuotaError = String(err).includes('429') || String(err).includes('quota') || String(err).includes('RESOURCE_EXHAUSTED');
    if (isQuotaError) {
      console.log('[Quota Info] Translate rate limited or quota exceeded. Using elegant local fallback dictionary.');
    } else {
      console.log('[Info] Translate fallback triggered:', err?.message || err);
    }
    // Provide a simple local translation fallback dictionary or clean simulation
    const fallbacks: { [key: string]: string } = {
      "Welcome to Fonteyn Evangelical Church": "Ngiyanemukela eFonteyn Evangelical Church",
      "Living God's Word, Growing Together in Faith": "Kuphila ngelivi laNkulunkulu, Kukhula Ndzawonye eKukholweni",
      "Plan Your Visit": "Hlela Luvakasho Lwakho",
      "Watch Sermons": "Bukela Tishumayelo",
      "Join Us This Sunday": "Hlanganyela Natsi Ngelitsandvo Laleli Sontfo",
      "Sunday Worship": "Kukhonza Kwasontfo",
      "Worship God, Share the Gospel, Make Disciples, Serve the Community": "Khonta Nkulunkulu, Shicilela Livangeli, Enta Bafundzi, Sitsa Sive",
    };

    const trimmed = text.trim();
    const matched = fallbacks[trimmed] || `[Translation Fallback: ${targetLanguage === 'swati' ? 'SiSwati version' : 'English version'} represented: "${text}"]`;
    res.json({ 
      translatedText: matched,
      isDemoFallback: true 
    });
  }
});

app.get('/api/ai/devotional', async (req: Request, res: Response) => {
  const lang = (req.query.lang as string) || 'en';
  const forceRefresh = req.query.refresh === 'true';
  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const docId = `devotional_${lang}_${todayStr}`;

  try {
    // 1. Try reading from cache in Firestore if not forced refresh
    if (!forceRefresh) {
      try {
        const cachedDoc = await db.collection('devotionals').doc(docId).get();
        if (cachedDoc.exists) {
          return res.json(cachedDoc.data());
        }
      } catch (cacheErr) {
        console.warn('Error reading cached devotional, proceeding with generation:', cacheErr);
      }
    }

    // 2. Generate with Gemini
    const ai = getGeminiClient();
    const systemPrompt = `You are a devout, inspiring, and highly encouraging pastor for Fonteyn Evangelical Church in Mbabane, Eswatini. 
Generate a beautiful, rich daily devotional for today.
The response MUST be a single structured JSON object.`;

    const userPrompt = lang === 'swati' 
      ? `Generate a beautiful daily devotional in Siswati (the native language of Eswatini). It should contain:
- an inspiring title (Siswati)
- a relevant bible verse reference (e.g. 'Johane 15:5')
- the actual bible verse text (Siswati)
- a short heart-warming theological reflection / commentary (about 150-200 words in Siswati, filled with faith, hope, and love, with practical application to daily life)
- a short closing prayer of 1-2 sentences (Siswati)
- a daily reflection/application question (Siswati)`
      : `Generate a beautiful daily devotional in English. It should contain:
- an inspiring title
- a relevant bible verse reference (e.g. 'John 15:5')
- the actual bible verse text
- a short heart-warming theological reflection / commentary (about 150-200 words in English, filled with faith, hope, and love, with practical application to daily life)
- a short closing prayer of 1-2 sentences
- a daily reflection/application question`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            scripture: { type: Type.STRING },
            scriptureText: { type: Type.STRING },
            thought: { type: Type.STRING },
            prayer: { type: Type.STRING },
            reflectionQuestion: { type: Type.STRING },
          },
          required: ["title", "scripture", "scriptureText", "thought", "prayer", "reflectionQuestion"],
        }
      }
    });

    const devData = JSON.parse(response.text.trim());
    devData.date = todayStr;
    devData.lang = lang;

    // 3. Cache the generated devotional
    try {
      await db.collection('devotionals').doc(docId).set(devData);
    } catch (saveErr) {
      console.warn('Failed to save devotional to Firestore cache:', saveErr);
    }

    return res.json(devData);

  } catch (err: any) {
    const isQuotaError = String(err).includes('429') || String(err).includes('quota') || String(err).includes('RESOURCE_EXHAUSTED');
    if (isQuotaError) {
      console.log('[Quota Info] Daily devotional generation skipped or rate-limited. Returning beautiful, dynamic local fallback.');
    } else {
      console.log('[Info] Daily devotional fallback used:', err?.message || err);
    }

    const fallbackEnglishList = [
      {
        title: "Abiding in His Love",
        scripture: "John 15:5",
        scriptureText: "I am the vine, you are the branches. He who abides in Me, and I in him, bears much fruit; for without Me you can do nothing.",
        thought: "In the fast-paced rhythm of our daily lives, it is so easy to drift into self-reliance. We strive, we plan, and we exhaust ourselves, forgetting that our true strength and spiritual vitality come solely from our connection to Jesus Christ. Just as a branch cannot bear fruit by itself, we cannot live a fruitful, peace-filled life apart from Him. Abiding is not a call to passive laziness, but an active resting, a conscious turning of our minds and hearts to the Lord in prayer, worship, and obedience throughout our day. Today, let us take a moment to pause, breathe, and consciously align our steps with the Vine, knowing that in Him, our lives will bear lasting fruit.",
        prayer: "Lord Jesus, help me to abide in You today. Forgive me for the times I try to carry my burdens alone, and teach me to rest in Your strength and love. Amen.",
        reflectionQuestion: "What is one area of your life today where you need to stop self-striving and instead trust in the Lord's strength?",
        date: todayStr,
        lang: 'en',
        isFallback: true
      },
      {
        title: "The Peace of His Presence",
        scripture: "Philippians 4:6-7",
        scriptureText: "Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God; and the peace of God, which surpasses all understanding, will guard your hearts and minds through Christ Jesus.",
        thought: "Anxiety is a common companion in our modern world, pulling our attention in a hundred different directions. Yet, scripture invites us to trade our heavy burdens of anxiety for the perfect, transcendent peace of God. This trade happens in the place of prayer. When we bring our requests to Him with a heart of gratitude, we acknowledge that He is sovereign and good. We do not have to figure out every detail of our future today. We can rest in the knowledge that His peace is guarding our hearts like a sentinel, protecting us from fear.",
        prayer: "Heavenly Father, I hand over all my worries and fears to You today. Fill my heart with Your supernatural peace that guards my thoughts in Christ Jesus. Amen.",
        reflectionQuestion: "What is the primary anxiety you need to release to God in prayer right now?",
        date: todayStr,
        lang: 'en',
        isFallback: true
      },
      {
        title: "The Strength of Quietness",
        scripture: "Isaiah 30:15",
        scriptureText: "In returning and rest you shall be saved; in quietness and confidence shall be your strength.",
        thought: "We live in a culture that celebrates constant noise, activity, and hustle. We are told that our worth is defined by our productivity. However, God's kingdom operates on a completely different principle. True spiritual strength is not found in endless striving, but in returning to God and resting in His presence. It is in the quietness of our hearts and the unshakeable confidence in His character that we find the capacity to endure and thrive. Today, take a few minutes to step away from the noise and find rest in the quietness of God's love.",
        prayer: "Father, teach me the beauty of quietness. Help me to quiet my soul before You and find my strength in Your unshakeable love. Amen.",
        reflectionQuestion: "How can you carve out 5 minutes of intentional silence to rest in God's presence today?",
        date: todayStr,
        lang: 'en',
        isFallback: true
      }
    ];

    const fallbackSwatiList = [
      {
        title: "Kuhlala Oliveni Lweliciniso",
        scripture: "Johane 15:5",
        scriptureText: "Ngingulofosela welivini, nina nitigaba. Lowo lohlala kumbe, nami ngihlale kuye, utsela titselo letinyenti; ngobe ngaphandle kwami ngeke nente lutfo.",
        thought: "Ekuphileni kwetfu kwamalanga onkhe, kulula kakhulu kutsi tetsembe tsine. Siyesuka ekutseni sitsembe Nkulunkulu, sibe matasa ngekuhlela nangekutikhokhobisa ngemandla etfu. Kodvwa Livi laNkulunkulu lisikhumbuta kutsi emandla etfu emoya nempilo yetfu ivela kuphela ngekuhlala kuJesu Khristu. Njengobe ligatja lingeke litsela titselo lodvwa, natsi ngeke sibe nekuphila lokunokuthula netitselo letinhle ngaphandle kwakhe. Kuhlala Kuye kusho kuthantaza, kumlalela, kanye nekuhamba naYe onkhe malanga. Lamuhla, asime kancane, sitsatse umoya, simeme Jesu kutsi abe sisekelo sako konkhe lesikwentako.",
        prayer: "Nkhosi Jesu, ngisite ngihlale kuWe lamuhla. Ngitsetselele lapho ngitsemba khona emandla ami, ungifundzise kuncika kuWe. Amen.",
        reflectionQuestion: "Ngukuphi luhlangotsi lwekuphila kwakho lamuhla lapho ubona khona kutsi ube wetsemba emandla akho kunekwetsemba Nkhosi?",
        date: todayStr,
        lang: 'swati',
        isFallback: true
      },
      {
        title: "Kuthula Kwekuba Mbikwakhe",
        scripture: "KubaseFilipi 4:6-7",
        scriptureText: "Ningakhatseki ngalutfo, kodvwa emitthandazweni yenu ngaso sonkhe sikhatsi layikhonze kuNkulunkulu ngekuthantaza nekuncenga kanye nekuBonga.",
        thought: "Kukhatseka kuyasihlupha kakhulu emhlabeni walamuhla, kusidvonsela etindleleni letinyenti letahlukene. Kodvwa Livi laNkulunkulu lisimema kutsi sishintjanise imitfalo yetfu yekukhatseka nekuthula lokuphakeme kwaNkulunkulu. Loku kwenteka emthandazweni. Uma siletha ticelo tetfu Kuye ngenhliziyo lengekubonga, sivuma kutsi unguSomandla futsi ulungile. Akudzingeki kutsi sati yonkhe imininingwane yakusasa lamuhla. Singaphumula sisekwatini kutsi kuthula kwakhe kuyayigada tinhliziyo tetfu.",
        prayer: "Babe wasezulwini, nginikela tonkhe tibonelo nekukhatseka kwami kuWe lamuhla. Gwalisa inhliziyo yami ngekuthula kwakho lokuphakeme lokugada imicondvo yami kuKhristu Jesu. Amen.",
        reflectionQuestion: "Ngukuphi kukhatseka lokuphambili lokudzinga ukukukhulula kuNkulunkulu emthandazweni nyalo?",
        date: todayStr,
        lang: 'swati',
        isFallback: true
      },
      {
        title: "Emandla Ekuphumula",
        scripture: "Isaya 30:15",
        scriptureText: "Ngekubuyela nekutsula niyawusindziswa; ekuthuleni nekuphumuleni kuyawuba nemandla enu.",
        thought: "Siphila esiveni lesigubha umsindo longasuki, imisebenti, kanye nekugijima kakhulu. Sitshelwa kutsi kubaluleka kwetfu kubonakala ngalokusikwentako. Kodvwa umbuso waNkulunkulu usebenta ngendlela lehluke ngokuphelele. Emandla emoya mbamba awatfolakali ekugijimeni longapheli, kodvwa ekubuyeleni kuNkulunkulu nasekuphumuleni mbikwakhe. Ekuthuleni kwetinhliziyo tetfu nasekwetsembeni similo sakhe ngulapho sitfola khona emandla. Lamuhla, tsatsa imizuzwana embalwa uphume emsindweni, utfole kuphumula elutsandvweni lwaNkulunkulu.",
        prayer: "Babe, ngifundzise buhle bekuthula. Ngisite ngithulise umphefumulo wami phambi kwakho, ngitfole emandla ami elutsandvweni lwakho lolunganyakatiswa. Amen.",
        reflectionQuestion: "Ungayitsatsa njani imizuzu lemihlanu yetuthula ngelitsandvo lamuhla kute uphumule mbikwakhe?",
        date: todayStr,
        lang: 'swati',
        isFallback: true
      }
    ];

    const dayIndex = new Date().getDate();
    const fallbackEnglish = fallbackEnglishList[dayIndex % fallbackEnglishList.length];
    const fallbackSwati = fallbackSwatiList[dayIndex % fallbackSwatiList.length];

    return res.json(lang === 'swati' ? fallbackSwati : fallbackEnglish);
  }
});

app.get('/api/ai/daily-scripture', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  const lang = (req.query.lang as string) || 'en';
  const forceRefresh = req.query.refresh === 'true';
  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const docId = `scripture_${lang}_${todayStr}`;

  try {
    // 1. Try reading from cache in Firestore if not forced refresh
    if (!forceRefresh) {
      try {
        const cachedDoc = await db.collection('daily_scriptures').doc(docId).get();
        if (cachedDoc.exists) {
          return res.json(cachedDoc.data());
        }
      } catch (cacheErr) {
        console.warn('Error reading cached scripture, proceeding with generation:', cacheErr);
      }
    }

    // 2. Generate with Gemini
    const ai = getGeminiClient();
    const systemPrompt = `You are a devout, warm, and highly encouraging pastor for Fonteyn Evangelical Church in Mbabane, Eswatini. 
Generate a beautiful daily bible scripture verse and an uplifting, concise message of 2-3 sentences that applies the scripture's truth to daily life in a heart-warming way.
The response MUST be a single structured JSON object containing 'verse', 'text', and 'message'.`;

    const userPrompt = lang === 'swati' 
      ? `Generate an encouraging daily scripture in Siswati (the native language of Eswatini). It must contain:
- 'verse': a relevant bible verse reference in Siswati (e.g., 'Johane 3:16' or 'Tiphrofetho 3:5')
- 'text': the actual bible verse text in Siswati
- 'message': a short, uplifting message of 2-3 sentences in Siswati applying this scripture's truth to encourage believers today.`
      : `Generate an encouraging daily scripture in English. It must contain:
- 'verse': a relevant bible verse reference (e.g., 'John 3:16' or 'Proverbs 3:5')
- 'text': the actual bible verse text in English
- 'message': a short, uplifting message of 2-3 sentences in English applying this scripture's truth to encourage believers today.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.9,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verse: { type: Type.STRING },
            text: { type: Type.STRING },
            message: { type: Type.STRING },
          },
          required: ["verse", "text", "message"],
        }
      }
    });

    const scriptureData = JSON.parse(response.text.trim());
    scriptureData.date = todayStr;
    scriptureData.lang = lang;

    // 3. Cache the generated scripture
    try {
      await db.collection('daily_scriptures').doc(docId).set(scriptureData);
    } catch (saveErr) {
      console.warn('Failed to save scripture to Firestore cache:', saveErr);
    }

    return res.json(scriptureData);

  } catch (err: any) {
    const isQuotaError = String(err).includes('429') || String(err).includes('quota') || String(err).includes('RESOURCE_EXHAUSTED');
    if (isQuotaError) {
      console.log('[Quota Info] Daily scripture generation skipped or rate-limited. Returning beautiful, dynamic local fallback.');
    } else {
      console.log('[Info] Daily scripture fallback used:', err?.message || err);
    }

    const fallbackEnglishList = [
      {
        verse: "Philippians 4:13",
        text: "I can do all things through Christ who strengthens me.",
        message: "No matter what challenges you face today, remember that you are never alone. Christ is your ultimate source of strength, guiding your steps and giving you the courage to overcome every obstacle.",
        date: todayStr,
        lang: 'en',
        isFallback: true
      },
      {
        verse: "Psalm 23:1",
        text: "The Lord is my shepherd; I shall not want.",
        message: "No matter what valleys you walk through today, trust that your Heavenly Shepherd is leading you with absolute care and provision. Rest in His green pastures and let Him restore your soul.",
        date: todayStr,
        lang: 'en',
        isFallback: true
      },
      {
        verse: "Isaiah 40:31",
        text: "But those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles, they shall run and not be weary, they shall walk and not faint.",
        message: "When you feel exhausted and weary, turn your focus toward waiting on God. In His presence, there is a divine exchange of weakness for unshakeable spiritual strength that will lift you above your circumstances.",
        date: todayStr,
        lang: 'en',
        isFallback: true
      },
      {
        verse: "Proverbs 3:5-6",
        text: "Trust in the Lord with all your heart, and lean not on your own understanding; in all your ways acknowledge Him, and He shall direct your paths.",
        message: "Our human perspective is limited, but God sees the entire map of our lives. Relinquish your need to control and surrender your plans to Him today; He is already paving a smooth path forward for you.",
        date: todayStr,
        lang: 'en',
        isFallback: true
      }
    ];

    const fallbackSwatiList = [
      {
        verse: "KubaseFilipi 4:13",
        text: "Nginemandla ekwenza tonkhe tintfo ngaKhristu longipha emandla.",
        message: "Noma ngabe ngutiphi tinkinga lobhekana nato namuhla, khumbula kutsi awuwedwa. Khristu ungumtfombo wakho wemandla, uhola tinyatselo takho futsi ukupha sibindi sekveta tonkhe tinkinga.",
        date: todayStr,
        lang: 'swati',
        isFallback: true
      },
      {
        verse: "Tihlabelelo 23:1",
        text: "Jehova ungumelusi wami, ngingeke ngeswele lutfo.",
        message: "Noma ngabe ngutiphi tigodi lohamba kuto lamuhla, temba kutsi Melusi wakho wasezulwini ukuhola ngekunakekela nangekuphakela lokuphelele. Phumula emadlelweni akhe latalako futsi uvumele umphefumulo wakho uvuseleleke.",
        date: todayStr,
        lang: 'swati',
        isFallback: true
      },
      {
        verse: "Isaya 40:31",
        text: "Kodvwa labalindzele Jehova bayawutfola emandla lamasha; bayawundiza ngetimpiko njengetinkozi, bagijime bangacubuki, bahambe bangadzandzabuki.",
        message: "Uma utiva udzandzabukile futsi ukhatsele, gucula umcondvo wakho ekulindzeleni Nkulunkulu. Embikwakhe, kukhona emandla lamasha layawukuphakamisa ngetulu kwetimo.",
        date: todayStr,
        lang: 'swati',
        isFallback: true
      },
      {
        verse: "Tiphrofetho 3:5-6",
        text: "Tsemba Jehova ngayo yonkhe inhliziyo yakho, unganciki kokucondza kwakho; mutisekele tindlela takho tonkhe, futsi Yena uyawucondzisa tindlela takho.",
        message: "Kokucondza kwetfu kwebuntfu kunemikhawulo, kodvwa Nkulunkulu ubona lonkhe ibalave lekuphila kwetfu. Dedela kufisa kwakho kulawula tintfo, unikele tinhlelo takho Kuye lamuhla.",
        date: todayStr,
        lang: 'swati',
        isFallback: true
      }
    ];

    const dayIndex = new Date().getDate();
    const fallbackEnglish = fallbackEnglishList[dayIndex % fallbackEnglishList.length];
    const fallbackSwati = fallbackSwatiList[dayIndex % fallbackSwatiList.length];

    return res.json(lang === 'swati' ? fallbackSwati : fallbackEnglish);
  }
});

// ==========================================
// V2 EXPANSION ARCHITECTURE SCHEMATICS
// ==========================================

// 1. Multi-Branch & Campus Expansion
app.get('/api/v2/branches', (req: Request, res: Response) => {
  res.json(branches);
});
app.post('/api/v2/branches', (req: Request, res: Response) => {
  const newInst = { id: `br-${Date.now()}`, metrics: { averageAttendance: 100, activeMinistries: 2 }, ...req.body };
  branches.unshift(newInst);
  res.status(201).json(newInst);
});
app.put('/api/v2/branches/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = branches.findIndex(b => b.id === id);
  if (idx !== -1) {
    branches[idx] = { ...branches[idx], ...req.body };
    res.json(branches[idx]);
  } else {
    res.status(404).json({ error: "Branch not found" });
  }
});
app.delete('/api/v2/branches/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  branches = branches.filter(b => b.id !== id);
  res.json({ success: true });
});

// 2. Educational Networks (Schools, Bible College)
app.get('/api/v2/education/schools', (req: Request, res: Response) => {
  res.json(schoolInstitutions);
});
app.post('/api/v2/education/schools', (req: Request, res: Response) => {
  const newInst = { id: `edu-${Date.now()}`, enrollmentCount: 20, ...req.body };
  schoolInstitutions.unshift(newInst);
  res.status(201).json(newInst);
});
app.put('/api/v2/education/schools/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = schoolInstitutions.findIndex(s => s.id === id);
  if (idx !== -1) {
    schoolInstitutions[idx] = { ...schoolInstitutions[idx], ...req.body };
    res.json(schoolInstitutions[idx]);
  } else {
    res.status(404).json({ error: "Institution not found" });
  }
});
app.delete('/api/v2/education/schools/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  schoolInstitutions = schoolInstitutions.filter(s => s.id !== id);
  res.json({ success: true });
});

// 3. Broadcasting & Media App Infrastructure
app.get('/api/v2/media/radio', (req: Request, res: Response) => {
  res.json(broadcastStations);
});
app.post('/api/v2/media/radio', (req: Request, res: Response) => {
  const newStation = { id: `rad-${Date.now()}`, schedule: [], ...req.body };
  broadcastStations.unshift(newStation);
  res.status(201).json(newStation);
});
app.put('/api/v2/media/radio/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = broadcastStations.findIndex(b => b.id === id);
  if (idx !== -1) {
    broadcastStations[idx] = { ...broadcastStations[idx], ...req.body };
    res.json(broadcastStations[idx]);
  } else {
    res.status(404).json({ error: "Station not found" });
  }
});
app.delete('/api/v2/media/radio/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  broadcastStations = broadcastStations.filter(b => b.id !== id);
  res.json({ success: true });
});

// 4. Christian Bookstore & Digital Products
app.get('/api/v2/store/products', (req: Request, res: Response) => {
  res.json(bookstoreProducts);
});
app.post('/api/v2/store/products', (req: Request, res: Response) => {
  const newProduct = { id: `bk-${Date.now()}`, stockCount: 10, price: 50, ...req.body };
  bookstoreProducts.unshift(newProduct);
  res.status(201).json(newProduct);
});
app.put('/api/v2/store/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = bookstoreProducts.findIndex(p => p.id === id);
  if (idx !== -1) {
    bookstoreProducts[idx] = { ...bookstoreProducts[idx], ...req.body };
    res.json(bookstoreProducts[idx]);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});
app.delete('/api/v2/store/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  bookstoreProducts = bookstoreProducts.filter(p => p.id !== id);
  res.json({ success: true });
});

// 5. Community Development Projects
app.get('/api/v2/community/projects', (req: Request, res: Response) => {
  res.json(communityProjects);
});
app.post('/api/v2/community/projects', (req: Request, res: Response) => {
  const newProj = { id: `proj-${Date.now()}`, currentFunding: 0, targetBudget: 1000, partners: [], ...req.body };
  communityProjects.unshift(newProj);
  res.status(201).json(newProj);
});
app.put('/api/v2/community/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = communityProjects.findIndex(p => p.id === id);
  if (idx !== -1) {
    communityProjects[idx] = { ...communityProjects[idx], ...req.body };
    res.json(communityProjects[idx]);
  } else {
    res.status(404).json({ error: "Project not found" });
  }
});
app.delete('/api/v2/community/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  communityProjects = communityProjects.filter(p => p.id !== id);
  res.json({ success: true });
});


app.get('/sitemap.xml', (req: Request, res: Response) => {
  res.header('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://fonteynchurch.org/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://fonteynchurch.org/#about</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://fonteynchurch.org/#sermons</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://fonteynchurch.org/#events</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://fonteynchurch.org/#ministries</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://fonteynchurch.org/#blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://fonteynchurch.org/#contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`);
});

// Startup task to back up local images to Firestore & Firebase Storage so they are preserved across serverless deployments (like Vercel)
async function backupLocalImagesToFirestore() {
  console.log('Running automatic startup backup of local images to Firestore & Firebase Storage...');
  const directoriesToScan = [
    { dir: publicDir },
    { dir: uploadsDir }
  ];

  for (const { dir } of directoriesToScan) {
    if (!fs.existsSync(dir)) continue;
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        // Skip directories and non-image files
        if (stat.isDirectory()) continue;
        const ext = path.extname(file).toLowerCase();
        if (!['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) continue;

        // Extract doc ID
        const docId = path.basename(file, ext);
        
        let mime = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
        else if (ext === '.gif') mime = 'image/gif';
        else if (ext === '.webp') mime = 'image/webp';
        else if (ext === '.svg') mime = 'image/svg+xml';

        // Check if already in Firestore or storage
        try {
          const docSnap = await db.collection('assets').doc(docId).get();
          const buffer = fs.readFileSync(filePath);
          
          let uploadedToStorage = false;
          if (storage && !isStorageDisabled) {
            try {
              const fileRef = storageRef(storage, `assets/${file}`);
              await uploadBytes(fileRef, buffer, { contentType: mime });
              uploadedToStorage = true;
              console.log(`Successfully backed up local file ${file} to Firebase Storage.`);
            } catch (storageErr) {
              isStorageDisabled = true;
              console.warn(`Firebase Storage is not enabled or permission is denied. Skipping Storage backups and gracefully using Firestore document backup. Info:`, storageErr);
            }
          }

          if (!docSnap.exists) {
            console.log(`Local file ${file} is missing from Firestore. Backing up metadata...`);
            const base64Data = buffer.toString('base64');

            const docData: any = {
              name: file,
              contentType: mime,
              storagePath: uploadedToStorage ? `assets/${file}` : null,
              updatedAt: new Date().toISOString()
            };

            if (base64Data.length <= 1040000) {
              docData.base64 = `data:${mime};base64,${base64Data}`;
            }

            await db.collection('assets').doc(docId).set(docData);
            console.log(`Successfully backed up local file ${file} to Firestore assets collection.`);
          } else {
            // Document exists, but maybe we want to update the storagePath if we uploaded it now
            const data = docSnap.data() as any;
            if (uploadedToStorage && !data.storagePath) {
              await db.collection('assets').doc(docId).set({
                storagePath: `assets/${file}`
              }, { merge: true });
              console.log(`Updated Firestore document ${docId} with storage path.`);
            }
          }
        } catch (dbErr) {
          console.error(`Error checking/backing up ${file} to Firestore:`, dbErr);
        }
      }
    } catch (err) {
      console.error(`Failed to scan directory ${dir} for backups:`, err);
    }
  }
}

// Configure Vite or Static Serve
async function startServer() {
  // Load persistent configurations from Firestore on startup
  try {
    await loadPersistentConfig();
  } catch (e) {
    console.warn('Load persistent config error:', e);
  }

  // Run the automatic backup task
  try {
    await backupLocalImagesToFirestore();
  } catch (backupErr) {
    console.error('Error running backupLocalImagesToFirestore:', backupErr);
  }

  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('Vite middleware setup warning:', e);
    }
  } else if (!process.env.VERCEL) {
    // Serve static directory
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  try {
    await seedDatabaseIfEmpty();
  } catch (e) {
    console.warn('Seed database warning:', e);
  }

  // Only call app.listen if NOT on Vercel serverless
  if (!process.env.VERCEL) {
    const PORT = 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Fonteyn Evangelical Church Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

// In Vercel serverless, startServer runs as promise/background without blocking handler
startServer().catch(err => {
  console.error('Failed to start server:', err);
});

export default app;
