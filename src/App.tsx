import React, { useState, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';
import { Loader2 } from 'lucide-react';
import { ImageProvider } from './components/ImageContext';

// Lazy load Views
const HomeView = lazy(() => import('./components/HomeView'));
const AboutView = lazy(() => import('./components/AboutView'));
const SermonsView = lazy(() => import('./components/SermonsView'));
const EventsView = lazy(() => import('./components/EventsView'));
const MinistriesView = lazy(() => import('./components/MinistriesView'));
const OutreachView = lazy(() => import('./components/OutreachView'));
const BibleView = lazy(() => import('./components/BibleView'));
const BlogView = lazy(() => import('./components/BlogView'));
const MediaView = lazy(() => import('./components/MediaView'));
const ContactView = lazy(() => import('./components/ContactView'));
const MemberView = lazy(() => import('./components/MemberView'));
const PrayerWallView = lazy(() => import('./components/PrayerWallView'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [language, setLanguage] = useState<'en' | 'swati'>('en');
  const [userEmail, setUserEmail] = useState('covenant.believer@fonteyn.org');

  // Trigger content refreshes when something is modified in admin Panel
  const handleRefresh = () => {
    // We can fetch data in child components directly to remain simple,
    // so this is a placeholder keeping types aligned.
  };

  const renderActiveView = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomeView 
            language={language}
            setCurrentTab={setCurrentTab}
            onNewDonation={handleRefresh}
            onNewPrayerRequest={handleRefresh}
          />
        );
      case 'about':
        return <AboutView language={language} />;
      case 'sermons':
        return <SermonsView language={language} />;
      case 'events':
        return <EventsView language={language} />;
      case 'ministries':
        return <MinistriesView language={language} />;
      case 'outreach':
        return <OutreachView language={language} />;
      case 'bible':
        return <BibleView language={language} />;
      case 'blog':
        return <BlogView language={language} />;
      case 'media':
        return <MediaView language={language} />;
      case 'contact':
        return <ContactView language={language} />;
      case 'member':
        return <MemberView language={language} />;
      case 'prayer-wall':
        return <PrayerWallView language={language} />;
      case 'admin':
        return (
          <AdminDashboard 
            language={language} 
          />
        );
      default:
        return (
          <HomeView 
            language={language}
            setCurrentTab={setCurrentTab}
            onNewDonation={handleRefresh}
            onNewPrayerRequest={handleRefresh}
          />
        );
    }
  };

  return (
    <ImageProvider>
      <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between selection:bg-secondary selection:text-primary" id="app-site-wrapper-outer">
        {/* GLOBAL TOP NAVIGATION */}
        <Navbar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          language={language} 
          setLanguage={setLanguage} 
          userEmail={userEmail}
        />

        {/* CORE ROUTED DYNAMIC VIEWPORT */}
        <main className="flex-grow overflow-x-hidden">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[50vh] text-secondary">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          }>
            {renderActiveView()}
          </Suspense>

          {/* UNIVERSAL SITE FOOTER */}
          <Footer language={language} setCurrentTab={setCurrentTab} />

          {/* INTELLIGENT COMPANION BOT */}
          <AIChatbot language={language} />
        </main>
      </div>
    </ImageProvider>
  );
}
