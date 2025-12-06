import React, { useState, useRef, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import Loader from './ui/Loader';

enum VideoMode {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

const VideoGen: React.FC = () => {
  const [mode, setMode] = useState<VideoMode>(VideoMode.TEXT);
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for Veo API Key on mount
  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    } catch (e) {
      console.error("Error checking API key status", e);
    }
  };

  const handleSelectKey = async () => {
    try {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        // Assume success after dialog interaction, or we can poll.
        setHasApiKey(true);
      }
    } catch (e) {
      setError("Failed to open key selection dialog.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!hasApiKey) {
      setError("Please select a paid API key to use the Veo model.");
      return;
    }

    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      let imageBase64 = null;
      if (mode === VideoMode.IMAGE && previewUrl) {
        imageBase64 = previewUrl;
      }
      
      const resultUrl = await generateVideo(prompt, imageBase64);
      setVideoUrl(resultUrl);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("Requested entity was not found")) {
         setHasApiKey(false); // Reset to force re-selection
         setError("API Key invalid or not found. Please select your key again.");
      } else {
        setError(e.message || "Failed to generate video");
      }
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill prompts based on mode for demo
  useEffect(() => {
    if (mode === VideoMode.TEXT) {
      setPrompt('Sunny Bakery — Scene 1: Exterior, sunrise, bakery sign. Scene 2: Inside, fresh bread. Call-to-action: "Visit today!" — style: cozy, cinematic');
    } else {
      setPrompt('Pan-right 20% over 5s, subtle camera bob, add drifting clouds and happy ambient particles.');
    }
  }, [mode]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">Video Lab (Veo)</h2>
          <p className="text-gray-400">Generate high-quality video from text or bring images to life.</p>
        </div>
        {!hasApiKey && (
          <button 
            onClick={handleSelectKey}
            className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            ⚠️ Select Paid API Key
          </button>
        )}
      </div>

      {!hasApiKey && (
        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl text-blue-200 text-sm">
          <p>
            <strong>Note:</strong> Video generation requires a paid billing project. 
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline ml-1 hover:text-white">
              View Billing Docs
            </a>
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-900 p-1 rounded-xl w-fit">
        <button
          onClick={() => setMode(VideoMode.TEXT)}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === VideoMode.TEXT ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          Text-to-Video
        </button>
        <button
          onClick={() => setMode(VideoMode.IMAGE)}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === VideoMode.IMAGE ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          Image-to-Video
        </button>
      </div>

      <div className="bg-gray-850 p-6 rounded-2xl border border-gray-750 space-y-6 shadow-xl">
        
        {mode === VideoMode.IMAGE && (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-sm font-medium text-gray-300">Reference Image</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700 hover:border-primary-500 rounded-xl p-8 cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[150px] bg-gray-950/30"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-48 object-contain rounded-lg shadow-md" />
              ) : (
                <>
                  <span className="text-3xl mb-2">📁</span>
                  <span className="text-gray-400">Click to upload an image</span>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            {mode === VideoMode.TEXT ? 'Scene Description' : 'Motion Prompts (Parallax, Pan, Zoom)'}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-primary-500 outline-none h-24 resize-none"
            placeholder={mode === VideoMode.TEXT ? "A cinematic drone shot of..." : "Pan right slowly, add fog..."}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !hasApiKey}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            loading || !hasApiKey
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg shadow-primary-500/20'
          }`}
        >
          {loading ? 'Generating Video (this takes a moment)...' : 'Generate Video'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-xl">
          {error}
        </div>
      )}

      {/* Output Area */}
      {(loading || videoUrl) && (
        <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 flex justify-center min-h-[300px] items-center">
            {loading ? (
                <Loader text="Veo is rendering your scene..." />
            ) : videoUrl ? (
                <div className="w-full max-w-2xl">
                    <video controls autoPlay loop className="w-full rounded-lg shadow-2xl border border-gray-800">
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="mt-4 flex justify-end">
                        <a 
                            href={videoUrl} 
                            download="veo-generation.mp4"
                            className="text-sm text-primary-400 hover:text-primary-300 underline"
                        >
                            Download Video
                        </a>
                    </div>
                </div>
            ) : null}
        </div>
      )}
    </div>
  );
};

export default VideoGen;