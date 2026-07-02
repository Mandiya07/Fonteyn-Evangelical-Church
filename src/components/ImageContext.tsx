import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AppImages {
  pastor: string;
  hero: string;
  ministry_children: string;
  ministry_youth: string;
  ministry_young_adults: string;
  ministry_men: string;
  ministry_women: string;
  ministry_family: string;
  ministry_evangelism: string;
  ministry_worship: string;
  ministry_prayer: string;
  ministry_outreach: string;
  ministry_preschool: string;
  [key: string]: string;
}

interface ImageContextType {
  images: AppImages;
  isLoading: boolean;
  updateMapping: (key: string, url: string) => Promise<boolean>;
  uploadFile: (file: File) => Promise<string | null>;
  refreshImages: () => Promise<void>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

const FALLBACKS: AppImages = {
  pastor: "",
  hero: "",
  ministry_children: "",
  ministry_youth: "",
  ministry_young_adults: "",
  ministry_men: "",
  ministry_women: "",
  ministry_family: "",
  ministry_evangelism: "",
  ministry_worship: "",
  ministry_prayer: "",
  ministry_outreach: "",
  ministry_preschool: "",
};

function sanitizeAppImages(data: any): AppImages {
  const sanitized = { ...FALLBACKS, ...data };
  const cb = Date.now().toString();
  for (const key of Object.keys(sanitized)) {
    const val = sanitized[key];
    if (typeof val === 'string') {
      if (val) {
        try {
          if (val.startsWith('http://') || val.startsWith('https://')) {
            const parsed = new URL(val);
            parsed.searchParams.set('cb', cb);
            sanitized[key] = parsed.toString();
          } else {
            const separator = val.includes('?') ? '&' : '?';
            sanitized[key] = `${val}${separator}cb=${cb}`;
          }
        } catch (e) {
          const separator = val.includes('?') ? '&' : '?';
          sanitized[key] = `${val}${separator}cb=${cb}`;
        }
      }
    }
  }
  return sanitized;
}

export function ImageProvider({ children }: { children: React.ReactNode }) {
  const [images, setImages] = useState<AppImages>(FALLBACKS);
  const [isLoading, setIsLoading] = useState(true);

  const refreshImages = async () => {
    try {
      const res = await fetch(`/api/images?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setImages(sanitizeAppImages(data));
      }
    } catch (err) {
      console.error('Failed to fetch image mapping:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshImages();
  }, []);

  const updateMapping = async (key: string, url: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/images/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, url }),
      });
      if (res.ok) {
        let busterUrl = '';
        if (url) {
          const cb = Date.now().toString();
          try {
            if (url.startsWith('http://') || url.startsWith('https://')) {
              const urlObj = new URL(url);
              urlObj.searchParams.set('cb', cb);
              busterUrl = urlObj.toString();
            } else {
              const separator = url.includes('?') ? '&' : '?';
              busterUrl = `${url}${separator}cb=${cb}`;
            }
          } catch (e) {
            const separator = url.includes('?') ? '&' : '?';
            busterUrl = `${url}${separator}cb=${cb}`;
          }
        }
        setImages(prev => ({ ...prev, [key]: busterUrl }));
        return true;
      }
    } catch (err) {
      console.error(`Failed to update mapping for ${key}:`, err);
    }
    return false;
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch('/api/images/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: file.name, base64 }),
          });
          if (res.ok) {
            const data = await res.json();
            resolve(data.url);
          } else {
            const errorData = await res.json().catch(() => ({}));
            console.error('Upload API failure:', errorData);
            resolve(null);
          }
        } catch (err) {
          console.error('Upload API failure:', err);
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  return (
    <ImageContext.Provider value={{ images, isLoading, updateMapping, uploadFile, refreshImages }}>
      {children}
    </ImageContext.Provider>
  );
}

export function useAppImages() {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useAppImages must be used within an ImageProvider');
  }
  return context;
}
