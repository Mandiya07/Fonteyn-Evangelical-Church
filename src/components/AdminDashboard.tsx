import React, { useState } from 'react';
import { 
  Users, Calendar, Video, HeartHandshake, DollarSign, 
  MessageSquare, FileText, ImageIcon, ShieldCheck, 
  Settings, Activity, Search, Plus, MoreVertical, Edit2, Trash2,
  Building2, GraduationCap, Radio, Store, Globe2
} from 'lucide-react';

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
  { id: 'media', icon: <ImageIcon className="w-4 h-4" />, label: 'Media' },
  { id: 'images', icon: <ImageIcon className="w-4 h-4" />, label: 'Image Assets' },
  { id: 'members', icon: <ShieldCheck className="w-4 h-4" />, label: 'Members' },
];

const EXPANSION_TABS = [
  { id: 'branches', icon: <Building2 className="w-4 h-4" />, label: 'Churches & Campuses' },
  { id: 'education', icon: <GraduationCap className="w-4 h-4" />, label: 'Schools & College' },
  { id: 'broadcasting', icon: <Radio className="w-4 h-4" />, label: 'Radio & TV Station' },
  { id: 'store', icon: <Store className="w-4 h-4" />, label: 'Christian Bookstore' },
  { id: 'community', icon: <Globe2 className="w-4 h-4" />, label: 'Community Projects' },
];

import AISermonAssistant from './AISermonAssistant';
import AdminImagesView from './AdminImagesView';

export default function AdminDashboard({ language }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="min-h-screen bg-gray-50 flex" id="admin-dashboard-root">
      
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
            <Settings className="w-4 h-4" />
          </div>
          <div>
             <h2 className="font-header text-sm font-bold text-primary">Admin Control</h2>
             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Dashboard</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition uppercase tracking-widest ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-500 hover:text-primary hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-8 mb-2 px-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">V2 Expansion Modules</span>
          </div>
          <div className="space-y-1">
            {EXPANSION_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition uppercase tracking-widest ${
                  activeTab === tab.id 
                    ? 'bg-secondary text-primary shadow-md' 
                    : 'text-gray-500 hover:text-secondary hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
           <h1 className="font-header text-2xl font-bold text-primary">
             {[...TABS, ...EXPANSION_TABS].find(t => t.id === activeTab)?.label} Management
           </h1>
           <div className="flex items-center gap-4">
             <div className="relative">
               <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
               <input 
                 type="text" 
                 placeholder="Quick search..." 
                 className="pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-xs outline-none focus:ring-1 focus:ring-secondary w-64"
               />
             </div>
             <div className="w-9 h-9 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-sm">
               AM
             </div>
           </div>
        </header>

        {/* Dynamic Content Pane */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          
          {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: 'Total Members', value: '1,245', icon: <Users className="w-5 h-5" />, trend: '+12%' },
                   { label: 'Monthly Donations', value: 'E45,000', icon: <DollarSign className="w-5 h-5" />, trend: '+5%' },
                   { label: 'Active Prayers', value: '34', icon: <MessageSquare className="w-5 h-5" />, trend: '-2%' },
                   { label: 'New Visitors', value: '89', icon: <Activity className="w-5 h-5" />, trend: '+24%' },
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm border-l-4 border-l-secondary">
                     <div className="flex justify-between items-start mb-4">
                       <div className="p-2 bg-gray-50 rounded-lg text-primary">{stat.icon}</div>
                       <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{stat.trend}</span>
                     </div>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
                     <h3 className="font-header text-3xl font-bold text-primary mt-1">{stat.value}</h3>
                   </div>
                 ))}
               </div>

               <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm">
                  <h3 className="font-header text-lg font-bold text-primary mb-6">Recent Activity Logging</h3>
                  <div className="space-y-4">
                    {[
                      { msg: 'New sermon uploaded: "Walking in Faith"', time: '10 mins ago' },
                      { msg: 'User Sipho requested counseling', time: '1 hour ago' },
                      { msg: 'Donation received: E500.00', time: '2 hours ago' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                         <span className="text-sm text-gray-600">{log.msg}</span>
                         <span className="text-[10px] text-gray-400 font-mono">{log.time}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'sermons' && (
            <div className="mb-8 animate-fade-in">
              <AISermonAssistant />
            </div>
          )}

          {activeTab === 'images' && (
            <div className="mb-8 animate-fade-in">
              <AdminImagesView />
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'images' && (
            <div className="bg-white rounded-2xl border border-gray-150 shadow-sm animate-fade-in overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h2 className="font-header text-lg font-bold text-primary flex items-center gap-2">
                   {[...TABS, ...EXPANSION_TABS].find(t => t.id === activeTab)?.icon}
                   Active {[...TABS, ...EXPANSION_TABS].find(t => t.id === activeTab)?.label} Directory
                 </h2>
                 <button className="bg-secondary text-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white border border-secondary transition shadow-sm flex items-center gap-2">
                   <Plus className="w-4 h-4" /> Add New
                 </button>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-gray-600">
                   <thead className="text-[10px] uppercase font-bold tracking-widest text-gray-400 bg-gray-50 border-b border-gray-100">
                     <tr>
                       <th className="px-6 py-4">ID Reference</th>
                       <th className="px-6 py-4">Title / Name</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4">Date Added</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {[1, 2, 3, 4, 5].map((item) => (
                       <tr key={item} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                         <td className="px-6 py-4 font-mono text-xs text-gray-400">#REF-00{item}</td>
                         <td className="px-6 py-4 font-medium text-primary">Sample {[...TABS, ...EXPANSION_TABS].find(t => t.id === activeTab)?.label} Entry {item}</td>
                         <td className="px-6 py-4">
                           <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                             Active
                           </span>
                         </td>
                         <td className="px-6 py-4 text-xs font-mono">2026-06-10</td>
                         <td className="px-6 py-4 text-right">
                           <button className="p-1.5 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-md transition tooltip mx-1" title="Edit">
                             <Edit2 className="w-4 h-4" />
                           </button>
                           <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition tooltip mx-1" title="Delete">
                             <Trash2 className="w-4 h-4" />
                           </button>
                           <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-md transition tooltip mx-1" title="More">
                             <MoreVertical className="w-4 h-4" />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Showing 1 to 5 of 24 entries</span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 transition">Previous</button>
                    <button className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 transition">Next</button>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
