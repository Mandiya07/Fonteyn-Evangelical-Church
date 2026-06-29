import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, RefreshCw, Quote } from 'lucide-react';

interface DailyScriptureData {
  verse: string;
  text: string;
  message: string;
  date?: string;
  isFallback?: boolean;
}

interface DailyScriptureProps {
  language: 'en' | 'swati';
}

export default function DailyScripture({ language }: DailyScriptureProps) {
  const [scripture, setScripture] = useState<DailyScriptureData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchScripture = async (forceRefresh = false) => {
    setIsLoading(true);
    setError('');
    try {
      const url = `/api/ai/daily-scripture?lang=${language === 'en' ? 'en' : 'swati'}${forceRefresh ? '&refresh=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch scripture');
      }
      const data = await res.json();
      setScripture(data);
    } catch (err: any) {
      console.error('Error fetching daily scripture:', err);
      setError(
        language === 'en'
          ? "Unable to load today's daily scripture promise."
          : 'Yehhlulekile kulayisha livi lesithembiso selanga lamuhla.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScripture();
  }, [language]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-150 relative overflow-hidden transition-all duration-300 hover:shadow-xl" id="daily-scripture-card">
      {/* Decorative colored top accent line */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>
      
      {/* Background radial soft light accents */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-secondary/5 rounded-full blur-xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-4" id="daily-scripture-loading">
          <RefreshCw className="w-8 h-8 text-secondary animate-spin" />
          <p className="text-xs text-gray-500 font-medium font-sans animate-pulse">
            {language === 'en' ? 'Unfolding God\'s promise... Please wait' : 'Ivula livi lesithembiso... Sicela ume kancane'}
          </p>
        </div>
      ) : error ? (
        <div className="py-10 text-center space-y-4" id="daily-scripture-error">
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button
            onClick={() => fetchScripture(true)}
            className="px-5 py-2.5 bg-primary text-secondary text-xs font-bold font-header uppercase rounded-xl hover:bg-neutral-800 transition shadow-sm cursor-pointer"
          >
            {language === 'en' ? 'Try Again' : 'Etama Kabusha'}
          </button>
        </div>
      ) : scripture ? (
        <div className="space-y-6 animate-fade-in" id="daily-scripture-content">
          {/* Header section with sparkles icon */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/15 text-primary border border-secondary/25 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-secondary" />
                {language === 'en' ? 'Today\'s Promise' : 'Sithembiso Selanga'}
              </span>
              <h3 className="font-header text-xl font-bold text-primary tracking-tight">
                {language === 'en' ? 'Daily Scripture' : 'Livi Selanga'}
              </h3>
            </div>
            
            {/* Display localized date */}
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono shrink-0">
              {new Date(scripture.date || new Date()).toLocaleDateString(language === 'en' ? 'en-US' : 'ss-SZ', {
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Scripture Quotation block */}
          <div className="bg-supporting rounded-2xl p-5 border-l-4 border-secondary relative">
            <Quote className="absolute top-4 right-4 w-8 h-8 text-secondary/10 pointer-events-none" />
            <div className="flex items-center space-x-2 text-secondary mb-2">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="font-header font-bold text-xs uppercase tracking-wider">{scripture.verse}</span>
            </div>
            <p className="font-sans font-medium italic text-gray-800 text-xs sm:text-sm leading-relaxed">
              "{scripture.text}"
            </p>
          </div>

          {/* Reflection Message from Gemini */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase font-header">
              {language === 'en' ? 'Pastoral Encouragement' : 'Sikhutsazo Sabelusi'}
            </h4>
            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed font-sans">
              {scripture.message}
            </p>
          </div>

          {/* Footer controls */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-[10px] text-gray-400">
            <span>
              {scripture.isFallback
                ? (language === 'en' ? 'Offline standby active' : 'Imodi ye-Offline ivuliwe')
                : (language === 'en' ? 'Daily bread from Gemini AI' : 'Kudla selanga lokuvela ku-Gemini AI')
              }
            </span>
            <button
              onClick={() => fetchScripture(true)}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 font-bold text-primary hover:text-secondary group transition cursor-pointer"
              id="refresh-scripture-btn"
            >
              <RefreshCw className={`w-3 h-3 text-primary group-hover:text-secondary ${isLoading ? 'animate-spin' : 'group-hover:rotate-45'} transition duration-300`} />
              <span>{language === 'en' ? 'Seek Another Promise' : 'Funa Lelinye Sithembiso'}</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
