import React, { useState, useEffect } from 'react';
import { Play, Image as ImageIcon, Video, Calendar, Share2, Download, Search, User, Filter, Eye, MonitorPlay, MessageCircle, Clock, Volume2 } from 'lucide-react';

interface MediaViewProps {
  language: 'en' | 'swati';
}

interface PhotoAlbum {
  id: string;
  title: string;
  date: string;
  category: string;
  coverImage: string;
  imageCount: number;
  images: string[];
}

interface VideoPost {
  id: string;
  title: string;
  date: string;
  platform: 'YouTube' | 'Facebook' | 'Vimeo';
  duration: string;
  thumbnail: string;
  url: string;
  views: string;
}

export default function MediaView({ language }: MediaViewProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'live'>('photos');
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState('All');
  const [selectedAlbum, setSelectedAlbum] = useState<PhotoAlbum | null>(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);

  // MOCK DATA
  const photoAlbums: PhotoAlbum[] = [
    {
      id: 'a1',
      title: 'Resurrection Sunday Service',
      date: 'April 9, 2023',
      category: 'Worship Services',
      coverImage: '',
      imageCount: 0,
      images: []
    },
    {
      id: 'a2',
      title: 'National Men\'s Conference',
      date: 'August 12, 2023',
      category: 'Conferences',
      coverImage: '',
      imageCount: 0,
      images: []
    },
    {
      id: 'a3',
      title: 'Youth Explosion Retreat',
      date: 'June 20, 2023',
      category: 'Youth Events',
      coverImage: '',
      imageCount: 0,
      images: []
    },
    {
      id: 'a4',
      title: 'Mbabane Orphanage Visit',
      date: 'December 15, 2022',
      category: 'Outreach Programs',
      coverImage: '',
      imageCount: 0,
      images: []
    },
    {
      id: 'a5',
      title: 'Christmas Carols Night',
      date: 'December 24, 2022',
      category: 'Special Events',
      coverImage: '',
      imageCount: 0,
      images: []
    }
  ];

  const videos: VideoPost[] = [
    {
      id: 'v1',
      title: 'Sunday Service Live HD - Rev LS Mnisi',
      date: 'October 15, 2023',
      platform: 'YouTube',
      duration: '2:15:30',
      thumbnail: '',
      url: 'https://youtube.com',
      views: '1.2k'
    },
    {
      id: 'v2',
      title: 'Midweek Worship & Prayer Session',
      date: 'October 11, 2023',
      platform: 'Facebook',
      duration: '1:05:22',
      thumbnail: '',
      url: 'https://facebook.com',
      views: '856'
    },
    {
      id: 'v3',
      title: 'Youth Choir Presentation 2023',
      date: 'September 28, 2023',
      platform: 'Vimeo',
      duration: '45:10',
      thumbnail: '',
      url: 'https://vimeo.com',
      views: '3.4k'
    }
  ];

  const categories = ['All', 'Worship Services', 'Conferences', 'Youth Events', 'Outreach Programs', 'Special Events'];

  const filteredAlbums = photoAlbums.filter(album => 
    selectedPhotoCategory === 'All' || album.category === selectedPhotoCategory
  );

  const [liveChat, setLiveChat] = useState<{name: string, text: string}[]>([
    { name: 'Sipho Dlamini', text: 'Amen! Powerful message already.' },
    { name: 'Sarah Ndlovu', text: 'Watching live from Manzini. Blessed sunday everyone.' },
    { name: 'Musa Zwane', text: 'Praise the Lord.' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const sendLiveMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if(!chatInput.trim()) return;
    setLiveChat([...liveChat, { name: 'You (Guest)', text: chatInput }]);
    setChatInput('');
  };

  const handleDownloadImage = (e: React.MouseEvent, imgUrl: string) => {
    e.stopPropagation();
    alert('High-resolution download initiated for: ' + imgUrl);
  };

  return (
    <div className="min-h-screen bg-supporting py-12" id="media-center-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Setup */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header">Digital Archive</span>
          <h1 className="text-3xl sm:text-4xl font-header font-bold text-primary mt-2">FEC Media Center</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-3 max-w-2xl mx-auto">
            Experience our vibrant church community through photos, videos, and live broadcasts from Mbabane.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-xl p-1 w-full max-w-md mx-auto mb-10 shadow-sm border border-gray-150">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition uppercase tracking-wider flex items-center justify-center gap-1.5 ${
              activeTab === 'photos' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-primary hover:bg-gray-50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos</span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition uppercase tracking-wider flex items-center justify-center gap-1.5 ${
              activeTab === 'videos' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-primary hover:bg-gray-50'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Videos</span>
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition uppercase tracking-wider flex items-center justify-center gap-1.5 ${
              activeTab === 'live' ? 'bg-red-600 text-white shadow-sm' : 'text-red-500 hover:text-red-700 hover:bg-red-50'
            }`}
          >
            <MonitorPlay className="w-3.5 h-3.5" />
            <span className="animate-pulse">Live</span>
          </button>
        </div>

        {/* TAB 1: Photo Gallery */}
        {activeTab === 'photos' && (
          <div className="space-y-6 animate-fade-in" id="photo-gallery-section">
            {!selectedAlbum ? (
              <>
                {/* Category Filter */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                  {categories.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhotoCategory(cat)}
                      className={`px-4 py-2 text-[10px] sm:text-xs font-bold rounded-full transition uppercase tracking-widest ${
                        selectedPhotoCategory === cat
                          ? 'bg-secondary text-primary'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-secondary/50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Album Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAlbums.map((album) => (
                    <div 
                      key={album.id}
                      onClick={() => setSelectedAlbum(album)}
                      className="bg-white rounded-2xl border border-gray-150 overflow-hidden group cursor-pointer hover:shadow-xl hover:border-secondary transition duration-300"
                    >
                      <div className="relative h-56 overflow-hidden bg-gray-100">
                        {album.coverImage ? (
                          <img 
                            src={album.coverImage} 
                            alt={album.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-80"></div>
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <span className="text-[9px] font-bold tracking-widest text-secondary uppercase block mb-1">{album.category}</span>
                          <h3 className="font-header font-bold text-lg leading-tight">{album.title}</h3>
                        </div>
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-white text-[10px] font-bold flex items-center space-x-1 border border-white/10">
                          <ImageIcon className="w-3 h-3 text-secondary" />
                          <span>{album.imageCount}</span>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                         <div className="flex items-center space-x-2 text-xs text-gray-500 font-medium font-sans">
                           <Calendar className="w-3.5 h-3.5 text-secondary" />
                           <span>{album.date}</span>
                         </div>
                         <button className="text-[10px] uppercase font-bold text-primary hover:text-secondary tracking-widest transition">
                           Open Album →
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="animate-fade-in bg-white rounded-2xl border border-gray-150 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <button 
                      onClick={() => setSelectedAlbum(null)}
                      className="text-xs font-bold text-gray-500 hover:text-primary transition uppercase tracking-widest flex items-center gap-1 mb-2"
                    >
                      ← Back to Albums
                    </button>
                    <h2 className="font-header text-2xl font-bold text-primary">{selectedAlbum.title}</h2>
                    <p className="text-xs text-gray-500 mt-1">{selectedAlbum.date} • {selectedAlbum.imageCount} Photos • {selectedAlbum.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 border border-gray-200 rounded-lg hover:border-secondary hover:text-secondary text-gray-500 transition tooltip" title="Share Album">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Images Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedAlbum.images.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setLightboxImageIndex(idx)}
                      className="relative h-40 bg-gray-100 rounded-xl overflow-hidden cursor-pointer group"
                    >
                      {img ? (
                        <img loading="lazy" src={img} alt={`${selectedAlbum.title} ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <ImageIcon className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 transition duration-300 flex items-center justify-center">
                         <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition duration-300" />
                      </div>
                      <button 
                        onClick={(e) => handleDownloadImage(e, img)}
                        className="absolute bottom-2 right-2 p-1.5 bg-black/50 hover:bg-secondary text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                        title="Download High-Res"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LIGHTBOX FOR PHOTOS */}
        {lightboxImageIndex !== null && selectedAlbum && (
           <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center text-white" onClick={() => setLightboxImageIndex(null)}>
             <button 
                className="absolute top-6 right-6 text-white/50 hover:text-white transition p-2 bg-white/5 rounded-full"
                onClick={() => setLightboxImageIndex(null)}
              >
                ✕
             </button>
             <div className="max-w-5xl w-full px-4 flex flex-col items-center justify-center animate-zoom-in" onClick={e => e.stopPropagation()}>
               {selectedAlbum.images[lightboxImageIndex] ? (
                 <img loading="lazy" 
                   src={selectedAlbum.images[lightboxImageIndex]} 
                   className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
                   alt="Enlarged gallery view"
                 />
               ) : (
                 <div className="max-h-[80vh] w-full aspect-video bg-neutral-900 rounded-lg flex items-center justify-center border border-white/10">
                   <ImageIcon className="w-24 h-24 text-white/5" />
                 </div>
               )}
               <div className="mt-4 flex justify-between items-center w-full max-w-lg">
                 <button 
                   onClick={(e) => { e.stopPropagation(); setLightboxImageIndex(prev => prev! > 0 ? prev! - 1 : selectedAlbum.images.length - 1); }}
                   className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition"
                 >
                   ← Prev
                 </button>
                 <span className="text-xs font-mono">{lightboxImageIndex + 1} / {selectedAlbum.images.length}</span>
                 <button 
                   onClick={(e) => { e.stopPropagation(); setLightboxImageIndex(prev => prev! < selectedAlbum.images.length - 1 ? prev! + 1 : 0); }}
                   className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition"
                 >
                   Next →
                 </button>
               </div>
             </div>
           </div>
        )}

        {/* TAB 2: Video Archive */}
        {activeTab === 'videos' && (
          <div className="space-y-8 animate-fade-in" id="video-archive-section">
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="relative w-full sm:w-96">
                 <input 
                   type="text" 
                   placeholder="Search video archive..." 
                   className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-secondary"
                 />
                 <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
               </div>
               <select className="p-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-secondary w-full sm:w-auto">
                 <option>All Platforms</option>
                 <option>YouTube</option>
                 <option>Facebook Live</option>
                 <option>Vimeo</option>
               </select>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(video => (
                  <div key={video.id} className="bg-white rounded-2xl overflow-hidden border border-gray-150 shadow-sm flex flex-col group hover:shadow-md hover:border-secondary transition">
                    <div className="relative aspect-video bg-gray-900 overflow-hidden cursor-pointer">
                      {video.thumbnail ? (
                        <img loading="lazy" src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <Video className="w-12 h-12 text-gray-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-12 h-12 bg-secondary text-primary rounded-full flex items-center justify-center transform group-hover:scale-110 transition shadow-lg">
                            <Play className="w-5 h-5 ml-1" />
                         </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                        {video.duration}
                      </div>
                      <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded bg-black/60 text-white`}>
                        {video.platform}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-header font-bold text-[15px] text-primary leading-snug line-clamp-2" title={video.title}>
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-widest">
                          <span>{video.date}</span>
                          <span>•</span>
                          <span>{video.views} Views</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                        <button className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 rounded-lg transition" onClick={() => window.open(video.url, '_blank')}>
                          Watch on {video.platform}
                        </button>
                        <button className="p-2 border border-gray-200 rounded-lg hover:border-secondary hover:text-secondary text-gray-500 transition">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* TAB 3: Livestreaming */}
        {activeTab === 'live' && (
          <div className="animate-fade-in bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden" id="livestream-section">
             <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
               {/* Left/Main: Video Player */}
               <div className="lg:col-span-2 bg-neutral-900 relative">
                  {/* Mock Video Player */}
                  <div className="aspect-video w-full flex items-center justify-center bg-black relative">
                     <div className="absolute inset-0 w-full h-full bg-neutral-900 opacity-80" />
                     <div className="absolute top-4 left-4 flex items-center gap-2">
                       <span className="flex h-3 w-3 relative">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                       </span>
                       <span className="bg-red-600 font-bold text-white text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border border-red-500/50">
                         LIVE
                       </span>
                       <span className="bg-black/50 backdrop-blur-sm text-white font-mono text-[10px] px-2 py-0.5 rounded border border-white/10">
                         <Eye className="w-3 h-3 inline mr-1" /> 1,248
                       </span>
                     </div>
                     
                     <div className="relative text-center space-y-4">
                       <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto border border-white/20 hover:bg-white/20 hover:scale-110 cursor-pointer transition-all duration-300 shadow-2xl">
                         <Play className="w-8 h-8 text-white ml-1" />
                       </div>
                       <h3 className="text-white font-header font-bold tracking-wide text-lg drop-shadow-md">Sunday Morning Service</h3>
                     </div>

                     {/* Video Controls Mock */}
                     <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent flex items-end px-4 py-2">
                        <div className="w-full flex items-center gap-4 text-white">
                          <Play className="w-4 h-4 cursor-pointer hover:text-secondary" />
                          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 w-[100%] rounded-full shadow-[0_0_10px_red]"></div>
                          </div>
                          <Volume2 className="w-4 h-4 cursor-pointer hover:text-secondary" />
                          <span className="font-mono text-[9px] uppercase font-bold tracking-widest">LIVE</span>
                        </div>
                     </div>
                  </div>
                  
                  {/* Stream Info */}
                  <div className="p-6 bg-white">
                    <h2 className="font-header text-xl font-bold text-primary">Sunday Morning Service Live Broadcast</h2>
                    <p className="text-xs text-gray-500 font-mono mt-1 mb-4">Streaming via YouTube Live & Facebook Live</p>
                    <p className="text-sm text-gray-700 leading-relaxed max-w-2xl">
                      Join us live from Fonteyn Evangelical Church in Mbabane. Rev LS Mnisi brings a powerful message on "Faith that moves mountains." Please share the stream link with family and friends.
                    </p>
                    <div className="flex gap-3 mt-5 border-t border-gray-100 pt-5">
                      <button className="flex-1 sm:flex-none px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition shadow-sm">
                        Donate via Mobile Money
                      </button>
                      <button className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition border border-gray-200 flex items-center justify-center gap-1.5 object-cover">
                        <Share2 className="w-3.5 h-3.5" /> Share Stream
                      </button>
                    </div>
                  </div>
               </div>

               {/* Right: Live Chat */}
               <div className="bg-gray-50 flex flex-col h-[400px] lg:h-auto">
                 <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-2 shadow-sm relative z-10">
                   <MessageCircle className="w-4 h-4 text-secondary" />
                   <h3 className="font-header font-bold text-sm text-primary uppercase tracking-wider">Live Chat</h3>
                 </div>
                 
                 {/* Chat Messages */}
                 <div className="flex-1 p-4 overflow-y-auto space-y-4">
                   <div className="bg-primary/10 p-2.5 rounded-lg border border-primary/20 text-[10px] text-primary text-center font-bold tracking-wide">
                     Welcome to the Live Chat! Be respectful.
                   </div>
                   {liveChat.map((msg, i) => (
                     <div key={i} className="text-xs">
                       <span className="font-bold text-primary">{msg.name}:</span>
                       <span className="text-gray-700 ml-1.5">{msg.text}</span>
                     </div>
                   ))}
                 </div>

                 {/* Chat Input */}
                 <div className="p-4 bg-white border-t border-gray-200 relative z-10">
                   <form onSubmit={sendLiveMessage} className="flex gap-2">
                     <input 
                       type="text" 
                       placeholder="Say amen..."
                       value={chatInput}
                       onChange={e => setChatInput(e.target.value)}
                       className="flex-1 text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-secondary"
                     />
                     <button type="submit" className="px-3 bg-secondary text-primary font-bold rounded-lg hover:bg-primary hover:text-secondary transition shadow-sm">
                       Send
                     </button>
                   </form>
                 </div>
               </div>
             </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
