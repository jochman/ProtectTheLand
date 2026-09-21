import { translate } from '../locales/translate';
import type { Dispatch } from 'react';
import type { GameState, GameAction } from '../types';
import { RULES } from '../game/rules';

export function EntranceInstructionModal({ state, dispatch }: { state: GameState; dispatch: Dispatch<GameAction> }) {
  if (!state.isIntroModalOpen) return null;
  return <div className="absolute inset-0 z-50 grid place-items-center bg-black/75 p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="intro-title" className="modal-panel w-full max-w-sm rounded-3xl bg-amber-50 p-5 text-slate-900 shadow-2xl">
      <h2 id="intro-title" className="text-xl font-black">{translate(state.locale, 'components.EntranceInstructionModal.10', [])}</h2>
      <p className="mt-3 text-sm leading-relaxed">{translate(state.locale, 'components.EntranceInstructionModal.11', [])}</p>
      <ol className="mt-4 list-decimal space-y-2 ps-5 text-sm">
        <li>{translate(state.locale, 'components.EntranceInstructionModal.13', [])}</li>
        <li>{translate(state.locale, 'components.EntranceInstructionModal.14', [])}</li>
        <li>{translate(state.locale, 'components.EntranceInstructionModal.15', [])}</li>
      </ol>
      <p className="mt-4 rounded-xl bg-amber-100 p-3 text-xs leading-relaxed">{translate(state.locale, 'components.EntranceInstructionModal.17', [])}</p>
      <p className="mt-3 text-xs">{translate(state.locale, 'components.EntranceInstructionModal.18', [RULES.raidDeaths.toLocaleString(state.locale === 'he' ? 'he-IL' : 'en-US'), RULES.raidCost])}</p>
      <p className="mt-3 text-sm font-bold">{translate(state.locale, 'components.EntranceInstructionModal.19', [])}</p>
      <button className="mt-4 min-h-11 w-full rounded-xl bg-amber-700 p-3 font-bold text-white" onClick={() => dispatch({ type: 'CLOSE_INTRO_MODAL' })}>{translate(state.locale, 'components.EntranceInstructionModal.20', [])}</button>
    </section>
  </div>;
}
