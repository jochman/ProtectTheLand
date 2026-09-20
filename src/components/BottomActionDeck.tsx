import type { Dispatch } from 'react';
import type { GameAction, GameState } from '../types';
import { LordOfHostsButton } from './LordOfHostsButton';
import { RULES, objective } from '../game/rules';

export function BottomActionDeck({ state, dispatch }: { state: GameState; dispatch: Dispatch<GameAction> }) {
  const he = state.locale === 'he';
  const exposed = Object.values(state.tiles).some(t => t.hasSettlement && t.garrisonCount === 0);
  const hasTroops = Object.values(state.tiles).some(t => t.isBorderCheckpoint && t.garrisonCount > 0);
  const playing = state.gameStatus === 'playing';
  const constructing = Object.keys(state.constructions).length > 0;
  const instruction = state.isDeployMode ? (he ? 'בחר מאחז מודגש במפה' : 'Select a highlighted outpost')
    : state.isBuildMode ? (he ? 'בחר גבעה מודגשת במפה' : 'Select a highlighted hilltop')
    : state.tutorialStep === 'observe' && state.activeBreaches.length ? (he ? '3/3 · הפרצה שוחקת חוסן. לחץ לסגירה' : '3/3 · The gap drains HP. Tap to seal it')
    : state.activeBreaches.length ? (he ? 'לחץ על פרצה מודגשת להחזרת חייל' : 'Tap a highlighted gap to return a troop')
    : state.tutorialStep === 'build' ? (constructing ? (he ? 'המאחז בבנייה…' : 'Outpost under construction…') : (he ? '1/3 · בנה מאחז ראשון' : '1/3 · Build your first outpost'))
    : state.tutorialStep === 'deploy' ? (he ? '2/3 · בחר פריסה ובדוק את המחיר' : '2/3 · Select Deploy and preview the cost')
    : (he ? 'הגבול בטוח. בדוק את יעד התרחיש' : 'Border secure. Check your scenario goal');
  const details = state.tutorialStep === 'observe'
    ? (he ? '3/3 · החייל הועבר למאחז. הפרצה המודגשת שוחקת 0.4 חוסן לשנייה. לחץ עליה להחזרת חייל; כך תוכל להשוות בין מימון המאחז להגנת הגבול.' : '3/3 · Your troop moved to the outpost. The highlighted gap drains 0.4 HP/s. Tap it to return a troop and compare outpost funding with border security.')
    : objective(state);
  return <div className="action-deck relative z-20 flex shrink-0 flex-col gap-1 px-3 pb-2 pt-1">
    <div className="flex min-h-10 items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-2 text-slate-900">
      <button className="min-h-10 flex-1 text-start text-xs font-bold leading-snug" onClick={() => dispatch({ type: 'SHOW_INFO_POPOVER', title: he ? 'הצעד הבא' : 'Next decision', text: details })}>{instruction} <span className="text-amber-700">ⓘ</span></button>
      {(state.isBuildMode || state.isDeployMode) && <button className="min-h-10 px-2 text-xs underline" onClick={() => dispatch({ type: state.isBuildMode ? 'TOGGLE_BUILD_MODE' : 'DEPLOY_TROOPS' })}>{he ? 'ביטול' : 'Cancel'}</button>}
    </div>
    <div className="grid grid-cols-3 gap-1.5">
      <button className="clay-btn min-h-14 px-1 py-1 text-xs" disabled={!playing || state.reservesBatchesLeft === 0} onClick={() => dispatch({ type: 'CALL_RESERVES' })}>
        <span>{he ? 'גייס מילואים' : 'Call reserves'}</span><span className="text-[11px]">+4 · {state.reservesBatchesLeft} {he ? 'נותרו' : 'left'}</span>
      </button>
      <button className={`clay-btn min-h-14 px-1 py-1 text-xs ${state.isDeployMode ? 'ring-2 ring-amber-700' : ''}`} disabled={!playing || (!state.isDeployMode && (!exposed || !hasTroops || state.budget < RULES.deployCost))} onClick={() => dispatch({ type: 'DEPLOY_TROOPS' })}>
        <span>{he ? 'פריסת חייל' : 'Deploy troop'}</span><span className="text-[11px]">₪{RULES.deployCost} / {he ? 'חייל' : 'troop'}</span>
      </button>
      <button className={`clay-btn min-h-14 px-1 py-1 text-xs ${state.isBuildMode ? 'ring-2 ring-amber-700' : ''}`} disabled={!playing || (!state.isBuildMode && state.budget < RULES.buildCost)} onClick={() => dispatch({ type: 'TOGGLE_BUILD_MODE' })}>
        <span>{he ? 'בניית מאחז' : 'Build outpost'}</span><span className="text-[11px]">₪{RULES.buildCost}</span>
      </button>
    </div>
    <LordOfHostsButton state={state} dispatch={dispatch} />
  </div>;
}
