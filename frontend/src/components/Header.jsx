import React from 'react';
import { Menu, Plus, TrendingUp } from 'lucide-react';

export default function Header({ 
  onToggleSidebar, 
  onNewChat, 
  activeTitle 
}) {
  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="md:hidden p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm sm:text-base text-slate-200 truncate max-w-[200px] sm:max-w-md">
            {activeTitle || 'StockInsight'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/50 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
}
