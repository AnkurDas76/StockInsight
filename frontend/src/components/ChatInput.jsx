import React, { useRef, useEffect } from 'react';
import { ArrowUp, StopCircle } from 'lucide-react';

export default function ChatInput({ 
  input, 
  setInput, 
  onSend, 
  isLoading, 
  isStreaming,
  onStop 
}) {
  const textareaRef = useRef(null);

  // Auto resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading && !isStreaming) {
        onSend();
      }
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800/80 backdrop-blur-md sticky bottom-0 z-30">
      <div className="max-w-3xl mx-auto relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() && !isLoading && !isStreaming) {
              onSend();
            }
          }}
          className="relative flex items-center bg-slate-900/90 border border-slate-700/60 rounded-2xl shadow-xl shadow-slate-950/60 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all duration-200"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isStreaming}
            rows={1}
            placeholder="Ask about a stock, company, financial metric, or market trend..."
            className="w-full py-3.5 pl-4 pr-12 bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none resize-none min-h-[48px] max-h-[180px]"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="absolute right-2.5 bottom-2.5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Stop response"
            >
              <StopCircle className="w-4 h-4 text-amber-400" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`
                absolute right-2.5 bottom-2.5 p-2 rounded-xl transition-all duration-150 flex items-center justify-center cursor-pointer
                ${input.trim() && !isLoading 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 active:scale-95' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
              `}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </form>

        <div className="flex items-center justify-between px-2 mt-2 text-[11px] text-slate-500">
          <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Shift+Enter</kbd> for line break</span>
          <span className="hidden sm:inline">StockInsight AI v1.0</span>
        </div>
      </div>
    </div>
  );
}
