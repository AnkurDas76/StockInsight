import React from 'react';
import { 
  TrendingUp, 
  Plus, 
  MessageSquare, 
  X, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  BarChart3
} from 'lucide-react';

export default function Sidebar({ 
  conversations, 
  activeThreadId, 
  onSelectThread, 
  onNewChat, 
  isOpen, 
  onClose,
  isBackendConnected,
  conversationTitles
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 bg-slate-900/90 border-r border-slate-800/80
        flex flex-col h-full transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header / Brand */}
        <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-100 text-base tracking-tight flex items-center gap-1.5">
                StockInsight
              </h1>
              <p className="text-[11px] font-medium text-slate-400">Financial AI Assistant</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-sm shadow-emerald-950/50 transition-all duration-150 active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Research Chat</span>
          </button>
        </div>

        {/* Conversation List Header */}
        <div className="px-4 py-2 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Recent Research</span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
            {conversations.length}
          </span>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 py-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <BarChart3 className="w-6 h-6 stroke-1 text-slate-600" />
              <span>No prior research chats.</span>
            </div>
          ) : (
            conversations.map((thread) => {
              const isActive = thread.thread_id === activeThreadId;
              const title = conversationTitles[thread.thread_id] || 'Research Chat';

              return (
                <button
                  key={thread.thread_id}
                  onClick={() => onSelectThread(thread.thread_id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-150 group cursor-pointer
                    ${isActive 
                      ? 'bg-slate-800/90 text-emerald-400 font-medium border border-slate-700/60 shadow-xs' 
                      : 'text-slate-300 hover:bg-slate-800/40 hover:text-slate-100'}
                  `}
                >
                  <MessageSquare className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                  <span className="truncate flex-1 text-xs">{title}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer / Backend Status */}
        <div className="p-3 border-t border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/40 text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 text-[11px]">Backend API</span>
            </div>
            {isBackendConnected ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                <AlertCircle className="w-3 h-3" />
                Offline
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
