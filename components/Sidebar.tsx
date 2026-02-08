import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onNewChat 
}) => {
  return (
    <aside className="w-64 bg-blue-950/10 border-r border-blue-900/30 flex flex-col pt-16">
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <span>+</span>
          <span>New Chat</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
              activeSessionId === session.id
                ? 'bg-blue-900/40 text-blue-100'
                : 'text-blue-300 hover:bg-blue-900/20'
            }`}
          >
            <div className="text-sm font-medium truncate">{session.title}</div>
            <div className="text-xs text-blue-500 mt-1">
              {new Date(session.created_at).toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
