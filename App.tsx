
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import PromptBox from './components/PromptBox';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { supabaseService } from './services/supabaseService';
import { cerebrasService } from './services/cerebrasService';
import { ChatSession, Message, CerebrasModel, AnalyticsData } from './types';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);

  // Initialize and load history from Supabase
  useEffect(() => {
    const init = async () => {
      try {
        const history = await supabaseService.getChatHistory();
        const validatedHistory = Array.isArray(history) ? history : [];
        setSessions(validatedHistory);
        
        if (validatedHistory.length > 0) {
          setActiveSessionId(validatedHistory[0].id);
        }
        
        const stats = await supabaseService.getAnalytics();
        setAnalyticsData(Array.isArray(stats) ? stats : []);
      } catch (err) {
        console.warn('Initial data load failed, proceeding with local state.', err);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  const activeSession = Array.isArray(sessions) 
    ? (sessions.find(s => s.id === activeSessionId) || null)
    : null;

  const handleNewChat = useCallback(() => {
    const newId = crypto.randomUUID();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      model: CerebrasModel.LLAMA_3_1_8B,
      created_at: new Date().toISOString(),
      messages: []
    };
    
    setSessions(prev => [newSession, ...(Array.isArray(prev) ? prev : [])]);
    setActiveSessionId(newId);
    setShowAnalytics(false);
    
    supabaseService.saveChatSession(newSession);
  }, []);

  const handleSendMessage = async (text: string) => {
    let currentSessionId = activeSessionId;
    let targetSession = Array.isArray(sessions) ? sessions.find(s => s.id === currentSessionId) : null;
    
    // Auto-create session if none active
    if (!currentSessionId || !targetSession) {
      const newId = crypto.randomUUID();
      const newSession: ChatSession = {
        id: newId,
        title: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
        model: CerebrasModel.LLAMA_3_1_8B,
        created_at: new Date().toISOString(),
        messages: []
      };
      setSessions(prev => [newSession, ...(Array.isArray(prev) ? prev : [])]);
      setActiveSessionId(newId);
      currentSessionId = newId;
      targetSession = newSession;
      await supabaseService.saveChatSession(newSession);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    // Optimistic UI update
    setSessions(prev => (Array.isArray(prev) ? prev : []).map(s => 
      s.id === currentSessionId 
        ? { 
            ...s, 
            messages: [...s.messages, userMessage], 
            title: s.messages.length === 0 ? (text.slice(0, 30) + (text.length > 30 ? '...' : '')) : s.title 
          } 
        : s
    ));

    setIsLoading(true);
    
    try {
      // Persist user message to Supabase
      await supabaseService.saveMessage(currentSessionId, userMessage);
      
      // If the title was updated optimistically, persist that too
      if (targetSession && targetSession.messages.length === 0) {
        await supabaseService.saveChatSession({
          ...targetSession,
          title: text.slice(0, 30) + (text.length > 30 ? '...' : '')
        });
      }

      // Prepare context for Cerebras API
      const contextMessages = Array.isArray(targetSession?.messages) 
        ? [...targetSession.messages, userMessage] 
        : [userMessage];
        
      const aiResponse = await cerebrasService.chat(contextMessages);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        created_at: new Date().toISOString()
      };

      // Final UI update with AI reply
      setSessions(prev => (Array.isArray(prev) ? prev : []).map(s => 
        s.id === currentSessionId 
          ? { ...s, messages: [...s.messages, assistantMessage] } 
          : s
      ));

      // Persist AI message to Supabase
      await supabaseService.saveMessage(currentSessionId, assistantMessage);
      
      // Refresh analytics after a turn
      const updatedStats = await supabaseService.getAnalytics();
      setAnalyticsData(updatedStats);

    } catch (error: any) {
      console.error('Conversation Error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Connection Interrupted: ${error.message || 'The neural interface failed to respond.'}`,
        created_at: new Date().toISOString()
      };
      setSessions(prev => (Array.isArray(prev) ? prev : []).map(s => 
        s.id === currentSessionId ? { ...s, messages: [...s.messages, errorMessage] } : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-blue-500 font-mono text-xs tracking-widest uppercase animate-pulse">Initializing Necxa...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden select-none">
      <Header 
        showAnalytics={showAnalytics} 
        onShowAnalytics={() => setShowAnalytics(!showAnalytics)} 
      />
      
      <Sidebar 
        sessions={Array.isArray(sessions) ? sessions : []}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          setShowAnalytics(false);
        }}
        onNewChat={handleNewChat}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {showAnalytics ? (
          <AnalyticsDashboard data={analyticsData} />
        ) : (
          <>
            <ChatWindow 
              messages={activeSession?.messages || []} 
              isLoading={isLoading} 
            />
            <PromptBox 
              onSend={handleSendMessage} 
              isLoading={isLoading} 
            />
          </>
        )}
        
        {/* Atmosphere/Deco */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      </main>
    </div>
  );
};

export default App;
