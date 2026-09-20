import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ShieldCheck, RotateCcw } from 'lucide-react';
import { GameState, GameAction } from '../types';
import { he } from '../locales/he';
import { en } from '../locales/en';

interface RationalVictoryModalProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const RationalVictoryModal: React.FC<RationalVictoryModalProps> = ({ state, dispatch }) => {
  if (state.gameStatus !== 'rational_victory') return null;

  const strings = state.locale === 'he' ? he : en;

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#f0fdf4] border-4 border-emerald-600 w-full max-w-sm rounded-[32px] p-6 shadow-2xl text-slate-800 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Victory Header */}
        <div className="bg-emerald-100/90 border-2 border-emerald-400 rounded-2xl px-6 py-3 shadow-inner w-full flex flex-col items-center">
          <ShieldCheck className="w-10 h-10 text-emerald-600 mb-1 animate-bounce" />
          <h1 className="text-2xl font-black text-emerald-800 tracking-tight font-rubik">
            {strings.modals.victoryTitle}
          </h1>
          <p className="text-xs font-bold text-emerald-700 mt-1 font-heebo">
            {strings.modals.victorySubtitle}
          </p>
        </div>

        {/* Analytical Explanation */}
        <p className="text-xs leading-relaxed text-slate-700 px-1 font-heebo">
          {strings.modals.victoryBody}
        </p>

        {/* The Civic Movement Slogan */}
        <div className="bg-emerald-800 text-emerald-100 font-black text-sm px-4 py-2 rounded-xl tracking-wide shadow-sm w-full font-rubik">
          {strings.slogan}
        </div>

        {/* Restart Button */}
        <button
          onClick={() => dispatch({ type: 'RESTART_GAME' })}
          className="w-full py-3 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 font-heebo"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{strings.modals.victoryRestartBtn}</span>
        </button>

      </div>
    </div>
  );
};
