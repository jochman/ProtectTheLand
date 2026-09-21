import { useEffect, type Dispatch } from 'react';
import type { GameAction, GameState } from '../types';

/** One focus boundary for every modal, including native disclosure controls. */
export function ModalAccessibility({ state, dispatch }: { state: GameState; dispatch: Dispatch<GameAction> }) {
  const key = state.isIntroModalOpen ? 'intro' : state.isToolkitOpen ? 'toolkit'
    : state.isNewsModalOpen ? 'news' : state.gameStatus !== 'playing' ? 'result'
    : state.selectedThreatId ? 'threat' : state.selectedSettlementId ? 'outpost'
    : state.selectedInfiltrationId ? 'infiltration' : state.infoPopover ? 'info' : '';
  useEffect(() => {
    if (!key) return;
    const panel = [...document.querySelectorAll<HTMLElement>('[role="dialog"]')].at(-1);
    if (!panel) return;
    const previous = document.activeElement as HTMLElement | SVGElement | null;
    const inert: HTMLElement[] = [];
    let branch: Element = panel;
    while (branch.parentElement && branch.parentElement.id !== 'root') {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement && !sibling.inert) {
          sibling.inert = true; inert.push(sibling);
        }
      }
      branch = branch.parentElement;
    }
    panel.tabIndex = -1;
    panel.focus();
    const focusable = () => [...panel.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], summary, input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')]
      .filter(el => el.getClientRects().length > 0 && !el.closest('[inert]')
        && ![...panel.querySelectorAll('details:not([open])')].some(details => details.contains(el) && el !== details.querySelector('summary')));
    const close: Partial<Record<string, GameAction>> = {
      intro: { type: 'CLOSE_INTRO_MODAL' }, toolkit: { type: 'CLOSE_TOOLKIT' }, news: { type: 'CLOSE_NEWS_MODAL' },
      threat: { type: 'SELECT_THREAT', id: null }, outpost: { type: 'SELECT_TILE', tileId: null },
      infiltration: { type: 'SELECT_INFILTRATION', id: null }, info: { type: 'CLEAR_INFO_POPOVER' },
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && close[key]) { event.preventDefault(); event.stopPropagation(); dispatch(close[key]!); }
      if (event.key !== 'Tab') return;
      const targets = focusable();
      const index = targets.indexOf(document.activeElement as HTMLElement);
      if (!targets.length) { event.preventDefault(); panel.focus(); }
      else if (event.shiftKey && index <= 0) { event.preventDefault(); targets.at(-1)!.focus(); }
      else if (!event.shiftKey && (index < 0 || index === targets.length - 1)) { event.preventDefault(); targets[0].focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      inert.forEach(el => { el.inert = false; });
      if (previous?.isConnected && previous !== document.body) previous.focus();
      else document.querySelector<HTMLButtonElement>('header button')?.focus();
    };
  }, [key, dispatch]);
  return null;
}
