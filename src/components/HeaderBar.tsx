import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw, Globe, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';
import { GameState, GameAction } from '../types';

interface HeaderBarProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ state, dispatch }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const isHe = state.locale === 'he';

  return (
    <header className="flex items-center justify-between px-3 sm:px-4 py-1 sm:py-2 text-white/90 z-20 flex-shrink-0">
      <div className="flex items-center gap-1.5 font-bold tracking-wide">
        <span className="text-xl font-black text-amber-300 drop-shadow-sm font-rubik">
          {isHe ? '7 באוקטובר' : 'OCTOBER 7'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* How to Play / Guide */}
        <button
          onClick={() => dispatch({ type: 'OPEN_INTRO_MODAL' })}
          className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-xs font-bold border border-white/20 backdrop-blur-sm transition-transform active:scale-95 text-amber-300"
          title={isHe ? 'הוראות ומטרת המשחק' : 'How to Play'}
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-xs font-bold border border-white/20 backdrop-blur-sm transition-transform active:scale-95 text-white/80"
          title={isHe ? 'מסך מלא' : 'Toggle Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Language Toggle */}
        <button
          onClick={() => dispatch({ type: 'SET_LOCALE', locale: state.locale === 'he' ? 'en' : 'he' })}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/30 hover:bg-black/50 text-xs font-bold border border-white/20 backdrop-blur-sm transition-transform active:scale-95"
          title="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5 text-amber-300" />
          <span>{isHe ? 'EN' : 'עב'}</span>
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
