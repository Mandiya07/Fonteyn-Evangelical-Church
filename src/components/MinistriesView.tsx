import React, { useState, useEffect } from 'react';
import { Compass, Users, Clock, Mail, CheckCircle, Award, VolumeX, Image as ImageIcon, User } from 'lucide-react';
import { Ministry } from '../types';

interface MinistriesViewProps {
  language: 'en' | 'swati';
}

export default function MinistriesView({ language }: MinistriesViewProps) {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [selectedMin, setSelectedMin] = useState<Ministry | null>(null);
  
  useEffect(() => {
    fetch('/api/ministries')
      .then(res => res.json())
      .then(data => {
        setMinistries(data);
        if (data && data.length > 0) {
          setSelectedMin(data[0]);
        }
      })
      .catch(err => console.error('Error fetching ministries:', err));
  }, []);
  
  // Join Ministry form state
  const [joinName, setJoinName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinReason, setJoinReason] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinName.trim() || !joinEmail.trim() || !selectedMin) return;
    setJoinSuccess(true);
    setJoinName('');
    setJoinEmail('');
    setJoinReason('');
    setTimeout(() => setJoinSuccess(false), 5000);
  };

  return (
    <div className="py-12 bg-white font-sans animate-fade-in" id="ministries-section-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header block">
            Fellowship Circles
          </span>
          <h1 className="font-header text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Ministries Section
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Deepen your fellowship and express your spiritual calling. Select from our dedicated ministries below to view details and calendars.
          </p>
        </div>

        {/* MINISTRIES SELECTOR PILLS */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b pb-4 max-w-4xl mx-auto" id="ministries-horizontal-pills">
          {ministries.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMin(m)}
              className={`px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-header font-bold tracking-wide transition-all ${
                selectedMin?.id === m.id
                  ? 'bg-primary text-secondary border border-secondary shadow-sm'
                  : 'bg-supporting text-gray-600 border border-gray-150 hover:bg-white hover:border-secondary/40'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* ACTIVE FOCUS SPLIT LAYOUT */}
        {selectedMin ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
            
            {/* LEFT PANEL: MINISTRY OVERVIEW (7 Cols) */}
            <div className="lg:col-span-8 bg-supporting/30 border p-6 sm:p-8 rounded-3xl space-y-6 text-left" id="ministry-active-panel">
              <div className="space-y-2">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">CHURCH FELLOWSHIP GROUP</span>
                <h2 className="font-header text-xl sm:text-2xl font-bold text-primary">{selectedMin.name}</h2>
                <p className="text-xs text-gray-400 font-mono tracking-wide flex items-center gap-1.5 pt-1">
                  <Clock className="w-4 h-4 text-secondary shrink-0" />
                  <span>Default Meeting: <strong>{selectedMin.schedule}</strong></span>
                </p>
              </div>

              {/* Description Paragraph */}
              <div className="space-y-2 font-sans text-xs sm:text-sm text-gray-650 leading-relaxed border-t border-gray-100 pt-4" id="ministry-desc-para">
                <h4 className="font-header text-xs font-bold text-primary uppercase tracking-widest">Our Agenda & Vision</h4>
                <p>{selectedMin.description}</p>
              </div>

              {/* Activities Bullet Lists */}
              <div className="space-y-3 pt-2" id="ministry-activities-para">
                <h4 className="font-header text-xs font-bold text-primary uppercase tracking-widest">Core Activities</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedMin.activities?.map((act, i) => (
                    <li key={i} className="flex gap-2 bg-white p-3 rounded-xl border border-gray-150 text-xs text-gray-650 font-sans shadow-2xs font-medium">
                      <CheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gallery grids */}
              <div className="space-y-3 pt-2" id="ministry-gallery-para">
                <h4 className="font-header text-xs font-bold text-primary uppercase tracking-widest">Gallery Preview</h4>
                <div className="grid grid-cols-2 gap-4">
                  {(selectedMin.gallery || []).map((img, i) => (
                    <div key={i} className="relative h-28 sm:h-36 rounded-xl overflow-hidden border border-gray-150">
                      {img ? (
                        <img loading="lazy" src={img} alt="Ministry Life" className="w-full h-full object-cover transition duration-300 hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="text-gray-300 w-8 h-8" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: LEADER PROFILE & REGISTER FORM (4 Cols) */}
            <div className="lg:col-span-4 space-y-6" id="ministry-meta-panel">
              {/* Leader profile bio card */}
              <div className="bg-white border rounded-2xl p-5 text-center shadow-sm space-y-4" id="leader-bio-card">
                <span className="text-[9px] font-bold text-secondary tracking-widest uppercase font-header block">MINISTRY COORDINATOR</span>
                
                <div className="space-y-2.5">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-secondary/20">
                    {selectedMin.leaderPhoto ? (
                      <img loading="lazy" src={selectedMin.leaderPhoto} alt={selectedMin.leader} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <User className="text-gray-400 w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-header text-xs sm:text-sm font-bold text-primary">{selectedMin.leader}</h4>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase font-sans">{selectedMin.leaderTitle}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-center">
                  <a 
                    href={`mailto:${selectedMin.contact}`} 
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-primary hover:text-secondary transition"
                  >
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{selectedMin.contact}</span>
                  </a>
                </div>
              </div>

              {/* Quick RSVP Form to join group */}
              <div className="bg-primary/95 border border-secondary text-white p-6 rounded-3xl text-left shadow-lg space-y-4" id="join-ministry-form-card">
                <h3 className="font-header text-sm font-bold tracking-wide uppercase border-b border-white/10 pb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-secondary shrink-0 animate-pulse" />
                  <span>Join This Ministry Group</span>
                </h3>

                {joinSuccess ? (
                  <div className="p-4 bg-white/5 border border-secondary/20 rounded-2xl text-center space-y-1 animate-zoom-in text-secondary">
                    <CheckCircle className="w-6 h-6 text-secondary mx-auto" />
                    <span className="text-xs font-bold block text-white">Request Sent Succesfully!</span>
                    <span className="text-[10px] text-gray-300 block leading-normal pt-1">{selectedMin.leader} will review and add you to the department WhatsApp group/list.</span>
                  </div>
                ) : (
                  <form onSubmit={handleJoinSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-300 font-bold uppercase block">Your name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Samuel Dlamini"
                        value={joinName}
                        onChange={(e) => setJoinName(e.target.value)}
                        className="bg-white/10 placeholder-gray-400 border border-white/10 focus:ring-1 focus:ring-secondary focus:border-secondary w-full text-xs px-3 py-2.5 rounded-xl outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-300 font-bold uppercase block">Email / phone</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Email or +268 Mobile"
                        value={joinEmail}
                        onChange={(e) => setJoinEmail(e.target.value)}
                        className="bg-white/10 placeholder-gray-400 border border-white/10 focus:ring-1 focus:ring-secondary focus:border-secondary w-full text-xs px-3 py-2.5 rounded-xl outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-300 font-bold uppercase block">Why do you want to join? (Optional)</label>
                      <textarea 
                        rows={2}
                        placeholder="Tell us your interest or talent..."
                        value={joinReason}
                        onChange={(e) => setJoinReason(e.target.value)}
                        className="bg-white/10 placeholder-gray-400 border border-white/10 focus:ring-1 focus:ring-secondary focus:border-secondary w-full text-xs px-3 py-2.5 rounded-xl outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 mt-2 bg-secondary text-primary hover:bg-white text-xs font-bold leading-none font-header rounded-xl shadow transition duration-200 uppercase tracking-widest cursor-pointer"
                    >
                      Send Enrollment Request
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
            <Compass className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No ministries available currently.</p>
          </div>
        )}
      </div>
    </div>
  );
}
