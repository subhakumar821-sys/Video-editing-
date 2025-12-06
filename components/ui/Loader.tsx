import React from 'react';

const Loader: React.FC<{ text?: string }> = ({ text = "Generating..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-gray-400 animate-pulse">{text}</p>
    </div>
  );
};

export default Loader;