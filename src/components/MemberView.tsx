import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Download, ShieldCheck, Sparkles, Megaphone, CheckCircle, FileText, Bookmark, BookOpen, Video, Users, Check, Search, Lock, EyeOff } from 'lucide-react';

const AVAILABLE_MINISTRIES = [
  "Youth Fellowship",
  "Praise & Worship",
  "Ushering & Protocol",
  "Children's Church",
  "Community Outreach",
  "Men's Kingsmen",
  "Women's Grace"
];

const MEMBER_EVENTS = [
  { id: 'me1', title: 'Leadership Training Seminar', date: 'July 5, 2026', time: '09:00 AM', isRegistered: false },
  { id: 'me2', title: 'Couples Retreat (Members Only)', date: 'August 14, 2026', time: '18:00 PM', isRegistered: true }
];

const EXCLUSIVE_CONTENT = [
  { id: 'ec1', title: "Foundations of Faith - Session 1", type: "Video Masterclass", duration: "45 mins" },
  { id: 'ec2', title: "Biblical Finances - Seminar Record", type: "Audio Study", duration: "60 mins" }
];

const CHURCH_DIRECTORY = [
  { id: 'cd1', familyName: 'Dlamini Family', members: ['Sipho', 'Zinhle', 'Thabo (Child)'], phone: '+268 7600 1111', email: 'dlamini.family@example.com', isPrivate: false, avatar: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200&auto=format&fit=crop&q=80&fit=crop' },
  { id: 'cd2', familyName: 'Mnisi Family', members: ['LS', 'Lindiwe', 'Sibusiso', 'Nomsa'], phone: '+268 7611 2222', email: 'mnisi@example.com', isPrivate: false, avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1bfd8c?w=200&auto=format&fit=crop&q=80&fit=crop' },
  { id: 'cd3', familyName: 'Ndlovu Family', members: ['Sarah', 'Buhle (Child)'], phone: '+268 7622 3333', email: 'sarah.ndlovu@example.com', isPrivate: true, avatar: 'https://images.unsplash.com/photo-1523824922870-a6201560e4eb?w=200&auto=format&fit=crop&q=80&fit=crop' },
  { id: 'cd4', familyName: 'Maseko Household', members: ['Sanele'], phone: '+268 7644 4444', email: 'sanele.m@example.com', isPrivate: false, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80&fit=crop' },
];

interface MemberViewProps {
  language: 'en' | 'swati';
}

export default function MemberView({ language }: MemberViewProps) {
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory'>('dashboard');
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editPhone, setEditPhone] = useState('');
  const [editName, setEditName] = useState('');
  const [editMinistries, setEditMinistries] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Exclusive Events State
  const [memberEvents, setMemberEvents] = useState(MEMBER_EVENTS);

  // Download states
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Load profile from API
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Profile fetch failed');
      const data = await res.json();
      setProfile(data || {});
      setEditName(data?.name || '');
      setEditPhone(data?.phone || '');
      setEditMinistries(data?.ministries || []);
    } catch (err) {
      console.error('Error fetching member profile:', err);
      // Fallback to avoid complete crash
      setProfile({});
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          ministries: editMinistries
        })
      });
      const data = await res.json();
      setProfile(data);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const triggerDownload = (fileName: string) => {
    setIsDownloading(fileName);
    setTimeout(() => {
      setIsDownloading(null);
      alert(`[Demo Mode] Simulated secure download of: "${fileName}.pdf". In production, this streams the official secured PDF file directly from the local Clouddrive.`);
    }, 1500);
  };

  const toggleMinistry = (ministry: string) => {
    setEditMinistries(prev => 
      prev.includes(ministry) 
        ? prev.filter(m => m !== ministry)
        : [...prev, ministry]
    );
  };
  
  // Directory State
  const [searchQuery, setSearchQuery] = useState('');
  const [directoryData, setDirectoryData] = useState(CHURCH_DIRECTORY);

  const handleEventRegistration = (id: string) => {
    const isReg = memberEvents.find(e => e.id === id)?.isRegistered;
    setMemberEvents(prev => prev.map(ev => 
      ev.id === id ? { ...ev, isRegistered: !ev.isRegistered } : ev
    ));
    alert(isReg ? "Event un-registered successfully." : "Registered for member event successfully!");
  };

  if (!profile) {
    return (
      <div className="py-20 text-center text-gray-500 animate-pulse font-sans">
        Authenticating member file...
      </div>
    );
  }

  const filteredDirectory = directoryData.filter(d => 
    d.familyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.members.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="py-12 bg-white font-sans animate-fade-in" id="member-portal-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header block">
            FEC Lubumbano • Covenant Fellowship
          </span>
          <h1 className="font-header text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Membership Portal
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            {language === 'en' 
              ? `Welcome back, ${profile?.name || 'Believer'}! Manage your profile, view member exclusive events, or search the directory.`
              : `Siyakwemukela, ${profile?.name || 'Mkholwa'}! Lawula imininingwane yakho noma ubuke umbhalo wamalunga amanye.`}
          </p>
        </div>

        {/* TOP LEVEL NAVIGATION TABS */}
        <div className="flex bg-supporting/50 p-1.5 rounded-2xl w-full max-w-xs mx-auto mb-10 border border-gray-150 shadow-sm">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2.5 text-[10px] font-bold rounded-xl transition uppercase tracking-widest flex items-center justify-center gap-2 ${
              activeTab === 'dashboard' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-primary hover:bg-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex-1 py-2.5 text-[10px] font-bold rounded-xl transition uppercase tracking-widest flex items-center justify-center gap-2 ${
              activeTab === 'directory' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-primary hover:bg-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Directory
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: DIGITAL MEMBERSHIP CARD (5 Cols) */}
          <div className="lg:col-span-5 space-y-6" id="member-cards-pane">
            
            {/* The visual card mockup */}
            <div className="bg-primary hover:border-secondary border-[3px] border-primary text-white rounded-3xl p-6 shadow-xl relative overflow-hidden text-left" id="visual-member-id">
              {/* Background watermark */}
              <div className="absolute right-0 bottom-0 opacity-5 -mr-10 -mb-10 text-white select-none">
                <Bookmark className="w-48 h-48" />
              </div>

              <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
                <div>
                  <h4 className="font-header text-sm font-bold tracking-wide text-white uppercase">Covenant Member Card</h4>
                  <span className="text-[9px] text-[#D4AF37] font-semibold uppercase tracking-wider">Fonteyn Evangelical Church</span>
                </div>
                <div className="p-1 px-2.5 bg-[#D4AF37]/20 border border-[#D4AF37]/20 text-[#D4AF37] rounded-full text-[9px] font-bold uppercase tracking-widest leading-none shrink-0">
                  FEC ACTIVE
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-white/20 shrink-0">
                  {profile?.avatar ? (
                    <img loading="lazy" src={profile.avatar} alt={profile?.name || 'Member'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <User className="text-white/40 w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-header text-sm font-bold text-white tracking-wide">{profile?.name || 'Guest Member'}</h3>
                  <p className="text-xs text-gray-300 font-mono flex items-center gap-1.5 leading-none">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{profile?.email || 'No email set'}</span>
                  </p>
                  <p className="text-xs text-gray-300 font-mono flex items-center gap-1.5 leading-none">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{profile?.phone || 'No phone set'}</span>
                  </p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 p-3 rounded-xl mt-4 space-y-1">
                <span className="text-[9px] text-gray-400 block font-bold uppercase tracking-widest">Enrolled departments</span>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {(profile?.ministries || []).map((m: string, i: number) => (
                    <span key={i} className="text-[10px] bg-secondary/15 border border-secondary/20 text-secondary font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono pt-4 border-t border-white/10 mt-4 leading-none">
                <span>MEMBER SINCE {profile?.joinedDate || 'Recently'}</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>2FA SECURED</span>
                </span>
              </div>
            </div>

            {/* Edit details form toggler */}
            <div className="bg-supporting/45 border p-5 rounded-3xl" id="member-profile-controls">
              {saveSuccess && (
                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-150 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-zoom-in">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="font-semibold">Covenant profile updated successfully!</span>
                </div>
              )}

              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 border border-primary hover:bg-primary/5 text-primary rounded-xl font-header font-bold text-xs uppercase cursor-pointer"
                >
                  Edit profile configurations
                </button>
              ) : (
                <form onSubmit={handleProfileSave} className="space-y-4 text-left animate-fade-in" id="edit-profile-form">
                  <h4 className="font-header text-xs font-bold text-primary uppercase tracking-widest border-b pb-1">Edit Account Profiles</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 font-bold uppercase block">Verification Name</label>
                    <input 
                      type="text" 
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-2 border rounded-lg focus:ring-1 focus:ring-secondary outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 font-bold uppercase block">Verified Telephone</label>
                    <input 
                      type="text" 
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-2 border rounded-lg focus:ring-1 focus:ring-secondary outline-none"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-[9px] text-gray-500 font-bold uppercase block border-t pt-3">Join Ministry Groups</label>
                    <div className="grid grid-cols-2 gap-2">
                       {AVAILABLE_MINISTRIES.map(min => (
                         <label key={min} className="flex items-center space-x-2 bg-white border border-gray-150 p-2 rounded-lg cursor-pointer hover:border-secondary transition">
                           <input 
                             type="checkbox" 
                             checked={editMinistries.includes(min)}
                             onChange={() => toggleMinistry(min)}
                             className="w-3.5 h-3.5 text-secondary accent-secondary"
                           />
                           <span className="text-[10px] text-gray-700 font-bold uppercase">{min}</span>
                         </label>
                       ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2 bg-gray-100 text-gray-800 font-bold text-xs rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-primary text-secondary tracking-wide border border-secondary/20 font-bold text-xs rounded-lg uppercase"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: BULLETINS & PDF DOCUMENTS (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-left" id="member-announcements-pane">
            
            {/* Private announcements bulletin */}
            <div className="bg-supporting/45 border p-6 rounded-3xl space-y-4" id="member-private-bulletins">
              <h3 className="font-header text-xs sm:text-sm font-bold text-primary uppercase tracking-widest pb-1 border-b flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-secondary shrink-0" />
                <span>Covenant Family announcements</span>
              </h3>

              <div className="space-y-4 text-xs font-sans text-gray-650" id="bulletins-feed">
                {[
                  {
                    title: "Pastor Appreciations Assembly Day",
                    date: "June 14, 2026",
                    body: "Our annual Pastor Appreciation takes place this Sunday. We invite all families to prepare their love gift vectors or voluntary baskets to bless the Mnisi household."
                  },
                  {
                    title: "Sanctuary Maintenance Work Party",
                    date: "June 27, 2026",
                    body: "Calling all FEC Kingsmen (Men) and volunteers! We have scheduled a minor repairs and chapel garden beautifying day at the chapel grounds starting at 7:30 AM."
                  },
                  {
                    title: "Mobile App Synchronizers API Audits",
                    date: "June 09, 2026",
                    body: "Our technology team is auditing database end points for sermons and event feeds preparing for our future official Android container launches."
                  }
                ].map((bul, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-gray-150 space-y-1.5 shadow-2xs">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-secondary uppercase tracking-wider">CHURCH NOTICE</span>
                      <span className="text-gray-400 font-mono tracking-wide">{bul.date}</span>
                    </div>
                    <h4 className="font-header text-sm font-bold text-primary">{bul.title}</h4>
                    <p className="leading-relaxed font-sans text-xs text-gray-650">{bul.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Member Events Registration */}
            <div className="bg-supporting/45 border p-6 rounded-3xl space-y-4" id="member-exclusive-events">
              <h3 className="font-header text-xs sm:text-sm font-bold text-primary uppercase tracking-widest pb-1 border-b flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-secondary shrink-0" />
                <span>Member-Only Events</span>
              </h3>

              <div className="grid grid-cols-1 gap-4" id="events-grid-list">
                {memberEvents.map((ev) => (
                  <div key={ev.id} className="bg-white p-4 rounded-xl border border-gray-150 flex flex-col sm:flex-row justify-between sm:items-center text-left shadow-2xs gap-4">
                    <div className="space-y-1">
                      <h4 className="font-header text-[13px] font-bold text-primary">{ev.title}</h4>
                      <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wide flex gap-2">
                        <span>{ev.date}</span>
                        <span>•</span>
                        <span>{ev.time}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleEventRegistration(ev.id)}
                      className={`px-4 py-2 font-bold text-[10px] uppercase tracking-wide rounded-lg border transition shrink-0 flex items-center justify-center gap-1.5 ${
                        ev.isRegistered 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-primary text-secondary border-primary hover:bg-neutral-800 hover:border-neutral-800'
                      }`}
                    >
                      {ev.isRegistered && <Check className="w-3.5 h-3.5" />}
                      <span>{ev.isRegistered ? 'Registered' : 'RSVP Now'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Downloadable church secure documents */}
            <div className="bg-supporting/45 border p-6 rounded-3xl space-y-4" id="member-private-documents">
              <h3 className="font-header text-xs sm:text-sm font-bold text-primary uppercase tracking-widest pb-1 border-b flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-secondary shrink-0" />
                <span>Secure downloads directory</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="documents-grid-list">
                {[
                  { title: "FEC By-Laws & Regulations", code: "fec_bylaws_2026", size: "2.4 MB", type: "Regulations" },
                  { title: "Daily Reading Plan Booklet", code: "daily_word_plan_2026", size: "1.1 MB", type: "Spiritual Study" },
                ].map((doc, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-gray-150 flex flex-col justify-between items-start text-left shadow-2xs space-y-4">
                    <div className="space-y-1">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-wider shrink-0">{doc.type}</span>
                      <h4 className="font-header text-xs font-bold text-primary pt-1">{doc.title}</h4>
                      <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wide">SECURE DOCUMENT • {doc.size}</p>
                    </div>

                    <button
                      onClick={() => triggerDownload(doc.code)}
                      disabled={isDownloading === doc.code}
                      className="py-1.5 px-3.5 bg-supporting hover:bg-secondary hover:text-primary rounded-lg border border-gray-150 font-bold text-[10px] flex items-center gap-1 text-gray-600 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{isDownloading === doc.code ? 'Downloading...' : 'Get PDF File'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusive Content / Media  */}
            <div className="bg-supporting/45 border p-6 rounded-3xl space-y-4" id="member-exclusive-content">
              <h3 className="font-header text-xs sm:text-sm font-bold text-primary uppercase tracking-widest pb-1 border-b flex items-center gap-2">
                <Video className="w-4.5 h-4.5 text-secondary shrink-0" />
                <span>Private Broadcasts & Material</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EXCLUSIVE_CONTENT.map((content) => (
                  <div key={content.id} className="bg-primary p-4 rounded-xl border border-primary text-white flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-secondary transition">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition duration-500">
                      <BookOpen className="w-24 h-24 text-secondary" />
                    </div>
                    
                    <div className="space-y-1 relative z-10 mb-4">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/30 font-bold uppercase tracking-wider inline-flex items-center gap-1">
                         <ShieldCheck className="w-3 h-3" />
                         <span>{content.type}</span>
                      </span>
                      <h4 className="font-header text-sm font-bold text-white pt-1 line-clamp-1">{content.title}</h4>
                      <p className="text-[10px] text-gray-300 font-mono uppercase tracking-wide">Duration • {content.duration}</p>
                    </div>

                    <button
                      onClick={() => alert(`Launching secure player for: ${content.title}`)}
                      className="py-2 px-4 bg-secondary text-primary hover:bg-white rounded-lg font-bold text-[10px] uppercase tracking-widest transition relative z-10 text-center"
                    >
                      Access Content
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
        )}

        {/* TAB 2: CHURCH DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-10 shadow-sm animate-fade-in" id="church-directory-pane">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-8 pb-6 border-b border-gray-100">
              <div>
                <h2 className="font-header text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
                  <Users className="w-6 h-6 text-secondary" />
                  Family & Member Directory
                </h2>
                <p className="text-xs text-gray-500 mt-2 font-sans max-w-lg">
                  Search securely through out covenanted families. For privacy, members marked <Lock className="inline w-3 h-3 mx-0.5 text-gray-400" /> have elected to hide extended contact details.
                </p>
              </div>

              <div className="relative w-full sm:w-72 shrink-0">
                <input 
                  type="text" 
                  placeholder="Search by name or family..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-secondary focus:bg-white transition"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDirectory.length === 0 ? (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center text-gray-500 border border-dashed border-gray-200 rounded-2xl">
                  <Users className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm">No members found matching "{searchQuery}"</p>
                </div>
              ) : (
                filteredDirectory.map((fam) => (
                  <div key={fam.id} className="border border-gray-150 rounded-2xl p-5 hover:border-secondary transition shadow-2xs group relative">
                    
                    {fam.isPrivate && (
                      <div className="absolute top-4 right-4 text-gray-400 tooltip" title="Details hidden by user">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}

                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                        {fam.avatar ? (
                          <img loading="lazy" src={fam.avatar} alt={fam.familyName} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-300" />
                          </div>
                      )}
                      </div>
                      <div>
                        <h4 className="font-header text-sm font-bold text-primary leading-tight">{fam.familyName}</h4>
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-1">
                          {fam.members.length} Members
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Family Roster</p>
                        <div className="flex flex-wrap gap-1">
                           {fam.members.map((m, i) => (
                             <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-md">
                               {m}
                             </span>
                           ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Contact Info</p>
                        {fam.isPrivate ? (
                          <div className="flex items-center gap-2 text-xs text-gray-400 italic bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Private Information</span>
                          </div>
                        ) : (
                          <div className="space-y-1.5 text-xs text-gray-600 font-mono">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <a href={`tel:${fam.phone}`} className="hover:text-secondary">{fam.phone}</a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <a href={`mailto:${fam.email}`} className="hover:text-secondary truncate">{fam.email}</a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
