export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  topic: string;
  scripture: string;
  videoUrl?: string;
  audioUrl?: string;
  sermonNotes?: string;
  summary?: string;
  discussionQuestions?: string[];
  socialPosts?: string[];
}

export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  registeredCount: number;
  rsvps: string[]; // List of user emails who RSVP'd
  volunteers: {
    role: string;
    slots: number;
    filled: string[]; // List of user emails who signed up
  }[];
}

export interface Ministry {
  id: string;
  name: string;
  description: string;
  leader: string;
  leaderTitle: string;
  leaderPhoto: string;
  schedule: string;
  activities: string[];
  gallery: string[];
  contact: string;
}

export interface PrayerRequest {
  id: string;
  requesterName: string;
  text: string;
  isPrivate: boolean;
  isAnonymous: boolean;
  date: string;
  isAnswered: boolean;
  pastorNote?: string;
  prayedForCount: number;
}

export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  category: 'Tithes' | 'Offerings' | 'Building Fund' | 'Missions Fund';
  paymentMethod: 'Mobile Money' | 'Bank Transfer' | 'Debit Card' | 'Credit Card';
  date: string;
  receiptNumber: string;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  category: string;
  date: string;
  content: string;
  summary: string;
  likes: number;
  tags: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  ministries: string[];
  avatar: string;
  joinedDate: string;
  isPastor: boolean;
}

// ==========================================
// V2 EXPANSION ARCHITECTURE SCHEMAS
// ==========================================

export interface ChurchBranch {
  id: string;
  name: string;
  location: string;
  leadPastorId: string;
  establishedDate: string;
  contactEmail: string;
  metrics: {
    averageAttendance: number;
    activeMinistries: number;
  };
}

export interface EducationalInstitution {
  id: string;
  type: 'School' | 'Bible College';
  name: string;
  principal: string;
  enrollmentCount: number;
  curriculumType: string;
  accreditationStatus: string;
}

export interface OnlineCourse {
  id: string;
  title: string;
  instructorId: string;
  credits: number;
  modules: { title: string; videoUrl: string; quizId: string }[];
  enrolledStudentsCount: number;
}

export interface BroadcastStation {
  id: string;
  type: 'Radio' | 'Television';
  name: string;
  frequencyDb?: string;
  streamingUrl: string;
  currentProgramId: string;
  schedule: { time: string; programName: string }[];
}

export interface StoreProduct {
  id: string;
  title: string;
  type: 'Book' | 'Merchandise' | 'Digital';
  price: number;
  stockCount: number;
  authorOrBrand: string;
}

export interface CommunityProject {
  id: string;
  title: string;
  targetBudget: number;
  currentFunding: number;
  status: 'Planning' | 'Active' | 'Completed';
  partners: string[];
}
