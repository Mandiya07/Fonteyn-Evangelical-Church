import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface AITranslatorProps {
  text: string;
  targetLanguage: 'en' | 'swati';
  className?: string;
  as?: React.ElementType;
}

// Global cache to avoid redundant API calls
const translationCache: Record<string, Record<string, string>> = {
  en: {},
  swati: {}
};

export default function AITranslator({ text, targetLanguage, className = '', as: Tag = 'span' }: AITranslatorProps) {
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If English is the target or text is empty, just use original
    // Assuming base text is English. In a real scenario we'd do a better check.
    if (targetLanguage === 'en' || !text.trim()) {
      setTranslatedText(text);
      return;
    }

    if (translationCache[targetLanguage][text]) {
      setTranslatedText(translationCache[targetLanguage][text]);
      return;
    }

    const fetchTranslation = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLanguage })
        });
        const data = await res.json();
        const translated = data.translatedText || text;
        translationCache[targetLanguage][text] = translated;
        setTranslatedText(translated);
      } catch (err) {
        console.error('Translation failed:', err);
        setTranslatedText(text); // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslation();
  }, [text, targetLanguage]);

  return (
    <Tag className={`relative inline-block ${className}`}>
      {isLoading ? (
        <span className="inline-flex items-center gap-1 opacity-70">
          <Loader2 className="w-3 h-3 animate-spin" /> Translating...
        </span>
      ) : (
        <span className="animate-fade-in">{translatedText}</span>
      )}
    </Tag>
  );
}
