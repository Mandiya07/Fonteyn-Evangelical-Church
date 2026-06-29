import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Search, Filter, Book, FileText, Sparkles, Download, Share2, Printer, CheckCircle, RotateCw, RefreshCw, AudioLines, Video } from 'lucide-react';
import { Sermon } from '../types';

interface SermonsViewProps {
  language: 'en' | 'swati';
}

export default function SermonsView({ language }: SermonsViewProps) {
  const [sermonsList, setSermonsList] = useState<Sermon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedSpeaker, setSelectedSpeaker] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');
  const [activeSermon, setActiveSermon] = useState<Sermon | null>(null);

  // Notes drawer state
  const [viewNotesSermon, setViewNotesSermon] = useState<Sermon | null>(null);

  // Audio player state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerSermon, setPlayerSermon] = useState<Sermon | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // AI Sermon Assistant state
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [aiActiveTab, setAiActiveTab] = useState<'summary' | 'scriptures' | 'questions' | 'social'>('summary');
  const [selectedAiSermon, setSelectedAiSermon] = useState<Sermon | null>(null);
  const [aiLoadingMessage, setAiLoadingMessage] = useState('Whispering with Gemini AI...');

  // Load sermons from Express API
  const fetchSermons = async () => {
    try {
      const res = await fetch('/api/sermons');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSermonsList(data);
        if (data.length > 0) {
          setPlayerSermon(data[0]);
        }
      } else {
        console.warn('Sermons API did not return an array:', data);
        setSermonsList([]);
      }
    } catch (err) {
      console.error('Error fetching sermons:', err);
      setSermonsList([]);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, []);

  // Filter topics and speakers - with safe array checks
  const topics = ['All', ...new Set((Array.isArray(sermonsList) ? sermonsList : []).map(s => s.topic))];
  const speakers = ['All', ...new Set((Array.isArray(sermonsList) ? sermonsList : []).map(s => s.speaker))];
  const dates = ['All', ...new Set((Array.isArray(sermonsList) ? sermonsList : []).map(s => s.date))];

  // Filtered List
  const filteredSermons = (Array.isArray(sermonsList) ? sermonsList : []).filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.scripture.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.speaker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === 'All' || s.topic === selectedTopic;
    const matchesSpeaker = selectedSpeaker === 'All' || s.speaker === selectedSpeaker;
    const matchesDate = selectedDate === 'All' || s.date === selectedDate;
    return matchesSearch && matchesTopic && matchesSpeaker && matchesDate;
  });

  // Start playing audio
  const handlePlayAudio = (sermon: Sermon) => {
    const isSameSermon = playerSermon && playerSermon.id === sermon.id;
    
    if (isSameSermon) {
      togglePlayPause();
    } else {
      setPlayerSermon(sermon);
      setCurrentTime(0);
      setIsPlaying(true);
      // Playback triggered in useEffect
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (audioRef.current && playerSermon?.audioUrl && isPlaying) {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    }
  }, [playerSermon]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return "0:00";
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  // Run AI Sermon Assistant Analysis on the backend
  const handleAiAnalysis = async (sermon: Sermon) => {
    setSelectedAiSermon(sermon);
    setIsAiAnalyzing(true);
    setAiAnalysisResult(null);

    // Dynamic loading screen messages simulation
    const loadingStrings = [
      'Theological AI scanning scripture context...',
      'Mapping biblical root narratives from Matthew & Hebrews...',
      'Synthesizing hermeneutic summaries for Mbabane hills...',
      'Formulating actionable cellular discussion questions...',
      'Formatting ready-made announcements for Eswatini communities...'
    ];

    let msgIdx = 0;
    setAiLoadingMessage(loadingStrings[0]);
    const timer = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingStrings.length;
      setAiLoadingMessage(loadingStrings[msgIdx]);
    }, 2400);

    try {
      const res = await fetch('/api/ai/sermon-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: sermon.title,
          scripture: sermon.scripture,
          notes: sermon.sermonNotes
        }),
      });
      const data = await res.json();
      setAiAnalysisResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(timer);
      setIsAiAnalyzing(false);
    }
  };

  // Copy social media post to clipboard helper
  const [copiedTextIdx, setCopiedTextIdx] = useState<number | null>(null);
  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTextIdx(idx);
    setTimeout(() => setCopiedTextIdx(null), 3000);
  };

  return (
    <div className="py-12 bg-white font-sans animate-fade-in" id="sermons-center-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* HEADER SECTION */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header block">
            Media & Scriptures Library
          </span>
          <h1 className="font-header text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Sermons Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Deep dive into weekly exposition of Scripture at Fonteyn. Stream, read sermon notes, or study together.
          </p>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="bg-supporting/45 border p-5 rounded-2xl flex flex-col md:flex-row items-center gap-4" id="sermons-filter-bar">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search sermons, topic, speaker, or biblical phrase..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs text-gray-800 pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-1 focus:ring-secondary focus:border-secondary transition placeholder-gray-400 outline-none"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto shrink-0">
            {/* Filter Topic */}
            <div className="flex-1 sm:flex-initial">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full text-xs px-3 py-3 bg-white border border-gray-150 rounded-xl focus:ring-1 focus:ring-secondary outline-none"
              >
                {topics.map((t, idx) => (
                  <option key={idx} value={t}>{t === 'All' ? 'All Topics' : t}</option>
                ))}
              </select>
            </div>

            {/* Filter Speaker */}
            <div className="flex-1 sm:flex-initial">
              <select
                value={selectedSpeaker}
                onChange={(e) => setSelectedSpeaker(e.target.value)}
                className="w-full text-xs px-3 py-3 bg-white border border-gray-150 rounded-xl focus:ring-1 focus:ring-secondary outline-none"
              >
                {speakers.map((s, idx) => (
                  <option key={idx} value={s}>{s === 'All' ? 'All Speakers' : s}</option>
                ))}
              </select>
            </div>

            {/* Filter Date */}
            <div className="flex-1 sm:flex-initial">
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-xs px-3 py-3 bg-white border border-gray-150 rounded-xl focus:ring-1 focus:ring-secondary outline-none"
              >
                {dates.map((d, idx) => (
                  <option key={idx} value={d}>{d === 'All' ? 'All Dates' : d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* MOCK PLAYER HUD */}
        {playerSermon && (
          <div className="bg-neutral-900 border-l-[6px] border-secondary text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-5 font-sans" id="sermon-player-hud">
            <div className="flex items-center space-x-4.5 text-left w-full md:w-auto">
              <div className="p-3 bg-secondary/10 border border-secondary text-secondary rounded-xl shrink-0 animate-pulse">
                <AudioLines className="w-6 h-6 text-secondary" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-secondary font-bold font-header tracking-wider uppercase block">CURRENT STREAMING AUDIO</span>
                <h3 className="font-header text-sm sm:text-base font-bold text-white line-clamp-1">{playerSermon.title}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <span>{playerSermon.speaker}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-600 block"></span>
                  <span className="font-mono text-[11px]">{playerSermon.scripture}</span>
                </p>
              </div>
            </div>

            {/* Simulating active tracks */}
            <div className="w-full md:flex-1 max-w-sm flex items-center space-x-3 text-xs" id="player-timeline-hud">
              <span className="text-gray-400 text-[11px] shrink-0 font-mono">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => {
                  const time = Number(e.target.value);
                  setCurrentTime(time);
                  if (audioRef.current) {
                    audioRef.current.currentTime = time;
                  }
                }}
                className="flex-1 h-1.5 bg-neutral-850 rounded-full appearance-none cursor-pointer accent-secondary"
              />
              <span className="text-gray-400 text-[11px] shrink-0 font-mono">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center space-x-3 shrink-0 w-full md:w-auto justify-end">
              {playerSermon.audioUrl && (
                <audio
                  ref={audioRef}
                  src={playerSermon.audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleAudioEnded}
                  className="hidden"
                />
              )}
              {playerSermon.audioUrl ? (
                <button
                  onClick={togglePlayPause}
                  className="w-11 h-11 bg-secondary text-primary font-bold rounded-full flex items-center justify-center hover:bg-white hover:scale-105 transition shadow-md shrink-0 cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-5 h-5 text-primary" /> : <Play className="w-5 h-5 text-primary fill-primary ml-0.5" />}
                </button>
              ) : (
                <div className="text-xs text-secondary font-mono bg-secondary/10 px-3 py-2 rounded-xl">
                  No Audio Available
                </div>
              )}
            </div>
          </div>
        )}

        {/* TWO COLUMN CONTENT: SERMONS LIST vs ADVANCED AI SUMMARY PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: SERMONS CATALOG LIST (7 Cols) */}
          <div className="lg:col-span-7 space-y-4" id="sermons-catalog-list">
            <h3 className="font-header text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-wider pb-1 border-b">
              <span>⛪ Sermons Library catalog</span>
              <span className="text-xs text-secondary font-sans font-medium">({filteredSermons.length} found)</span>
            </h3>

            {filteredSermons.length === 0 ? (
              <div className="p-8 text-center text-gray-500 border rounded-2xl bg-gray-50">
                No matching messages found. Type another topic or select 'All Topics' filters.
              </div>
            ) : (
              filteredSermons.map((sermon) => (
                <div 
                  key={sermon.id}
                  className={`bg-white border rounded-2xl p-5 text-left flex flex-col justify-between transition-all duration-200 group ${
                    playerSermon?.id === sermon.id 
                      ? 'border-secondary ring-1 ring-secondary/35 shadow-md bg-secondary/5' 
                      : 'border-gray-200 hover:border-primary/25 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    {/* Title Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold tracking-wider uppercase">
                          {sermon.topic}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold font-mono tracking-wide">{sermon.date}</span>
                      </div>
                      <h4 className="font-header text-sm sm:text-base font-bold text-primary group-hover:text-neutral-800 transition leading-tight">
                        {sermon.title}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span className="font-semibold text-gray-700">{sermon.speaker}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-secondary font-mono text-[11px] font-semibold flex items-center gap-1">
                          <Book className="w-3.5 h-3.5" />
                          <span>{sermon.scripture}</span>
                        </span>
                      </p>
                    </div>

                    {/* Quick Launchers */}
                    <div className="flex items-center gap-2 shrink-0 md:pt-1">
                      {sermon.videoUrl && (
                        <button
                          onClick={() => window.open(sermon.videoUrl, '_blank')}
                          className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20 hover:bg-primary/20 transition"
                          title="Watch Sermon Video"
                        >
                           <Video className="w-3.5 h-3.5 text-primary" />
                        </button>
                      )}
                      <button
                        onClick={() => handlePlayAudio(sermon)}
                        className="p-2.5 bg-primary rounded-xl text-secondary hover:bg-neutral-800 transition"
                        title="Play Sermon Audio"
                      >
                        <Play className="w-3.5 h-3.5 text-secondary fill-secondary" />
                      </button>
                      <button
                        onClick={() => setViewNotesSermon(sermon)}
                        className="p-2.5 bg-supporting rounded-xl text-primary hover:border-primary hover:bg-white border transition"
                        title="Read Sermon Outline & Download PDF"
                      >
                        <FileText className="w-3.5 h-3.5 text-primary" />
                      </button>
                      
                      {/* AI analyzer launch button */}
                      <button
                        onClick={() => handleAiAnalysis(sermon)}
                        className={`p-2.5 border rounded-xl flex items-center justify-center transition ${
                          selectedAiSermon?.id === sermon.id && aiAnalysisResult 
                            ? 'bg-secondary text-primary border-primary font-bold' 
                            : 'bg-indigo-50 border-indigo-200 hover:border-indigo-500 text-indigo-700'
                        }`}
                        title="Ask AI Summary Assistant"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT: ADVANCED AI SERMON DISCOVERY CORE (5 Cols) */}
          <div className="lg:col-span-5" id="sermon-ai-assistant-panel">
            <div className="bg-neutral-900 border-[3px] border-secondary text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden text-left min-h-[380px] flex flex-col justify-between">
              
              {/* Background styling decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full blur-xl z-0 pointer-events-none"></div>

              <div className="z-10 relative space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-secondary/25 border border-secondary text-secondary rounded-lg">
                        <Sparkles className="w-4 h-4 text-secondary" />
                      </div>
                      <h3 className="font-header text-sm font-bold tracking-wide text-white uppercase">AI Sermon Assistant</h3>
                    </div>
                    <span className="text-[9px] font-mono tracking-widest text-[#D4AF37] border border-[#D4AF37]/20 px-2.5 py-0.5 rounded bg-[#D4AF37]/5 font-bold uppercase">GEMINI PRO LIVE</span>
                  </div>

                  {/* Dynamic States */}
                  {isAiAnalyzing ? (
                    // 1. Loading state with active prompts
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-5 animate-pulse" id="ai-loading-panel">
                      <RefreshCw className="w-10 h-10 text-secondary animate-spin" />
                      <div>
                        <h4 className="font-header text-sm font-bold text-white">Analyzing Theology Outline</h4>
                        <p className="text-[11px] text-gray-400 italic max-w-xs mx-auto leading-relaxed mt-1">{aiLoadingMessage}</p>
                      </div>
                    </div>
                  ) : aiAnalysisResult ? (
                    // 2. Analytical tabs and content
                    <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between" id="ai-analysis-output">
                      <div className="space-y-1">
                        <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">ANALYSED SOURCE</span>
                        <h4 className="font-header text-xs text-white line-clamp-1 italic">"{selectedAiSermon?.title}"</h4>
                      </div>

                      {/* Tab buttons */}
                      <div className="grid grid-cols-4 gap-1 border-b border-white/10 pb-2 pt-1" id="ai-subtabs">
                        {[
                          { id: 'summary', label: 'Digest' },
                          { id: 'scriptures', label: 'Bible+' },
                          { id: 'questions', label: 'Cell Guide' },
                          { id: 'social', label: 'Social' }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setAiActiveTab(tab.id as any)}
                            className={`py-1 rounded text-[10px] sm:text-xs font-bold tracking-wide transition border ${
                              aiActiveTab === tab.id
                                ? 'bg-secondary text-primary border-primary'
                                : 'bg-white/5 text-gray-300 border-white/5 hover:bg-white/10'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Tab panels dynamically rendered */}
                      <div className="flex-1 py-1.5 min-h-[220px]">
                        {aiActiveTab === 'summary' && (
                          <div className="text-xs text-gray-300 leading-relaxed font-sans space-y-3 animate-fade-in">
                            <span className="font-header text-xs font-bold text-secondary tracking-wider block">THEOLOGICAL DIGEST</span>
                            <p className="whitespace-pre-wrap">{aiAnalysisResult.summary}</p>
                          </div>
                        )}

                        {aiActiveTab === 'scriptures' && (
                          <div className="text-xs text-gray-300 leading-relaxed font-sans space-y-3 animate-fade-in">
                            <span className="font-header text-xs font-bold text-secondary tracking-wider block">Scripture cross-anchors</span>
                            <ul className="space-y-2.5">
                              {aiAnalysisResult.bibleReferences?.map((ref: string, i: number) => (
                                <li key={i} className="flex gap-2 bg-white/5 border border-white/5 p-2 rounded-xl">
                                  <Book className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                                  <span>{ref}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiActiveTab === 'questions' && (
                          <div className="text-xs text-gray-300 leading-relaxed font-sans space-y-3 animate-fade-in">
                            <span className="font-header text-xs font-bold text-secondary tracking-wider block">SMALL-GROUP DISCUSSION GUIDE</span>
                            <ul className="space-y-2 list-decimal pl-4.5">
                              {aiAnalysisResult.discussionQuestions?.map((q: string, i: number) => (
                                <li key={i}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiActiveTab === 'social' && (
                          <div className="text-xs text-gray-300 leading-relaxed font-sans space-y-3 animate-fade-in">
                            <span className="font-header text-xs font-bold text-secondary tracking-wider block">WhatsApp & facebook announcements</span>
                            <div className="space-y-3.5">
                              {aiAnalysisResult.socialPosts?.map((post: string, i: number) => (
                                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 relative group">
                                  <p className="pr-8 break-words text-[11px] font-mono leading-relaxed">{post}</p>
                                  <button
                                    onClick={() => handleCopy(post, i)}
                                    className="absolute top-2.5 right-2.5 text-xs font-black p-1 bg-white/10 text-secondary hover:bg-secondary hover:text-primary transition-all rounded"
                                    title="Copy Text Template"
                                  >
                                    {copiedTextIdx === i ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // 3. Welcome/Zero state
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-10 space-y-4" id="ai-zero-state">
                      <Sparkles className="w-12 h-12 text-[#D4AF37]/45 animate-bounce" />
                      <div className="space-y-1">
                        <h4 className="font-header text-xs sm:text-sm font-semibold text-white tracking-wide">Ready to Generate Cell Guides?</h4>
                        <p className="text-[11px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                          Select any lecture or sermon from the library list, then click the sparkle icon (<Sparkles className="w-3 h-3 text-indigo-400 inline" />) to instantly query Gemini for theological summaries, additional bible proofs, and small-group questions!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* NOTES SLIDEOUT DETAILED PANEL MODAL */}
      {viewNotesSermon && (
        <div className="fixed inset-0 bg-primary/75 backdrop-blur-xs z-50 flex justify-end animate-fade-in font-sans">
          <div className="bg-white max-w-xl w-full h-full p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl relative border-l border-gray-200">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-[10px] font-bold text-secondary tracking-widest uppercase font-header">Sermon Notes Outline</span>
                <button
                  onClick={() => setViewNotesSermon(null)}
                  className="p-1 px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-bold text-xs"
                >
                  Close ×
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full font-bold uppercase tracking-wider">{viewNotesSermon.topic}</span>
                <h3 className="font-header text-lg font-bold text-primary leading-tight">{viewNotesSermon.title}</h3>
                <p className="text-xs text-gray-500 font-sans">
                  Preached by <strong className="text-gray-800">{viewNotesSermon.speaker}</strong> on {viewNotesSermon.date}
                </p>
                <p className="text-secondary font-mono font-bold text-xs flex items-center gap-1 mt-1">
                  <Book className="w-4 h-4 text-secondary shrink-0" />
                  <span>Scripture focus: {viewNotesSermon.scripture}</span>
                </p>
              </div>

              <div className="border border-gray-150 rounded-2xl p-5 bg-supporting/50 text-xs sm:text-sm text-gray-750 whitespace-pre-wrap leading-relaxed outline-none">
                {viewNotesSermon.sermonNotes}
              </div>
            </div>

            <div className="border-t pt-5 mt-8 flex space-x-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 border border-gray-200 hover:border-primary text-gray-800 bg-white hover:bg-gray-50 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5"
                title="Print Notes or Save as PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Print Outline</span>
              </button>
              <button
                type="button"
                onClick={() => alert("Downloading PDF Note Guide...")}
                className="flex-1 py-3 border border-gray-200 hover:border-primary text-gray-800 bg-white hover:bg-gray-50 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5"
                title="Download Study Materials (.pdf)"
              >
                <Download className="w-4 h-4" />
                <span>PDF Download</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewNotesSermon(null);
                  handleAiAnalysis(viewNotesSermon);
                }}
                className="flex-1 py-3 bg-primary text-secondary tracking-wide border border-secondary/20 hover:bg-neutral-800 rounded-xl font-bold text-xs flex items-center justify-center space-x-1"
              >
                <Sparkles className="w-4 h-4 text-secondary" />
                <span>AI Analyze Options</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
