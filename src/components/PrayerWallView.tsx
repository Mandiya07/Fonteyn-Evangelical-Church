import React, { useState, useEffect } from 'react';
import { Heart, Plus, Send, X } from 'lucide-react';
import { PrayerRequest } from '../types';

interface PrayerWallViewProps {
  language: 'en' | 'swati';
}

export default function PrayerWallView({ language }: PrayerWallViewProps) {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [newRequestText, setNewRequestText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/prayer-requests');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrayFor = async (id: string) => {
    try {
      const res = await fetch('/api/prayer-requests/pray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/prayer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: newRequestText, 
          isAnonymous, 
          isPrivate: false 
        })
      });
      setNewRequestText('');
      setShowForm(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-10">
          <h2 className="font-header text-4xl font-bold text-primary">
            {language === 'en' ? 'Community Prayer Wall' : 'Lugome lwemithwalo'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Share your burdens and lift up others in prayer. We are stronger together.' 
              : 'Yabelana ngetimfuno takho futsi ucamangele labanye emithwalweni yabo.'}
          </p>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-primary text-secondary px-6 py-3 rounded-full font-bold hover:bg-neutral-800 transition"
          >
            <Plus className="w-5 h-5" />
            {language === 'en' ? 'Post a Request' : 'Yenza Sicelo'}
          </button>
        </div>

        {/* Post Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8 animate-fade-in">
            <h3 className="font-header font-bold text-lg mb-4 text-primary">Share your need</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={newRequestText}
                onChange={(e) => setNewRequestText(e.target.value)}
                placeholder="How can we pray for you?"
                className="w-full p-4 border rounded-xl focus:ring-1 focus:ring-secondary outline-none"
                rows={3}
                required
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isAnonymous} 
                    onChange={(e) => setIsAnonymous(e.target.checked)} 
                    className="accent-primary"
                  />
                  <span className="text-sm">Post Anonymously</span>
                </label>
                <button type="submit" className="bg-secondary text-primary px-6 py-2 rounded-xl font-bold hover:bg-secondary/80 transition">
                  {language === 'en' ? 'Post Request' : 'Thumela'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Wall */}
        <div className="grid gap-6">
          {requests.map((req) => (
            <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="font-bold text-primary">{req.requesterName}</span>
                <span className="text-xs text-gray-400">{req.date}</span>
              </div>
              <p className="text-gray-700">{req.text}</p>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-gray-500 font-mono">
                  {req.prayedForCount || 0} {language === 'en' ? 'prayed for' : 'betfulwe'}
                </span>
                <button 
                  onClick={() => handlePrayFor(req.id)}
                  className="flex items-center gap-1 text-secondary px-3 py-1 rounded-full border border-secondary/20 hover:bg-secondary/10 transition text-sm"
                >
                  <Heart className="w-4 h-4 fill-secondary text-secondary" />
                  {language === 'en' ? 'Pray' : 'Bantfu'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
