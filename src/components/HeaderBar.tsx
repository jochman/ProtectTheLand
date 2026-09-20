import React from 'react';
import { Volume2, VolumeX, RotateCcw, Globe } from 'lucide-react';
import { GameState, GameAction } from '../types';

interface HeaderBarProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ state, dispatch }) => {
  return (
    <header className="flex items-center justify-between px-4 py-2 text-white/90 z-20 flex-shrink-0">
      <div className="flex items-center gap-1.5 font-bold tracking-wide">
        <span className="text-xl font-black text-amber-300 drop-shadow-sm">
          {state.locale === 'he' ? '7 באוקטובר' : 'OCTOBER 7'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <button
          onClick={() => dispatch({ type: 'SET_LOCALE', locale: state.locale === 'he' ? 'en' : 'he' })}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/30 hover:bg-black/50 text-xs font-bold border border-white/20 backdrop-blur-sm transition-transform active:scale-95"
          title="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5 text-amber-300" />
          <span>{state.locale === 'he' ? 'EN' : 'עב'}</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
          className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-xs font-bold border border-white/20 backdrop-blur-sm transition-transform active:scale-95"
          title="Toggle Sound"
        >
          {state.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={() => dispatch({ type: 'RESTART_GAME' })}
          className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-xs font-bold border border-white/20 backdrop-blur-sm transition-transform active:scale-95"
          title="Restart"
        >
          <RotateCcw className="w-4 h-4 text-amber-200" />
        </button>
      </div>
    </header>
  );
};
