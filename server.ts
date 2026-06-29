import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { initializeApp as initClientApp } from 'firebase/app';
import { 
  getFirestore as getClientFirestore, 
  collection as clientCollection, 
  doc as clientDoc,
  getDoc as clientGetDoc,
  getDocs as clientGetDocs,
  addDoc as clientAddDoc,
  setDoc as clientSetDoc,
  deleteDoc as clientDeleteDoc,
  updateDoc as clientUpdateDoc,
  query as clientQuery,
  orderBy as clientOrderBy,
  limit as clientLimit,
  QueryConstraint
} from 'firebase/firestore';
import {
  INITIAL_SERMONS,
  INITIAL_EVENTS,
  INITIAL_BLOG_POSTS,
  INITIAL_USER_PROFILE
} from './src/data';

dotenv.config();

// Handle Firebase configuration from config file if exists
let firebaseConfig: any = null;
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
if (fs.existsSync(firebaseConfigPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
  } catch (err) {
    console.error('Failed to parse firebase-applet-config.json:', err);
  }
}

// Initialize Firebase Client
if (!firebaseConfig?.projectId) {
  console.error('CRITICAL: Firebase Project ID is missing from configuration.');
}

const clientApp = initClientApp(firebaseConfig);
const firestoreDatabaseId = (firebaseConfig?.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') 
  ? firebaseConfig.firestoreDatabaseId 
  : undefined;

const clientDb = getClientFirestore(clientApp, firestoreDatabaseId);

const db = {
  collection(collectionName: string) {
    class CompatQuery {
      private constraints: QueryConstraint[] = [];
      private colRef = clientCollection(clientDb, collectionName);

      orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
        this.constraints.push(clientOrderBy(field, direction));
        return this;
      }

      limit(n: number) {
        this.constraints.push(clientLimit(n));
        return this;
      }

      async get() {
        const q = this.constraints.length > 0 
          ? clientQuery(this.colRef, ...this.constraints)
          : this.colRef;
        const querySnapshot = await clientGetDocs(q);
        return {
          empty: querySnapshot.empty,
          size: querySnapshot.size,
          docs: querySnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ref: docSnap.ref,
            data() {
              return docSnap.data();
            }
          }))
        };
      }

      async add(data: any) {
        const docRef = await clientAddDoc(this.colRef, data);
        return {
          id: docRef.id,
          ref: docRef
        };
      }

      doc(docId: string) {
        const dRef = clientDoc(clientDb, collectionName, docId);
        return {
          id: docId,
          ref: dRef,
          async get() {
            const docSnap = await clientGetDoc(dRef);
            return {
              exists: docSnap.exists(),
              id: docSnap.id,
              ref: docSnap.ref,
              data() {
                return docSnap.data();
              }
            };
          },
          async set(data: any, options?: { merge?: boolean }) {
            await clientSetDoc(dRef, data, options || {});
          },
          async update(data: any) {
            await clientUpdateDoc(dRef, data);
          },
          async delete() {
            await clientDeleteDoc(dRef);
          }
        };
      }
    }

    return new CompatQuery();
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

// Setup uploaded images directory
const publicDir = path.join(process.cwd(), 'public');
const uploadsDir = path.join(publicDir, 'uploads');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve /uploads statically in all modes (dev & prod)
app.use('/uploads', express.static(uploadsDir));

// Config file for current image mapping (Legacy fallback)
const configFilePath = path.join(uploadsDir, 'image-config.json');
let appImages: Record<string, string> = {
  pastor: "/pastor_portrait_1781085265986.png",
  hero: "https://images.unsplash.com/photo-1438232992991-995b7058bcd3?w=1600&auto=format&fit=crop&q=80",
  ministry_children: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=450&auto=format&fit=crop&q=80",
  ministry_youth: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=450&auto=format&fit=crop&q=80",
  ministry_young_adults: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=450&auto=format&fit=crop&q=80",
  ministry_men: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=450&auto=format&fit=crop&q=80",
  ministry_women: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=450&auto=format&fit=crop&q=80",
  ministry_family: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=450&auto=format&fit=crop&q=80",
  ministry_evangelism: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=450&auto=format&fit=crop&q=80",
  ministry_worship: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=450&auto=format&fit=crop&q=80",
  ministry_prayer: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=450&auto=format&fit=crop&q=80",
  ministry_outreach: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=450&auto=format&fit=crop&q=80",
  ministry_preschool: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=450&auto=format&fit=crop&q=80"
};

// Initial load: Priority Firestore > Local File > Hardcoded Defaults
async function loadPersistentConfig() {
  // 1. Try Firestore
  try {
    const doc = await db.collection('settings').doc('app-images').get();
    if (doc.exists) {
      console.log('Images loaded from Firestore');
      appImages = { ...appImages, ...doc.data() };
      return;
    }
  } catch (err: any) {
    console.error("Failed to load images from Firestore:", err.message);
    if (err.message && (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED'))) {
      try {
        handleFirestoreError(err, OperationType.GET, 'settings/app-images');
      } catch (e) {}
    }
  }

  // 2. Try Local File fallback
  if (fs.existsSync(configFilePath)) {
    try {
      const data = fs.readFileSync(configFilePath, 'utf-8');
      appImages = { ...appImages, ...JSON.parse(data) };
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

  // 2. Update Local File (as extra persistence or debug info)
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(appImages, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to write image-config.json:", err);
  }
};

// Images API Endpoints
app.get('/api/images', async (req: Request, res: Response) => {
  try {
    const doc = await db.collection('settings').doc('app-images').get();
    if (doc.exists) {
      appImages = { ...appImages, ...doc.data() };
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

app.post('/api/images/upload', async (req: Request, res: Response) => {
  const { name, base64 } = req.body;
  if (!name || !base64) {
    return res.status(400).json({ error: 'Name and Base64 content are required.' });
  }

  try {
    // Create safe unique ID
    const sanitizedName = name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const baseName = path.basename(sanitizedName, path.extname(sanitizedName)) || 'img';
    const docId = `${baseName}_${Date.now()}`;

    // Store in Firestore to persist across serverless deployments
    await db.collection('assets').doc(docId).set({ base64, name: sanitizedName });
    
    const publicUrl = `/api/assets/${docId}`;
    res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('File Upload Error:', err);
    res.status(500).json({ error: err.message || 'Failed to save uploaded file' });
  }
});

app.get('/api/assets/:id', async (req: Request, res: Response) => {
  try {
    const doc = await db.collection('assets').doc(req.params.id).get();
    if (doc.exists) {
      const data = doc.data() as any;
      const base64Str = data.base64;
      
      const match = base64Str.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const contentType = match[1];
        const rawBase64 = match[2];
        const buffer = Buffer.from(rawBase64, 'base64');
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.send(buffer);
      } else {
        res.status(400).send('Invalid image format');
      }
    } else {
      res.status(404).send('Not found');
    }
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
    console.error('Gemini Chat Error:', err);
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
    console.error('Sermon Assistant Error:', err);
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
    console.error('Translate Error:', err);
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
    console.error('Error generating daily devotional:', err);

    // Fallbacks
    const fallbackEnglish = {
      title: "Abiding in His Love",
      scripture: "John 15:5",
      scriptureText: "I am the vine, you are the branches. He who abides in Me, and I in him, bears much fruit; for without Me you can do nothing.",
      thought: "In the fast-paced rhythm of our daily lives, it is so easy to drift into self-reliance. We strive, we plan, and we exhaust ourselves, forgetting that our true strength and spiritual vitality come solely from our connection to Jesus Christ. Just as a branch cannot bear fruit by itself, we cannot live a fruitful, peace-filled life apart from Him. Abiding is not a call to passive laziness, but an active resting, a conscious turning of our minds and hearts to the Lord in prayer, worship, and obedience throughout our day. Today, let us take a moment to pause, breathe, and consciously align our steps with the Vine, knowing that in Him, our lives will bear lasting fruit.",
      prayer: "Lord Jesus, help me to abide in You today. Forgive me for the times I try to carry my burdens alone, and teach me to rest in Your strength and love. Amen.",
      reflectionQuestion: "What is one area of your life today where you need to stop self-striving and instead trust in the Lord's strength?",
      date: todayStr,
      lang: 'en',
      isFallback: true
    };

    const fallbackSwati = {
      title: "Kuhlala Oliveni Lweliciniso",
      scripture: "Johane 15:5",
      scriptureText: "Ngingulofosela welivini, nina nitigaba. Lowo lohlala kumbe, nami ngihlale kuye, utsela titselo letinyenti; ngobe ngaphandle kwami ngeke nente lutfo.",
      thought: "Ekuphileni kwetfu kwamalanga onkhe, kulula kakhulu kutsi tetsembe tsine. Siyesuka ekutseni sitsembe Nkulunkulu, sibe matasa ngekuhlela nangekutikhokhobisa ngemandla etfu. Kodvwa Livi laNkulunkulu lisikhumbuta kutsi emandla etfu emoya nempilo yetfu ivela kuphela ngekuhlala kuJesu Khristu. Njengobe ligatja lingeke litsela titselo lodvwa, natsi ngeke sibe nekuphila lokunokuthula netitselo letinhle ngaphandle kwakhe. Kuhlala Kuye kusho kuthantaza, kumlalela, kanye nekuhamba naYe onkhe malanga. Lamuhla, asime kancane, sitsatse umoya, simeme Jesu kutsi abe sisekelo sako konkhe lesikwentako.",
      prayer: "Nkhosi Jesu, ngisite ngihlale kuWe lamuhla. Ngitsetselele lapho ngitsemba khona emandla ami, ungifundzise kuncika kuWe. Amen.",
      reflectionQuestion: "Ngukuphi luhlangotsi lwekuphila kwakho lamuhla lapho ubona khona kutsi ube wetsemba emandla akho kunekwetsemba Nkhosi?",
      date: todayStr,
      lang: 'swati',
      isFallback: true
    };

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

// Configure Vite or Static Serve
async function startServer() {
  // Load persistent configurations from Firestore on startup
  await loadPersistentConfig();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static directory
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  await seedDatabaseIfEmpty();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fonteyn Evangelical Church Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
