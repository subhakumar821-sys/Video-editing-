import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import Loader from './ui/Loader';

const ImageGen: React.FC = () => {
  const [prompt, setPrompt] = useState('3D Pixar-style cheerful fox driving a colorful bus down a sunny town street, soft lighting, vibrant colors, cinematic 35mm, high detail');
  const [highQuality, setHighQuality] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateImage(prompt, highQuality);
      setImage(result);
    } catch (e: any) {
      setError(e.message || "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Image Studio</h2>
        <p className="text-gray-400">Transform your words into stunning visuals.</p>
      </div>

      <div className="bg-gray-850 p-6 rounded-2xl border border-gray-750 space-y-4 shadow-xl">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none h-32"
            placeholder="Describe the image you want to see..."
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={highQuality} 
              onChange={(e) => setHighQuality(e.target.checked)}
              className="w-5 h-5 rounded border-gray-700 bg-gray-950 text-primary-600 focus:ring-offset-gray-900 focus:ring-primary-500"
            />
            <span className="text-gray-300 group-hover:text-white transition-colors">HD Quality (Pro Model)</span>
          </label>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className={`px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 ${
              loading || !prompt 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/30'
            }`}
          >
            {loading ? 'Generating...' : 'Generate Art'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-xl">
          Error: {error}
        </div>
      )}

      <div className="min-h-[400px] flex items-center justify-center bg-gray-950/50 rounded-2xl border-2 border-dashed border-gray-800">
        {loading ? (
          <Loader text="Rendering pixels..." />
        ) : image ? (
          <div className="relative group w-full h-full flex items-center justify-center p-4">
            <img 
              src={image} 
              alt="Generated Result" 
              className="max-h-[600px] w-auto rounded-lg shadow-2xl" 
            />
            <a 
              href={image} 
              download={`generated-${Date.now()}.png`}
              className="absolute bottom-8 right-8 bg-black/70 hover:bg-black text-white px-4 py-2 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
            >
              Download PNG
            </a>
          </div>
        ) : (
          <div className="text-gray-600 flex flex-col items-center">
            <span className="text-4xl mb-2">🖼️</span>
            <span>Your masterpiece will appear here</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGen;