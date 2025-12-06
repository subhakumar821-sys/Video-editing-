import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: AppTab.IMAGE, label: 'Image Studio', icon: '🎨' },
    { id: AppTab.VIDEO, label: 'Video Lab', icon: '🎥' },
    { id: AppTab.AUDIO, label: 'Voiceover (TTS)', icon: '🎙️' },
    { id: AppTab.SONG, label: 'Songwriter', icon: '🎵' },
  ];

  return (
    <div className="w-full md:w-64 bg-gray-950 border-r border-gray-850 flex-shrink-0 flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-purple-400">
          CreativeStudio
        </h1>
        <p className="text-xs text-gray-400 mt-1">Powered by Gemini</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                : 'text-gray-400 hover:bg-gray-850 hover:text-gray-200'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-850">
        <div className="text-xs text-gray-500 text-center">
          v1.0.0 • Gemini 2.5 & Veo
        </div>
      </div>
    </div>
  );
};

export default Sidebar;