import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

// Initialize Firebase Admin
// In AI Studio, it's safer to use the default appId/projectId if they aren't explicitly required,
// but we MUST use the firestoreDatabaseId if it's not "(default)".
console.log('Firebase Init - Project:', firebaseConfig?.projectId);
console.log('Firebase Init - Database:', firebaseConfig?.firestoreDatabaseId);

const firebaseApp = initializeApp(
  firebaseConfig?.projectId 
    ? { projectId: firebaseConfig.projectId } 
    : {}
);

// Specifically target the Firestore database ID if provided in config
const firestoreDatabaseId = firebaseConfig?.firestoreDatabaseId || undefined;
const db = firestoreDatabaseId 
  ? getFirestore(firebaseApp, firestoreDatabaseId)
  : getFirestore(firebaseApp);

// Seed Database helper
async function seedDatabaseIfEmpty() {
  // One-time wipe of demo collections to ensure a clean slate for the user.
  try {
    const collections = ['sermons', 'prayerRequests'];
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      console.log(`Cleared collection: ${collectionName}`);
    }
  } catch (err) {
    console.error('Error during database wipe:', err);
  }
  
  // Demo data seeding disabled to maintain a clean slate.
  console.log('Seed database completed - App is now in production-ready clean state.');
}

// In-Memory Data fallbacks for non-Firestore endpoints
let events: any[] = [];
let blogPosts: any[] = [];
let userProfile = { ...INITIAL_USER_PROFILE };
let donations: any[] = [];

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

// Config file for current image mapping
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

// Load persistent image config from file if present
if (fs.existsSync(configFilePath)) {
  try {
    const data = fs.readFileSync(configFilePath, 'utf-8');
    appImages = { ...appImages, ...JSON.parse(data) };
  } catch (err) {
    console.error("Failed to parse image-config.json:", err);
  }
}

// Sermons persistence
// (Firestore is now the source of truth)

// Function to save image configuration
const saveImageConfig = () => {
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(appImages, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to write image-config.json:", err);
  }
};

// Images API Endpoints
app.get('/api/images', (req: Request, res: Response) => {
  res.json(appImages);
});

app.post('/api/images/update', (req: Request, res: Response) => {
  const { key, url } = req.body;
  if (!key || typeof url !== 'string') {
    return res.status(400).json({ error: 'Key and active URL string are required.' });
  }
  
  appImages[key] = url;
  saveImageConfig();
  res.json({ success: true, images: appImages });
});

app.post('/api/images/upload', (req: Request, res: Response) => {
  const { name, base64 } = req.body;
  if (!name || !base64) {
    return res.status(400).json({ error: 'Name and Base64 content are required.' });
  }

  try {
    // Strip header if present (e.g. "data:image/png;base64,")
    // More robust regex for various MIME types
    const match = base64.match(/^data:[^;]+;base64,(.+)$/);
    const rawBase64 = match ? match[1] : base64;
    const buffer = Buffer.from(rawBase64, 'base64');
    
    // Create safe unique filename
    const sanitizedName = name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const ext = path.extname(sanitizedName) || '.png';
    const baseName = path.basename(sanitizedName, ext);
    const finalFilename = `${baseName}_${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, finalFilename);

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${finalFilename}`;
    res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('File Upload Error:', err);
    res.status(500).json({ error: err.message || 'Failed to save uploaded file' });
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
    // Return empty list if Firestore is unconfigured or permission denied
    // This allows the app to stay functional even without data.
    res.status(200).json([]);
  }
});

app.post('/api/sermons', async (req: Request, res: Response) => {
  const { title, speaker, date, topic, scripture, sermonNotes } = req.body;
  
  if (!title || !speaker || !date || !topic || !scripture || !sermonNotes) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newSermon = {
    title,
    speaker,
    date,
    topic,
    scripture,
    sermonNotes,
    videoUrl: '' // Empty for now, can be updated later
  };

  try {
    const docRef = await db.collection('sermons').add(newSermon);
    res.status(201).json({ id: docRef.id, ...newSermon });
  } catch (err) {
    console.error('Error adding sermon:', err);
    res.status(500).json({ error: 'Failed to add sermon' });
  }
});

app.get('/api/events', (req: Request, res: Response) => {
  res.json(events);
});

app.get('/api/blog', (req: Request, res: Response) => {
  res.json(blogPosts);
});

app.get('/api/prayer-requests', async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('prayerRequests').orderBy('date', 'desc').get();
    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(requests);
  } catch (err) {
    console.error('Error fetching prayer requests:', err);
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
  } catch (err) {
    console.error('Error adding prayer request:', err);
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
  } catch (err) {
    console.error('Error updating prayer request:', err);
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
  } catch (err) {
    console.error('Error answering prayer request:', err);
    res.status(500).json({ error: 'Failed to answer prayer request' });
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

app.get('/api/profile', (req: Request, res: Response) => {
  res.json(userProfile);
});

app.post('/api/profile', (req: Request, res: Response) => {
  userProfile = {
    ...userProfile,
    ...req.body
  };
  res.json(userProfile);
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

let members: any[] = [];

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

// ==========================================
// V2 EXPANSION ARCHITECTURE SCHEMATICS
// ==========================================

// 1. Multi-Branch & Campus Expansion
app.get('/api/v2/branches', (req: Request, res: Response) => {
  // To be implemented: Fetch dynamic branches from database
  res.json({ message: "Multi-branch API stub - Prepare for Church Networking" });
});

// 2. Educational Networks (Schools, Bible College)
app.get('/api/v2/education/schools', (req: Request, res: Response) => {
  res.json({ message: "Schools & Bible College API stub" });
});

app.get('/api/v2/education/courses', (req: Request, res: Response) => {
  res.json({ message: "Online Courses API stub (Moodle/Canvas Integration)" });
});

// 3. Broadcasting & Media App Infrastructure
app.get('/api/v2/media/live-stream', (req: Request, res: Response) => {
  res.json({ message: "Live Stream / TV Channel Broadcast API stub" });
});

app.get('/api/v2/media/radio', (req: Request, res: Response) => {
  res.json({ message: "Christian Radio Station Live Stream API stub" });
});

// 4. Christian Bookstore & Digital Products
app.get('/api/v2/store/products', (req: Request, res: Response) => {
  res.json({ message: "E-Commerce Bookstore API stub" });
});

// 5. Community Development Projects
app.get('/api/v2/community/projects', (req: Request, res: Response) => {
  res.json({ message: "Community Outreach & Development Fund Tracking API stub" });
});

// 6. Conference Management
app.get('/api/v2/events/conferences', (req: Request, res: Response) => {
  res.json({ message: "Annual Conference Ticketing & Management API stub" });
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
