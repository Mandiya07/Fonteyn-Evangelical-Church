import React, { useState } from 'react';
import { BookOpen, Search, Calendar, Heart, Bookmark, Share2, ChevronRight, Sun, BookMarked } from 'lucide-react';

interface BibleViewProps {
  language: 'en' | 'swati';
}

const READING_PLANS = [
  { id: '1', title: 'Bible in a Year', duration: '365 Days', progress: 45, type: 'Chronological' },
  { id: '2', title: '30 Days with Jesus', duration: '30 Days', progress: 12, type: 'Gospels' },
  { id: '3', title: 'Psalms of Comfort', duration: '14 Days', progress: 0, type: 'Topical' },
];

const DEVOTIONALS = [
  { id: '1', title: 'Walking in Faith', date: 'Today', excerpt: 'Faith is the assurance of things hoped for, the conviction of things not seen...', readTime: '5 min' },
  { id: '2', title: 'The Power of Grace', date: 'Yesterday', excerpt: 'Gods grace is sufficient for us in every season of our lives...', readTime: '4 min' },
  { id: '3', title: 'Overcoming Fear', date: 'Oct 12', excerpt: 'Do not be anxious about anything, but in everything by prayer and supplication...', readTime: '6 min' },
];

const PRAYER_GUIDES = [
  { id: '1', title: 'A.C.T.S. Prayer Model', description: 'Adoration, Confession, Thanksgiving, Supplication.' },
  { id: '2', title: 'Praying for the Nation', description: 'Intercessory points for Eswatini and global leaders.' },
  { id: '3', title: 'Morning Warfare', description: 'Scriptures and declarations to start your day victorious.' },
];

export default function BibleView({ language }: BibleViewProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'search' | 'plans' | 'devotionals'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ reference: string, text: string }[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Mock search results
    setSearchResults([
      { reference: 'John 3:16', text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
      { reference: 'Romans 8:28', text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
      { reference: 'Philippians 4:13', text: 'I can do all things through Christ which strengtheneth me.' }
    ]);
  };

  return (
    <div className="min-h-screen bg-supporting py-12" id="bible-resources-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Setup */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header">Digital Word</span>
          <h1 className="text-3xl sm:text-4xl font-header font-bold text-primary mt-2">Bible Resources</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-3 max-w-2xl mx-auto">
            {language === 'en' 
              ? "Access daily verses, devotionals, reading plans, and prayer guides to strengthen your walk with God."
              : "Tfola emavesi onkhe emalanga, ticondziso temthandazo netinhlelo tekufundza liBhayibheli."}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap bg-white rounded-xl p-1 w-full max-w-3xl mx-auto mb-10 shadow-sm border border-gray-150 gap-1 sm:gap-0">
          {[
            { id: 'daily', icon: <Sun className="w-4 h-4" />, label: 'Daily Word' },
            { id: 'search', icon: <Search className="w-4 h-4" />, label: 'Scripture Search' },
            { id: 'plans', icon: <Calendar className="w-4 h-4" />, label: 'Reading Plans' },
            { id: 'devotionals', icon: <BookOpen className="w-4 h-4" />, label: 'Devotionals' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 px-2 text-[10px] sm:text-xs font-bold rounded-lg transition uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                activeTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-primary hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: Daily Word (Verse & Prayer Guides) */}
        {activeTab === 'daily' && (
          <div className="space-y-8 animate-fade-in" id="daily-word-pane">
            
            {/* Verse of the Day Hero */}
            <div className="bg-primary rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl border-b-4 border-secondary">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1000&auto=format&fit=crop&q=80&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
              <div className="absolute -top-10 -right-10 text-secondary/10">
                <BookOpen className="w-64 h-64" />
              </div>
              <div className="relative z-10 max-w-3xl mx-auto">
                <span className="inline-block px-3 py-1 bg-secondary/20 border border-secondary/50 text-secondary rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                  Verse of the Day
                </span>
                <p className="font-serif text-2xl sm:text-4xl leading-relaxed italic mb-8">
                  "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint."
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <span className="font-header text-lg font-bold text-secondary">Isaiah 40:31 (KJV)</span>
                  <div className="hidden sm:block w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                  <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-secondary transition bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                    <Share2 className="w-4 h-4" /> Share Verse
                  </button>
                </div>
              </div>
            </div>

            {/* Prayer Guides */}
            <div>
              <h3 className="font-header text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-secondary" /> Prayer Guides
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRAYER_GUIDES.map(guide => (
                  <div key={guide.id} className="bg-white p-5 rounded-2xl border border-gray-150 hover:border-secondary transition shadow-sm group cursor-pointer flex flex-col justify-between">
                    <div>
                      <h4 className="font-header font-bold text-[15px] text-primary">{guide.title}</h4>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{guide.description}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                       <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-primary transition">Open Guide</span>
                       <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Scripture Search */}
        {activeTab === 'search' && (
          <div className="animate-fade-in bg-white rounded-3xl border border-gray-150 p-6 sm:p-10 shadow-sm max-w-4xl mx-auto" id="scripture-search-pane">
             <div className="text-center mb-8">
               <h2 className="font-header text-2xl font-bold text-primary mb-2">Search the Scriptures</h2>
               <p className="text-xs text-gray-500">Find verses by keyword, topic, or reference.</p>
             </div>
             
             <form onSubmit={handleSearch} className="mb-10">
               <div className="relative max-w-2xl mx-auto flex shadow-sm rounded-xl overflow-hidden border border-gray-200 focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary transition">
                 <div className="bg-gray-50 px-4 flex items-center border-r border-gray-200">
                   <Search className="w-5 h-5 text-gray-400" />
                 </div>
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   placeholder="e.g. 'Love', 'John 3:16', 'Faith'"
                   className="flex-1 px-4 py-4 text-sm outline-none"
                 />
                 <button type="submit" className="bg-primary text-white font-bold px-6 text-xs uppercase tracking-wider hover:bg-neutral-800 transition">
                   Search
                 </button>
               </div>
             </form>

             {searchResults.length > 0 && (
               <div className="space-y-4 max-w-3xl mx-auto">
                 <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-4 text-center">Results for "{searchQuery}"</h3>
                 {searchResults.map((result, idx) => (
                   <div key={idx} className="p-5 border border-gray-150 rounded-xl hover:border-secondary transition bg-gray-50/50">
                     <div className="flex justify-between items-start mb-2">
                       <h4 className="font-header font-bold text-secondary text-[15px]">{result.reference}</h4>
                       <button className="text-gray-400 hover:text-primary tooltip" title="Bookmark">
                         <Bookmark className="w-4 h-4" />
                       </button>
                     </div>
                     <p className="text-sm text-gray-700 leading-relaxed font-serif">{result.text}</p>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {/* TAB 3: Reading Plans */}
        {activeTab === 'plans' && (
          <div className="animate-fade-in" id="reading-plans-pane">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-header text-2xl font-bold text-primary">Your Reading Plans</h2>
              <button className="text-xs font-bold text-secondary uppercase tracking-widest hover:text-primary transition">Browse More →</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {READING_PLANS.map(plan => (
                <div key={plan.id} className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400 mb-3 tracking-widest">
                    <span>{plan.type}</span>
                    <span>{plan.duration}</span>
                  </div>
                  <h3 className="font-header text-lg font-bold text-primary mb-6">{plan.title}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-secondary">{plan.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-secondary rounded-full transition-all duration-1000" style={{ width: `${plan.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-primary font-bold text-xs uppercase tracking-widest rounded-lg border border-gray-200 transition">
                      {plan.progress === 0 ? 'Start Plan' : 'Continue Reading'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Devotionals */}
        {activeTab === 'devotionals' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8" id="devotionals-pane">
             
             {/* Left: Featured Devotional */}
             <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden flex flex-col sm:flex-row">
               <div className="w-full sm:w-2/5 aspect-square sm:aspect-auto bg-gray-100 relative">
                 <img loading="lazy" src="https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?w=600&auto=format&fit=crop&q=80&fit=crop" className="w-full h-full object-cover" alt="Devotional" />
                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-[10px] font-bold text-primary uppercase tracking-widest shadow-sm">
                   Today's Reading
                 </div>
               </div>
               <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
                 <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 uppercase mb-3">
                   <Calendar className="w-3.5 h-3.5" /> Oct 15, 2023
                 </div>
                 <h2 className="font-header text-2xl font-bold text-primary mb-4">Trusting the Process</h2>
                 <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1 font-serif">
                   We often want the promise without the process. But God uses the waiting seasons to prepare our character for the destination He has planned for us. Are we willing to embrace the refinement?
                 </p>
                 <button className="w-max px-6 py-2.5 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-neutral-800 transition shadow-md">
                   Read Full Devotional
                 </button>
               </div>
             </div>

             {/* Right: Past Devotionals List */}
             <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm flex flex-col">
               <h3 className="font-header font-bold text-lg text-primary mb-6 flex items-center gap-2">
                 <BookMarked className="w-5 h-5 text-secondary" /> Recent Entries
               </h3>
               <div className="space-y-4 flex-1">
                 {DEVOTIONALS.map(dev => (
                   <div key={dev.id} className="p-4 border border-gray-100 rounded-xl hover:border-secondary transition cursor-pointer group">
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-[9px] font-bold uppercase tracking-widest text-secondary">{dev.date}</span>
                       <span className="text-[9px] font-mono text-gray-400">{dev.readTime} read</span>
                     </div>
                     <h4 className="font-header font-bold text-sm text-primary group-hover:text-secondary transition">{dev.title}</h4>
                     <p className="text-xs text-gray-500 mt-2 line-clamp-2 font-serif">{dev.excerpt}</p>
                   </div>
                 ))}
               </div>
               <button className="mt-4 pt-4 border-t border-gray-100 w-full text-center text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-primary transition">
                 View Archive
               </button>
             </div>

          </div>
        )}

      </div>
    </div>
  );
}
