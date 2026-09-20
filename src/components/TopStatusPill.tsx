import React from 'react';
import { Shield } from 'lucide-react';
import { GameState } from '../types';
import { he } from '../locales/he';
import { en } from '../locales/en';

interface TopStatusPillProps {
  state: GameState;
}

export const TopStatusPill: React.FC<TopStatusPillProps> = ({ state }) => {
  const strings = state.locale === 'he' ? he : en;

  // Determine Defense bar color
  let barColor = 'bg-emerald-500';
  if (state.defenseScore < 60) {
    barColor = 'bg-amber-500';
  }
  if (state.defenseScore < 30) {
    barColor = 'bg-red-500 animate-pulse';
  }

  return (
    <div className="flex flex-col items-center gap-1.5 px-4 z-20">
      {/* Upper Pill: Soldiers and Settlements */}
      <div className="status-pill flex items-center justify-around w-56 px-4 py-1.5 rounded-full shadow-lg">
        {/* Soldiers Counter */}
        <div className="flex items-center gap-2" title={strings.stats.soldiers}>
          {/* Soldier Figurine Token */}
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-800 fill-current drop-shadow-sm">
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21v-3.5c0-1.5 1-2.5 2.5-3h8c1.5.5 2.5 1.5 2.5 3V21H5.5z" />
            </svg>
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tight font-rubik">
            {state.soldiersAtBorder + state.soldiersAtSettlements}
          </span>
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Settlements Counter */}
        <div className="flex items-center gap-2" title={strings.stats.settlements}>
          {/* 3D Clay House Token */}
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-700 fill-current drop-shadow-sm">
              <polygon points="12,3 2,11 5,11 5,21 19,21 19,11 22,11" />
              <rect x="10" y="14" width="4" height="7" fill="#4a2810" />
            </svg>
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tight font-rubik">
            {state.settlementsCount}
          </span>
        </div>
      </div>

      {/* Lower Pill: Defense Bar */}
      <div className="status-pill flex items-center justify-between w-64 px-3 py-1.5 rounded-full shadow-md gap-2">
        {/* Progress Fill Bar */}
        <div className="flex-1 bg-amber-100/80 rounded-full h-4 p-0.5 border border-amber-300/60 overflow-hidden shadow-inner relative">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${Math.max(4, state.defenseScore)}%` }}
          />
        </div>

        {/* Shield Icon & Label */}
        <div className="flex items-center gap-1 text-slate-700">
          <Shield
            className={`w-4 h-4 ${
              state.defenseScore >= 60
                ? 'text-emerald-600 fill-emerald-100'
                : state.defenseScore >= 30
                ? 'text-amber-600 fill-amber-100'
                : 'text-red-600 fill-red-100 animate-bounce'
            }`}
          />
          <span className="text-xs font-bold text-slate-700 font-heebo">
            {strings.stats.defense}
          </span>
        </div>
      </div>
    </div>
  );
};
