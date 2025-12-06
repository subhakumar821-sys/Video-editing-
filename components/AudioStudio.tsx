import React, { useState, useRef } from 'react';
import { generateSpeech, generateLyrics } from '../services/geminiService';
import { decodeAudioData, playAudioBuffer } from '../services/audioUtils';
import { TTSVoice, AppTab } from '../types';
import Loader from './ui/Loader';

interface AudioStudioProps {
  mode: AppTab.AUDIO | AppTab.SONG;
}

const AudioStudio: React.FC<AudioStudioProps> = ({ mode }) => {
  const [text, setText] = useState('Read with warm, friendly tone, slight smile, 95 words per minute.');
  const [seed, setSeed] = useState('Kids song about colors and the moon — chorus simple, repetitive, 4 lines.');
  const [voice, setVoice] = useState<TTSVoice>(TTSVoice.Puck);
  const [loading, setLoading] = useState(false);
  const [lyricsResult, setLyricsResult] = useState<{title?: string, lyrics?: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Audio context ref to persist across renders
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioCtxRef.current;
  };

  const handleTTS = async (textToRead: string) => {
    if (!textToRead.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const base64Audio = await generateSpeech(textToRead, voice);
      const ctx = getAudioContext();
      const buffer = await decodeAudioData(base64Audio, ctx);
      playAudioBuffer(buffer, ctx);
    } catch (e: any) {
      setError(e.message || "Failed to generate speech");
    } finally {
      setLoading(false);
    }
  };

  const handleSongwriting = async () => {
    if (!seed.trim()) return;
    setLoading(true);
    setError(null);
    setLyricsResult(null);
    try {
      const jsonStr = await generateLyrics(seed);
      try {
          const parsed = JSON.parse(jsonStr);
          setLyricsResult(parsed);
      } catch (e) {
          // Fallback if JSON parsing fails (rare with schema but possible)
          setLyricsResult({ lyrics: jsonStr, title: "Untitled Song" });
      }
    } catch (e: any) {
      setError(e.message || "Failed to write song");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">
          {mode === AppTab.AUDIO ? 'Voiceover Studio' : 'AI Songwriter'}
        </h2>
        <p className="text-gray-400">
          {mode === AppTab.AUDIO 
            ? 'Generate lifelike speech with controllable voices.' 
            : 'Compose creative lyrics and perform them instantly.'}
        </p>
      </div>

      <div className="bg-gray-850 p-6 rounded-2xl border border-gray-750 shadow-xl space-y-6">
        
        {/* Controls Area */}
        {mode === AppTab.AUDIO ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Text to Speak</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-primary-500 outline-none h-32 resize-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-300 block mb-2">Voice Model</label>
                <select 
                  value={voice}
                  onChange={(e) => setVoice(e.target.value as TTSVoice)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {Object.values(TTSVoice).map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => handleTTS(text)}
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-500 disabled:bg-gray-700 text-white rounded-lg font-semibold transition-all"
                >
                  {loading ? 'Synthesizing...' : 'Generate & Play Audio'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Song Idea / Seed</label>
              <textarea
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-primary-500 outline-none h-24 resize-none"
                placeholder="E.g., A blues song about a lost robot..."
              />
            </div>
            <button
              onClick={handleSongwriting}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg font-bold transition-all"
            >
              {loading ? 'Composing...' : 'Write Song'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-xl">
          {error}
        </div>
      )}

      {/* Results Area */}
      {loading && mode === AppTab.SONG && <Loader text="Writing lyrics..." />}
      
      {mode === AppTab.SONG && lyricsResult && !loading && (
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 space-y-6 animate-fade-in">
          <div className="text-center border-b border-gray-800 pb-4">
            <h3 className="text-2xl font-bold text-white mb-1">{lyricsResult.title}</h3>
            <p className="text-gray-500 text-sm">Generated by Gemini 2.5 Flash</p>
          </div>
          
          <div className="whitespace-pre-wrap font-mono text-gray-300 leading-relaxed text-center">
            {lyricsResult.lyrics}
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col items-center space-y-4">
            <p className="text-gray-400 text-sm">Want to hear it?</p>
            <div className="flex gap-4">
                 <select 
                  value={voice}
                  onChange={(e) => setVoice(e.target.value as TTSVoice)}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm"
                >
                  {Object.values(TTSVoice).map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <button
                onClick={() => handleTTS(lyricsResult.lyrics || "")}
                className="flex items-center space-x-2 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
                >
                <span>▶️</span>
                <span>Perform Lyrics (TTS)</span>
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioStudio;