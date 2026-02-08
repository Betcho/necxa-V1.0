import React from 'react';

interface HeaderProps {
  showAnalytics: boolean;
  onShowAnalytics: () => void;
}

const Header: React.FC<HeaderProps> = ({ showAnalytics, onShowAnalytics }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-sm border-b border-blue-900/30 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg"></div>
        <h1 className="text-xl font-bold text-blue-100 tracking-tight">NECXA</h1>
      </div>
      
      <button
        onClick={onShowAnalytics}
        className="px-4 py-2 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-800/50 rounded-lg text-blue-200 text-sm font-medium transition-colors"
      >
        {showAnalytics ? 'Chat' : 'Analytics'}
      </button>
    </header>
  );
};

export default Header;
