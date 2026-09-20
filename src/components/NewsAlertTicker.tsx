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
    <div className="px-4 py-1 z-20">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs shadow-sm transition-colors duration-300 ${
          isUrgent
            ? 'bg-red-500/90 text-white border-red-400 animate-pulse'
            : 'bg-white/85 text-slate-800 border-slate-200 backdrop-blur-sm'
        }`}
      >
        <div className="flex-shrink-0">
          {isUrgent ? (
            <AlertTriangle className="w-4 h-4 text-amber-300" />
          ) : (
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          )}
        </div>
        <div className="flex-1 truncate font-medium font-heebo">
          <span className="font-black underline mx-1">{state.currentNews.source}:</span>
          <span>{state.currentNews.headline}</span>
        </div>
      </div>
    </div>
  );
};
