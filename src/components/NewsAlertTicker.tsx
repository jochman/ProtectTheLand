import React from 'react';
import { AlertTriangle, Radio } from 'lucide-react';
import { GameState } from '../types';

interface NewsAlertTickerProps {
  state: GameState;
}

export const NewsAlertTicker: React.FC<NewsAlertTickerProps> = ({ state }) => {
  if (!state.currentNews) return null;

  const isUrgent = state.currentNews.isUrgent || state.defenseScore < 40;

  return (
    <div className="px-3 py-1 z-20 w-full">
      <div
        className={`flex items-start gap-2.5 px-3.5 py-2 rounded-2xl border text-xs shadow-md transition-all duration-300 ${
          isUrgent
            ? 'bg-red-600/95 text-white border-red-400 shadow-red-500/20'
            : 'bg-white/95 text-slate-800 border-amber-200/80 backdrop-blur-md'
        }`}
      >
        <div className="flex-shrink-0 mt-0.5">
          {isUrgent ? (
            <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce" />
          ) : (
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          )}
        </div>

        {/* Fully visible, wrapping message content without any truncation */}
        <div className="flex-1 min-w-0 font-heebo leading-relaxed">
          <span
            className={`font-black text-[11px] px-1.5 py-0.5 rounded-md ml-1 inline-block ${
              isUrgent ? 'bg-red-800 text-amber-200' : 'bg-amber-100 text-amber-900 border border-amber-300/60'
            }`}
          >
            {state.currentNews.source}
          </span>
          <span className="font-semibold text-xs tracking-tight">
            {state.currentNews.headline}
          </span>
        </div>
      </div>
    </div>
  );
};
