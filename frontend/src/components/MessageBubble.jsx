import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, TrendingUp, Loader2, AlertCircle } from 'lucide-react';

export default function MessageBubble({ message, isStreaming, isLast }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`py-4 px-4 sm:px-6 w-full ${isUser ? 'bg-slate-950' : 'bg-slate-900/40 border-y border-slate-800/40'}`}>
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className={`w-8 h-8 rounded-lg ${isError ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'} flex items-center justify-center shadow-xs`}>
              {isError ? <AlertCircle className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header Role */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">
              {isUser ? 'You' : 'StockInsight'}
            </span>
            {isStreaming && isLast && !isUser && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Loader2 className="w-3 h-3 animate-spin" />
                Analyzing market data...
              </span>
            )}
          </div>

          {/* Body */}
          {isUser ? (
            <div className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-normal">
              {message.content}
            </div>
          ) : isError ? (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{message.content || 'Something went wrong while researching this request.'}</span>
            </div>
          ) : (
            <div className="prose-stockinsight">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
              {isStreaming && isLast && (
                <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse align-middle" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
