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
  pastor: "/pastor_portrait_1781085265986.png",
  hero: "https://images.unsplash.com/photo-1438232992991-995b7058bcd3?w=1600&auto=format&fit=crop&q=80",
  ministry_children: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=450&auto=format&fit=crop&q=80",
  ministry_youth: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=450&auto=format&fit=crop&q=80",
  ministry_young_adults: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=450&auto=format&fit=crop&q=80",
  ministry_men: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=450&auto=format&fit=crop&q=80",
  ministry_women: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=450&auto=format&fit=crop&q=80",
  ministry_family: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=450&auto=format&fit=crop&q=80",
  ministry_evangelism: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=450&auto=format&fit=crop&q=80",
  ministry_worship: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=450&auto=format&fit=crop&q=80",
  ministry_prayer: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=450&auto=format&fit=crop&q=80",
  ministry_outreach: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=450&auto=format&fit=crop&q=80",
  ministry_preschool: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=450&auto=format&fit=crop&q=80",
};

export function ImageProvider({ children }: { children: React.ReactNode }) {
  const [images, setImages] = useState<AppImages>(FALLBACKS);
  const [isLoading, setIsLoading] = useState(true);

  const refreshImages = async () => {
    try {
      const res = await fetch('/api/images');
      if (res.ok) {
        const data = await res.json();
        setImages(prev => ({ ...prev, ...data }));
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
        setImages(prev => ({ ...prev, [key]: url }));
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
