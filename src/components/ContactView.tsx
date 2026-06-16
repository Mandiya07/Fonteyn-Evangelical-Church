import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Heart, Calendar, Clock, CheckCircle, AlertOctagon } from 'lucide-react';

interface ContactViewProps {
  language: 'en' | 'swati';
}

export default function ContactView({ language }: ContactViewProps) {
  // Counseling booking form state
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitType, setVisitType] = useState('Spiritual Counseling');
  const [requestDate, setRequestDate] = useState('');
  const [requestTime, setRequestTime] = useState('10:00 AM');
  const [notes, setNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // General email contact state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactType, setContactType] = useState('Prayer Request');
  const [contactText, setContactText] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorEmail.trim() || !requestDate) return;
    setBookingSuccess(true);
    setVisitorName('');
    setVisitorEmail('');
    setNotes('');
    setTimeout(() => setBookingSuccess(false), 5000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactText.trim()) return;
    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactText('');
    setTimeout(() => setContactSuccess(false), 5000);
  };

  return (
    <div className="py-12 bg-white font-sans animate-fade-in" id="contact-counseling-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header block">
            Reach Out • Sitsasele
          </span>
          <h1 className="font-header text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Counseling & Contact
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Book home or hospital visits, coordinate counseling schedules, or drop us a message about any church inquire.
          </p>
        </div>

        {/* DETAILS PANEL ROW: DIRECTORY + MAP VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Directory details & WhatsApp links (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 text-left" id="contact-directory-column">
            
            <div className="bg-supporting/45 p-6 rounded-3xl border border-gray-150 space-y-5">
              <h3 className="font-header text-sm font-bold text-primary uppercase tracking-widest pb-1 border-b">
                Contact Address & Details
              </h3>

              <div className="space-y-4 font-sans text-xs sm:text-sm text-gray-750">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary font-header text-xs tracking-wide">Physical Location</strong>
                    <p className="mt-0.5 leading-relaxed font-sans text-xs">
                      Fonteyn, Mbabane, Eswatini <br />
                      <span className="text-gray-500 font-mono text-[10px] block mt-1">
                        GPS Coordinates: -26.32604, 31.1411
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary font-header text-xs tracking-wide">Postal Address</strong>
                    <p className="mt-0.5 font-sans text-xs">P.O. Box 8560, Mbabane, Eswatini</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary font-header text-xs tracking-wide">Telephone Numbers</strong>
                    <p className="mt-0.5 font-mono text-xs leading-normal font-semibold text-gray-900">
                      +268 7605 8257 (Public Helpline) <br />
                      +268 7605 8257 (Counseling Booking)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary font-header text-xs tracking-wide">Email Communications</strong>
                    <p className="mt-0.5 font-semibold text-xs">office@fonteynchurch.org <br /> counselor@fonteynchurch.org</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary font-header text-xs tracking-wide">Service Times</strong>
                    <p className="mt-0.5 font-semibold text-xs text-gray-700 leading-normal">
                      Sunday Bible Study: 10:00 AM <br />
                      Sunday Main Service: 11:00 AM <br />
                      Wednesday Prayer: 05:30 PM
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <strong className="text-primary font-header text-[11px] tracking-wide block uppercase">Denominational Connection</strong>
                  <p className="mt-1 text-xs text-gray-600 leading-normal font-sans">
                    Fonteyn Evangelical Church is a branch of the Evangelical Church denomination in Eswatini, proud to be part of the wider Evangelical Church Eswatini network.
                  </p>
                </div>
              </div>
            </div>

            {/* Immediate Help Call Actions */}
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl space-y-4 text-left">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-emerald-600 animate-pulse" />
                </div>
                <h4 className="font-header text-xs sm:text-sm font-bold text-emerald-950 uppercase tracking-wide">Urgent WhatsApp counseling</h4>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed font-sans font-medium">
                Need urgent intercessory prayer or facing a domestic crisis? Connect immediately on WhatsApp to chat directly with our Pastor on duty.
              </p>
              <a 
                href="https://wa.me/26876058257"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-header font-bold text-xs rounded-xl shadow transition duration-200 uppercase tracking-widest items-center justify-center space-x-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 shrink-0 fill-white text-emerald-500" />
                <span>Chat with Pastor</span>
              </a>
            </div>

            {/* Emergency Counseling hotline details */}
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-xs text-red-800 space-y-0.5 font-sans">
                <strong>Emergency Pastoral Visitations</strong>
                <p className="text-[11px] leading-relaxed text-red-700">For emergency hospital visit actions or urgent funeral notices, please dial the Senior Pastor hotline directly on +268 7605 8257.</p>
              </div>
            </div>
          </div>

          {/* Column 2: Maps Simulator (7 Cols) */}
          <div className="lg:col-span-7 bg-supporting p-5 rounded-3xl border border-gray-150 text-center space-y-4" id="map-preview-column">
            <h3 className="font-header text-xs font-bold text-primary tracking-widest uppercase block text-left">
              Church Geography Location
            </h3>

            {/* Map iframe */}
            <div className="relative h-64 sm:h-[350px] bg-sky-200 rounded-2xl border border-gray-150 overflow-hidden shadow-inner">
               <iframe
                 title="Google Maps Location"
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113642.48421884632!2d31.066453163351336!3d-26.315024765792916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ee8cef88b4eb14b%3A0xe53bc9f77c38c823!2sMbabane%2C%20Eswatini!5e0!3m2!1sen!2sus!4v1718000000000!5m2!1sen!2sus"
                 width="100%"
                 height="100%"
                 style={{ border: 0 }}
                 allowFullScreen={true}
                 loading="lazy"
                 referrerPolicy="no-referrer-when-downgrade"
               />
            </div>
          </div>
        </div>

        {/* BOOK COUNSELING OR VISITATION SHEET SLOTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          
          {/* BOOK CELL SLOTS Form */}
          <div className="bg-supporting p-6 sm:p-8 rounded-3xl border text-left space-y-4" id="counseling-booking-panel">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-header text-xs sm:text-sm font-bold text-primary uppercase tracking-wider">Book Counseling / Visits</h3>
            </div>
            <p className="text-xs text-gray-500 leading-normal font-sans">
              Schedule direct personal dialogues with our senior counselors. Available for couples, spiritual queries, home/hospital communion runs.
            </p>

            {bookingSuccess ? (
              <div className="p-6 bg-white border border-secondary/20 rounded-2xl text-center space-y-2 animate-zoom-in text-primary">
                <CheckCircle className="w-8 h-8 text-secondary mx-auto" />
                <h4 className="font-header text-sm font-bold">visitation Slot Reserved</h4>
                <p className="text-xs text-gray-650 leading-relaxed max-w-sm mx-auto">
                  Amen! We have recorded your coordinates. An elder or pastor will contact you on your email to confirm the home-run/office counseling visit setup.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3.5 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 font-bold uppercase">Your name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Your name"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-2.5 border border-gray-200 focus:ring-1 focus:ring-secondary rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 font-bold uppercase">Email / phone</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Email or phone"
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-2.5 border border-gray-200 focus:ring-1 focus:ring-secondary rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-1 space-y-1">
                    <label className="text-[9px] text-gray-500 font-bold uppercase">visitation Type</label>
                    <select
                      value={visitType}
                      onChange={(e) => setVisitType(e.target.value)}
                      className="w-full bg-white text-xs px-2 py-2.5 border border-gray-200 rounded-xl outline-none"
                    >
                      <option value="Spiritual Counseling">Office counseling</option>
                      <option value="Home visit">Request Home visit</option>
                      <option value="Hospital visit">Request Hospital visit</option>
                      <option value="Marriage Guidance">Marriage Guidance</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 font-bold uppercase">Requested Date</label>
                    <input 
                      type="date" 
                      required
                      value={requestDate}
                      onChange={(e) => setRequestDate(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-2 border border-gray-200 rounded-xl outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 font-bold uppercase">Preferred Hours</label>
                    <select
                      value={requestTime}
                      onChange={(e) => setRequestTime(e.target.value)}
                      className="w-full bg-white text-xs px-2 py-2.5 border border-gray-200 rounded-xl outline-none"
                    >
                      <option value="10:00 AM">10:00 AM (Morning)</option>
                      <option value="02:00 PM">02:00 PM (Afternoon)</option>
                      <option value="06:00 PM">06:00 PM (Evening)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase">Brief Details or Prayer Request (Optional)</label>
                  <textarea 
                    rows={2}
                    placeholder="Provide any context so our spiritual advisors are prepared..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary text-secondary font-header font-bold text-xs rounded-xl hover:bg-neutral-800 transition tracking-wider uppercase cursor-pointer"
                >
                  Schedule Appointment
                </button>
              </form>
            )}
          </div>

          {/* GENERAL EMAIL CONTACT FORM */}
          <div className="bg-supporting p-6 sm:p-8 rounded-3xl border text-left space-y-4" id="general-contact-form-panel">
            <h3 className="font-header text-xs sm:text-sm font-bold text-primary uppercase tracking-wider">Submit Prayer & Contact</h3>
            <p className="text-xs text-gray-500 leading-normal font-sans">
              Need prayer? Want to contact the pastoral team directly? Leave a message below and we will stand with you or respond accordingly.
            </p>

            {contactSuccess ? (
              <div className="p-6 bg-white border border-secondary/20 rounded-2xl text-center space-y-2 animate-zoom-in text-primary">
                <CheckCircle className="w-8 h-8 text-secondary mx-auto" />
                <h4 className="font-header text-sm font-bold">Message Dispatched!</h4>
                <p className="text-xs text-gray-650 max-w-sm mx-auto">
                  We have received your communications. A church administrator or pastor will read and respond to your email address soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3.5 pt-2">
                <div className="grid grid-cols-2 gap-3.5">
                   <div className="space-y-1">
                     <label className="text-[9px] text-gray-500 font-bold uppercase">Your name</label>
                     <input 
                       type="text" 
                       required
                       placeholder="Full name"
                       value={contactName}
                       onChange={(e) => setContactName(e.target.value)}
                       className="w-full bg-white text-xs px-3 py-2.5 border border-gray-200 focus:ring-1 focus:ring-secondary rounded-xl outline-none"
                     />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[9px] text-gray-500 font-bold uppercase">your email</label>
                     <input 
                       type="email" 
                       required
                       placeholder="email@address.com"
                       value={contactEmail}
                       onChange={(e) => setContactEmail(e.target.value)}
                       className="w-full bg-white text-xs px-3 py-2.5 border border-gray-200 focus:ring-1 focus:ring-secondary rounded-xl outline-none"
                     />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[9px] text-gray-500 font-bold uppercase">Message / Request Type</label>
                   <select
                     value={contactType}
                     onChange={(e) => setContactType(e.target.value)}
                     className="w-full bg-white text-xs px-2 py-2.5 border border-gray-200 rounded-xl outline-none"
                   >
                     <option value="Prayer Request">Submit Prayer Request</option>
                     <option value="Book Counseling">Book Counseling Session</option>
                     <option value="Home Visit">Request Home Visit</option>
                     <option value="Hospital Visit">Request Hospital Visit</option>
                     <option value="Contact Pastors">Contact Pastoral Team</option>
                   </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase">Your message / request</label>
                  <textarea 
                    required
                    rows={3.5}
                    placeholder="How can we stand in faith with you..."
                    value={contactText}
                    onChange={(e) => setContactText(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-secondary text-primary font-header font-bold text-xs rounded-xl hover:bg-primary hover:text-white transition tracking-wider uppercase cursor-pointer"
                >
                  Send Submission
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
