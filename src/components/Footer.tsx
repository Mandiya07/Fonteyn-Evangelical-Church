import React from 'react';
import { Mail, Phone, MapPin, ExternalLink, MessageCircle, Clock } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  language: 'en' | 'swati';
}

export default function Footer({ setCurrentTab, language }: FooterProps) {
  const t = {
    quickLinks: language === 'en' ? 'Quick Navigation' : 'Tisetsetselo',
    serviceHours: language === 'en' ? 'Weekly Service Times' : 'Tikhathi Taka Sontfo',
    contactTitle: language === 'en' ? 'Get In Touch' : 'Sitsasele',
    sundayMorning: language === 'en' ? 'Sunday Morning Worship: ' : 'Kukhonza Kwasontfo Kuliphi: ',
    sundayEvening: language === 'en' ? 'Sunday Evening Service: ' : 'Kukhonza Kwasontfo Kutsambama: ',
    midweekPrayer: language === 'en' ? 'Friday Prayer & Deliverance: ' : 'Friday Prayer & Deliverance: ',
    locationDetail: language === 'en' ? 'Fonteyn Main Road, Mbabane, Eswatini' : 'Fonteyn Main Road, Mbabane, Eswatini',
    legal: language === 'en' ? '© 2026 Fonteyn Evangelical Church. Built with faith, serving Eswatini.' : '© 2026 Fonteyn Evangelical Church. Built with faith, serving Eswatini.',
  };

  return (
    <footer className="bg-neutral-950 border-t-4 border-secondary text-gray-300 font-sans" id="church-universal-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Church Bio */}
          <div className="space-y-4" id="footer-col-bio">
            <h4 className="font-header text-sm font-bold text-white tracking-widest uppercase">
              Fonteyn Evangelical Church
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Living God's Word, walk in His sovereign love, and growing together in authentic Christian discipleship. Serving the capital of Mbabane, Eswatini since 1994.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://wa.me/26876058257"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl transition"
                title="WhatsApp Pastor on Duty"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="mailto:office@fonteynchurch.org"
                className="p-2 bg-secondary/15 hover:bg-secondary/35 text-secondary border border-secondary/20 rounded-xl transition"
                title="Email Office"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4" id="footer-col-links">
            <h4 className="font-header text-sm font-bold text-white tracking-widest uppercase">
              {t.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { tab: 'home', label: language === 'en' ? 'Welcome Home' : 'Ekhaya' },
                { tab: 'about', label: language === 'en' ? 'Our History & Beliefs' : 'Ngatsi' },
                { tab: 'sermons', label: language === 'en' ? 'Sermons Library' : 'Tishumayelo' },
                { tab: 'events', label: language === 'en' ? 'Upcoming Calendar' : 'Temicimbi' },
                { tab: 'ministries', label: language === 'en' ? 'Church Ministries' : 'Tingoni' },
                { tab: 'outreach', label: language === 'en' ? 'Community Outreach' : 'Kusita Umphakatsi' },
                { tab: 'bible', label: language === 'en' ? 'Bible Center' : 'LiBhayibheli' },
                { tab: 'blog', label: language === 'en' ? 'News & Blog' : 'Tindzaba Talibandla' },
                { tab: 'media', label: language === 'en' ? 'Media Center' : 'Tindzaba' },
                { tab: 'contact', label: language === 'en' ? 'Prayer & counseling' : 'Counseling' },
              ].map((link, i) => (
                <li key={i}>
                  <button
                    onClick={() => setCurrentTab(link.tab)}
                    className="hover:text-secondary flex items-center gap-1.5 transition duration-150 group text-gray-400 font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary scale-0 group-hover:scale-100 transition-transform"></span>
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Service Times */}
          <div className="space-y-4" id="footer-col-times">
            <h4 className="font-header text-sm font-bold text-white tracking-widest uppercase flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-secondary shrink-0" />
              <span>{t.serviceHours}</span>
            </h4>
            <div className="space-y-4 text-xs text-gray-400 leading-relaxed font-sans">
              <div>
                <span className="text-white font-semibold block">Sunday Services</span>
                <span>Bible Study at 10:00 AM <br />Main Service at 11:00 AM</span>
              </div>
              <div>
                <span className="text-white font-semibold block">Midweek & Monday Grace</span>
                <span>Mon: Fathers' Fellowship (05:30 PM) <br />Wed: Prayer Service (05:30 PM)</span>
              </div>
              <div>
                <span className="text-white font-semibold block">Saturday Fellowships</span>
                <span>Mothers' Fellowship at 11:00 AM <br />Youth Fellowship at 01:00 PM</span>
              </div>
            </div>
          </div>

          {/* Column 4: Contact details */}
          <div className="space-y-4" id="footer-col-contact">
            <h4 className="font-header text-sm font-bold text-white tracking-widest uppercase">
              {t.contactTitle}
            </h4>
            <ul className="space-y-3.5 text-xs text-gray-400 font-sans">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <div>
                  <span>Fonteyn, Mbabane, Eswatini</span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">P.O. Box 8560</span>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-secondary shrink-0" />
                <span>+268 7605 8257</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-secondary shrink-0" />
                <span>office@fonteynchurch.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider and Copyright */}
        <div className="mt-12 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-gray-500">
          <div>{t.legal}</div>
          <div className="flex space-x-4">
            <span className="text-secondary font-semibold">Fonteyn, Mbabane, Eswatini</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
