import React, { useState } from 'react';
import { TIMELINE_MILESTONES, CORE_VALUES, CHURCH_LEADERS } from '../data';
import { Award, Eye, Rocket, CheckCircle, Mail, Calendar, ArrowRight, User } from 'lucide-react';
import { useAppImages } from './ImageContext';

interface AboutViewProps {
  language: 'en' | 'swati';
}

export default function AboutView({ language }: AboutViewProps) {
  const { images } = useAppImages();
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState(TIMELINE_MILESTONES.length > 0 ? TIMELINE_MILESTONES.length - 1 : 0);
  const [expandedValueIdx, setExpandedValueIdx] = useState<number | null>(null);

  const activeMilestone = TIMELINE_MILESTONES.length > 0 ? TIMELINE_MILESTONES[selectedTimelineIndex] : null;

  const t = {
    aboutTitle: language === 'en' ? 'Who We Are' : 'Taba Letikhulu',
    tagline: language === 'en' ? 'Our Origins, Values, & Spiritual Team' : 'Umlandvo nemigomo yetfu',
    historyTitle: language === 'en' ? 'Our Faith Timeline' : 'Umlandvo WeKukholwa',
    visionTitle: language === 'en' ? 'Our Vision' : 'Umbono Wetfu',
    missionTitle: language === 'en' ? 'Our Mission' : 'Mission Yetfu',
    valuesTitle: language === 'en' ? 'Core Values We Walk By' : 'Imigomo Lephelele',
    valuesSubtitle: language === 'en' ? 'Click any value to unpack its scripture basis.' : 'Chofoza imigomo kufundza kabanzi.',
    leadersTitle: language === 'en' ? 'Our Spiritual Leadership' : 'Baholi Betfu Bemoya',
    visionText: language === 'en' 
      ? 'To be a vibrant, Spirit-filled church that establishes a secure generation of Christian families and develops leaders who impact Eswatini with the pure Gospel of Jesus Christ.'
      : 'Kuba libandla lelivutsekako ngeMoya Lelingcwele, Lelisungula situkulwane lesicinile semindeni yemaKhristu futsi litfutfukise baholi labatoshintsha Eswatini ngelivangeli laJesu Khristu.',
    missionText: language === 'en'
      ? 'To glorify God through majestic worship, make authentic disciples of all nations, build supportive family altars, and model Christian compassion across the capital of Mbabane.'
      : 'Khulisa lidvumo laNkulunkulu ngekukhonza lokuphakeme, kutfutfukisa bafundzi bemihlobo yonkhe, kwakha lilati lemindeni, sitse lutsandvo lwaKhristu ngetento.'
  };

  return (
    <div className="py-12 bg-white font-sans animate-fade-in" id="about-view-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* HEADING HEADER */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header block">
            About Fonteyn FEC
          </span>
          <h1 className="font-header text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            {t.aboutTitle}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            {t.tagline}
          </p>
        </div>

        {/* VISION & MISSION DUAL FLASH CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="vision-mission-cards">
          {/* Vision card */}
          <div className="bg-primary hover:border-secondary border-[3px] border-primary rounded-2xl p-6 sm:p-8 text-white space-y-4 shadow-md transition duration-300">
            <div className="p-3.5 bg-secondary/15 border border-secondary/20 rounded-xl text-secondary w-fit">
              <Eye className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-header text-lg sm:text-xl font-bold text-white tracking-wide">
              {t.visionTitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
              {t.visionText}
            </p>
          </div>

          {/* Mission card */}
          <div className="bg-supporting border rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm hover:border-secondary transition duration-300">
            <div className="p-3.5 bg-primary/10 rounded-xl text-primary w-fit">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-header text-lg sm:text-xl font-bold text-primary tracking-wide">
              {t.missionTitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-650 leading-relaxed font-sans">
              {t.missionText}
            </p>
          </div>
        </div>

        {/* INTERACTIVE TIMELINE COMPONENT */}
        <div className="bg-supporting/60 rounded-3xl p-6 sm:p-8 border border-gray-150 space-y-8" id="history-timeline-section">
          <div className="text-center space-y-1">
            <h3 className="font-header text-xl font-bold text-primary flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5 text-secondary shrink-0" />
              <span>{t.historyTitle}</span>
            </h3>
            <p className="text-xs text-gray-500">
              Click through our milestones to discover how God has established our church in Eswatini hills.
            </p>
          </div>

          {/* Slider line / circles */}
          <div className="relative max-w-4xl mx-auto py-4" id="timeline-navigation-slider">
            {/* The horizontal track */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0 hidden sm:block"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
              {TIMELINE_MILESTONES.map((mile, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedTimelineIndex(i)}
                  className={`flex items-center space-x-2 sm:space-x-0 sm:flex-col sm:space-y-2 focus:outline-none transition group cursor-pointer`}
                >
                  <div 
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-header text-xs font-bold border-[3px] transition ${
                      selectedTimelineIndex === i 
                        ? 'bg-secondary text-primary border-primary scale-110 shadow' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-secondary'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className={`text-[11px] font-bold tracking-wider font-header ${selectedTimelineIndex === i ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`}>
                    {mile.year}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Card Display */}
          {activeMilestone && (
            <div className="bg-white border rounded-2xl p-6 sm:p-7 shadow-sm max-w-2xl mx-auto relative overflow-hidden animate-zoom-in" id="timeline-detail-card">
              <div className="absolute top-0 left-0 bg-secondary px-3 py-1 text-[10px] font-bold font-header text-primary rounded-br-xl">
                FEC ERA {activeMilestone.year}
              </div>
              
              <div className="space-y-3 pt-2 text-left">
                <h4 className="font-header text-base sm:text-lg font-bold text-primary mt-2">
                  {activeMilestone.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
                  {activeMilestone.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CORE VALUES VIEW SECTION */}
        <div className="space-y-6" id="core-values-section">
          <div className="text-center space-y-1">
            <h3 className="font-header text-xl font-bold text-primary">
              {t.valuesTitle}
            </h3>
            <p className="text-xs text-gray-500">
              {t.valuesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5" id="values-interactive-cards">
            {CORE_VALUES.map((val, idx) => {
              const isExpanded = expandedValueIdx === idx;
              return (
                <div 
                  key={idx}
                  onClick={() => setExpandedValueIdx(isExpanded ? null : idx)}
                  className={`border rounded-xl p-4 text-left cursor-pointer transition-all duration-300 select-none ${
                    isExpanded 
                      ? 'bg-secondary/10 border-secondary ring-2 ring-secondary/20 shadow-sm' 
                      : 'bg-white border-gray-200 hover:border-secondary/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-header text-sm font-bold text-primary flex items-center gap-2">
                      <span className="text-secondary font-sans font-black">#</span>
                      {val.name}
                    </span>
                    <span className="text-[10px] text-secondary font-semibold uppercase">{isExpanded ? 'Hide' : 'Read'}</span>
                  </div>
                  {isExpanded && (
                    <p className="mt-3.5 text-xs text-gray-600 leading-normal animate-fade-in border-t border-secondary/10 pt-2.5">
                      {val.desc}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* DIRECTORY: LEADERSHIP TEAM */}
        <div className="space-y-6" id="leadership-section">
          <div className="text-center space-y-1">
            <h3 className="font-header text-xl font-bold text-primary">
              {t.leadersTitle}
            </h3>
            <p className="text-xs text-gray-500">
              Meet the shepherds and ministry practitioners serving our spiritual community in Mbabane.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="leaders-directory-grid">
            {CHURCH_LEADERS.map((leader, idx) => {
              const isPastor = leader.role === 'Senior Pastor' || leader.name === 'Rev LS Mnisi';
              const photoUrl = isPastor ? (images.pastor || leader.photo) : leader.photo;
              return (
                <div 
                  key={idx}
                  className="bg-supporting/40 border border-gray-150 rounded-2xl p-4.5 text-center flex flex-col justify-between hover:shadow-md hover:border-secondary transition duration-300"
                >
                  <div className="space-y-3.5">
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-3 border-secondary/20 relative">
                      {photoUrl ? (
                        <img loading="lazy" src={photoUrl} alt={leader.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-Supporting flex items-center justify-center">
                          <User className="text-gray-400 w-12 h-12" />
                        </div>
                      )}
                    </div>
                  <div className="space-y-1">
                    <h4 className="font-header text-xs sm:text-sm font-bold text-primary tracking-wide leading-tight">{leader.name}</h4>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-secondary/15 text-primary border border-secondary/20 font-bold tracking-wider uppercase inline-block">
                      {leader.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-sans tracking-tight leading-normal">
                    {leader.bio}
                  </p>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-3 text-center">
                  <a 
                    href={`mailto:${leader.contact}`} 
                    className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-primary hover:text-secondary hover:underline transition"
                  >
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>Contact Leader</span>
                  </a>
                </div>
              </div>
            );
          })}
          </div>
        </div>

      </div>
    </div>
  );
}
