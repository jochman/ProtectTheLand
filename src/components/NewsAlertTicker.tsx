import React from 'react';
import { AlertTriangle, Radio, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { GameState, GameAction } from '../types';

interface NewsAlertTickerProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const NewsAlertTicker: React.FC<NewsAlertTickerProps> = ({ state, dispatch }) => {
  if (!state.currentNews) return null;

  const isUrgent = state.currentNews.isUrgent || state.defenseScore < 40;
  const isHe = state.locale === 'he';

  return (
    <div className="px-3 py-1 z-20 w-full">
      <div
        role="button"
        tabIndex={0}
        onClick={() => dispatch({ type: 'OPEN_NEWS_MODAL' })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            dispatch({ type: 'OPEN_NEWS_MODAL' });
          }
        }}
        className={`group flex items-start gap-2 px-3 py-2 rounded-2xl border text-xs shadow-md transition-all duration-200 cursor-pointer select-none hover:shadow-lg hover:border-amber-400 active:scale-[0.98] ${
          isUrgent
            ? 'bg-red-600/95 text-white border-red-400 shadow-red-500/20 hover:bg-red-600'
            : 'bg-white/95 text-slate-800 border-amber-200/80 backdrop-blur-md hover:bg-amber-50/60'
        }`}
      >
        <div className="flex-shrink-0 mt-0.5">
          {isUrgent ? (
            <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce" />
          ) : (
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          )}
        </div>

        {/* Fully visible message content with clickable indicator */}
        <div className="flex-1 min-w-0 font-heebo leading-relaxed">
          <div className="inline-flex items-center gap-1 ml-1.5 flex-wrap">
            <span
              className={`font-black text-[10.5px] px-1.5 py-0.5 rounded-md inline-block ${
                isUrgent
                  ? 'bg-red-800 text-amber-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-300/60'
              }`}
            >
              {state.currentNews.source}
            </span>
            {state.currentNews.arcStep && (
              <span className="text-[9.5px] font-bold text-amber-700 bg-amber-200/70 px-1 py-0.2 rounded border border-amber-400/50">
                {isHe ? `עדכון ${state.currentNews.arcStep}` : `Part ${state.currentNews.arcStep}`}
              </span>
            )}
          </div>
          <span className="font-semibold text-xs tracking-tight">
            {state.currentNews.headline}
          </span>
        </div>

        {/* Clickable prompt hint */}
        <div className="flex-shrink-0 flex items-center gap-0.5 mt-0.5 text-slate-400 group-hover:text-amber-700 transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="text-[10px] font-extrabold hidden xs:inline">
            {isHe ? 'מבזקים' : 'Feed'}
          </span>
          {isHe ? (
            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          ) : (
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          )}
        </div>
      </div>
    </div>
  );
};
