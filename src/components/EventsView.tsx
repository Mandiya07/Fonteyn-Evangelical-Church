import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Clock, CheckCircle, Hand, AlertCircle, Heart, Notebook } from 'lucide-react';
import { ChurchEvent } from '../types';

interface EventsViewProps {
  language: 'en' | 'swati';
}

export default function EventsView({ language }: EventsViewProps) {
  const [eventsList, setEventsList] = useState<ChurchEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  
  // RSVP Form state
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  // Volunteer state
  const [selectedRole, setSelectedRole] = useState('');
  const [volunteerEmail, setVolunteerEmail] = useState('');
  const [volunteerSuccess, setVolunteerSuccess] = useState(false);
  const [volunteerError, setVolunteerError] = useState('');

  // Calendar configuration
  const [currentMonth, setCurrentMonth] = useState<'June' | 'July'>('June');
  const [calendarView, setCalendarView] = useState<'monthly' | 'weekly' | 'agenda'>('monthly');
  const [wantsReminders, setWantsReminders] = useState(false);


  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEventsList(data);
      if (data.length > 0 && !selectedEvent) {
        setSelectedEvent(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Sync selected event when events list reloads
  useEffect(() => {
    if (selectedEvent) {
      const updated = eventsList.find(e => e.id === selectedEvent.id);
      if (updated) setSelectedEvent(updated);
    }
  }, [eventsList]);

  // Handle RSVP
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpEmail.trim() || !selectedEvent) return;

    try {
      const res = await fetch('/api/events/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          email: rsvpEmail.trim(),
          wantsReminders
        })
      });
      if (res.ok) {
        setRsvpSuccess(true);
        setRsvpEmail('');
        fetchEvents(); // reload database counts
        setTimeout(() => setRsvpSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Volunteer
  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !volunteerEmail.trim() || !selectedEvent) return;
    setVolunteerError('');

    try {
      const res = await fetch('/api/events/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          roleName: selectedRole,
          email: volunteerEmail.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setVolunteerError(data.error || 'Failed to sign up.');
      } else {
        setVolunteerSuccess(true);
        setVolunteerEmail('');
        setSelectedRole('');
        fetchEvents();
        setTimeout(() => setVolunteerSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Render a mock calendar month grid
  const renderCalendarMonth = () => {
    const daysInMonth = currentMonth === 'June' ? 30 : 31;
    const startOffset = currentMonth === 'June' ? 1 : 3; // Mock offsets
    const days = [];

    // Push preceding blanks
    for (let b = 0; b < startOffset; b++) {
      days.push(<div key={`blank-${b}`} className="h-10 sm:h-12 border bg-gray-50/50"></div>);
    }

    // Determine active days that contain events
    // Event 1 is June 20, Event 2 is July 4, Event 3 is July 18
    for (let d = 1; d <= daysInMonth; d++) {
      let isEventDay = false;
      let matchingEv: ChurchEvent | null = null;
      
      if (currentMonth === 'June' && d === 20) {
        isEventDay = true;
        matchingEv = eventsList.find(e => e.id === 'event-1') || null;
      } else if (currentMonth === 'July' && d === 4) {
        isEventDay = true;
        matchingEv = eventsList.find(e => e.id === 'event-2') || null;
      } else if (currentMonth === 'July' && d === 18) {
        isEventDay = true;
        matchingEv = eventsList.find(e => e.id === 'event-3') || null;
      }

      days.push(
        <div 
          key={`day-${d}`} 
          onClick={() => {
            if (matchingEv) setSelectedEvent(matchingEv);
          }}
          className={`h-11 sm:h-14 border p-1 text-left flex flex-col justify-between cursor-pointer group relative ${
            isEventDay 
              ? 'bg-secondary/15 border-secondary/60 hover:bg-secondary/30 transition' 
              : 'bg-white hover:bg-supporting transition'
          }`}
        >
          <span className={`text-[10px] sm:text-xs font-semibold ${isEventDay ? 'text-primary font-bold' : 'text-gray-400'}`}>
            {d}
          </span>
          {isEventDay && (
            <span className="h-2 w-2 rounded-full bg-secondary block self-end animate-ping"></span>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="py-12 bg-white font-sans animate-fade-in" id="events-center-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase font-header block">
            Communion & Fellowship Calendar
          </span>
          <h1 className="font-header text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Events System
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Review detailed timetables, signup for volunteer service teams, or secure seats for upcoming spiritual seminars.
          </p>
        </div>

        {/* TWO COLUMN PLATFORM LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: INTERACTIVE MONTHLY MATRIX & EVENT AGENDA LIST (5 Cols) */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-6" id="calendar-view-pane">
            <div className="bg-supporting p-5 rounded-3xl border border-gray-150 space-y-4">
              {/* Calendar Control Header */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-3" id="calendar-header-controls">
                <h3 className="font-header text-sm font-bold text-primary flex items-center gap-1.5 uppercase">
                  <Calendar className="w-4 h-4 text-secondary shrink-0" />
                  <span>Church Calendar</span>
                </h3>

                <div className="flex bg-white rounded-lg p-0.5 border text-[10px] font-bold">
                  {['monthly', 'weekly', 'agenda'].map(view => (
                    <button
                      key={view}
                      onClick={() => setCalendarView(view as any)}
                      className={`px-3 py-1 rounded transition uppercase ${
                        calendarView === view ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-primary'
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>

              {calendarView === 'monthly' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex bg-white rounded-lg p-0.5 border text-[11px] font-bold w-fit mx-auto mt-2">
                    <button 
                      onClick={() => setCurrentMonth('June')}
                      className={`px-3 py-1 rounded transition ${currentMonth === 'June' ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary'}`}
                    >
                      JUNE 2026
                    </button>
                    <button 
                      onClick={() => setCurrentMonth('July')}
                      className={`px-3 py-1 rounded transition ${currentMonth === 'July' ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary'}`}
                    >
                      JULY 2026
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-primary uppercase tracking-wider font-header pb-1" id="calendar-days-titles">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                      <span key={i}>{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 mt-1 font-mono" id="calendar-cells-grid">
                    {renderCalendarMonth()}
                  </div>
                </div>
              )}

              {calendarView === 'weekly' && (
                <div className="space-y-4 animate-fade-in mt-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[11px] font-bold text-primary uppercase">Week of Jun 14 - Jun 20</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                     {['Sun 14', 'Mon 15', 'Tue 16', 'Wed 17', 'Thu 18', 'Fri 19', 'Sat 20'].map((d, i) => {
                       // Find if there's an event this day (Mock data puts event on June 20)
                       const hasEvent = d === 'Sat 20';
                       return (
                         <div key={i} className="bg-white border rounded-lg p-2 min-h-[100px] flex flex-col justify-start">
                           <span className={`text-[10px] font-bold uppercase ${hasEvent ? 'text-secondary' : 'text-gray-500'}`}>{d}</span>
                           {hasEvent && eventsList.map((ev) => {
                              if (ev.id === 'event-1') {
                                return (
                                  <div 
                                    key={ev.id}
                                    onClick={() => setSelectedEvent(ev)}
                                    className="mt-2 p-1.5 bg-secondary/10 border border-secondary/30 rounded text-[9px] font-bold text-primary cursor-pointer hover:bg-secondary/20 transition leading-tight"
                                  >
                                    {ev.time} - {ev.title}
                                  </div>
                                )
                              }
                           })}
                         </div>
                       )
                     })}
                  </div>
                </div>
              )}

              {calendarView === 'agenda' && (
                <div className="space-y-3 animate-fade-in mt-2">
                  {eventsList.map((ev) => (
                    <div 
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`p-3.5 border rounded-xl text-left cursor-pointer transition-all duration-200 ${
                        selectedEvent?.id === ev.id 
                          ? 'border-secondary bg-secondary/5 ring-1 ring-secondary/20 shadow-xs' 
                          : 'bg-white border-gray-200 hover:border-secondary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold font-mono uppercase tracking-wide">{ev.date}</span>
                        <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">{ev.time}</span>
                      </div>
                      <h5 className="font-header text-sm font-bold text-primary mt-1 line-clamp-1">{ev.title}</h5>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: RICH EVENT SELECTION MANAGEMENT PANEL (7 Cols) */}
          <div className="lg:col-span-12 xl:col-span-7" id="event-management-details">
            {selectedEvent ? (
              <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-md animate-zoom-in" id="event-active-focused-card">
                {/* Event Cover Image */}
                <div className="relative h-48 sm:h-64 bg-primary flex items-end">
                  {selectedEvent.image ? (
                    <img loading="lazy" src={selectedEvent.image} alt={selectedEvent.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-neutral-900 border-b border-white/5 opacity-50 flex items-center justify-center">
                       <Notebook className="w-20 h-20 text-white/5" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="relative z-10 p-5 sm:p-7 text-left space-y-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-secondary text-primary font-bold tracking-widest uppercase inline-block">
                      {selectedEvent.date}
                    </span>
                    <h2 className="font-header text-base sm:text-xl md:text-2xl font-bold text-white leading-tight">
                      {selectedEvent.title}
                    </h2>
                  </div>
                </div>

                {/* Info and Registration Body */}
                <div className="p-6 sm:p-8 space-y-6 text-left">
                  {/* Location & timing info bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-100 pb-5 text-xs text-gray-650 font-sans font-medium" id="event-timing-subpanel">
                    <div className="flex items-center space-x-2.5">
                      <Clock className="w-4 h-4 text-secondary shrink-0" />
                      <span>{selectedEvent.time}</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <MapPin className="w-4 h-4 text-secondary shrink-0" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  </div>

                  {/* Narrative details */}
                  <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-gray-650" id="event-narrative-p">
                    <h4 className="font-header text-xs font-bold text-primary uppercase tracking-widest">Description</h4>
                    <p>{selectedEvent.description}</p>
                  </div>

                  <div className="bg-supporting/45 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="attendance-headcount-badge">
                    <div className="flex items-center space-x-3 text-xs">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{selectedEvent.registeredCount} believers registered</span>
                        <span className="text-[10px] text-gray-500 block">Seat allocations are open. RSVP to receive email notifications.</span>
                      </div>
                    </div>
                    
                    {/* Attendance Admin Mock Section */}
                    <div className="flex space-x-2">
                       <button
                         onClick={() => alert("Opening Attendance Management Dashboard...")}
                         className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-[10px] font-bold rounded-lg hover:border-secondary transition shrink-0 uppercase tracking-widest"
                       >
                         Manage Attendance
                       </button>
                    </div>
                  </div>

                  {/* Registration form & Volunteer coordination tabs split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Secure RSVP Form */}
                    <div className="bg-supporting p-5 rounded-2xl space-y-3.5" id="rsvp-card-panel">
                      <h4 className="font-header text-xs font-bold text-primary uppercase tracking-widest">Attend Event RSVP</h4>
                      
                      {rsvpSuccess ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl space-y-1 text-center animate-zoom-in text-emerald-800">
                          <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto" />
                          <span className="text-xs font-bold block">RSVP Registered!</span>
                          <span className="text-[10px] text-emerald-700 block">We sent details to your inbox. Welcome!</span>
                        </div>
                      ) : (
                        <form onSubmit={handleRsvpSubmit} className="space-y-3">
                          <input 
                            type="email" 
                            required
                            placeholder="Enter your email"
                            value={rsvpEmail}
                            onChange={(e) => setRsvpEmail(e.target.value)}
                            className="bg-white w-full text-xs px-3 py-2.5 border border-gray-200 focus:ring-1 focus:ring-secondary rounded-xl outline-none"
                          />
                          <div className="flex items-center space-x-2 pt-1 pb-1">
                            <input
                              type="checkbox"
                              id="reminders-check"
                              checked={wantsReminders}
                              onChange={(e) => setWantsReminders(e.target.checked)}
                              className="w-3.5 h-3.5 accent-secondary"
                            />
                            <label htmlFor="reminders-check" className="text-[10px] text-gray-600 font-medium cursor-pointer">
                              Send me event reminders via email
                            </label>
                          </div>
                          <button
                            type="submit"
                            className="w-full py-2.5 bg-primary text-secondary font-bold text-xs rounded-xl hover:bg-neutral-800 transition uppercase tracking-wider cursor-pointer"
                          >
                            Reserve Seat
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Volunteer role sign-up panel */}
                    <div className="bg-supporting p-5 rounded-2xl space-y-3.5" id="volunteer-card-panel">
                      <h4 className="font-header text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                        <Hand className="w-4 h-4 text-secondary shrink-0 animate-bounce" />
                        <span>Support as Volunteer</span>
                      </h4>

                      {volunteerSuccess ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl space-y-1 text-center animate-zoom-in text-emerald-800">
                          <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto" />
                          <span className="text-xs font-bold block">Volunteer Registered!</span>
                          <span className="text-[10px] text-emerald-700 block">Ministry Lead Sandile will reach out. Blessings!</span>
                        </div>
                      ) : (
                        <form onSubmit={handleVolunteerSubmit} className="space-y-3">
                          {volunteerError && (
                            <div className="text-[10px] text-red-500 flex items-center gap-1 bg-red-50 p-2 rounded">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              <span>{volunteerError}</span>
                            </div>
                          )}

                          <select
                            required
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="bg-white text-xs px-2 py-2.5 w-full border border-gray-200 rounded-xl outline-none"
                          >
                            <option value="">Select Volunteer Role</option>
                            {selectedEvent.volunteers.map((v, i) => (
                              <option key={i} value={v.role} disabled={v.filled.length >= v.slots}>
                                {v.role} ({v.slots - v.filled.length} slots left)
                              </option>
                            ))}
                          </select>
                          
                          <input 
                            type="email" 
                            required
                            placeholder="Your volunteer email"
                            value={volunteerEmail}
                            onChange={(e) => setVolunteerEmail(e.target.value)}
                            className="bg-white w-full text-xs px-3 py-2.5 border border-gray-200 focus:ring-1 focus:ring-secondary rounded-xl outline-none"
                          />

                          <button
                            type="submit"
                            className="w-full py-2.5 bg-secondary text-primary font-bold text-xs rounded-xl hover:bg-primary hover:text-white transition uppercase tracking-wider cursor-pointer"
                          >
                            Sign Up
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 border border-dashed rounded-3xl bg-gray-50 flex flex-col items-center justify-center text-center space-y-3">
                <Calendar className="w-12 h-12 text-gray-300" />
                <h4 className="font-header text-sm font-semibold">Select an event from the calendar grid</h4>
                <p className="text-xs text-gray-400">Click any colored cell in the month track to focus on details, reserve seats, or manage volunteer spots.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
