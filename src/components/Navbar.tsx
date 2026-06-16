import React, { useState } from 'react';
import { Church, Globe, Menu, X, Landmark, User, ShieldAlert, Sparkles, ChevronDown } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: 'en' | 'swati';
  setLanguage: (lang: 'en' | 'swati') => void;
  userEmail: string;
}

export default function Navbar({ currentTab, setCurrentTab, language, setLanguage, userEmail }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const groups = [
    {
      id: 'church-life',
      labelEn: 'Church Life',
      labelSw: 'Kuphila Kwebasindvisi',
      items: [
        { id: 'about', labelEn: 'About Us', labelSw: 'Ngatsi' },
        { id: 'ministries', labelEn: 'Ministries', labelSw: 'Tingoni' },
        { id: 'outreach', labelEn: 'Outreach', labelSw: 'Kusita Umphakatsi' },
        { id: 'events', labelEn: 'Events', labelSw: 'Temicimbi' },
      ]
    },
    {
      id: 'resources',
      labelEn: 'Resources',
      labelSw: 'Tinsitfo temoya',
      items: [
        { id: 'sermons', labelEn: 'Sermons Center', labelSw: 'Tishumayelo' },
        { id: 'bible', labelEn: 'Bible Center', labelSw: 'LiBhayibheli' },
        { id: 'blog', labelEn: 'News & Blog', labelSw: 'Tindzaba' },
        { id: 'media', labelEn: 'Media Center', labelSw: 'Tisakaso' },
      ]
    },
    {
      id: 'connect',
      labelEn: 'Connect',
      labelSw: 'Chumana Natsi',
      items: [
        { id: 'contact', labelEn: 'Counseling & Contact', labelSw: 'Tinhlelo & Contact' },
        { id: 'member', labelEn: 'Membership Portal', labelSw: 'Lubumbano' },
        { id: 'prayer-wall', labelEn: 'Prayer Wall', labelSw: 'Lugome Lwemithwalo' },
      ]
    }
  ];

  const navItems = [
    { id: 'home', labelEn: 'Home', labelSw: 'Ekhaya' },
    { id: 'about', labelEn: 'About Us', labelSw: 'Ngatsi' },
    { id: 'sermons', labelEn: 'Sermons Center', labelSw: 'Tishumayelo' },
    { id: 'events', labelEn: 'Events', labelSw: 'Temicimbi' },
    { id: 'ministries', labelEn: 'Ministries', labelSw: 'Tingoni' },
    { id: 'outreach', labelEn: 'Outreach', labelSw: 'Kusita Umphakatsi' },
    { id: 'bible', labelEn: 'Bible Center', labelSw: 'LiBhayibheli' },
    { id: 'blog', labelEn: 'News & Blog', labelSw: 'Tindzaba' },
    { id: 'media', labelEn: 'Media Center', labelSw: 'Tindzaba' },
    { id: 'contact', labelEn: 'Counseling & Contact', labelSw: 'Tinhlelo & Contact' },
    { id: 'member', labelEn: 'Membership Portal', labelSw: 'Lubumbano' },
  ];

  const t = {
    churchName: language === 'en' ? 'Fonteyn Evangelical Church' : 'Fonteyn Evangelical Church', // Proper name remains the same
    tagline: language === 'en' ? 'Mbabane, Eswatini' : 'Mbabane, Eswatini',
    adminLabel: language === 'en' ? 'Admin Panel' : 'I-Admin Panel',
  };

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary border-b-[3px] border-secondary text-white shadow-md font-sans" id="main-navigation-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand Brand Section */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('home')} id="nav-brand-logo">
            <div className="p-2.5 bg-secondary text-primary rounded-xl flex items-center justify-center shadow-inner border border-white/10 shrink-0">
              <Church className="w-6 h-6" />
            </div>
            <div>
              <div className="font-header text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1">
                FONTEYN <span className="text-secondary font-semibold font-sans">EVANGELICAL</span>
              </div>
              <div className="text-[11px] text-gray-300 font-sans tracking-widest flex items-center gap-1 font-medium">
                <span>MBABANE, ESWATINI</span>
                <span className="h-1.5 w-1.5 rounded-full bg-secondary inline-block"></span>
                <span className="text-secondary">EST. 1994</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1.5" id="desktop-links-list">
            {/* Home link */}
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 text-[13px] font-header font-medium tracking-wide rounded-lg transition-all duration-200 cursor-pointer ${
                currentTab === 'home'
                  ? 'bg-secondary text-primary font-semibold shadow-sm'
                  : 'text-gray-200 hover:bg-white/10 hover:text-white'
              }`}
              id="nav-item-home"
            >
              {language === 'en' ? 'Home' : 'Ekhaya'}
            </button>

            {/* Dropdown Groups */}
            {groups.map((group) => {
              const isGroupOpen = activeDropdown === group.id;
              const hasActiveItem = group.items.some(sub => sub.id === currentTab);
              
              return (
                <div 
                  key={group.id}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(group.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    onClick={() => setActiveDropdown(isGroupOpen ? null : group.id)}
                    className={`px-2.5 py-2 text-[13px] font-header font-medium tracking-wide rounded-lg transition-all duration-200 flex items-center gap-1 cursor-pointer select-none ${
                      hasActiveItem
                        ? 'bg-secondary text-primary font-semibold shadow-sm'
                        : isGroupOpen
                          ? 'bg-white/10 text-white'
                          : 'text-gray-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{language === 'en' ? group.labelEn : group.labelSw}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isGroupOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isGroupOpen && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-[#12253e] border border-secondary/20 rounded-xl shadow-xl py-1.5 z-50 animate-fade-in divide-y divide-white/5">
                      {group.items.map((sub) => {
                        const isSubActive = currentTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              handleNavClick(sub.id);
                              setActiveDropdown(null);
                            }}
                            className={`w-full text-left px-3.5 py-2 text-[12px] font-header font-medium tracking-wide transition-all duration-150 block cursor-pointer ${
                              isSubActive
                                ? 'text-secondary bg-white/5 font-bold border-l-[3px] border-secondary'
                                : 'text-gray-200 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {language === 'en' ? sub.labelEn : sub.labelSw}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Admin Dashboard Entry */}
            <button
              onClick={() => handleNavClick('admin')}
              className={`px-3 py-2 text-[13px] font-header font-semibold tracking-wide rounded-lg border transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-neutral-800 text-secondary border-secondary shadow-md'
                  : 'text-secondary border-secondary/30 hover:bg-secondary/15 hover:text-secondary'
              }`}
              id="nav-item-admin"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-secondary" />
              <span>{t.adminLabel}</span>
            </button>
          </div>

          {/* Language & User Access widgets */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center space-x-1 bg-black/20 p-1 rounded-lg border border-white/5" id="language-switcher">
              <Globe className="w-3.5 h-3.5 text-gray-300 ml-1" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 text-[10px] rounded font-semibold transition ${
                  language === 'en' ? 'bg-secondary text-primary' : 'text-gray-300 hover:text-white'
                }`}
                id="btn-lang-en"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('swati')}
                className={`px-2 py-0.5 text-[10px] rounded font-semibold transition ${
                  language === 'swati' ? 'bg-secondary text-primary' : 'text-gray-300 hover:text-white'
                }`}
                id="btn-lang-sw"
              >
                SWATI
              </button>
            </div>

            {/* Active User Indicator */}
            <div className="flex items-center space-x-2 bg-neutral-900 border border-white/10 px-3 py-1.5 rounded-xl shrink-0" id="user-indicator">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] font-semibold font-sans tracking-wide text-gray-300">
                {userEmail ? 'MEMBER' : 'VISITOR'}
              </span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:flex lg:hidden flex items-center space-x-2">
            {/* Language Toggle for Mobile */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'swati' : 'en')}
              className="p-2 bg-black/20 rounded-lg text-secondary border border-white/10 text-xs flex items-center gap-1 font-semibold"
              title="Switch Language"
              id="mobile-lang-switch-btn"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'SW' : 'EN'}</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 bg-black/20 text-gray-200 hover:text-white rounded-lg focus:outline-none border border-white/10"
              id="mobile-hamburger-btn"
            >
              {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="lg:hidden bg-primary border-t border-white/10 animate-fade-in" id="mobile-menu-pane">
          <div className="px-2 pt-3 pb-4 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`block w-full text-left px-4 py-3 text-sm font-semibold tracking-wide rounded-lg ${
                  currentTab === item.id
                    ? 'bg-secondary text-primary font-bold'
                    : 'text-gray-200 hover:bg-white/10 hover:text-white'
                }`}
                id={`mobile-nav-item-${item.id}`}
              >
                {language === 'en' ? item.labelEn : item.labelSw}
              </button>
            ))}
            
            <button
              onClick={() => handleNavClick('admin')}
              className={`block w-full text-left px-4 py-3 text-sm font-bold text-secondary border-t border-white/5 ${
                currentTab === 'admin' ? 'bg-neutral-800' : 'hover:bg-white/5'
              }`}
              id="mobile-nav-item-admin"
            >
              🚀 {t.adminLabel}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
