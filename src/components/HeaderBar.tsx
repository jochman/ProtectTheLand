import { translate } from '../locales/translate';
import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw, Globe, Maximize2, Minimize2, Play, Pause, BookOpen, Menu, X, Eye } from 'lucide-react';
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
    <header className="relative flex items-center justify-between px-3 sm:px-4 py-1 sm:py-2 text-white/90 z-40 flex-shrink-0">
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

        {/* Language Toggle */}
        <button
          onClick={() => dispatch({ type: 'SET_LOCALE', locale: state.locale === 'he' ? 'en' : 'he' })}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/30 hover:bg-black/50 text-xs font-bold border border-white/20 backdrop-blur-sm transition-transform active:scale-95"
          title={translate(state.locale, 'components.HeaderBar.87', [])}
        >
          <Globe className="w-3.5 h-3.5 text-amber-300" />
          <span>{translate(state.locale, 'components.HeaderBar.90', [])}</span>
        </button>

        {/* Secondary controls live in one compact menu. */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SYSTEM_MENU' })}
          aria-expanded={state.isSystemMenuOpen}
          className={`p-1.5 rounded-full text-xs font-bold border backdrop-blur-sm transition-transform active:scale-95 ${state.isSystemMenuOpen ? 'bg-amber-400 text-amber-950 border-amber-200' : 'bg-black/30 hover:bg-black/50 text-white/80 border-white/20'}`}
          title={translate(state.locale, 'components.HeaderBar.menu', [])}
        >
          {state.isSystemMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {state.isSystemMenuOpen && (
        <section role="dialog" aria-modal="true" aria-label={translate(state.locale, 'components.HeaderBar.menu', [])}
          className="absolute end-3 top-full z-50 w-64 rounded-2xl border-2 border-amber-300 bg-[#fffaf2] p-2 text-slate-800 shadow-2xl">
          <button onClick={() => dispatch({ type: 'OPEN_TOOLKIT' })} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-start text-sm font-bold hover:bg-amber-100">
            <BookOpen className="h-4 w-4 text-amber-700" />{translate(state.locale, 'components.HeaderBar.guide', [])}
          </button>
          <button onClick={() => dispatch({ type: 'TOGGLE_SOUND' })} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-start text-sm font-bold hover:bg-amber-100">
            {state.soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-700" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
            {translate(state.locale, state.soundEnabled ? 'components.HeaderBar.soundOn' : 'components.HeaderBar.soundOff', [])}
          </button>
          <button onClick={() => dispatch({ type: 'TOGGLE_REDUCE_MOTION' })} aria-pressed={state.reduceMotion} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-start text-sm font-bold hover:bg-amber-100">
            <Eye className="h-4 w-4 text-blue-700" />{translate(state.locale, state.reduceMotion ? 'components.HeaderBar.motionReduced' : 'components.HeaderBar.reduceMotion', [])}
          </button>
          <button onClick={() => { toggleFullscreen(); dispatch({ type: 'CLOSE_SYSTEM_MENU' }); }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-start text-sm font-bold hover:bg-amber-100">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}{translate(state.locale, isFullscreen ? 'components.HeaderBar.exitFullscreen' : 'components.HeaderBar.enterFullscreen', [])}
          </button>
          <div className="my-1 border-t border-amber-200" />
          <button onClick={() => dispatch({ type: 'RESTART_GAME' })} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-start text-sm font-bold text-red-800 hover:bg-red-50">
            <RotateCcw className="h-4 w-4" />{translate(state.locale, 'components.HeaderBar.110', [])}
          </button>
        </section>
      )}
    </header>
  );
};
