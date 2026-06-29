import React, { useState, useEffect } from 'react';
import { Calendar, Shield, Compass, CheckCircle, CreditCard, Send, Printer, BookOpen, Video, Headphones, Download, Share2, FileText, MapPin, Clock, Quote, Sparkles, RefreshCw } from 'lucide-react';
import { useAppImages } from './ImageContext';

interface HomeViewProps {
  setCurrentTab: (tab: string) => void;
  language: 'en' | 'swati';
  onNewDonation: (donation: any) => void;
  onNewPrayerRequest: (request: any) => void;
}

export default function HomeView({ setCurrentTab, language, onNewDonation, onNewPrayerRequest }: HomeViewProps) {
  const { images } = useAppImages();

  // Daily Devotional State
  const [devotional, setDevotional] = useState<any | null>(null);
  const [isLoadingDevotional, setIsLoadingDevotional] = useState(false);
  const [devotionalError, setDevotionalError] = useState('');

  const fetchDevotional = async (forceRefresh = false) => {
    setIsLoadingDevotional(true);
    setDevotionalError('');
    try {
      const res = await fetch(`/api/ai/devotional?lang=${language === 'en' ? 'en' : 'swati'}${forceRefresh ? '&refresh=true' : ''}`);
      if (!res.ok) {
        throw new Error('Failed to fetch devotional');
      }
      const data = await res.json();
      setDevotional(data);
    } catch (err: any) {
      console.error('Error fetching daily devotional:', err);
      setDevotionalError(language === 'en' ? 'Unable to load today\'s devotional.' : 'Yehhlulekile kulayisha sifundvo selanga.');
    } finally {
      setIsLoadingDevotional(false);
    }
  };

  useEffect(() => {
    fetchDevotional();
  }, [language]);

  // Plan your visit modal
  const [showPlanVisit, setShowPlanVisit] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitorCount, setVisitorCount] = useState('1');
  const [visitSubmitted, setVisitSubmitted] = useState(false);

  // Donation state
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'Tithes' | 'Offerings' | 'Building Fund' | 'Missions Fund'>('Tithes');
  const [paymentMethod, setPaymentMethod] = useState<'Mobile Money' | 'Bank Transfer' | 'Debit Card' | 'Credit Card'>('Mobile Money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<any | null>(null);

  // Prayer request state
  const [prayerName, setPrayerName] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmittingPrayer, setIsSubmittingPrayer] = useState(false);
  const [prayerSubmittedMessage, setPrayerSubmittedMessage] = useState(false);

  // Pastor message expansion
  const [pastorExpanded, setPastorExpanded] = useState(false);

  // Handle donations
  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setIsSubmittingDonation(true);

    try {
      // Mock API call
      setTimeout(() => {
        const data = {
          donorName: isAnonymous ? 'Anonymous' : (donorName || 'Generous Donor'),
          amount,
          category,
          paymentMethod,
          receiptNumber: "FEC-" + Math.floor(Math.random() * 100000),
          date: new Date().toLocaleDateString()
        };
        setGeneratedReceipt(data);
        onNewDonation(data);
        setIsSubmittingDonation(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsSubmittingDonation(false);
    }
  };

  // Handle prayer requests
  const handlePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim()) return;
    setIsSubmittingPrayer(true);

    try {
      // Mock API call
      setTimeout(() => {
        const data = {
          requesterName: isAnonymous ? 'Anonymous' : prayerName,
          text: prayerText,
          isPrivate,
          isAnonymous,
          date: new Date().toLocaleDateString()
        };
        onNewPrayerRequest(data);
        setPrayerSubmittedMessage(true);
        setPrayerName('');
        setPrayerText('');
        setIsSubmittingPrayer(false);
        setTimeout(() => setPrayerSubmittedMessage(false), 5000);
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsSubmittingPrayer(false);
    }
  };

  const ministries = [
    { title: "Children's Ministry", src: images.ministry_children || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=450&auto=format&fit=crop&q=80" },
    { title: "Youth Ministry", src: images.ministry_youth || "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=450&auto=format&fit=crop&q=80" },
    { title: "Young Adults Ministry", src: images.ministry_young_adults || "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=450&auto=format&fit=crop&q=80" },
    { title: "Men's Fellowship", src: images.ministry_men || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=450&auto=format&fit=crop&q=80" },
    { title: "Women's Fellowship", src: images.ministry_women || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=450&auto=format&fit=crop&q=80" },
    { title: "Family Ministry", src: images.ministry_family || "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=450&auto=format&fit=crop&q=80" },
    { title: "Evangelism Ministry", src: images.ministry_evangelism || "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=450&auto=format&fit=crop&q=80" },
    { title: "Worship Ministry", src: images.ministry_worship || "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=450&auto=format&fit=crop&q=80" },
    { title: "Prayer Ministry", src: images.ministry_prayer || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=450&auto=format&fit=crop&q=80" },
    { title: "Community Outreach Ministry", src: images.ministry_outreach || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=450&auto=format&fit=crop&q=80" },
    { title: "Christian Preschool", src: images.ministry_preschool || "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=450&auto=format&fit=crop&q=80" },
  ];

  const testimonials = [
    {
      name: "Sipho Dlamini",
      role: "Member since 2018",
      story: "My faith journey was completely transformed here. The uncompromising preaching of the Word really gave me a foundation when I needed it most."
    },
    {
      name: "Lungile Mabuza",
      role: "Youth Ministry",
      story: "The community impact of this church is profound. Seeing our outreach programs touch lives in Mbabane gives me such hope for Eswatini."
    },
    {
      name: "Themba Zwane",
      role: "Men's Fellowship",
      story: "I came broken, but through the prayer circles and the spiritual growth courses, I've found strength to be a better father to my family."
    }
  ];

  const latestSermons = [
    {
      title: "The Power of Authentic Faith",
      speaker: "Rev LS Mnisi",
      date: "October 15, 2023",
      scripture: "Hebrews 11:1-6",
      type: "video",
      image: "https://images.unsplash.com/photo-1438232992991-995b7058bcd3?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Walking in Compassion",
      speaker: "Elder Samuel Dlamini",
      date: "October 8, 2023",
      scripture: "Colossians 3:12-14",
      type: "audio",
      image: "https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=600&auto=format&fit=crop&q=80"
    }
  ];

  const upcomingEvents = [
    {
      title: "Annual Youth Convention",
      date: "Nov 12, 2023",
      time: "09:00 AM - 04:00 PM",
      location: "Fonteyn Main Sanctuary",
      image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Community Soup Kitchen",
      date: "Nov 18, 2023",
      time: "11:00 AM - 02:00 PM",
      location: "Mbabane Town Center",
      image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div className="font-sans" id="home-view-root">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-primary overflow-hidden min-h-[550px] sm:min-h-[650px] flex items-center border-b-8 border-secondary" id="hero-banner-section">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img loading="lazy" 
            src={images.hero || "https://images.unsplash.com/photo-1438232992991-995b7058bcd3?w=1200&auto=format&fit=crop&q=80"} 
            alt="Worship Congregation"
            className="w-full h-full object-cover opacity-55 saturate-[1.15] brightness-[0.70]"
            referrerPolicy="no-referrer"
          />
          {/* A softer, progressive dark blue gradient overlay to blend gently without masking out the image */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/65 to-primary"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          
          <h1 className="font-header text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight" id="hero-main-title">
            {language === 'en' ? 'Welcome to Fonteyn Evangelical Church' : 'Ngiyanemukela eFonteyn Evangelical Church'}
          </h1>
          
          <p className="mt-5 text-base sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed" id="hero-subtitle">
            {language === 'en' ? "Living God's Word, Growing Together in Faith" : "Kuphila ngelivi laNkulunkulu, Kukhula Ndzawonye ekukholweni."}
          </p>

          {/* Action buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => setShowPlanVisit(true)}
              className="w-full sm:w-auto px-8 py-4 bg-secondary text-primary font-bold rounded-xl shadow-lg hover:bg-white hover:text-primary transition-all duration-300 hover:scale-[1.03] text-sm tracking-wide font-header uppercase"
              id="hero-btn-plan"
            >
              📋 {language === 'en' ? 'Plan Your Visit' : 'Hlela Luvakasho'}
            </button>
            <button
              onClick={() => setCurrentTab('sermons')}
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-xl border-2 border-white/20 hover:border-secondary hover:text-secondary transition-all duration-300 text-sm tracking-wide font-header uppercase"
              id="hero-btn-sermons"
            >
              📖 {language === 'en' ? 'Watch Sermons' : 'Tishumayelo'}
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('service-times-anchored');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-neutral-900/60 text-secondary font-bold rounded-xl border border-secondary/40 hover:bg-neutral-900 transition-all text-sm tracking-wide font-header uppercase"
              id="hero-btn-sunday"
            >
              📅 {language === 'en' ? 'Join Us This Sunday' : 'Hlanganyela Natsi'}
            </button>
          </div>
        </div>
      </section>

      {/* 2. PASTOR'S WELCOME MESSAGE */}
      <section className="py-16 bg-white border-b border-gray-100" id="pastors-welcome-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Pastor Photo Column */}
            <div className="lg:col-span-5 relative flex justify-center" id="pastor-photo-holder">
              <div className="relative group max-w-sm sm:max-w-md">
                <div className="absolute -inset-2 bg-gradient-to-r from-secondary to-primary rounded-2xl blur-md opacity-35 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                  <img loading="lazy" 
                    src={images.pastor || "/pastor_portrait_1781085265986.png"} 
                    alt="Pastor Photo"
                    className="w-full h-[380px] object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-5 left-5 right-5 bg-primary/95 border border-secondary/30 text-white rounded-xl py-3 px-4.5 text-center shadow-lg">
                    <h4 className="font-header text-sm font-bold tracking-wide">Rev LS Mnisi</h4>
                    <p className="text-[10px] text-secondary font-sans font-semibold tracking-wider uppercase mt-1">Senior Pastor, Fonteyn FEC</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome Text Column */}
            <div className="lg:col-span-7 space-y-6" id="welcome-message-body">
              <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header">
                Warm Welcome • Ngiyanemukela
              </span>
              <h2 className="font-header text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                "Welcome to Fonteyn Evangelical Church"
              </h2>
              
              <div className="text-gray-600 space-y-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                <p className="font-medium text-gray-800 italic">
                  "Ngiyanemukela Nonkhe egameni leNkhosi yetfu Jesu Khristu! I welcome you all in the beautiful name of our Lord and Savior, Jesus Christ."
                </p>
                <p>
                  Fonteyn Evangelical Church is a community of faith located right here in the heart of Mbabane, Eswatini. Our mission is simple and powerful: to live God's Word, walk in His love, and grow together in discipleship.
                </p>
                
                {pastorExpanded && (
                  <div className="animate-fade-in space-y-4 pt-1 border-t border-gray-150">
                    <p>
                      We stand rooted in the inspired truth of the Scriptures, passionately sharing the Gospel of grace across our beautiful hills. We are dedicated to developing Christian leaders, strengthening marriages, raising children in godly wisdom, and serving Eswatini with Christ's compassion.
                    </p>
                    <p className="text-gray-800 font-semibold mt-3">
                      - Rev LS Mnisi & FEC Elders
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setPastorExpanded(!pastorExpanded)}
                className="inline-flex items-center space-x-2 text-xs font-bold text-primary hover:text-secondary group transition"
                id="pastor-read-more-btn"
              >
                <span>{pastorExpanded ? 'Read Less ↑' : 'Read More ↓'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 DAILY DEVOTIONAL SECTION */}
      <section className="py-16 bg-gradient-to-b from-white to-supporting/40 border-b border-gray-100" id="daily-devotional-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-secondary" /> 
              {language === 'en' ? 'Daily Soul Nourishment' : 'Kudla Kwemoya Kwenkhosi'}
            </span>
            <h2 className="font-header text-3xl font-bold text-primary mt-2 tracking-tight">
              {language === 'en' ? "Today's Devotional" : "Sifundvo Selanga Lamuhla"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-lg mx-auto leading-relaxed">
              {language === 'en' 
                ? "Start your day centered on God's truth. Powered by Gemini AI to deliver fresh theological reflections on scripture."
                : "Calisa lilanga lakho ngeliciniso laNkulunkulu. Isitfomulo selanga lesiletfwa bukhoma nge-Gemini AI."
              }
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-150 relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            {/* Elegant Background Accents */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary via-primary to-secondary"></div>
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

            {isLoadingDevotional ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="w-8 h-8 text-secondary animate-spin" />
                <p className="text-xs text-gray-500 font-medium font-sans animate-pulse">
                  {language === 'en' ? "Feasting on the Word... Please wait" : "Lilunda nelivi lamuhla... Sicela ume kancane"}
                </p>
              </div>
            ) : devotionalError ? (
              <div className="py-12 text-center space-y-4">
                <p className="text-sm text-red-600 font-medium">{devotionalError}</p>
                <button
                  onClick={() => fetchDevotional(true)}
                  className="px-5 py-2.5 bg-primary text-secondary text-xs font-bold font-header uppercase rounded-xl hover:bg-neutral-800 transition"
                >
                  {language === 'en' ? 'Retry Loading' : 'Etama Kabusha'}
                </button>
              </div>
            ) : devotional ? (
              <div className="space-y-8 animate-fade-in">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
                  <div className="space-y-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/25 uppercase tracking-wider">
                      {language === 'en' ? 'Abide Daily' : 'Hlala Kuye'}
                    </span>
                    <h3 className="font-header text-2xl font-bold text-primary tracking-tight leading-tight">
                      {devotional.title}
                    </h3>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                      {new Date(devotional.date || new Date()).toLocaleDateString(language === 'en' ? 'en-US' : 'ss-SZ', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>

                {/* Scripture Reference & Text */}
                <div className="bg-amber-50/50 rounded-2xl p-5 sm:p-6 border border-amber-100/70 relative">
                  <Quote className="absolute top-4 right-4 w-10 h-10 text-amber-200/40 pointer-events-none" />
                  <div className="flex items-center space-x-2 text-secondary mb-2.5">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span className="font-header font-bold text-xs uppercase tracking-wider">{devotional.scripture}</span>
                  </div>
                  <p className="font-sans font-medium italic text-gray-800 text-xs sm:text-sm leading-relaxed">
                    "{devotional.scriptureText}"
                  </p>
                </div>

                {/* Pastor Reflection / Commentary */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-secondary tracking-widest uppercase font-header">
                    {language === 'en' ? "Pastoral Reflection" : "Sifundvo Selikhonzi"}
                  </h4>
                  <div className="text-gray-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans font-normal text-gray-600">
                    {devotional.thought}
                  </div>
                </div>

                {/* Prayer section */}
                <div className="border-l-4 border-secondary/60 bg-gray-50/50 rounded-r-2xl p-5 space-y-2">
                  <h4 className="text-[10px] font-bold text-gray-500 tracking-widest uppercase font-header">
                    {language === 'en' ? "Daily Prayer" : "Mthandazo Selanga"}
                  </h4>
                  <p className="font-sans font-medium italic text-gray-800 text-xs sm:text-sm leading-relaxed">
                    "{devotional.prayer}"
                  </p>
                </div>

                {/* Reflection/Application Question */}
                <div className="p-5 bg-primary/[0.02] border border-primary/5 rounded-2xl space-y-2">
                  <h4 className="text-[10px] font-bold text-primary tracking-widest uppercase font-header flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-secondary" />
                    {language === 'en' ? "For Your Reflection" : "Kuzindla Nekuhlola"}
                  </h4>
                  <p className="text-gray-800 font-sans text-xs sm:text-sm font-semibold">
                    {devotional.reflectionQuestion}
                  </p>
                </div>

                {/* Refresh/Regenerate trigger */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-[11px] text-gray-400">
                  <span>
                    {devotional.isFallback 
                      ? (language === 'en' ? "Offline mode active" : "Imodi ye-Offline ivuliwe") 
                      : (language === 'en' ? "Freshly generated daily bread" : "Inshumayelo letsatfwe bukhoma")
                    }
                  </span>
                  <button
                    onClick={() => fetchDevotional(true)}
                    disabled={isLoadingDevotional}
                    className="inline-flex items-center space-x-1.5 font-bold text-primary hover:text-secondary group transition cursor-pointer"
                    title={language === 'en' ? "Seek another word from God" : "Kufuna lelinye lilwi kuNkulunkulu"}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-primary group-hover:text-secondary ${isLoadingDevotional ? 'animate-spin' : 'group-hover:rotate-45'} transition duration-300`} />
                    <span>{language === 'en' ? "Seek Fresh Devotional" : "Funa Lelilinye Sifundvo"}</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* 3. SERVICE TIMES */}
      <section className="py-16 bg-supporting" id="service-times-anchored">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header">
            Worship Schedules
          </span>
          <h2 className="font-header text-2xl sm:text-3xl font-bold text-primary mt-2">
            Weekly Service Times
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto mt-2">
            Join us throughout the week as we worship together and study God's Word.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5 mt-10">
            {/* Sunday Services */}
            <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm flex flex-col justify-between text-left hover:border-secondary transition duration-300">
              <div className="space-y-4">
                <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-header text-base font-bold text-primary">Sunday Services</h3>
                  <p className="text-xs text-gray-500 mt-1">Our primary weekly gathering to feed on the Word and worship together.</p>
                </div>
                <div className="border-t border-gray-100 pt-3 flex flex-col space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700">Bible Study:</span>
                    <span className="text-secondary font-bold">10:00 AM</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700">Main Church Service:</span>
                    <span className="text-secondary font-bold">11:00 AM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Midweek Services */}
            <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm flex flex-col justify-between text-left hover:border-secondary transition duration-300">
              <div className="space-y-4">
                <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl">
                  <Compass className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-header text-base font-bold text-primary">Midweek & Fellowship</h3>
                  <p className="text-xs text-gray-500 mt-1">Midweek programs to strengthen and anchor your faith and family walk.</p>
                </div>
                <div className="border-t border-gray-100 pt-3 flex flex-col space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700">Fathers' Fellowship (Mon):</span>
                    <span className="text-secondary font-bold">05:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700">Prayer Service (Wed):</span>
                    <span className="text-secondary font-bold">05:30 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekend fellowships */}
            <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm flex flex-col justify-between text-left hover:border-secondary transition duration-300 md:col-span-2 lg:col-span-1">
              <div className="space-y-4">
                <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-header text-base font-bold text-primary">Weekend Fellowships</h3>
                  <p className="text-xs text-gray-500 mt-1">Join specialized minister groups designed for distinct life seasons.</p>
                </div>
                <div className="border-t border-gray-100 pt-3 flex flex-col space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700">Mothers' Fellowship (Sat):</span>
                    <span className="text-secondary font-bold">11:00 AM</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700">Youth Fellowship (Sat):</span>
                    <span className="text-secondary font-bold">01:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LATEST SERMONS */}
      <section className="py-16 bg-white border-t border-gray-100" id="latest-sermons-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10">
            <div>
              <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header">
                Sermon Archive
              </span>
              <h2 className="font-header text-2xl sm:text-3xl font-bold text-primary mt-2">
                Latest Sermons
              </h2>
            </div>
            <button 
              onClick={() => setCurrentTab('sermons')}
              className="mt-4 md:mt-0 text-sm font-bold text-primary hover:text-secondary transition underline decoration-2 underline-offset-4"
            >
              View All Sermons →
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {latestSermons.map((sermon, idx) => (
              <div key={idx} className="bg-supporting rounded-2xl overflow-hidden shadow-sm border border-gray-200 flex flex-col sm:flex-row hover:border-secondary transition">
                <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-gray-200">
                  {sermon.image ? (
                    <img loading="lazy" src={sermon.image} alt={sermon.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/20"></div>
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 flex items-center space-x-1 rounded-lg">
                    {sermon.type === 'video' ? <Video className="w-3.5 h-3.5 text-primary" /> : <Headphones className="w-3.5 h-3.5 text-primary" />}
                    <span className="text-[10px] uppercase font-bold text-primary">{sermon.type}</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase font-sans">
                      {sermon.date} • {sermon.speaker}
                    </p>
                    <h3 className="font-header text-lg font-bold text-primary leading-tight">
                      {sermon.title}
                    </h3>
                    <div className="flex items-center space-x-1 text-xs font-medium text-secondary pt-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{sermon.scripture}</span>
                    </div>
                  </div>
                  <div className="pt-4 flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-secondary transition flex items-center space-x-1.5">
                      {sermon.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
                      <span>Watch Online</span>
                    </button>
                    <button className="px-3 py-2 bg-gray-200 text-primary text-xs font-bold rounded-lg hover:bg-gray-300 transition flex items-center space-x-1.5" title="Download Audio">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button className="px-3 py-2 bg-gray-200 text-primary text-xs font-bold rounded-lg hover:bg-gray-300 transition flex items-center space-x-1.5" title="Sermon Notes">
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button className="px-3 py-2 bg-gray-200 text-primary text-xs font-bold rounded-lg hover:bg-gray-300 transition flex items-center space-x-1.5" title="Share Sermon">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. UPCOMING EVENTS */}
      <section className="py-16 bg-supporting" id="events-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
             <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header">
              Church Calendar
            </span>
            <h2 className="font-header text-2xl sm:text-3xl font-bold text-primary mt-2">
              Upcoming Events
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {upcomingEvents.map((event, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-150 flex flex-col group">
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  {event.image ? (
                    <img loading="lazy" src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-lg shadow-sm text-center">
                    <div className="text-xs font-bold text-primary uppercase">{event.date.split(' ')[0]}</div>
                    <div className="font-header font-bold text-xl text-secondary leading-none">{event.date.split(' ')[1].replace(',', '')}</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-header text-xl font-bold text-primary mb-3">
                    {event.title}
                  </h3>
                  <div className="space-y-2 border-b border-gray-100 pb-4 mb-4">
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-secondary" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-secondary" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <button onClick={() => setCurrentTab('events')} className="w-full py-2.5 bg-primary text-secondary tracking-wide font-bold font-header text-xs rounded-xl hover:bg-neutral-800 transition uppercase">
                    Registration Information
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. MINISTRIES OVERVIEW */}
      <section className="py-16 bg-white" id="ministries-overview-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header">
            Engage & Walk With Us
          </span>
          <h2 className="font-header text-2xl sm:text-3xl font-bold text-primary mt-2">
            FEC Ministries Overview
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto mt-2">
            Discover a place to serve, grow, and connect through our dedicated ministries.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mt-10">
            {ministries.map((min, index) => (
              <div 
                key={index} 
                className="bg-supporting border rounded-xl overflow-hidden hover:shadow-lg hover:border-secondary transition duration-300 flex flex-col group cursor-pointer"
                onClick={() => setCurrentTab('ministries')}
              >
                <div className="relative h-32 overflow-hidden bg-gray-100">
                  {min.src ? (
                    <img loading="lazy" src={min.src} alt={min.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Shield className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/30 group-hover:bg-primary/10 transition"></div>
                </div>
                <div className="p-3 text-center bg-white border-t border-gray-100 flex-1 flex items-center justify-center">
                  <h4 className="font-header text-[11px] sm:text-xs font-bold text-primary group-hover:text-secondary transition">{min.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-16 bg-primary" id="testimonials-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Quote className="w-10 h-10 text-secondary/50 mx-auto mb-4" />
          <h2 className="font-header text-2xl sm:text-3xl font-bold text-white mb-10">
            Life-Changing Stories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimony, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 transition">
                <p className="text-sm text-gray-300 italic mb-6 leading-relaxed">
                  "{testimony.story}"
                </p>
                <div className="flex items-center space-x-3 border-t border-white/10 pt-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold font-header">
                    {testimony.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">{testimony.name}</div>
                    <div className="text-secondary text-[10px] uppercase font-bold tracking-wider">{testimony.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. PRAYER REQUEST SECTIONS */}
      <section className="py-16 bg-supporting" id="prayer-requests-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-gray-150 text-center relative overflow-hidden">
            <span className="text-[10px] font-bold text-secondary tracking-widest uppercase font-header">
              The Power of Intercession
            </span>
            <h2 className="font-header text-2xl font-bold text-primary mt-2">
              How Can We Pray For You?
            </h2>
            <p className="text-xs text-gray-600 max-w-xl mx-auto mt-2 leading-relaxed">
              Submit your burdens to our dedicated intercessory team. Share public or private requests.
            </p>

            {prayerSubmittedMessage ? (
              <div className="mt-8 p-4 bg-emerald-50 border border-emerald-150 rounded-xl space-y-1 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="font-header text-sm font-bold text-emerald-900">Prayer Burden Received</h4>
                <p className="text-xs text-emerald-700">Blessings! We will pray over your request. Stay strong.</p>
              </div>
            ) : (
              <form onSubmit={handlePrayerSubmit} className="mt-8 space-y-4 text-left" id="prayer-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Your Name (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Samuel Dlamini"
                      disabled={isAnonymous}
                      value={prayerName}
                      onChange={(e) => setPrayerName(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-secondary disabled:opacity-50"
                    />
                  </div>
                  <div className="flex items-center space-x-2.5 pt-4.5 sm:pt-6">
                    <input 
                      type="checkbox" 
                      id="anon-check"
                      checked={isAnonymous}
                      onChange={(e) => {
                         setIsAnonymous(e.target.checked);
                         if (e.target.checked) setPrayerName('');
                      }}
                      className="w-4 h-4 accent-secondary rounded"
                    />
                    <label htmlFor="anon-check" className="text-xs text-gray-700 font-semibold select-none cursor-pointer">Submit anonymously</label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Prayer Request</label>
                  <textarea 
                    required
                    rows={3} 
                    placeholder="Tell us what to pray over..."
                    value={prayerText}
                    onChange={(e) => setPrayerText(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="private-check"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="w-4 h-4 accent-secondary rounded"
                    />
                    <label htmlFor="private-check" className="text-xs text-gray-700 font-medium select-none cursor-pointer">
                      Keep private (for Pastors only)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingPrayer}
                    className="w-full sm:w-auto px-6 py-3 bg-primary text-secondary hover:bg-neutral-800 transition rounded-xl font-header font-bold text-xs uppercase flex items-center justify-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5 shrink-0" />
                    <span>{isSubmittingPrayer ? 'Sending Request...' : 'Submit Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 9. ONLINE DONATION SECTION */}
      <section className="py-16 bg-neutral-900 border-b-4 border-secondary text-white" id="online-donations-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-11 items-start">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header block">
                Honoring God in Worship
              </span>
              <h2 className="font-header text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                Tithes, Offerings & Funds
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." (2 Cor 9:7)
              </p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                {[
                  { title: "Tithes", desc: "10% Covenant worship" },
                  { title: "Offerings", desc: "Free-will general love" },
                  { title: "Building Fund", desc: "Chapel improvements" },
                  { title: "Missions Fund", desc: "Eswatini outreach" }
                ].map((fund, idx) => (
                  <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <span className="font-bold text-xs text-secondary tracking-wide block">{fund.title}</span>
                    <span className="text-[10px] text-gray-400 font-sans block">{fund.desc}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-3 bg-primary/20 p-3.5 border border-primary/20 rounded-xl max-w-sm">
                <Shield className="w-5 h-5 text-secondary shrink-0" />
                <span className="text-[11px] text-gray-300 leading-normal font-sans font-medium">
                  Secure. Electronic donation receipts generated instantly.
                </span>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl p-6 md:p-8 text-gray-800 shadow-xl border border-gray-100 max-w-2xl mx-auto relative overflow-hidden">
                {!generatedReceipt ? (
                  <form onSubmit={handleDonationSubmit} className="space-y-4">
                    <h3 className="font-header text-sm font-bold text-primary tracking-wide border-b pb-2 mb-4 uppercase">
                      Create Secure Donation
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-500 uppercase">Your Name (Optional)</label>
                        <input 
                          type="text"
                          placeholder="e.g. Samuel Dlamini"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          className="w-full text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-500 uppercase">Amount (SZL)</label>
                        <input 
                          type="number"
                          required
                          placeholder="Amount in Lilangeni"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full text-xs px-3 py-2.5 bg-gray-50 border border-secondary/30 rounded-xl focus:ring-1 focus:ring-secondary font-bold text-primary outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-500 uppercase">Select Fund</label>
                        <select
                          value={category}
                          onChange={(e: any) => setCategory(e.target.value)}
                          className="w-full text-xs px-2.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-secondary"
                        >
                          <option value="Tithes">Tithes (Kushumi)</option>
                          <option value="Offerings">Offerings</option>
                          <option value="Building Fund">Building Fund</option>
                          <option value="Missions Fund">Missions Fund</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-500 uppercase">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e: any) => setPaymentMethod(e.target.value)}
                          className="w-full text-xs px-2.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-secondary"
                        >
                          <option value="Mobile Money">Mobile Money (MTN MoMo)</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Debit Card">Debit Card</option>
                          <option value="Credit Card">Credit Card</option>
                        </select>
                      </div>
                    </div>

                    {paymentMethod === 'Mobile Money' && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1 text-xs text-emerald-800">
                        <label className="font-semibold block text-[10px] text-emerald-600 uppercase">Mobile Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="+268 76__ ____"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-200 rounded-lg outline-none max-w-xs font-mono"
                        />
                      </div>
                    )}

                    {(paymentMethod === 'Debit Card' || paymentMethod === 'Credit Card') && (
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl space-y-2 text-xs text-amber-800">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[9px] font-bold text-amber-700">CARD NUMBER</label>
                            <input
                              type="text"
                              required
                              placeholder="4111 2222 3333 4444"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full px-2 py-1 text-xs bg-white border border-amber-200 rounded outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-amber-700">EXP & CVV</label>
                            <input
                              type="text"
                              required
                              placeholder="12/28 - 331"
                              className="w-full px-2 py-1 text-xs bg-white border border-amber-200 rounded outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingDonation}
                      className="w-full mt-4 py-3 bg-secondary hover:bg-primary text-primary hover:text-white font-header font-bold rounded-xl shadow-md transition-all duration-300 flex items-center justify-center space-x-2 text-xs uppercase cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 shrink-0" />
                      <span>{isSubmittingDonation ? 'Processing Gateway...' : `Submit SZL ${amount || '0'} Donation`}</span>
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6 p-4 border-2 border-dashed border-secondary rounded-2xl bg-white text-gray-800">
                    <div className="text-center space-y-1.5 border-b pb-4">
                      <div className="text-[13px] font-bold font-header text-primary tracking-widest uppercase">FONTEYN EVANGELICAL CHURCH</div>
                      <div className="text-[9px] text-gray-500 tracking-wide">P.O. Box 8560, Mbabane, Eswatini</div>
                      <div className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full w-fit mx-auto mt-2 uppercase border border-primary/20">
                        Donation Receipt
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs font-sans">
                      <div>
                        <span className="text-gray-400 block">RECEIPT NO</span>
                        <span className="font-mono text-primary font-bold">{generatedReceipt.receiptNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">DATE</span>
                        <span className="font-semibold">{generatedReceipt.date}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">DONOR</span>
                        <span className="font-semibold text-gray-900">{generatedReceipt.donorName}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">FUND DIRECTED</span>
                        <span className="font-semibold text-secondary">{generatedReceipt.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">AMOUNT</span>
                        <span className="font-bold text-gray-900">SZL {generatedReceipt.amount}.00</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">METHOD</span>
                        <span className="font-semibold">{generatedReceipt.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-4 border-t">
                      <button
                        onClick={() => window.print()}
                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-primary rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Receipt</span>
                      </button>
                      <button
                        onClick={() => {
                          setGeneratedReceipt(null);
                          setAmount('');
                          setDonorName('');
                          setPhoneNumber('');
                          setCardNumber('');
                        }}
                        className="flex-1 py-2.5 bg-primary text-secondary tracking-wide font-bold text-xs rounded-xl hover:bg-neutral-800 flex items-center justify-center transition"
                      >
                        New Donation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLAN YOUR VISIT MODAL */}
      {showPlanVisit && (
        <div className="fixed inset-0 bg-primary/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="font-header text-sm font-bold text-primary uppercase pb-2 border-b">
              Plan Your Visit
            </h3>
            
            {visitSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle className="w-12 h-12 text-secondary mx-auto" />
                <h4 className="font-header text-sm font-bold text-primary">Visit Confirmed!</h4>
                <p className="text-xs text-gray-650 leading-relaxed">
                  We look forward to worshiping with you. God bless!
                </p>
                <button
                  onClick={() => {
                    setShowPlanVisit(false);
                    setVisitSubmitted(false);
                  }}
                  className="px-5 py-2 mt-4 bg-primary text-white hover:bg-neutral-800 text-xs font-bold rounded-lg transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                setVisitSubmitted(true);
              }} className="space-y-4 pt-3 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Your name</label>
                  <input 
                    type="text" 
                    required 
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Date of Visit</label>
                  <input 
                    type="date" 
                    required 
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Group Size</label>
                  <select 
                    value={visitorCount}
                    onChange={(e) => setVisitorCount(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none"
                  >
                    <option value="1">Just me</option>
                    <option value="2">2 People</option>
                    <option value="3">3 - 5 People</option>
                    <option value="6">6+ People</option>
                  </select>
                </div>

                <div className="flex space-x-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPlanVisit(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-secondary hover:bg-primary text-primary hover:text-white rounded-lg text-xs font-bold transition"
                  >
                    Confirm Visit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
