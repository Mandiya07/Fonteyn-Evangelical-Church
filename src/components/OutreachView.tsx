import React, { useState } from 'react';
import { Heart, Users, Globe, BookOpen, Utensils, HandHeart, CheckCircle, ArrowRight, Activity, MapPin } from 'lucide-react';

interface OutreachViewProps {
  language: 'en' | 'swati';
}

export default function OutreachView({ language }: OutreachViewProps) {
  const [volunteerName, setVolunteerName] = useState('');
  const [volunteerEmail, setVolunteerEmail] = useState('');
  const [volunteerPhone, setVolunteerPhone] = useState('');
  const [volunteerInterest, setVolunteerInterest] = useState('Soup Kitchen');
  const [submitted, setSubmitted] = useState(false);

  const programs = [
    {
      title: 'Charity Projects & Soup Kitchen',
      description: 'Providing weekly meals and basic necessities to the homeless and vulnerable families in Mbabane and surrounding communities.',
      icon: <Utensils className="w-6 h-6 text-primary" />,
      image: ''
    },
    {
      title: 'Youth Empowerment Initiatives',
      description: 'Mentorship, skills training, and educational support for high school students and young adults to build sustainable futures.',
      icon: <BookOpen className="w-6 h-6 text-primary" />,
      image: ''
    },
    {
      title: 'Community Health Programs',
      description: 'Partnering with local clinics to offer free health screenings, counseling, and wellness seminars for our neighborhood.',
      icon: <Activity className="w-6 h-6 text-primary" />,
      image: ''
    },
    {
      title: 'Evangelism & Street Ministry',
      description: 'Taking the Gospel to the streets through open-air meetings, tract distribution, and one-on-one personal evangelism.',
      icon: <Users className="w-6 h-6 text-primary" />,
      image: ''
    },
    {
      title: 'Global Mission Trips',
      description: 'Annual short-term mission trips supporting church planting, orphanage builds, and relief work beyond Eswatini borders.',
      icon: <Globe className="w-6 h-6 text-primary" />,
      image: ''
    }
  ];

  const statistics = [
    { label: 'Meals Served Annually', value: '15,000+' },
    { label: 'Youth Mentored', value: '350+' },
    { label: 'Families Supported', value: '1,200' },
    { label: 'Active Volunteers', value: '85' }
  ];

  const stories = [
    {
      author: 'Lungile M.',
      role: 'Youth Program Graduate',
      quote: "The empowerment program didn't just teach me computer skills; it gave me the confidence to start my own small business. The church believed in me when I didn't believe in myself."
    },
    {
      author: 'Gogo Dlamini',
      role: 'Community Member',
      quote: "Every Thursday, the soup kitchen team brings more than just food. They bring warmth, prayers, and dignity. This church is a true light in our community."
    }
  ];

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerName || !volunteerPhone) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setVolunteerName('');
      setVolunteerEmail('');
      setVolunteerPhone('');
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-supporting py-12" id="outreach-view-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Setup */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header">Hands & Feet of Christ</span>
          <h1 className="text-3xl sm:text-4xl font-header font-bold text-primary mt-2">Community Outreach</h1>
          <p className="text-sm text-gray-600 mt-4 max-w-2xl mx-auto leading-relaxed">
            {language === 'en' 
              ? "We believe faith must be demonstrated through action. Discover how we're making a tangible impact in Mbabane and beyond, and learn how you can join the mission."
              : "Sikholelwa kutsi kukholwa kufanele kubonakale ngetento. Tfolisisa kutsi silwenta njani lushintjo eMbabane nakutindzawo letikhashane, uphindze ufunde nekutsi ungatilumbanisa njani."}
          </p>
        </div>

        {/* Impact Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {statistics.map((stat, idx) => (
            <div key={idx} className="bg-primary text-center p-6 rounded-2xl border-b-4 border-secondary shadow-lg">
              <div className="text-3xl sm:text-4xl font-bold font-header text-white mb-1">{stat.value}</div>
              <div className="text-[10px] sm:text-xs font-bold text-secondary uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Programs Grid */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
             <HandHeart className="w-6 h-6 text-secondary" />
             <h2 className="font-header text-2xl font-bold text-primary">Our Initiatives</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-xl hover:border-secondary transition duration-300 group flex flex-col">
                <div className="h-48 overflow-hidden relative bg-primary/5 flex items-center justify-center">
                  {program.image ? (
                    <>
                      <img loading="lazy" src={program.image} alt={program.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                      <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition duration-300"></div>
                    </>
                  ) : (
                    <HandHeart className="w-14 h-14 text-gray-300 animate-pulse" />
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                    {program.icon}
                  </div>
                  <h3 className="font-header text-xl font-bold text-primary mb-2 line-clamp-1">{program.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed flex-1">{program.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Stories & Volunteer Form Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Success Stories */}
          <div className="space-y-6">
            <h2 className="font-header text-2xl font-bold text-primary mb-6">Impact Stories</h2>
            <div className="space-y-6">
              {stories.map((story, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm relative">
                  <div className="text-secondary text-4xl font-serif absolute top-4 left-4 opacity-20">"</div>
                  <p className="text-sm text-gray-700 italic relative z-10 pl-4">{story.quote}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 pl-4">
                    <div className="font-bold text-primary text-sm">{story.author}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{story.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volunteer Opportunities Form */}
          <div className="bg-primary rounded-3xl p-8 relative overflow-hidden shadow-xl border-b-4 border-secondary text-white">
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="relative z-10">
               <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Join The Movement</span>
               <h2 className="font-header text-2xl font-bold text-white mt-1 mb-2">Volunteer With Us</h2>
               <p className="text-xs text-gray-300 mb-8 font-sans leading-relaxed">
                 God has equipped everyone with unique gifts. Whether you have two hours a month or two days a week, there's a place for you to serve.
               </p>

               {submitted ? (
                 <div className="bg-white/10 border border-white/20 p-6 rounded-2xl text-center backdrop-blur-md">
                   <CheckCircle className="w-12 h-12 text-secondary mx-auto mb-3" />
                   <h3 className="font-header font-bold text-lg text-white">Thank You!</h3>
                   <p className="text-xs text-gray-300 mt-2">
                     Your volunteer interest has been received. Our outreach coordinator will contact you shortly.
                   </p>
                 </div>
               ) : (
                 <form onSubmit={handleVolunteerSubmit} className="space-y-4 text-left">
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name</label>
                     <input 
                       type="text" 
                       required
                       value={volunteerName}
                       onChange={e => setVolunteerName(e.target.value)}
                       className="w-full text-xs px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl focus:ring-1 focus:ring-secondary outline-none text-white placeholder-gray-500"
                       placeholder="e.g. Sipho Dlamini"
                     />
                   </div>
                   
                   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</label>
                       <input 
                         type="tel" 
                         required
                         value={volunteerPhone}
                         onChange={e => setVolunteerPhone(e.target.value)}
                         className="w-full text-xs px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl focus:ring-1 focus:ring-secondary outline-none text-white placeholder-gray-500"
                         placeholder="+268 7600 0000"
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address (Optional)</label>
                       <input 
                         type="email" 
                         value={volunteerEmail}
                         onChange={e => setVolunteerEmail(e.target.value)}
                         className="w-full text-xs px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl focus:ring-1 focus:ring-secondary outline-none text-white placeholder-gray-500"
                         placeholder="sipho@example.com"
                       />
                     </div>
                   </div>

                   <div className="space-y-1 pb-2">
                     <label className="text-[10px] font-bold text-gray-400 uppercase">Area of Interest</label>
                     <select 
                       value={volunteerInterest}
                       onChange={e => setVolunteerInterest(e.target.value)}
                       className="w-full text-xs px-3 py-2.5 bg-neutral-800 border border-white/20 rounded-xl focus:ring-1 focus:ring-secondary outline-none text-white"
                     >
                       <option>Soup Kitchen & Food Drive</option>
                       <option>Youth Mentorship</option>
                       <option>Street Evangelism</option>
                       <option>Medical & Health Support</option>
                       <option>General Administration</option>
                     </select>
                   </div>

                   <button 
                     type="submit"
                     className="w-full py-3 bg-secondary text-primary font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white transition flex items-center justify-center gap-2"
                   >
                     <span>Sign Up to Serve</span>
                     <ArrowRight className="w-4 h-4" />
                   </button>
                 </form>
               )}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
