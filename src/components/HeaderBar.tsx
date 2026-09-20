import { translate } from '../locales/translate';
import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw, Globe, HelpCircle, Maximize2, Minimize2, Play, Pause, BookOpen } from 'lucide-react';
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

  return (
    <header className="flex items-center justify-between px-3 sm:px-4 py-1 sm:py-2 text-white/90 z-20 flex-shrink-0">
      <div className="flex items-center gap-1.5 font-bold tracking-wide">
        <span className="text-xl font-black text-amber-300 drop-shadow-sm font-rubik">
          {translate(state.locale, 'components.HeaderBar.39', [])}
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Pause / Resume Button */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
          className={`p-1.5 rounded-full text-xs font-bold border backdrop-blur-sm transition-transform active:scale-95 ${
            state.isPaused
              ? 'bg-amber-400 text-amber-950 border-amber-200 ring-2 ring-amber-300'
              : 'bg-black/30 hover:bg-black/50 text-white/80 border-white/20'
          }`}
          title={state.isPaused
            ? translate(state.locale, 'components.HeaderBar.resumeGame', [])
            : translate(state.locale, 'components.HeaderBar.pauseGame', [])}
        >
          {state.isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
        </button>

        {/* How to Play / Guide */}
        <button
          onClick={() => dispatch({ type: 'OPEN_INTRO_MODAL' })}
          className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-xs font-bold border border-white/20 backdrop-blur-sm transition-transform active:scale-95 text-amber-300"
          title={translate(state.locale, 'components.HeaderBar.61', [])}
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={() => dispatch({ type: 'OPEN_TOOLKIT' })}
          className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-xs font-bold border border-white/20 backdrop-blur-sm transition-transform active:scale-95 text-amber-300"
          title={translate(state.locale, 'components.HeaderBar.69', [])}
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-xs font-bold border border-white/20 backdrop-blur-sm transition-transform active:scale-95 text-white/80"
          title={translate(state.locale, 'components.HeaderBar.78', [])}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Language Toggle */}
        <button
          onClick={() => dispatch({ type: 'SET_LOCALE', locale: state.locale === 'he' ? 'en' : 'he' })}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/30 hover:bg-black/50 text-xs font-bold border border-white/20 backdrop-blur-sm transition-transform active:scale-95"
          title={translate(state.locale, 'components.HeaderBar.87', [])}
        >
          <Globe className="w-3.5 h-3.5 text-amber-300" />
          <span>{translate(state.locale, 'components.HeaderBar.90', [])}</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
          className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-xs font-bold border border-white/20 backdrop-blur-sm transition-transform active:scale-95"
          title={translate(state.locale, 'components.HeaderBar.97', [])}
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
          title={translate(state.locale, 'components.HeaderBar.110', [])}
        >
          <RotateCcw className="w-4 h-4 text-amber-200" />
        </button>
      </div>
    </header>
  );
};
