import React, { useState } from 'react';
import { Calendar, User, Tag as TagIcon, Share2, MessageCircle, ChevronRight, Bookmark, Filter, FileText } from 'lucide-react';

interface BlogViewProps {
  language: 'en' | 'swati';
}

const CATEGORIES = ['All', 'Announcements', 'Pastor\'s Articles', 'Testimonies', 'Ministry Updates', 'Community News'];

const BLOG_POSTS = [
  {
    id: '1',
    title: 'Navigating Seasons of Change',
    excerpt: 'As we enter a new quarter, let us reflect on how God uses different seasons to mature our faith and build our character.',
    content: 'Full content goes here...',
    author: 'Rev LS Mnisi',
    date: 'Oct 14, 2023',
    category: 'Pastor\'s Articles',
    tags: ['Faith', 'Growth', 'Seasons'],
    comments: 12,
    image: 'https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?w=600&auto=format&fit=crop&q=80&fit=crop'
  },
  {
    id: '2',
    title: 'Youth Choir Wins Regional Competition',
    excerpt: 'Congratulations to our amazing youth choir for their outstanding performance at the Manzini Regional Choral Festival this past weekend.',
    content: 'Full content goes here...',
    author: 'Admin',
    date: 'Oct 12, 2023',
    category: 'Ministry Updates',
    tags: ['Youth', 'Music', 'Celebration'],
    comments: 5,
    image: 'https://images.unsplash.com/photo-1514320291840-2bc89897d387?w=600&auto=format&fit=crop&q=80&fit=crop'
  },
  {
    id: '3',
    title: 'Thanksgiving Service Announcement',
    excerpt: 'Join us for our annual Thanksgiving Sunday where we will dedicate time to thank God for His faithfulness throughout the year.',
    content: 'Full content goes here...',
    author: 'Church Board',
    date: 'Oct 10, 2023',
    category: 'Announcements',
    tags: ['Events', 'Thanksgiving'],
    comments: 0,
    image: 'https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?w=600&auto=format&fit=crop&q=80&fit=crop'
  },
  {
    id: '4',
    title: 'Healing After Loss: Sister Lindiwe\'s Story',
    excerpt: 'God\'s grace has been my anchor during the darkest storms of my life. I want to share my journey of finding peace after losing my husband.',
    content: 'Full content goes here...',
    author: 'Lindiwe Dlamini',
    date: 'Oct 05, 2023',
    category: 'Testimonies',
    tags: ['Healing', 'Grace', 'Testimony'],
    comments: 24,
    image: 'https://images.unsplash.com/photo-1523824922870-a6201560e4eb?w=600&auto=format&fit=crop&q=80&fit=crop'
  },
  {
    id: '5',
    title: 'Soup Kitchen Expands to Surrounding Areas',
    excerpt: 'Thanks to your generous donations, our weekly soup kitchen program is now able to serve two additional neighboring communities.',
    content: 'Full content goes here...',
    author: 'Outreach Team',
    date: 'Sep 28, 2023',
    category: 'Community News',
    tags: ['Outreach', 'Community', 'Giving'],
    comments: 8,
    image: 'https://images.unsplash.com/photo-1593113580332-6ace6178c187?w=600&auto=format&fit=crop&q=80&fit=crop'
  }
];

export default function BlogView({ language }: BlogViewProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [commentText, setCommentText] = useState('');

  const filteredPosts = BLOG_POSTS.filter(post => 
    activeCategory === 'All' || post.category === activeCategory
  );

  const handleShare = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    alert(`Sharing: ${title}`);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    alert('Comment submitted for moderation.');
    setCommentText('');
  };

  return (
    <div className="min-h-screen bg-supporting py-12" id="blog-view-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Setup */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header">Church Voices</span>
          <h1 className="text-3xl sm:text-4xl font-header font-bold text-primary mt-2">News & Articles</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-3 max-w-2xl mx-auto">
            {language === 'en' 
              ? "Stay updated with church announcements, read encouraging articles from our pastors, and celebrate powerful testimonies."
              : "Hlala wati ngetimemetelo telibandla, fundza tifundvo letakhako kubafundisi, uphindze ugubhe bufakazi lobunemandla."}
          </p>
        </div>

        {!selectedPost ? (
          <>
            {/* Category Filter */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-[10px] sm:text-xs font-bold rounded-full transition uppercase tracking-widest ${
                    activeCategory === cat
                      ? 'bg-secondary text-primary shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-secondary/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-xl hover:border-secondary transition duration-300 group flex flex-col cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {post.image ? (
                      <img loading="lazy" 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <TagIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-[9px] font-bold text-primary uppercase tracking-widest shadow-sm">
                      {post.category}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">
                      <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</div>
                      <span>•</span>
                      <div className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.comments}</div>
                    </div>
                    
                    <h3 className="font-header text-xl font-bold text-primary mb-3 leading-snug group-hover:text-secondary transition">{post.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed flex-1 font-sans">{post.excerpt}</p>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                         <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><User className="w-3 h-3" /></div>
                         {post.author}
                      </div>
                      <button 
                         onClick={(e) => handleShare(e, post.title)}
                         className="p-1.5 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition tooltip" title="Share Article"
                      >
                         <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden animate-fade-in" id="blog-article-view">
             {/* Article Header Image */}
             <div className="h-64 sm:h-96 relative bg-gray-900">
                {selectedPost.image ? (
                  <img loading="lazy" src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover opacity-60" />
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                    <FileText className="w-20 h-20 text-white/5" />
                  </div>
                )}
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-6 left-6 bg-black/50 backdrop-blur hover:bg-secondary hover:text-primary text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition flex items-center gap-2 border border-white/20"
                >
                  ← Back to Articles
                </button>
             </div>
             
             {/* Article Content */}
             <div className="p-6 sm:p-12">
               <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-500 uppercase tracking-widest mb-6">
                 <span className="bg-secondary/20 text-secondary px-3 py-1 rounded font-bold">{selectedPost.category}</span>
                 <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {selectedPost.date}</div>
                 <div className="flex items-center gap-1.5"><User className="w-4 h-4" /> {selectedPost.author}</div>
               </div>

               <h2 className="font-header text-3xl sm:text-4xl font-bold text-primary mb-8 leading-tight">{selectedPost.title}</h2>
               
               <div className="prose prose-lg prose-gray max-w-none mb-10 font-serif text-gray-700 leading-relaxed">
                 <p className="text-xl mb-6 font-medium">{selectedPost.excerpt}</p>
                 <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                 <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
               </div>
               
               {/* Tags & Action Bar */}
               <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-y border-gray-100 gap-4 mb-10">
                 <div className="flex flex-wrap items-center gap-2">
                   <TagIcon className="w-4 h-4 text-gray-400 mr-1" />
                   {selectedPost.tags.map((tag: string, idx: number) => (
                     <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
                       {tag}
                     </span>
                   ))}
                 </div>
                 <div className="flex items-center gap-2">
                   <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-secondary hover:text-secondary transition uppercase tracking-widest">
                     <Bookmark className="w-4 h-4" /> Save
                   </button>
                   <button 
                     onClick={(e) => handleShare(e, selectedPost.title)}
                     className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-secondary hover:text-secondary transition uppercase tracking-widest"
                   >
                     <Share2 className="w-4 h-4" /> Share
                   </button>
                 </div>
               </div>

               {/* Comments Section */}
               <div className="bg-gray-50 rounded-2xl p-6 sm:p-8" id="article-comments">
                 <h3 className="font-header text-xl font-bold text-primary flex items-center gap-2 mb-6">
                   <MessageCircle className="w-5 h-5 text-secondary" /> 
                   Comments ({selectedPost.comments})
                 </h3>
                 
                 <form onSubmit={handleCommentSubmit} className="mb-8 relative border border-gray-200 rounded-xl bg-white shadow-sm focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary transition-all p-1">
                   <textarea
                     required
                     value={commentText}
                     onChange={e => setCommentText(e.target.value)}
                     placeholder="Join the discussion... (Comments are moderated)"
                     className="w-full text-sm px-4 py-3 outline-none resize-none bg-transparent"
                     rows={3}
                   ></textarea>
                   <div className="flex justify-between items-center px-4 pb-3 border-t border-gray-100 pt-3">
                     <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Moderated</span>
                     <button type="submit" className="bg-primary text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-widest px-6 py-2 rounded-lg transition shadow">
                       Post Comment
                     </button>
                   </div>
                 </form>

                 {/* Mock Comments View */}
                 <div className="space-y-4">
                   <div className="bg-white p-4 rounded-xl border border-gray-150">
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold font-header text-sm">S</div>
                           <div>
                             <h4 className="font-bold text-xs text-primary">Sipho D.</h4>
                             <span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono">2 days ago</span>
                           </div>
                         </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">What a powerful reminder. Thank you for sharing this! God's timing is truly perfect.</p>
                   </div>
                 </div>

               </div>
               
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
