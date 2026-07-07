import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Video, HeartHandshake, DollarSign, 
  MessageSquare, FileText, ImageIcon, ShieldCheck, 
  Settings, Activity, Search, Plus, MoreVertical, Edit2, Trash2,
  Building2, GraduationCap, Radio, Store, Globe2, X, AlertTriangle, Check,
  Folder, Server
} from 'lucide-react';
import AISermonAssistant from './AISermonAssistant';
import { useAppImages } from './ImageContext';
import AdminImagesView from './AdminImagesView';
import AdminMediaFilesView from './AdminMediaFilesView';
import StorageDiagnostics from './StorageDiagnostics';

interface AdminDashboardProps {
  language: 'en' | 'swati';
}

const TABS = [
  { id: 'overview', icon: <Activity className="w-4 h-4" />, label: 'Overview' },
  { id: 'users', icon: <Users className="w-4 h-4" />, label: 'Users' },
  { id: 'events', icon: <Calendar className="w-4 h-4" />, label: 'Events' },
  { id: 'sermons', icon: <Video className="w-4 h-4" />, label: 'Sermons' },
  { id: 'ministries', icon: <HeartHandshake className="w-4 h-4" />, label: 'Ministries' },
  { id: 'donations', icon: <DollarSign className="w-4 h-4" />, label: 'Donations' },
  { id: 'prayers', icon: <MessageSquare className="w-4 h-4" />, label: 'Prayers' },
  { id: 'blog', icon: <FileText className="w-4 h-4" />, label: 'Blog Posts' },
  { id: 'images', icon: <ImageIcon className="w-4 h-4" />, label: 'Image Assets' },
  { id: 'media-files', icon: <Folder className="w-4 h-4" />, label: 'Media Files' },
  { id: 'storage-diagnostics', icon: <Server className="w-4 h-4 text-emerald-400" />, label: 'Storage Diagnostics' },
  { id: 'members', icon: <ShieldCheck className="w-4 h-4" />, label: 'Members' },
];

const EXPANSION_TABS = [
  { id: 'branches', icon: <Building2 className="w-4 h-4" />, label: 'Churches & Campuses' },
  { id: 'education', icon: <GraduationCap className="w-4 h-4" />, label: 'Schools & College' },
  { id: 'broadcasting', icon: <Radio className="w-4 h-4" />, label: 'Radio & TV Station' },
  { id: 'store', icon: <Store className="w-4 h-4" />, label: 'Christian Bookstore' },
  { id: 'community', icon: <Globe2 className="w-4 h-4" />, label: 'Community Projects' },
];

// Schema config for fields dynamically modified in forms
const SCHEMAS: Record<string, { label: string; name: string; type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'image'; options?: string[] }[]> = {
  users: [
    { label: 'Full Name', name: 'name', type: 'text' },
    { label: 'Email Address', name: 'email', type: 'text' },
    { label: 'Phone Number', name: 'phone', type: 'text' },
    { label: 'Role', name: 'role', type: 'select', options: ['Admin', 'Pastor/Admin', 'User'] },
    { label: 'Status', name: 'status', type: 'select', options: ['Active', 'Suspended'] }
  ],
  events: [
    { label: 'Event Title', name: 'title', type: 'text' },
    { label: 'Description', name: 'description', type: 'textarea' },
    { label: 'Date (YYYY-MM-DD)', name: 'date', type: 'text' },
    { label: 'Time', name: 'time', type: 'text' },
    { label: 'Location Address', name: 'location', type: 'text' },
    { label: 'Feature Image', name: 'image', type: 'image' }
  ],
  sermons: [
    { label: 'Sermon Title', name: 'title', type: 'text' },
    { label: 'Preacher Name', name: 'speaker', type: 'text' },
    { label: 'Preach Date (YYYY-MM-DD)', name: 'date', type: 'text' },
    { label: 'Topic Category', name: 'topic', type: 'text' },
    { label: 'Scripture Reference', name: 'scripture', type: 'text' },
    { label: 'Sermon Outline Notes', name: 'sermonNotes', type: 'textarea' },
    { label: 'Theological Summary', name: 'summary', type: 'textarea' },
    { label: 'Video URL (Stream Links)', name: 'videoUrl', type: 'text' },
    { label: 'Audio Podcast URL', name: 'audioUrl', type: 'text' }
  ],
  ministries: [
    { label: 'Ministry Name', name: 'name', type: 'text' },
    { label: 'Vision and Objectives', name: 'description', type: 'textarea' },
    { label: 'Leader Full Name', name: 'leader', type: 'text' },
    { label: 'Leader Council Title', name: 'leaderTitle', type: 'text' },
    { label: 'Leader Avatar', name: 'leaderPhoto', type: 'image' },
    { label: 'Schedule Routine', name: 'schedule', type: 'text' },
    { label: 'Primary Contact Email', name: 'contact', type: 'text' }
  ],
  donations: [
    { label: 'Donor Full Name', name: 'donorName', type: 'text' },
    { label: 'Amount (SZL)', name: 'amount', type: 'number' },
    { label: 'Giving Mode/Category', name: 'category', type: 'select', options: ['Tithes', 'Offerings', 'Building Fund', 'Missions Fund'] },
    { label: 'Payment Method', name: 'paymentMethod', type: 'select', options: ['Mobile Money', 'Bank Transfer', 'Debit Card', 'Credit Card'] }
  ],
  prayers: [
    { label: 'Prayer Requester Name', name: 'requesterName', type: 'text' },
    { label: 'Deep Intercession Request Details', name: 'text', type: 'textarea' },
    { label: 'Is Private? (Confidential to Pastor LS Mnisi)', name: 'isPrivate', type: 'checkbox' },
    { label: 'Submit Anonymously?', name: 'isAnonymous', type: 'checkbox' },
    { label: 'Is Answered / Blessed Testimony?', name: 'isAnswered', type: 'checkbox' },
    { label: 'Pastor/Counselor Reflection Note', name: 'pastorNote', type: 'textarea' }
  ],
  blog: [
    { label: 'Article Title', name: 'title', type: 'text' },
    { label: 'Written/Authored By', name: 'author', type: 'text' },
    { label: 'Feature Image', name: 'image', type: 'image' },
    { label: 'Category', name: 'category', type: 'text' },
    { label: 'Short Catchy Abstract', name: 'summary', type: 'text' },
    { label: 'Complete Blog Article Content', name: 'content', type: 'textarea' },
    { label: 'Post Date (YYYY-MM-DD)', name: 'date', type: 'text' }
  ],
  members: [
    { label: 'Member Full Name', name: 'name', type: 'text' },
    { label: 'Email Address', name: 'email', type: 'text' },
    { label: 'Mobile Phone Contact', name: 'phone', type: 'text' },
    { label: 'Active Leadership Post', name: 'role', type: 'text' },
    { label: 'Representative Avatar', name: 'avatar', type: 'image' },
    { label: 'Ordaianed Pastoral clergy status?', name: 'isPastor', type: 'checkbox' }
  ],
  branches: [
    { label: 'Campuses/Branch Title', name: 'name', type: 'text' },
    { label: 'Geographic City Address', name: 'location', type: 'text' },
    { label: 'Lead Pastor ID Reference', name: 'leadPastorId', type: 'text' },
    { label: 'Established Date (YYYY-MM-DD)', name: 'establishedDate', type: 'text' },
    { label: 'Branch Liaison Email', name: 'contactEmail', type: 'text' }
  ],
  education: [
    { label: 'Institution Format', name: 'type', type: 'select', options: ['School', 'Bible College'] },
    { label: 'Institution / Campus Name', name: 'name', type: 'text' },
    { label: 'Principal Lead Officer', name: 'principal', type: 'text' },
    { label: 'Core Curriculum Standard', name: 'curriculumType', type: 'text' },
    { label: 'Educational Accreditation Details', name: 'accreditationStatus', type: 'text' }
  ],
  broadcasting: [
    { label: 'Broadcasting Feed Type', name: 'type', type: 'select', options: ['Radio', 'Television'] },
    { label: 'Service Feed Call Sign', name: 'name', type: 'text' },
    { label: 'Station Frequency description', name: 'frequencyDb', type: 'text' },
    { label: 'Resource URL Stream Address', name: 'streamingUrl', type: 'text' }
  ],
  store: [
    { label: 'Product Title', name: 'title', type: 'text' },
    { label: 'Inventory Type', name: 'type', type: 'select', options: ['Book', 'Merchandise', 'Digital'] },
    { label: 'Unit Retailing Price (SZL)', name: 'price', type: 'number' },
    { label: 'Warehousing Stock Count', name: 'stockCount', type: 'number' },
    { label: 'Broad author / product manufacture brand', name: 'authorOrBrand', type: 'text' }
  ],
  community: [
    { label: 'Project Title', name: 'title', type: 'text' },
    { label: 'Budget Target Funding (SZL)', name: 'targetBudget', type: 'number' },
    { label: 'Direct Public Capital Funding Secured', name: 'currentFunding', type: 'number' },
    { label: 'Development Phase Status', name: 'status', type: 'select', options: ['Planning', 'Active', 'Completed'] }
  ]
};

export default function AdminDashboard({ language }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { uploadFile, refreshImages } = useAppImages();
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const fetchData = async () => {
    const url = getTabUrl(activeTab);
    if (!url) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${url}?_t=${Date.now()}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`Error loading database for tab ${activeTab}:`, err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleForceRefresh = async () => {
    localStorage.clear();
    setLoading(true);
    try {
      await refreshImages();
      await fetchData();
    } catch (err) {
      console.error("Error during force refresh", err);
      alert("Failed to refresh data.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (fieldName: string, file: File) => {
    setUploadingField(fieldName);
    try {
      const url = await uploadFile(file);
      if (url) {
        setFormData(prev => ({ ...prev, [fieldName]: url }));
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image.");
    } finally {
      setUploadingField(null);
    }
  };
  
  // Overview Summary States
  const [statsData, setStatsData] = useState({
    members: '0',
    donations: 'E0.00',
    prayers: '0',
    users: '0'
  });

  // Modal Dialog states
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const getTabUrl = (tab: string) => {
    switch (tab) {
      case 'users': return '/api/users';
      case 'events': return '/api/events';
      case 'sermons': return '/api/sermons';
      case 'ministries': return '/api/ministries';
      case 'donations': return '/api/donations';
      case 'prayers': return '/api/prayer-requests';
      case 'blog': return '/api/blog';
      case 'members': return '/api/members';
      case 'branches': return '/api/v2/branches';
      case 'education': return '/api/v2/education/schools';
      case 'broadcasting': return '/api/v2/media/radio';
      case 'store': return '/api/v2/store/products';
      case 'community': return '/api/v2/community/projects';
      default: return null;
    }
  };

  // Fetch items for specific tab
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Load Overview Metrics dynamically from APIs
  useEffect(() => {
    if (activeTab === 'overview') {
      const endpoints = [
        { key: 'members', path: '/api/members' },
        { key: 'donations', path: '/api/donations' },
        { key: 'prayers', path: '/api/prayer-requests' },
        { key: 'users', path: '/api/users' }
      ];

      Promise.all(
        endpoints.map(ep => fetch(ep.path).then(res => res.json()).catch(() => []))
      ).then(([mList, dList, pList, uList]) => {
        const safeMList = Array.isArray(mList) ? mList : [];
        const safeDList = Array.isArray(dList) ? dList : [];
        const safePList = Array.isArray(pList) ? pList : [];
        const safeUList = Array.isArray(uList) ? uList : [];

        const sumD = safeDList.reduce((sum: number, cur: any) => sum + (parseFloat(cur.amount) || 0), 0);
        setStatsData({
          members: safeMList.length.toString(),
          donations: `E ${sumD.toLocaleString()}`,
          prayers: safePList.length.toString(),
          users: safeUList.length.toString()
        });
      });
    }
  }, [activeTab, items]);

  const getTableColumns = (tab: string) => {
    switch (tab) {
      case 'users':
        return ['Name', 'Email Address', 'Privilege', 'Status', 'Joined Date'];
      case 'events':
        return ['Event Title', 'Schedule Date', 'Hour', 'Physical Location', 'Registered Count'];
      case 'sermons':
        return ['Sermon Title', 'Speaker', 'Preached', 'Category', 'Scripture Passages'];
      case 'ministries':
        return ['Ministry Name', 'Primary Leader', 'Leader Role', 'Schedule Routine', 'Liaison Email'];
      case 'donations':
        return ['Donor Full Name', 'Financial amount', 'Fund Category', 'Payment Mode', 'Transacted'];
      case 'prayers':
        return ['Prayer Requester', 'Request Details', 'Privatized?', 'Resolution State', 'Intercessions Count'];
      case 'blog':
        return ['Article Title', 'Authored by', 'Topic Category', 'Appreciation Likes', 'Date'];
      case 'members':
        return ['Member Name', 'Email Account', 'Contact Number', 'Office Role', 'Clergy Clergy?'];
      case 'branches':
        return ['Branch Campus', 'Geographic City', 'Leader Reference', 'Founded Date', 'Contact Email'];
      case 'education':
        return ['Institution Name', 'Kind', 'Principal head', 'Syllabus Type', 'Accredited Status'];
      case 'broadcasting':
        return ['Channel Name', 'Feed Format', 'Call Band Freq', 'Streaming Link URL'];
      case 'store':
        return ['Product Standard', 'Retailing Price', 'Format Class', 'Warehousing Stock', 'Author/Manufacturer'];
      case 'community':
        return ['Project Focus', 'Target Capital Required', 'Current Capital Secured', 'Development Stage'];
      default:
        return ['ID Reference', 'Title / Name', 'Status', 'Date Added'];
    }
  };

  const renderRowCells = (tab: string, item: any) => {
    switch (tab) {
      case 'users':
        return (
          <>
            <td className="px-6 py-4 font-medium text-primary">{item.name}</td>
            <td className="px-6 py-4 text-xs font-mono">{item.email}</td>
            <td className="px-6 py-4 text-xs font-semibold">{item.role}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.status === 'Suspended' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                {item.status || 'Active'}
              </span>
            </td>
            <td className="px-6 py-4 text-xs font-mono">{item.joinedDate}</td>
          </>
        );
      case 'events':
        return (
          <>
            <td className="px-6 py-4 font-medium text-primary">{item.title}</td>
            <td className="px-6 py-4 text-xs font-mono">{item.date}</td>
            <td className="px-6 py-4 text-xs">{item.time}</td>
            <td className="px-6 py-4 text-xs max-w-[200px] truncate">{item.location}</td>
            <td className="px-6 py-4 text-xs font-bold text-gray-550">{item.registeredCount || item.rsvps?.length || 0} Members</td>
          </>
        );
      case 'sermons':
        return (
          <>
            <td className="px-6 py-4 font-medium text-primary">{item.title}</td>
            <td className="px-6 py-4 text-xs font-semibold">{item.speaker}</td>
            <td className="px-6 py-4 text-xs font-mono">{item.date}</td>
            <td className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[10px] text-gray-400">{item.topic}</td>
            <td className="px-6 py-4 text-xs italic font-medium">{item.scripture}</td>
          </>
        );
      case 'ministries':
        return (
          <>
            <td className="px-6 py-4 font-medium text-primary">{item.name}</td>
            <td className="px-6 py-4 text-xs font-semibold">{item.leader}</td>
            <td className="px-6 py-4 text-xs text-gray-400 font-medium">{item.leaderTitle}</td>
            <td className="px-6 py-4 text-xs font-medium">{item.schedule}</td>
            <td className="px-6 py-4 text-xs font-mono">{item.contact}</td>
          </>
        );
      case 'donations':
        return (
          <>
            <td className="px-6 py-4 font-medium text-primary">{item.donorName}</td>
            <td className="px-6 py-4 text-xs font-bold font-mono text-emerald-600">E {item.amount}</td>
            <td className="px-6 py-4 text-xs">{item.category}</td>
            <td className="px-6 py-4 text-xs">{item.paymentMethod}</td>
            <td className="px-6 py-4 text-xs font-mono">{item.date}</td>
          </>
        );
      case 'prayers':
        return (
          <>
            <td className="px-6 py-4 font-medium text-primary">{item.requesterName}</td>
            <td className="px-6 py-4 text-xs max-w-[250px] truncate">{item.text}</td>
            <td className="px-6 py-4 text-xs font-bold">{item.isPrivate ? 'Yes 🔒' : 'No 🌐'}</td>
            <td className="px-6 py-4 text-xs">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.isAnswered ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {item.isAnswered ? 'Answered' : 'Pending'}
              </span>
            </td>
            <td className="px-6 py-4 text-xs font-mono font-bold text-gray-450">{item.prayedForCount || 0}</td>
          </>
        );
      case 'blog':
        return (
          <>
            <td className="px-6 py-4 font-medium text-primary">{item.title}</td>
            <td className="px-6 py-4 text-xs font-semibold">{item.author}</td>
            <td className="px-6 py-4 text-xs italic">{item.category}</td>
            <td className="px-6 py-4 text-xs font-mono">{item.likes || 0} Likes</td>
            <td className="px-6 py-4 text-xs font-mono">{item.date}</td>
          </>
        );
      case 'members':
        return (
          <>
            <td className="px-6 py-4 font-medium text-primary">{item.name}</td>
            <td className="px-6 py-4 text-xs font-mono">{item.email}</td>
            <td className="px-6 py-4 text-xs">{item.phone}</td>
            <td className="px-6 py-4 text-xs font-bold text-gray-500">{item.role || 'Member'}</td>
            <td className="px-6 py-4 text-xs font-bold">{item.isPastor ? 'Pastor ✝️' : 'Layperson'}</td>
          </>
        );
      case 'branches':
        return (
          <>
            <td className="px-6 py-4 font-medium text-primary">{item.name}</td>
            <td className="px-6 py-4 text-xs">{item.location}</td>
            <td className="px-6 py-4 text-xs font-mono text-gray-400">#{item.leadPastorId || 'N/A'}</td>
            <td className="px-6 py-4 text-xs font-mono">{item.establishedDate}</td>
            <td className="px-6 py-4 text-xs font-mono">{item.contactEmail}</td>
          </>
        );
      case 'education':
        return (
          <>
            <td className="px-6 py-4 font-medium text-primary">{item.name}</td>
            <td className="px-6 py-4 text-xs"><span className="uppercase tracking-widest text-[9px] font-bold text-secondary bg-primary/20 border border-primary/10 px-2 py-0.5 rounded">{item.type}</span></td>
            <td className="px-6 py-4 text-xs font-semibold">{item.principal}</td>
            <td className="px-6 py-4 text-xs font-mono text-gray-500">{item.curriculumType}</td>
            <td className="px-6 py-4 text-xs text-gray-450 italic font-medium">{item.accreditationStatus}</td>
          </>
        );
      case 'broadcasting':
        return (
          <>
            <td className="px-6 py-4 font-medium text-primary">{item.name}</td>
            <td className="px-6 py-4 text-xs font-bold uppercase text-[10px] text-gray-500 tracking-wider">{item.type}</td>
            <td className="px-6 py-4 text-xs font-mono text-emerald-600">{item.frequencyDb || 'N/A'}</td>
            <td className="px-6 py-4 text-xs text-secondary hover:underline font-mono max-w-[200px] truncate">{item.streamingUrl}</td>
          </>
        );
      case 'store':
        return (
          <>
            <td className="px-6 py-4 font-medium text-primary">{item.title}</td>
            <td className="px-6 py-4 text-xs font-bold text-emerald-600 font-mono">E {item.price}</td>
            <td className="px-6 py-4 text-xs italic">{item.type}</td>
            <td className="px-6 py-4 text-xs font-mono font-bold">{item.stockCount} items</td>
            <td className="px-6 py-4 text-xs font-medium">{item.authorOrBrand}</td>
          </>
        );
      case 'community':
        return (
          <>
            <td className="px-6 py-4 font-medium text-primary">{item.title}</td>
            <td className="px-6 py-4 text-xs font-bold text-gray-500 font-mono">E {item.targetBudget?.toLocaleString() || 0}</td>
            <td className="px-6 py-4 text-xs font-bold text-emerald-600 font-mono">E {item.currentFunding?.toLocaleString() || 0}</td>
            <td className="px-6 py-4 text-xs">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                item.status === 'Active' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-600 border border-gray-100'
              }`}>
                {item.status}
              </span>
            </td>
          </>
        );
      default:
        return (
          <>
            <td className="px-6 py-4 font-mono text-xs text-gray-400">#{item.id}</td>
            <td className="px-6 py-4 font-medium text-primary">{item.title || item.name}</td>
            <td className="px-6 py-4 text-xs font-mono">Active</td>
            <td className="px-6 py-4 text-xs">Recently</td>
          </>
        );
    }
  };

  const openAddModal = () => {
    setEditItem(null);
    const schema = SCHEMAS[activeTab] || [];
    const defaults: Record<string, any> = {};
    schema.forEach(field => {
      if (field.type === 'checkbox') {
        defaults[field.name] = false;
      } else if (field.type === 'number') {
        defaults[field.name] = 0;
      } else {
        defaults[field.name] = '';
      }
    });
    setFormData(defaults);
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = getTabUrl(activeTab);
    if (!url) return;

    setSaving(true);
    const requestUrl = editItem ? `${url}/${editItem.id}` : url;
    const method = editItem ? 'PUT' : 'POST';

    try {
      const response = await fetch(requestUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const savedData = await response.json();
        if (editItem) {
          setItems(prev => prev.map(it => it.id === editItem.id ? savedData : it));
        } else {
          setItems(prev => [savedData, ...prev]);
        }
        setShowModal(false);
        setEditItem(null);
      } else {
        const errorText = await response.text();
        alert(`Failed to save administrative record: ${errorText}`);
      }
    } catch (err: any) {
      console.error('Error saving resource entry:', err);
      alert(`Error saving: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const url = getTabUrl(activeTab);
    if (!url) return;

    if (!confirm('Are you strictly sure you want to permanently delete this church register entry? This action is irreversible.')) return;

    try {
      const response = await fetch(`${url}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems(prev => prev.filter(it => it.id !== id));
      } else {
        const errText = await response.text();
        alert(`Failed to delete record: ${errText}`);
      }
    } catch (err: any) {
      console.error('Error hard deleting record:', err);
      alert(`Delete failed: ${err.message || err}`);
    }
  };

  // Live filter items based on search query
  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = (item.title || '').toLowerCase().includes(query);
    const nameMatch = (item.name || '').toLowerCase().includes(query);
    const speakerMatch = (item.speaker || '').toLowerCase().includes(query);
    const descMatch = (item.description || '').toLowerCase().includes(query);
    const textMatch = (item.text || '').toLowerCase().includes(query);
    const donorMatch = (item.donorName || '').toLowerCase().includes(query);
    return titleMatch || nameMatch || speakerMatch || descMatch || textMatch || donorMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans" id="admin-dashboard-root">
      
      {/* Sidebar Navigation */}
      <div className="w-64 bg-primary text-white border-r border-primary-dark/30 hidden md:flex flex-col shadow-lg shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-3 bg-[#0a141b]/50">
          <div className="w-9 h-9 rounded-xl bg-secondary text-primary flex items-center justify-center font-black shadow-sm">
            ✝
          </div>
          <div>
            <h2 className="font-header text-sm font-bold text-white tracking-wide">Fonteyn Evangelical</h2>
            <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block pt-0.5">ADMIN CENTRE</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
          <div>
            <span className="text-[9px] font-bold text-[#6a8798] uppercase tracking-widest pl-3 block mb-2">Main Core Ledgers</span>
          </div>
          <div className="space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold transition uppercase tracking-widest ${
                  activeTab === tab.id 
                    ? 'bg-secondary text-primary shadow-sm font-black' 
                    : 'text-[#9cb5c5] hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-primary' : 'text-[#6a8798]'}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-6 mb-2">
            <span className="text-[9px] font-bold text-[#6a8798] uppercase tracking-widest pl-3 block mb-2">V2 Expansion Portals</span>
          </div>
          <div className="space-y-1">
            {EXPANSION_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold transition uppercase tracking-widest ${
                  activeTab === tab.id 
                    ? 'bg-secondary text-primary shadow-sm font-black' 
                    : 'text-[#9cb5c5] hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-primary' : 'text-[#6a8798]'}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0 shadow-xs">
           <div className="flex items-center gap-2">
             <div className="p-1.5 bg-gray-100 rounded-lg text-primary md:hidden">
               <Settings className="w-5 h-5 animate-spin" />
             </div>
             <h1 className="font-header text-xl font-extrabold text-primary tracking-tight">
               {[...TABS, ...EXPANSION_TABS].find(t => t.id === activeTab)?.label} Control
             </h1>
           </div>
           
           <div className="flex items-center gap-4">
             {activeTab !== 'overview' && activeTab !== 'images' && (
               <div className="relative">
                 <Search className="w-4 h-4 text-gray-450 absolute left-3 top-2.5" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Filter records in directory..." 
                   className="pl-9 pr-4 py-2 bg-gray-100 border-none rounded-xl text-xs outline-none focus:ring-1 focus:ring-secondary w-64 text-primary font-medium"
                 />
               </div>
             )}
             <div className="w-9 h-9 rounded-full bg-secondary text-primary flex items-center justify-center font-black text-xs border border-primary/10">
               SM
             </div>
           </div>
        </header>

        {/* Dynamic Content Pane */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          
          {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-8">
               <button
                onClick={handleForceRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                <Activity className="w-4 h-4" />
                Force Refresh
              </button>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: 'Registered Members', value: statsData.members, icon: <Users className="w-5 h-5" />, trend: 'Eswatini Registry' },
                   { label: 'Cumulative Donations', value: statsData.donations, icon: <DollarSign className="w-5 h-5" />, trend: 'Lalangeni (SZL)' },
                   { label: 'Active Prayer Requests', value: statsData.prayers, icon: <MessageSquare className="w-5 h-5" />, trend: 'Prayer Wall' },
                   { label: 'Platform Users', value: statsData.users, icon: <ShieldCheck className="w-5 h-5" />, trend: 'System Access' },
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm border-l-4 border-l-secondary flex flex-col justify-between">
                     <div className="flex justify-between items-start mb-4">
                       <div className="p-2.5 bg-gray-50 rounded-xl text-primary border border-gray-100">{stat.icon}</div>
                       <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-150">{stat.trend}</span>
                     </div>
                     <div>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
                       <h3 className="font-header text-3xl font-black text-primary mt-1">{stat.value}</h3>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
                  <h3 className="font-header text-base font-bold text-primary mb-4">Pastoral System Dashboard Activities</h3>
                  <div className="space-y-3 font-sans">
                    {[
                      { msg: 'Dynamic church register active. Connecting to secure Swaziland Firestore servers.', time: 'System Active' },
                      { msg: 'Administrative services synchronized with Fonteyn main church ledger.', time: 'Verified Secure' },
                      { msg: 'Sermon theological notes generated for Reverend LS Mnisi congregation.', time: 'AI Copilot Ready' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                         <span className="text-xs text-gray-650 font-medium flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block"></span>
                           {log.msg}
                         </span>
                         <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md font-mono font-bold tracking-wide">{log.time}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'sermons' && (
            <div className="mb-8 animate-fade-in space-y-8">
              <AISermonAssistant />
            </div>
          )}

          {activeTab === 'images' && (
            <div className="mb-8 animate-fade-in">
              <AdminImagesView />
            </div>
          )}

          {activeTab === 'media-files' && (
            <div className="mb-8 animate-fade-in">
              <AdminMediaFilesView />
            </div>
          )}

          {activeTab === 'storage-diagnostics' && (
            <div className="mb-8 animate-fade-in">
              <StorageDiagnostics />
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'images' && activeTab !== 'media-files' && activeTab !== 'storage-diagnostics' && (
            <div className="bg-white rounded-3xl border border-gray-150 shadow-sm animate-fade-in overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/40">
                 <h2 className="font-header text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
                   {[...TABS, ...EXPANSION_TABS].find(t => t.id === activeTab)?.icon}
                   Active {[...TABS, ...EXPANSION_TABS].find(t => t.id === activeTab)?.label} Register
                 </h2>
                 <button 
                   onClick={openAddModal}
                   className="bg-secondary text-primary px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-secondary border-none transition shadow-sm flex items-center gap-2"
                 >
                   <Plus className="w-4 h-4 text-primary" /> Add Register Entry
                 </button>
               </div>
               
               {loading ? (
                 <div className="p-16 flex flex-col items-center justify-center gap-3">
                   <div className="w-10 h-10 rounded-full border-4 border-secondary border-t-primary animate-spin" />
                   <p className="text-xs text-gray-450 font-medium">Downloading register index...</p>
                 </div>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm text-gray-600">
                     <thead className="text-[10px] uppercase font-bold tracking-widest text-[#6a8798] bg-[#f9fafb] border-b border-gray-100">
                       <tr>
                         {getTableColumns(activeTab).map((col, idx) => (
                           <th key={idx} className="px-6 py-4">{col}</th>
                         ))}
                         <th className="px-6 py-4 text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                       {filteredItems.length === 0 ? (
                         <tr>
                           <td colSpan={getTableColumns(activeTab).length + 1} className="px-6 py-12 text-center">
                             <div className="flex flex-col items-center justify-center gap-2">
                               <AlertTriangle className="w-8 h-8 text-amber-500" />
                               <p className="text-xs font-bold text-gray-450">No files found. The church ledger directory is empty.</p>
                               <button 
                                 onClick={openAddModal} 
                                 className="text-xs text-[#0a141b] border-b border-[#0a141b] font-bold"
                               >
                                 Create first template record
                               </button>
                             </div>
                           </td>
                         </tr>
                       ) : (
                         filteredItems.map((item) => (
                           <tr key={item.id || item.email} className="hover:bg-[#f9fafb]/50 transition duration-150">
                             {renderRowCells(activeTab, item)}
                             <td className="px-6 py-4 text-right shrink-0">
                               <div className="flex items-center justify-end gap-1.5">
                                 <button 
                                   onClick={() => openEditModal(item)}
                                   className="p-1.5 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-xl transition" 
                                   title="Edit Entry"
                                 >
                                   <Edit2 className="w-3.5 h-3.5" />
                                 </button>
                                 <button 
                                   onClick={() => handleDelete(item.id)}
                                   className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition" 
                                   title="Delete Record"
                                 >
                                   <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                               </div>
                             </td>
                           </tr>
                         ))
                       )}
                     </tbody>
                   </table>
                 </div>
               )}

               <div className="p-4 border-t border-gray-100 bg-[#f9fafb] flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                  <span>Showing {filteredItems.length} entries</span>
                  <div className="flex gap-2">
                     <button className="px-3 py-1.5 border border-gray-150 rounded-xl bg-white hover:bg-gray-50 transition" disabled>Prev</button>
                     <button className="px-3 py-1.5 border border-gray-150 rounded-xl bg-white hover:bg-gray-50 transition" disabled>Next</button>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>

      {/* Dynamic Popover Modal Dialogue for ADD / EDIT */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0a141b]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="ledger-form-overlay">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-150 overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-header text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-secondary" />
                  {editItem ? 'Edit Existing Record' : 'Record New Entry'}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                  Ledger: {[...TABS, ...EXPANSION_TABS].find(t => t.id === activeTab)?.label}
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-xl transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 font-sans text-xs">
                {(SCHEMAS[activeTab] || []).map((field) => (
                  <div key={field.name} className="space-y-1.5 text-left">
                    <label className="font-bold text-primary block">{field.label}</label>
                    
                    {field.type === 'text' && (
                      <input 
                        type="text" 
                        required
                        value={formData[field.name] || ''} 
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary focus:border-secondary outline-none text-primary font-medium"
                      />
                    )}

                    {field.type === 'number' && (
                      <input 
                        type="number" 
                        required
                        value={formData[field.name] || 0} 
                        onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary focus:border-secondary outline-none text-primary font-medium"
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea 
                        rows={3}
                        value={formData[field.name] || ''} 
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary focus:border-secondary outline-none text-primary font-medium"
                      />
                    )}

                    {field.type === 'select' && (
                      <select 
                        value={formData[field.name] || ''} 
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary focus:border-secondary outline-none text-primary font-bold"
                      >
                        <option value="">-- Choose Option --</option>
                        {field.options?.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {field.type === 'checkbox' && (
                      <div className="flex items-center gap-2 pt-1">
                        <input 
                          type="checkbox" 
                          id={field.name}
                          checked={formData[field.name] || false} 
                          onChange={(e) => handleInputChange(field.name, e.target.checked)}
                          className="w-4 h-4 text-secondary border-gray-300 rounded-md focus:ring-secondary"
                        />
                        <label htmlFor={field.name} className="font-semibold text-gray-500">Enable / True</label>
                      </div>
                    )}

                    {field.type === 'image' && (
                      <div className="space-y-2 mt-2">
                        {formData[field.name] && (
                          <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden group">
                            <img src={formData[field.name]} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleInputChange(field.name, '')}
                              className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleImageUpload(field.name, e.target.files[0]);
                          }}
                          className="hidden"
                          id={`upload-${field.name}`}
                        />
                        <label 
                          htmlFor={`upload-${field.name}`}
                          className="flex items-center justify-center w-full px-4 py-3 bg-gray-50 border border-dashed border-gray-300 hover:border-secondary hover:bg-gray-100 rounded-xl cursor-pointer transition text-gray-500 font-medium"
                        >
                          {uploadingField === field.name ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></span>
                              Uploading...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" /> 
                              {formData[field.name] ? 'Change Image Asset' : 'Select Image File'}
                            </span>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action feet */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-500 hover:text-primary hover:bg-gray-200 rounded-xl font-bold uppercase tracking-wider transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-secondary text-primary hover:bg-[#ffdf1a] font-black uppercase tracking-wider rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin block" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Save Record</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
