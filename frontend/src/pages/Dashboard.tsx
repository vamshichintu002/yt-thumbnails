import React, { useState, useEffect } from 'react';
import { Zap, Upload, Image as ImageIcon, Coins, CreditCard, Youtube, Type, FileVideo, AlertCircle, Download } from 'lucide-react';
import { Button } from '../components/ui/moving-border';
import { motion } from 'framer-motion';
import { convertWebpToPngAndDownload, isWebPSupported } from '../utils/imageUtils';

type GenerationType = 'title' | 'image' | 'youtube';

// YouTube URL regex pattern
const YOUTUBE_URL_PATTERN = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function Dashboard() {
  const [credits] = useState(100);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [imageText, setImageText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubePreview, setYoutubePreview] = useState<string | null>(null);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [generationType, setGenerationType] = useState<GenerationType>('title');
  const [showNewImagePopup, setShowNewImagePopup] = useState(false);
  const [newGeneratedImage, setNewGeneratedImage] = useState<string | null>(null);
  const [generatedThumbnails, setGeneratedThumbnails] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract YouTube video ID and get thumbnail
  const getYoutubeThumbnail = (url: string) => {
    const videoId = url.match(YOUTUBE_URL_PATTERN)?.[1];
    if (!videoId) {
      setYoutubeError('Please enter a valid YouTube URL');
      setYoutubePreview(null);
      return;
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    setYoutubePreview(thumbnailUrl);
    setYoutubeError(null);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (youtubeUrl) {
        getYoutubeThumbnail(youtubeUrl);
      } else {
        setYoutubePreview(null);
        setYoutubeError(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [youtubeUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const generateThumbnails = async () => {
    if (!title.trim()) {
      setError('Please enter a title first');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/generate-thumbnail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate thumbnails');
      }
      
      if (!data.success || !Array.isArray(data.images) || data.images.length === 0) {
        throw new Error('No valid images in API response');
      }

      const newThumbnails = data.images.map((url, index) => ({
        id: Date.now() + index,
        url: `http://localhost:3001${url}`,
        style: `Style ${index + 1}`,
        metadata: data.metadata
      }));
      
      setGeneratedThumbnails(prevThumbnails => [...newThumbnails, ...prevThumbnails]);
      setNewGeneratedImage(newThumbnails[0].url);
      setShowNewImagePopup(true);
      
      // Auto-hide popup after 5 seconds
      setTimeout(() => {
        setShowNewImagePopup(false);
      }, 5000);

    } catch (err) {
      console.error('Thumbnail generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate thumbnails. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, thumbnailId: number | string) => {
    try {
      await convertWebpToPngAndDownload(url, `thumbnail-${thumbnailId}`);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image. Please try again.');
    }
  };

  const tabs = [
    { id: 'title', label: 'From Title', icon: Type },
    { id: 'image', label: 'From Image', icon: ImageIcon },
    { id: 'youtube', label: 'From YouTube', icon: Youtube },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Credits Display */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full">
              <Coins className="w-5 h-5" />
              <span className="font-semibold">{credits} Credits</span>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors">
              <CreditCard className="w-5 h-5" />
              <span>Buy Credits</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = generationType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setGenerationType(tab.id as GenerationType)}
                  className={`flex-1 relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'text-white' : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-600/20 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6">
            {generationType === 'title' && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your video title"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {error && (
                  <div className="text-red-500 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}

            {generationType === 'image' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Image Description</label>
                  <input
                    type="text"
                    value={imageText}
                    onChange={(e) => setImageText(e.target.value)}
                    placeholder="Describe what you want in the image"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Reference Image (Optional)</label>
                  <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-4 text-white/70" />
                      <p className="text-sm text-white/70 mb-1">
                        Drop image or click to browse
                      </p>
                      <p className="text-xs text-white/40">
                        Supports JPG, PNG, WEBP
                      </p>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {generationType === 'youtube' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-white/80">YouTube URL</label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Enter YouTube video URL"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  {youtubeError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {youtubeError}
                    </div>
                  )}
                </div>

                {/* YouTube Preview */}
                <div className="aspect-video rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  {youtubePreview ? (
                    <img
                      src={youtubePreview}
                      alt="YouTube Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40">
                      <FileVideo className="w-12 h-12" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generateThumbnails}
          disabled={isGenerating || (generationType === 'title' && !title.trim())}
          className="w-full mb-8" 
          containerClassName="w-full"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 animate-pulse" />
              Generating...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Generate Thumbnails
            </div>
          )}
        </Button>

        {/* New Image Popup */}
        {showNewImagePopup && newGeneratedImage && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-gray-900 p-6 rounded-xl max-w-2xl w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">New Thumbnail Generated!</h3>
              <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                <img
                  src={newGeneratedImage}
                  alt="New Generated Thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', newGeneratedImage);
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjAyMDIwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZhaWxlZCB0byBsb2FkIGltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowNewImagePopup(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownload(newGeneratedImage, Date.now())}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download as PNG
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generated Thumbnails */}
        {generatedThumbnails.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Generated Thumbnails</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {generatedThumbnails.map((thumbnail) => (
                <div
                  key={thumbnail.id}
                  className="relative group rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-colors"
                >
                  <img
                    src={thumbnail.url}
                    alt={`Thumbnail ${thumbnail.id}`}
                    className="w-full aspect-video object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', thumbnail.url);
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjAyMDIwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZhaWxlZCB0byBsb2FkIGltYWdlPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-medium mb-2">{thumbnail.style}</p>
                      <button
                        onClick={() => handleDownload(thumbnail.url, thumbnail.id)}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download as PNG
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}