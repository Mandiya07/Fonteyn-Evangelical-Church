import React, { useState, useEffect } from 'react';
import { 
  Upload, Link, Check, Image as ImageIcon, Loader2, RefreshCw, 
  FileAudio, FileText, File, Trash2, Copy, Search, Plus, X, ExternalLink
} from 'lucide-react';

interface MediaAsset {
  id: string;
  name: string;
  contentType: string;
  updatedAt: string;
  url: string;
}

export default function AdminMediaFilesView() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Images' | 'Audio' | 'Documents' | 'Other'>('All');

  // Fetch all uploaded assets
  const fetchAssets = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/assets');
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      } else {
        setErrorMessage("Failed to retrieve uploaded media assets.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error occurred while fetching media list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Handle generic file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size limit (e.g., 50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("File exceeds 50MB limit.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      // Read file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Content = reader.result as string;
        try {
          const res = await fetch('/api/images/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: file.name,
              base64: base64Content
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              await fetchAssets();
            } else {
              setErrorMessage(data.error || "Failed to upload file.");
            }
          } else {
            setErrorMessage("Server rejected file upload.");
          }
        } catch (err) {
          console.error(err);
          setErrorMessage("Failed to send file data to server.");
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        setErrorMessage("Failed to read file.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setErrorMessage("An unexpected error occurred during upload.");
      setIsUploading(false);
    }
  };

  // Delete specific asset
  const handleDeleteAsset = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this media file?")) {
      return;
    }

    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setAssets(prev => prev.filter(asset => asset.id !== id));
      } else {
        setErrorMessage("Failed to delete asset.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error during asset deletion.");
    }
  };

  // Helper to copy links
  const handleCopyLink = (url: string, id: string) => {
    // Generate absolute path URL
    const absoluteUrl = window.location.origin + url;
    navigator.clipboard.writeText(absoluteUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  // Determine which icon to display based on content type
  const getAssetIcon = (contentType: string) => {
    const type = contentType.toLowerCase();
    if (type.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-indigo-500" />;
    } else if (type.startsWith('audio/')) {
      return <FileAudio className="w-5 h-5 text-emerald-500" />;
    } else if (type.includes('pdf') || type.includes('document') || type.includes('text/')) {
      return <FileText className="w-5 h-5 text-amber-500" />;
    } else {
      return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  // Category identification
  const getCategory = (contentType: string): 'Images' | 'Audio' | 'Documents' | 'Other' => {
    const type = contentType.toLowerCase();
    if (type.startsWith('image/')) return 'Images';
    if (type.startsWith('audio/')) return 'Audio';
    if (type.includes('pdf') || type.includes('document') || type.includes('text/')) return 'Documents';
    return 'Other';
  };

  // Filter & Search
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (categoryFilter === 'All') return matchesSearch;
    return matchesSearch && getCategory(asset.contentType) === categoryFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in" id="admin-media-files-root">
      {/* Introduction */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-header text-lg font-bold text-primary">Media Library & File Manager</h2>
          <p className="text-xs text-gray-500 mt-1">
            Upload bulletins, sermon audio tracks, video clips, or PDF slides. Copy direct URLs to embed inside events, blogs, or sermon notes.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchAssets}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-primary text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Library</span>
          </button>
          
          <label className="flex items-center gap-2 bg-primary hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {isUploading && (
        <div className="bg-primary/5 border border-primary/20 text-primary p-4 rounded-xl text-xs font-semibold flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing file upload. Please wait...</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-800 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-150 shadow-xs">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 text-gray-450 absolute left-3.5 top-3" />
          <input 
            type="text"
            placeholder="Search media by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-gray-50 text-xs border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-secondary transition"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Images', 'Audio', 'Documents', 'Other'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition ${
                categoryFilter === cat
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-primary/45'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-24 text-secondary">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Media Library...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-150 p-16 text-center text-gray-450 space-y-3">
          <ImageIcon className="w-10 h-10 mx-auto text-gray-300" />
          <h3 className="font-header text-sm font-bold text-primary">No Media Files found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery ? 'Adjust your search filters or try a different keyword.' : 'Upload document sheets, sermon MP3 audio podcasts, or event photos to build the public church digital locker.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAssets.map(asset => {
            const isImage = asset.contentType.startsWith('image/');
            const isCopied = copiedId === asset.id;

            return (
              <div 
                key={asset.id}
                className="bg-white border border-gray-150 rounded-2xl overflow-hidden hover:shadow-md transition duration-300 flex flex-col justify-between"
              >
                {/* Preview Thumbnail */}
                <div className="h-40 bg-gray-50 border-b border-gray-100 relative flex items-center justify-center group overflow-hidden">
                  {isImage ? (
                    <img 
                      src={asset.url} 
                      alt={asset.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      {getAssetIcon(asset.contentType)}
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{asset.contentType.split('/')[1] || 'File'}</span>
                    </div>
                  )}

                  {/* Actions overlay on hover */}
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-2">
                    <a 
                      href={asset.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-full text-primary hover:bg-secondary hover:text-primary transition shadow-md"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button 
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition shadow-md cursor-pointer"
                      title="Delete asset permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* File Details */}
                <div className="p-4.5 space-y-3.5 flex-grow flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-primary truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                      <span>{getCategory(asset.contentType)}</span>
                      <span>{new Date(asset.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-gray-50">
                    <button
                      onClick={() => handleCopyLink(asset.url, asset.id)}
                      className={`w-full py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        isCopied 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-primary/5 text-primary hover:bg-primary/10 border border-primary/10'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied Link!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Direct Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
