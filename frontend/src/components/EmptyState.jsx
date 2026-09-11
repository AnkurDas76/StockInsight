import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  BarChart2, 
  ArrowRight, 
  Sparkles,
  GitCompare,
  Zap,
  LineChart
} from 'lucide-react';

export default function EmptyState({ onSelectSuggestion }) {
  const suggestions = [
    {
      icon: DollarSign,
      title: "Stock Quote & Price",
      prompt: "What's Apple's current stock price?",
      desc: "Get real-time prices & daily change"
    },
    {
      icon: BarChart2,
      title: "Financial Metrics",
      prompt: "Analyze NVIDIA's financial metrics",
      desc: "Revenue, P/E ratio, margins & ROE"
    },
    {
      icon: GitCompare,
      title: "Company Comparison",
      prompt: "Compare Apple and Microsoft",
      desc: "Side-by-side fundamental breakdown"
    },
    {
      icon: Zap,
      title: "Market Screener",
      prompt: "Find technology stocks gaining today",
      desc: "Filter market movers by sector"
    },
    {
      icon: LineChart,
      title: "Historical Performance",
      prompt: "Show Tesla's recent historical performance",
      desc: "OHLC trend and volume summary"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto w-full animate-fade-in">
      {/* Brand Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Agentic Financial Research Engine</span>
      </div>

      {/* Main Title */}
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100 mb-3">
        StockInsight
      </h2>
      <p className="text-base sm:text-lg text-slate-400 max-w-xl mb-10 leading-relaxed">
        AI-powered stock research, simplified. Ask anything about stocks, companies, financials, or market performance.
      </p>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full">
        {suggestions.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectSuggestion(item.prompt)}
              className="group p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-800/60 text-left transition-all duration-200 flex flex-col justify-between hover:shadow-lg hover:shadow-emerald-950/20 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-800 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-300 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1 group-hover:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-snug">
                  "{item.prompt}"
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
