import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Award, FileText, CheckCircle, Send, AlertTriangle, Landmark, PlusCircle, Archive } from 'lucide-react';
import { Sermon, ChurchEvent, PrayerRequest, Donation } from '../types';

interface AdminViewProps {
  language: 'en' | 'swati';
  onNewSermonCreated: () => void;
  onNewEventCreated: () => void;
}

export default function AdminView({ language, onNewSermonCreated, onNewEventCreated }: AdminViewProps) {
  const [prRequests, setPrRequests] = useState<PrayerRequest[]>([]);
  const [funding, setFunding] = useState<Donation[]>([]);
  
  // Pastor Note state
  const [replyPrId, setReplyPrId] = useState<string | null>(null);
  const [pastorNoteText, setPastorNoteText] = useState('');
  const [pastorNoteSuccess, setPastorNoteSuccess] = useState(false);

  // Add Sermon state
  const [sSubmitting, setSSubmitting] = useState(false);
  const [sTitle, setSTitle] = useState('');
  const [sSpeaker, setSSpeaker] = useState('Rev LS Mnisi');
  const [sDate, setSDate] = useState('');
  const [sTopic, setSTopic] = useState('Faith & Spiritual Growth');
  const [sScripture, setSScripture] = useState('');
  const [sNotes, setSNotes] = useState('');
  const [sSuccess, setSSuccess] = useState(false);

  const fetchPrRequests = async () => {
    try {
      const res = await fetch('/api/prayer-requests');
      const data = await res.json();
      setPrRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFunding = async () => {
    try {
      const res = await fetch('/api/donations');
      const data = await res.json();
      setFunding(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPrRequests();
    fetchFunding();
  }, []);

  // Compute stats on donations
  const totals = funding.reduce((sum, item) => sum + item.amount, 0);
  const tithesTotal = funding.filter(f => f.category === 'Tithes').reduce((sum, item) => sum + item.amount, 0);
  const offeringsTotal = funding.filter(f => f.category === 'Offerings').reduce((sum, item) => sum + item.amount, 0);
  const buildingTotal = funding.filter(f => f.category === 'Building Fund').reduce((sum, item) => sum + item.amount, 0);
  const missionsTotal = funding.filter(f => f.category === 'Missions Fund').reduce((sum, item) => sum + item.amount, 0);

  // Submit pastor note
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyPrId || !pastorNoteText.trim()) return;

    try {
      const res = await fetch('/api/prayer-requests/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: replyPrId,
          pastorNote: pastorNoteText.trim()
        })
      });
      if (res.ok) {
        setPastorNoteSuccess(true);
        setReplyPrId(null);
        setPastorNoteText('');
        fetchPrRequests();
        setTimeout(() => setPastorNoteSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="py-12 bg-white font-sans animate-fade-in" id="admin-view-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* HEADER */}
        <div className="text-center space-y-2 border-b pb-5">
          <span className="text-xs font-bold text-red-500 tracking-widest uppercase font-header flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
            <span>Pastoral Authorization Only</span>
          </span>
          <h1 className="font-header text-3xl font-bold text-primary tracking-tight">
            Administration Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Manage prayer request intercessions, ledger balances audits, and register new sermon libraries directly to the Cloud database.
          </p>
        </div>

        {/* LEDGER STATISTICS GAUGE CARDS */}
        <div className="space-y-4" id="ledger-stats-gui">
          <h3 className="font-header text-xs font-bold text-primary uppercase tracking-widest text-left">FEC Treasury Audit Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-primary hover:border-secondary border-[3px] border-primary rounded-2xl p-4.5 text-white flex flex-col justify-between shadow-sm">
              <span className="text-[9px] text-gray-300 font-bold uppercase tracking-wider">AGGREGATED LEDGER</span>
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-white pt-2">E {totals}.00</span>
              <span className="text-[10px] text-secondary font-sans font-medium pt-1">Total Eswatini Emalangeni</span>
            </div>

            {[
              { category: "Tithes (Kushumi)", sum: tithesTotal, color: "text-[#D4AF37]" },
              { category: "Free Offering", sum: offeringsTotal, color: "text-[#D4AF37]" },
              { category: "Building Fund", sum: buildingTotal, color: "text-[#D4AF37]" },
              { category: "Missions & Charity", sum: missionsTotal, color: "text-[#D4AF37]" }
            ].map((fund, idx) => (
              <div key={idx} className="bg-supporting border border-gray-150 rounded-2xl p-4.5 text-left flex flex-col justify-between shadow-2xs">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{fund.category}</span>
                <span className="font-mono text-lg sm:text-xl font-bold tracking-tight text-primary pt-2">E {fund.sum}.00</span>
                <span className="text-[10px] text-gray-400 font-sans block pt-1">Verified Gateway Cash</span>
              </div>
            ))}

          </div>
        </div>

        {/* PRAYER MODERATION PANEL vs ADD LATEST SERMON FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT CHALICE: MODERATE ACTIVE PRAYER BURDENS (7 Cols) */}
          <div className="lg:col-span-7 space-y-4 text-left" id="prayer-moderator-p">
            <h3 className="font-header text-xs font-bold text-primary tracking-widest uppercase pb-1 border-b">
              Moderate Congregation Prayers ({prRequests.length})
            </h3>

            {pastorNoteSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 font-sans text-xs rounded-xl flex items-center gap-1.5 animate-zoom-in">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                <span>Intercessory Pastor Note replied successfully! Appended to the bulletin.</span>
              </div>
            )}

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2" id="folders-scroller">
              {prRequests.length === 0 ? (
                <div className="p-6 text-center text-gray-400 border rounded-2xl bg-gray-50">
                  No prayer requests currently logged.
                </div>
              ) : (
                prRequests.map((pr) => (
                  <div key={pr.id} className="bg-supporting/45 border rounded-2xl p-5 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-secondary uppercase tracking-widest font-mono">
                        {pr.isAnonymous ? 'ANONYMOUS REQUEST' : `FROM: ${pr.requesterName}`}
                      </span>
                      <span className="text-gray-400 font-bold font-mono">{pr.date}</span>
                    </div>

                    <p className="text-xs sm:text-sm leading-relaxed text-gray-700 italic border-l-3 border-gray-200 pl-3">
                      "{pr.text}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className={`font-semibold ${pr.isPrivate ? 'text-red-500' : 'text-primary'}`}>
                        {pr.isPrivate ? '🔒 Private (Visible to Pastor)' : '🌐 Public Bulletin'}
                      </span>

                      {pr.isAnswered ? (
                        <div className="text-emerald-600 flex items-center gap-1 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>Pastor Replied</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyPrId(pr.id)}
                          className="py-1 px-3 bg-primary text-secondary tracking-wider font-bold rounded hover:bg-neutral-800 transition uppercase text-[10px]"
                        >
                          Send Pastor Note
                        </button>
                      )}
                    </div>

                    {/* Pastors Reply Note rendered if available */}
                    {pr.pastorNote && (
                      <div className="bg-primary/5 border border-primary/10 p-3.5 rounded-xl space-y-1.5 text-xs text-gray-800 font-sans border-l-4 border-l-[#D4AF37]">
                        <strong className="text-primary font-header text-[11px] uppercase tracking-wider block">Office Pastor Reply:</strong>
                        <p className="leading-relaxed whitespace-pre-wrap">"{pr.pastorNote}"</p>
                      </div>
                    )}

                    {/* Reply edit widget if active */}
                    {replyPrId === pr.id && (
                      <form onSubmit={handleReplySubmit} className="pt-3 border-t space-y-2.5 animate-fade-in">
                        <textarea 
                          required
                          rows={2}
                          placeholder="Type encouraging words/pastoral advice..."
                          value={pastorNoteText}
                          onChange={(e) => setPastorNoteText(e.target.value)}
                          className="w-full bg-white border border-gray-200 focus:ring-1 focus:ring-secondary text-xs p-2.5 rounded-xl outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyPrId(null)}
                            className="px-3.5 py-1.5 bg-gray-100 text-gray-800 font-bold text-xs rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 bg-primary text-secondary font-bold text-xs rounded border border-secondary/20 uppercase"
                          >
                            Save Note
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT CHALICE: ADD NEW MOCK SERMON DETAILS (5 Cols) */}
          <div className="lg:col-span-5 bg-supporting p-6 sm:p-7 rounded-3xl border border-gray-150 text-left space-y-4" id="sermon-registers-p">
            <h3 className="font-header text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b">
              <PlusCircle className="w-5 h-5 text-secondary shrink-0" />
              <span>Register New Sermon</span>
            </h3>

            {sSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-center gap-1 animate-zoom-in">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                <span>Sermon saved and indexed successfully!</span>
              </div>
            )}

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setSSubmitting(true);
                try {
                  const res = await fetch('/api/sermons', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: sTitle,
                      speaker: sSpeaker,
                      date: sDate,
                      topic: sTopic,
                      scripture: sScripture,
                      sermonNotes: sNotes
                    })
                  });
                  if (res.ok) {
                    setSTitle('');
                    setSNotes('');
                    setSScripture('');
                    setSDate('');
                    setSSuccess(true);
                    onNewSermonCreated();
                    setTimeout(() => setSSuccess(false), 5000);
                  }
                } catch(err) {
                  console.error(err);
                } finally {
                  setSSubmitting(false);
                }
              }}
              className="space-y-3.5 pt-1" 
              id="add-sermon-form"
            >
              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 font-bold uppercase">Sermon Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Living in Sovereign Revival"
                  value={sTitle}
                  onChange={(e) => setSTitle(e.target.value)}
                  className="w-full bg-white text-xs px-3 py-2 border rounded-lg focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase">Topic</label>
                  <select
                    value={sTopic}
                    onChange={(e) => setSTopic(e.target.value)}
                    className="w-full bg-white text-xs px-2 py-2 border rounded-lg outline-none"
                  >
                    <option value="Faith & Spiritual Growth">Faith & Growth</option>
                    <option value="Family & Leadership">Family Altar</option>
                    <option value="Christian Living">Christian Walk</option>
                    <option value="Community Outreach">Evangelism & Mercy</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase">Date</label>
                  <input 
                    type="date"
                    required
                    value={sDate}
                    onChange={(e) => setSDate(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-1.5 border rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 font-bold uppercase">Anchor Bible Scriptures</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John 3:16 & Romans 12:1"
                  value={sScripture}
                  onChange={(e) => setSScripture(e.target.value)}
                  className="w-full bg-white text-xs px-3 py-2.5 border rounded-lg focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 font-bold uppercase">Pastor Notes Outline</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Type sermon outline blocks..."
                  value={sNotes}
                  onChange={(e) => setSNotes(e.target.value)}
                  className="w-full bg-white text-xs px-3 py-2 rounded-lg outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={sSubmitting}
                className="w-full py-2.5 bg-primary text-secondary font-header font-bold text-xs rounded-xl hover:bg-neutral-800 transition tracking-wider uppercase cursor-pointer disabled:opacity-50"
              >
                {sSubmitting ? 'Indexing...' : 'Index Sermon'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
