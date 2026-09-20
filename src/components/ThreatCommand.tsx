import { selectLocale, translate } from '../locales/translate';
import { useEffect, useRef, type Dispatch } from 'react';
import { TriangleAlert, X } from 'lucide-react';
import type { GameAction, GameState } from '../types';
import { availableTroops, objective, RULES } from '../game/rules';
import { incomingSupport, threatDefense } from '../game/threats';
import { tileName } from '../game/hexGridData';

interface Props { state: GameState; dispatch: Dispatch<GameAction> }

export function ThreatStatus({ state, dispatch }: Props) {
  const threat = state.threats[0];
  if (state.tutorialStep !== 'done') return <div className="game-goal z-10 shrink-0 px-3 py-1 text-center text-[11px] font-bold leading-snug text-slate-800">{objective(state)}</div>;
  const feedback = state.threatFeedback && state.threatFeedback.until > state.elapsedSeconds ? state.threatFeedback : null;
  return <div className="game-goal threat-status z-10 shrink-0 px-3">
    {threat ? <button data-testid="threat-status" className="threat-strip w-full rounded-lg px-2 py-1 text-start text-[11px] font-bold leading-tight"
      onClick={() => dispatch({ type: 'SELECT_THREAT', id: threat.id })}>
      <span className="flex justify-between gap-2"><span className="flex min-w-0 items-center gap-1"><TriangleAlert className="h-3 w-3 shrink-0" /><span className="truncate">{tileName(state.tiles[threat.tileId], state.locale)}</span></span>
        <span className="shrink-0 tabular-nums">{threatDefense(state, threat)}/{threat.required} · {Math.max(0, threat.deadline - state.elapsedSeconds)}{translate(state.locale, 'components.ThreatCommand.19', [])}</span></span>
      <span className="block text-[10px]">{translate(state.locale, 'components.ThreatCommand.20', [])}{state.threats.length > 1 ? (translate(state.locale, 'components.ThreatCommand.20', [])) : ''}</span>
    </button> : <button className="min-h-9 w-full truncate rounded-lg px-1 text-center text-[10px] font-bold text-slate-800"
      title={feedback ? selectLocale(state.locale, feedback.textHe, feedback.textEn) : objective(state)}
      onClick={() => dispatch(feedback ? { type: 'OPEN_NEWS_MODAL' } : { type: 'OPEN_TOOLKIT' })}>
      {feedback ? selectLocale(state.locale, feedback.textHe, feedback.textEn) : translate(state.locale, 'components.ThreatCommand.24', [Math.max(0, (state.nextThreatAt ?? state.elapsedSeconds + RULES.threatGrace) - state.elapsedSeconds)])}
    </button>}
  </div>;
}

export function ThreatCommand({ state, dispatch }: Props) {
  const panel = useRef<HTMLElement>(null);
  const threat = state.threats.find(t => t.id === state.selectedThreatId);
  useEffect(() => {
    if (!threat) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    return () => previous?.focus();
  }, [threat?.id]);
  if (!threat) return null;
  const tile = state.tiles[threat.tileId];
  const ready = threatDefense(state, threat);
  const incoming = incomingSupport(state, threat.id);
  const remaining = threat.deadline - state.elapsedSeconds;
  const full = ready + incoming >= threat.required;
  const tooLate = remaining < RULES.reinforcementTravel;
  const sources = Object.values(state.tiles).filter(t => t.id !== tile.id && t.garrisonCount > 0 && (t.hasSettlement || t.isBorderCheckpoint));
  const send = (sourceId: string) => dispatch({ type: 'REINFORCE_THREAT', threatId: threat.id, sourceId });
  const close = () => dispatch({ type: 'SELECT_THREAT', id: null });
  return <div className="absolute inset-0 z-50 grid place-items-center bg-black/75 p-3" onClick={close}>
    <section ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="threat-title"
      className="modal-panel w-full max-w-sm rounded-3xl border-2 border-amber-500 bg-amber-50 p-4 text-slate-900 shadow-2xl outline-none"
      onClick={e => e.stopPropagation()} onKeyDown={e => {
        if (e.key === 'Escape') { e.stopPropagation(); close(); }
        if (e.key === 'Tab') {
          const buttons = [...panel.current!.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
          const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
          if (e.shiftKey && index <= 0) { e.preventDefault(); buttons.at(-1)?.focus(); }
          else if (!e.shiftKey && (index < 0 || index === buttons.length - 1)) { e.preventDefault(); buttons[0]?.focus(); }
        }
      }}>
      <div className="flex items-center justify-between gap-2"><h2 id="threat-title" className="text-lg font-black">{translate(state.locale, 'components.ThreatCommand.62', [])}</h2>
        <button className="grid min-h-11 min-w-11 place-items-center" onClick={close} aria-label={translate(state.locale, 'components.ThreatCommand.63', [])}><X className="h-5 w-5" /></button></div>
      {state.threats.length > 1 && <div className="mb-3 flex gap-2">{state.threats.map(t => <button key={t.id} aria-pressed={t.id === threat.id}
        className={`min-h-11 flex-1 rounded-lg border px-2 text-xs font-bold ${t.id === threat.id ? 'border-amber-700 bg-amber-200' : 'border-amber-300 bg-white'}`}
        onClick={() => dispatch({ type: 'SELECT_THREAT', id: t.id })}>{tileName(state.tiles[t.tileId], state.locale)} · {t.deadline - state.elapsedSeconds}{translate(state.locale, 'components.ThreatCommand.66', [])}</button>)}</div>}
      <div className="rounded-xl bg-slate-900 p-3 text-white">
        <h3 className="font-bold">{tileName(tile, state.locale)}</h3>
        <p className="mt-1 text-sm" data-testid="threat-strength">{translate(state.locale, 'components.ThreatCommand.69', [ready, threat.required, incoming, remaining])}</p>
      </div>
      <p className="my-3 text-xs leading-relaxed">{translate(state.locale, 'components.ThreatCommand.72', [])}</p>
      <p className="mb-3 text-xs text-red-800">{translate(state.locale, 'components.ThreatCommand.75', [])}</p>
      {full || tooLate ? <p className="rounded-xl bg-amber-100 p-3 text-sm font-bold">{tooLate && !full ? (translate(state.locale, 'components.ThreatCommand.77', []))
        : translate(state.locale, 'components.ThreatCommand.78', [])}</p> : <>
        <button disabled={availableTroops(state) === 0} className="min-h-11 w-full rounded-xl bg-emerald-700 p-3 text-sm font-bold text-white disabled:opacity-40" onClick={() => send('available')}>
          {translate(state.locale, 'components.ThreatCommand.80', [availableTroops(state)])}</button>
        <details className="mt-3 rounded-xl border border-amber-300 p-2">
        <summary className="flex min-h-11 cursor-pointer items-center text-xs font-bold">{translate(state.locale, 'components.ThreatCommand.82', [])}</summary>
        <div className="grid grid-cols-2 gap-2">{sources.map(source => <button key={source.id} className="min-h-11 rounded-xl border border-amber-300 bg-white p-2 text-start text-xs"
          onClick={() => send(source.id)}>{tileName(source, state.locale)}<span className="mt-1 block font-bold text-red-800">{source.isBorderCheckpoint
            ? translate(state.locale, 'components.ThreatCommand.borderSource', [])
            : translate(state.locale, 'components.ThreatCommand.outpostSource', [])}</span></button>)}</div>
        </details>
        {state.reservesBatchesLeft > 0 && <button className="mt-3 min-h-11 w-full rounded-xl bg-blue-700 p-2 text-sm font-bold text-white" onClick={() => dispatch({ type: 'CALL_RESERVES' })}>
          {translate(state.locale, 'components.ThreatCommand.88', [])}</button>}
      </>}
      <button className="mt-3 min-h-11 w-full rounded-xl bg-amber-900 p-3 text-sm font-bold text-white" onClick={close}>{translate(state.locale, 'components.ThreatCommand.90', [])}</button>
      {tile.hasSettlement && <button className="mt-2 min-h-11 w-full text-xs font-bold underline" onClick={() => {
        close(); dispatch({ type: 'SELECT_TILE', tileId: tile.id });
      }}>{translate(state.locale, 'components.ThreatCommand.93', [])}</button>}
    </section>
  </div>;
}
