import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EmptyState from './components/EmptyState';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import { 
  checkHealth, 
  listConversations, 
  getConversation, 
  streamChat, 
  createConversation 
} from './services/api';

const LOCAL_STORAGE_THREAD_KEY = 'stockinsight_active_thread_id';

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(() => {
    return localStorage.getItem(LOCAL_STORAGE_THREAD_KEY) || null;
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [conversationTitles, setConversationTitles] = useState({});

  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages or tokens arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Initial load & health check
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const healthy = await checkHealth();
      if (isMounted) setIsBackendConnected(healthy);

      try {
        const threads = await listConversations();
        if (!isMounted) return;

        setConversations(threads || []);

        // Load active conversation if thread exists in history
        const savedThread = localStorage.getItem(LOCAL_STORAGE_THREAD_KEY);
        if (savedThread) {
          const exists = threads.some(t => t.thread_id === savedThread);
          if (exists) {
            loadThreadMessages(savedThread);
          } else {
            // Missing thread, clear state
            setActiveThreadId(null);
            localStorage.removeItem(LOCAL_STORAGE_THREAD_KEY);
          }
        }
      } catch (err) {
        console.error('Failed to load initial conversation list:', err);
      }
    }

    init();
    return () => { isMounted = false; };
  }, []);

  // Sync activeThreadId to localStorage
  useEffect(() => {
    if (activeThreadId) {
      localStorage.setItem(LOCAL_STORAGE_THREAD_KEY, activeThreadId);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_THREAD_KEY);
    }
  }, [activeThreadId]);

  // Helper to load thread messages
  const loadThreadMessages = async (threadId) => {
    try {
      setIsLoading(true);
      const data = await getConversation(threadId);
      setMessages(data.messages || []);
      setActiveThreadId(threadId);

      // Derive title from first human message if present
      if (data.messages && data.messages.length > 0) {
        const firstUserMsg = data.messages.find(m => m.role === 'user');
        if (firstUserMsg) {
          setConversationTitles(prev => ({
            ...prev,
            [threadId]: truncateTitle(firstUserMsg.content)
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load conversation history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const truncateTitle = (text) => {
    if (!text) return 'Research Chat';
    const clean = text.trim();
    return clean.length > 30 ? clean.substring(0, 30) + '...' : clean;
  };

  const handleSelectThread = (threadId) => {
    if (threadId === activeThreadId) return;
    if (isStreaming) handleStopStream();
    loadThreadMessages(threadId);
    setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    if (isStreaming) handleStopStream();
    setActiveThreadId(null);
    setMessages([]);
    setInput('');
    setIsSidebarOpen(false);
  };

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
  };

  const handleSendMessage = async (customPrompt) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading || isStreaming) return;

    // Check backend connection
    const healthy = await checkHealth();
    setIsBackendConnected(healthy);
    if (!healthy) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: textToSend },
        { 
          role: 'assistant', 
          content: 'StockInsight backend is unavailable. Please make sure the FastAPI server is running on port 8000.', 
          isError: true 
        }
      ]);
      setInput('');
      return;
    }

    // Append User Message immediately
    const userMsg = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);

    // Set conversation title for new thread
    const promptTitle = truncateTitle(textToSend);

    // Append empty Assistant Message bubble
    const assistantMsgIndex = messages.length + 1; // user is at messages.length
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    let currentThreadId = activeThreadId;

    // Setup abort controller for client cancel
    const controller = new AbortController();
    abortControllerRef.current = controller;

    await streamChat({
      message: textToSend,
      threadId: currentThreadId,
      signal: controller.signal,
      onToken: (token, threadIdFromBackend) => {
        setIsLoading(false);
        if (threadIdFromBackend && !currentThreadId) {
          currentThreadId = threadIdFromBackend;
          setActiveThreadId(threadIdFromBackend);
          setConversationTitles(prev => ({
            ...prev,
            [threadIdFromBackend]: promptTitle
          }));
        }

        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: updated[lastIndex].content + token
            };
          }
          return updated;
        });
      },
      onDone: async (finalThreadId) => {
        setIsStreaming(false);
        setIsLoading(false);
        if (finalThreadId && !currentThreadId) {
          setActiveThreadId(finalThreadId);
        }
        // Refresh conversation history list
        try {
          const threads = await listConversations();
          setConversations(threads || []);
        } catch (e) {
          console.warn('Could not refresh threads after chat:', e);
        }
      },
      onError: (err) => {
        console.error('Stream error:', err);
        setIsStreaming(false);
        setIsLoading(false);
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
            const existingText = updated[lastIndex].content;
            if (!existingText) {
              updated[lastIndex] = {
                role: 'assistant',
                content: 'Something went wrong while researching this request. Please try again.',
                isError: true
              };
            }
          }
          return updated;
        });
      }
    });
  };

  const activeTitle = activeThreadId ? (conversationTitles[activeThreadId] || 'Stock Research') : 'New Research Chat';

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isBackendConnected={isBackendConnected}
        conversationTitles={conversationTitles}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-slate-950">
        {/* Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          onNewChat={handleNewChat}
          activeTitle={activeTitle}
        />

        {/* Chat / Empty View */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {messages.length === 0 ? (
            <EmptyState onSelectSuggestion={(prompt) => setInput(prompt)} />
          ) : (
            <div className="flex-1 pb-4">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  message={msg}
                  isStreaming={isStreaming}
                  isLast={idx === messages.length - 1}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Input Bar */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => handleSendMessage()}
          isLoading={isLoading}
          isStreaming={isStreaming}
          onStop={handleStopStream}
        />
      </div>
    </div>
  );
}
