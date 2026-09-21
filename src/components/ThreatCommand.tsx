import { selectLocale, translate } from '../locales/translate';
import { type Dispatch } from 'react';
import { TriangleAlert } from 'lucide-react';
import type { GameAction, GameState } from '../types';
import { objective, RULES } from '../game/rules';
import { dangerStatus, threatDefense } from '../game/threats';
import { tileName } from '../game/hexGridData';

interface Props { state: GameState; dispatch: Dispatch<GameAction> }

export function ThreatStatus({ state, dispatch }: Props) {
  const threat = state.threats[0];
  const danger = dangerStatus(state);
  if (danger) return <div className="game-goal danger-status z-10 shrink-0 px-3" data-critical={danger.critical}>
    <div className="danger-strip" data-testid="danger-strip" role="status" aria-live="polite" aria-atomic="true">
      <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{translate(state.locale, danger.critical ? 'danger.critical' : 'danger.warning')} · {translate(state.locale, `danger.${danger.advice}`)}</span>
    </div>
  </div>;
  if (state.tutorialStep !== 'done') return <div className="game-goal z-10 shrink-0 px-3 py-1 text-center text-[11px] font-bold leading-snug text-slate-800">{objective(state)}</div>;
  const feedback = state.threatFeedback && state.threatFeedback.until > state.elapsedSeconds ? state.threatFeedback : null;
  return <div className="game-goal threat-status z-10 shrink-0 px-3">
    {threat ? <button data-testid="threat-status" className="threat-strip w-full rounded-lg px-2 py-1 text-start text-[11px] font-bold leading-tight"
      onClick={() => dispatch({ type: 'REINFORCE_THREAT', threatId: threat.id })}>
      <span className="flex justify-between gap-2"><span className="flex min-w-0 items-center gap-1"><TriangleAlert className="h-3 w-3 shrink-0" /><span className="truncate">{tileName(state.tiles[threat.tileId], state.locale)}</span></span>
        <span className="shrink-0 tabular-nums">{threatDefense(state, threat)}/{threat.required} · {Math.max(0, threat.deadline - state.elapsedSeconds)}{translate(state.locale, 'components.ThreatCommand.19', [])}</span></span>
      <span className="block text-[10px]">{translate(state.locale, 'threat.count', [state.threats.length])}</span>
    </button> : <div className="min-h-9 w-full truncate rounded-lg px-1 text-center text-[10px] font-bold text-slate-800"
      title={feedback ? selectLocale(state.locale, feedback.textHe, feedback.textEn) : objective(state)}>
      {feedback ? selectLocale(state.locale, feedback.textHe, feedback.textEn) : translate(state.locale, 'components.ThreatCommand.24', [Math.max(0, (state.nextThreatAt ?? state.elapsedSeconds + RULES.threatGrace) - state.elapsedSeconds)])}
    </div>}
  </div>;
}
