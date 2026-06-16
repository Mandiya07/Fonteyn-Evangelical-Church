import React, { useState } from 'react';
import { useAppImages } from './ImageContext';
import { Upload, Link, Check, Image as ImageIcon, Loader2, RefreshCw } from 'lucide-react';

interface ImageSlot {
  key: string;
  label: string;
  description: string;
  category: 'General' | 'Ministries' | 'Hero & Branding';
}

const IMAGE_SLOTS: ImageSlot[] = [
  {
    key: 'pastor',
    label: "Senior Pastor's Portrait",
    description: "Main photo of Rev LS Mnisi displayed on the homepage welcome section and leadership page of About Us.",
    category: 'General',
  },
  {
    key: 'hero',
    label: "Hero Header Banner",
    description: "The darkened background congregation photo on the main homepage top splash screen.",
    category: 'Hero & Branding',
  },
  {
    key: 'ministry_children',
    label: "Children's Ministry Card",
    description: "Cover visual for the Children's Ministry section on Home and Ministries views.",
    category: 'Ministries',
  },
  {
    key: 'ministry_youth',
    label: "Youth Fellowship Card",
    description: "Cover image for youth cells, retreats, and Friday night fellowships.",
    category: 'Ministries',
  },
  {
    key: 'ministry_young_adults',
    label: "Young Adults Fellowship Card",
    description: "Visual banner for university students and young working career guilds.",
    category: 'Ministries',
  },
  {
    key: 'ministry_men',
    label: "Men's Kingsmen Card",
    description: "Cover display for Saturday Men's counseling circles and prayer nets.",
    category: 'Ministries',
  },
  {
    key: 'ministry_women',
    label: "Women's Grace Card",
    description: "Visual display for the Proverbs-based Women's Prayer network.",
    category: 'Ministries',
  },
  {
    key: 'ministry_family',
    label: "Family Ministry Card",
    description: "Banner representing joint dynamic couple groups and domestic altars.",
    category: 'Ministries',
  },
  {
    key: 'ministry_evangelism',
    label: "Evangelism & Missions Card",
    description: "Outreach banner for sharing the Gospel and community tract dissemination.",
    category: 'Ministries',
  },
  {
    key: 'ministry_worship',
    label: "Praise & Worship Card",
    description: "Visual display for singers, choir, instrumentalists and sanctuary musicians.",
    category: 'Ministries',
  },
  {
    key: 'ministry_prayer',
    label: "Intercessor Prayer Card",
    description: "Visual for weekly congregational Friday prayer chains.",
    category: 'Ministries',
  },
  {
    key: 'ministry_outreach',
    label: "Outreach Mercy Ministries Card",
    description: "Cover for soup kitchens, elderly relief packages, and shelter visits.",
    category: 'Ministries',
  },
  {
    key: 'ministry_preschool',
    label: "Christian Preschool Banner",
    description: "Cover image for the church-run Fonteyn Christian Preschool displayed on the homepage slider.",
    category: 'Ministries',
  },
];

export default function AdminImagesView() {
  const { images, uploadFile, updateMapping, refreshImages, isLoading } = useAppImages();
  const [activeCategory, setActiveCategory] = useState<'All' | 'General' | 'Ministries' | 'Hero & Branding'>('All');
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});
  const [successStatus, setSuccessStatus] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUrlSave = async (key: string) => {
    const url = urlInputs[key]?.trim();
    if (!url) return;
    
    setUploadingState(prev => ({ ...prev, [key]: true }));
    const success = await updateMapping(key, url);
    setUploadingState(prev => ({ ...prev, [key]: false }));

    if (success) {
      setSuccessStatus(prev => ({ ...prev, [key]: true }));
      setUrlInputs(prev => ({ ...prev, [key]: '' }));
      setTimeout(() => {
        setSuccessStatus(prev => ({ ...prev, [key]: false }));
      }, 3000);
    } else {
      setErrorMessage("Failed to update image mapping.");
    }
  };

  const handleFileUpload = async (key: string, file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file (PNG, JPG, etc.)");
      return;
    }

    setUploadingState(prev => ({ ...prev, [key]: true }));
    try {
      const publicUrl = await uploadFile(file);
      if (publicUrl) {
        const success = await updateMapping(key, publicUrl);
        if (success) {
          setSuccessStatus(prev => ({ ...prev, [key]: true }));
          setTimeout(() => {
            setSuccessStatus(prev => ({ ...prev, [key]: false }));
          }, 3000);
        } else {
          setErrorMessage("Image uploaded to server but failed to update application mapping registry.");
        }
      } else {
        setErrorMessage("Server rejected file upload. Verify file size (max 50MB) or ensure the image format is valid.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("A network error occurred during image upload. Please check your connection.");
    } finally {
      setUploadingState(prev => ({ ...prev, [key]: false }));
    }
  };

  const filteredSlots = activeCategory === 'All' 
    ? IMAGE_SLOTS 
    : IMAGE_SLOTS.filter(s => s.category === activeCategory);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-secondary py-24">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Loading application image mapping...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" id="admin-images-view-panel">
      {/* Introduction */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-header text-lg font-bold text-primary">Customize Application Media Assets</h2>
          <p className="text-xs text-gray-500 mt-1">
            As an Administrator, you can upload new PNG/JPG coordinates or provide external CDN links to swap images dynamically across pages. Changes take impact immediately.
          </p>
        </div>
        <button 
          onClick={() => {
            refreshImages();
            setErrorMessage(null);
          }}
          className="flex items-center gap-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-primary text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Core Sync</span>
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-xs font-semibold flex items-center justify-between" id="error-message-toaster">
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-800 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Categories slider */}
      <div className="flex gap-2.5 overflow-x-auto pb-1" id="category-scroller">
        {(['All', 'Hero & Branding', 'General', 'Ministries'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition ${
              activeCategory === cat
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-primary/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="slots-management-grid">
        {filteredSlots.map(slot => {
          const currentUrl = images[slot.key];
          const isUploading = uploadingState[slot.key];
          const isSuccess = successStatus[slot.key];

          return (
            <div 
              key={slot.key}
              className="bg-white border border-gray-150 rounded-2xl p-6 hover:shadow-md transition duration-300 flex flex-col md:flex-row gap-6 animate-fade-in"
            >
              {/* Left Column: Image Preview */}
              <div className="w-full md:w-32 h-32 relative rounded-xl border border-gray-200 bg-gray-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {currentUrl ? (
                  <img 
                    src={currentUrl} 
                    alt={slot.label} 
                    className="w-full h-full object-cover animate-fade-in" 
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 bg-primary/40 backdrop-blur-[1px] flex items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}

                {isSuccess && (
                  <div className="absolute inset-x-0 bottom-0 py-1 bg-emerald-600 text-white text-[10px] font-bold text-center flex items-center justify-center gap-1">
                    <Check className="w-3 h-3 text-white" />
                    <span>Saved Successfully</span>
                  </div>
                )}
              </div>

              {/* Right Column: Configuration Controls */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest bg-secondary/20 text-primary border border-secondary/25 px-2 py-0.5 rounded-full">
                      {slot.category}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">key: {slot.key}</span>
                  </div>
                  <h3 className="font-header text-sm font-bold text-primary mt-1.5">{slot.label}</h3>
                  <p className="text-[11px] text-gray-500 mt-1 leading-normal">{slot.description}</p>
                </div>

                {/* Operations */}
                <div className="space-y-2">
                  {/* File Upload Trigger */}
                  <label className="flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 text-primary px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition w-full text-center">
                    <Upload className="w-3.5 h-3.5 shrink-0" />
                    <span>Upload Image File</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(slot.key, file);
                      }}
                      disabled={isUploading}
                    />
                  </label>

                  {/* URL Text Input */}
                  <div className="flex gap-1.5 mt-2">
                    <div className="relative flex-grow">
                      <Link className="w-3.5 h-3.5 text-gray-400 absolute left-3 overlay top-3" />
                      <input 
                        type="text"
                        placeholder="Paste image URL..."
                        value={urlInputs[slot.key] !== undefined ? urlInputs[slot.key] : ''}
                        onChange={(e) => setUrlInputs(prev => ({ ...prev, [slot.key]: e.target.value }))}
                        className="w-full pl-8.5 pr-2 py-2 bg-gray-50 text-[11px] border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-secondary"
                        disabled={isUploading}
                      />
                    </div>
                    <button
                      onClick={() => handleUrlSave(slot.key)}
                      disabled={isUploading || !urlInputs[slot.key]?.trim()}
                      className="bg-neutral-950 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-2.5 rounded-xl hover:bg-secondary hover:text-primary transition disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
