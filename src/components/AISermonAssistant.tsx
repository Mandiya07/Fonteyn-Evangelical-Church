import React, { useState } from 'react';
import { Bot, Sparkles, BookOpen, MessageSquare, Share2, Loader2, CheckCircle2 } from 'lucide-react';

export default function AISermonAssistant() {
  const [title, setTitle] = useState('');
  const [scripture, setScripture] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/ai/sermon-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, scripture, notes })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate sermon materials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="bg-primary text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl border-b-4 border-secondary">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mt-20 -mr-20 blur-3xl pointer-events-none"></div>
         <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="flex-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/20 border border-secondary/50 text-secondary rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                 <Bot className="w-3.5 h-3.5" /> AI Sermon Assistant
              </span>
              <h2 className="font-header text-2xl sm:text-3xl font-bold mb-2">Automate Your Sermon Prep</h2>
              <p className="text-sm font-sans text-gray-300 max-w-xl">
                Enter your sermon details below. Our AI specifically trained for church ministry will instantly generate a structured summary, cross-reference scriptures, create cell-group discussion questions, and write social media announcements.
              </p>
            </div>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Input Form */}
         <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
           <form onSubmit={handleGenerate} className="space-y-5">
             <div>
               <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Sermon Title</label>
               <input 
                 type="text" 
                 required
                 value={title}
                 onChange={e => setTitle(e.target.value)}
                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-secondary transition"
                 placeholder="e.g. Building on the Rock"
               />
             </div>
             <div>
               <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Main Scriptures</label>
               <input 
                 type="text" 
                 required
                 value={scripture}
                 onChange={e => setScripture(e.target.value)}
                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-secondary transition"
                 placeholder="e.g. Matthew 7:24-27"
               />
             </div>
             <div>
               <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Raw Notes / Outline (Optional)</label>
               <textarea 
                 value={notes}
                 onChange={e => setNotes(e.target.value)}
                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-secondary transition resize-none"
                 placeholder="Paste your rough draft, bullet points, or theological pointers here..."
                 rows={6}
               />
             </div>
             <button 
               type="submit" 
               disabled={isLoading || !title || !scripture}
               className="w-full bg-secondary text-primary hover:bg-neutral-800 hover:text-white transition py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
             >
               {isLoading ? (
                 <><Loader2 className="w-4 h-4 animate-spin" /> Generating Wisdom...</>
               ) : (
                 <><Sparkles className="w-4 h-4" /> Generate Assets</>
               )}
             </button>
           </form>
         </div>

         {/* Results Pane */}
         <div className="bg-gray-50 rounded-3xl border border-gray-200 p-6 shadow-inner min-h-[400px]">
           {!result && !isLoading && (
             <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
               <Bot className="w-12 h-12 text-gray-300" />
               <p className="text-sm">Awaiting your notes to generate<br/>theological insights and media assets.</p>
             </div>
           )}

           {isLoading && (
             <div className="h-full flex flex-col items-center justify-center text-center text-secondary space-y-4">
               <Loader2 className="w-10 h-10 animate-spin" />
               <p className="text-xs font-bold uppercase tracking-widest text-primary animate-pulse">Analyzing Scripture...</p>
             </div>
           )}

           {result && !isLoading && (
             <div className="space-y-6 animate-fade-in">
               
               <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm relative group">
                 <div className="absolute top-4 right-4 text-green-500"><CheckCircle2 className="w-5 h-5" /></div>
                 <h3 className="flex items-center gap-2 font-header font-bold text-primary mb-3">
                   <BookOpen className="w-4 h-4 text-secondary" /> Sermon Summary
                 </h3>
                 <p className="text-sm text-gray-600 font-serif leading-relaxed pr-8">{result.summary}</p>
               </div>

               <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
                 <h3 className="flex items-center gap-2 font-header font-bold text-primary mb-3">
                   <BookOpen className="w-4 h-4 text-secondary" /> Bible References
                 </h3>
                 <ul className="space-y-2">
                   {result.bibleReferences?.map((ref: string, i: number) => (
                     <li key={i} className="text-sm text-gray-600 font-serif flex items-start gap-2">
                       <span className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 shrink-0"></span>
                       <span>{ref}</span>
                     </li>
                   ))}
                 </ul>
               </div>

               <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
                 <h3 className="flex items-center gap-2 font-header font-bold text-primary mb-3">
                   <MessageSquare className="w-4 h-4 text-secondary" /> Discussion Questions
                 </h3>
                 <ul className="space-y-2">
                   {result.discussionQuestions?.map((q: string, i: number) => (
                     <li key={i} className="text-sm text-gray-600 font-serif flex items-start gap-2">
                       <span className="shrink-0 text-gray-400 font-bold">{i + 1}.</span>
                       <span>{q}</span>
                     </li>
                   ))}
                 </ul>
               </div>

               <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
                 <h3 className="flex items-center gap-2 font-header font-bold text-primary mb-3">
                   <Share2 className="w-4 h-4 text-secondary" /> Social Media Posts
                 </h3>
                 <div className="space-y-3">
                   {result.socialPosts?.map((post: string, i: number) => (
                     <div key={i} className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 font-sans relative">
                        {post}
                        <button className="absolute bottom-2 right-2 text-[9px] font-bold uppercase text-secondary hover:text-primary transition bg-white px-2 py-1 border border-gray-200 shadow-sm rounded">Copy</button>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="pt-4 flex justify-end">
                  <button className="bg-primary text-white font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-xl hover:bg-neutral-800 transition shadow-md">
                    Export All Assets
                  </button>
               </div>
             </div>
           )}
         </div>
       </div>
    </div>
  );
}
