import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ImageGen from './components/ImageGen';
import VideoGen from './components/VideoGen';
import AudioStudio from './components/AudioStudio';
import { AppTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.IMAGE);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.IMAGE:
        return <ImageGen />;
      case AppTab.VIDEO:
        return <VideoGen />;
      case AppTab.AUDIO:
        return <AudioStudio mode={AppTab.AUDIO} />;
      case AppTab.SONG:
        return <AudioStudio mode={AppTab.SONG} />;
      default:
        return <ImageGen />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden text-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 -z-10" />
        {renderContent()}
      </main>
    </div>
  );
};

export default App;