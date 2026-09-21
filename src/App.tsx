import { translate } from './locales/translate';
import { useReducer, useEffect } from 'react';
import { gameReducer, INITIAL_STATE } from './game/gameReducer';
import { MobileFrame } from './components/MobileFrame';
import { HeaderBar } from './components/HeaderBar';
import { TopStatusPill } from './components/TopStatusPill';
import { NewsAlertTicker } from './components/NewsAlertTicker';
import { HexMapCanvas } from './components/HexMapCanvas';
import { BottomActionDeck } from './components/BottomActionDeck';
import { SoulSparksOverlay } from './components/SoulSparksOverlay';
import { SettlementInspectorModal } from './components/SettlementInspectorModal';
import { October7DefeatModal } from './components/October7DefeatModal';
import { RationalVictoryModal } from './components/RationalVictoryModal';
import { FloatingEmergencyAlert } from './components/FloatingEmergencyAlert';
import { InfiltrationDefenseModal } from './components/InfiltrationDefenseModal';
import { NewsFeedModal } from './components/NewsFeedModal';
import { EntranceInstructionModal } from './components/EntranceInstructionModal';
import { StrategyToolkitModal } from './components/StrategyToolkitModal';
import { isGamePaused } from './game/rules';
import { ThreatCommand, ThreatStatus } from './components/ThreatCommand';
import { ModalAccessibility } from './components/ModalAccessibility';
import { dangerStatus } from './game/threats';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  // Sync HTML dir and lang attributes with state.locale
  useEffect(() => {
    document.documentElement.lang = state.locale;
    document.documentElement.dir = translate(state.locale, 'App.27', []);
  }, [state.locale]);

  // Backgrounded tabs and minimized windows must never advance the simulation.
  // Returning keeps the game paused until the player explicitly resumes.
  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) dispatch({ type: 'PAUSE_GAME' });
    };
    const pauseOnPageHide = () => dispatch({ type: 'PAUSE_GAME' });
    document.addEventListener('visibilitychange', pauseWhenHidden);
    window.addEventListener('pagehide', pauseOnPageHide);
    return () => {
      document.removeEventListener('visibilitychange', pauseWhenHidden);
      window.removeEventListener('pagehide', pauseOnPageHide);
    };
  }, []);

  // Game loop tick every 1 second: auto-pauses when modals are open or when user tapped pause
  useEffect(() => {
    if (state.gameStatus !== 'playing' || isGamePaused(state)) return;

    const interval = setInterval(() => {
      dispatch({ type: 'TICK_TIMER' });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    state.gameStatus,
    state.isPaused,
    state.isSystemMenuOpen,
    state.isIntroModalOpen,
    state.isNewsModalOpen,
    state.selectedSettlementId,
    state.selectedInfiltrationId,
    state.selectedThreatId,
    state.isToolkitOpen,
    state.infoPopover,
  ]);

  // Auto-dismiss intercepted toast after 3 seconds
  useEffect(() => {
    if (state.interceptedToast) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_INTERCEPTED_TOAST' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.interceptedToast]);

  return (
    <MobileFrame isShaking={state.isScreenShaking} reduceMotion={state.reduceMotion}>
      {/* Floating Game Paused Indicator */}
      {state.isPaused && (
        <button type="button"
          onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
          className="absolute top-[138px] inset-x-6 z-40 cursor-pointer overflow-hidden rounded-2xl bg-amber-950/95 border-2 border-amber-400 shadow-2xl backdrop-blur-md py-2 px-3 text-amber-200 transition-all animate-in fade-in flex items-center justify-between pointer-events-auto"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">⏸️</span>
            <span className="text-xs font-black font-rubik">
              {translate(state.locale, 'App.72', [])}
            </span>
          </div>
          <span className="text-[10px] font-bold text-amber-300 underline font-heebo">
            {translate(state.locale, 'App.76', [])}
          </span>
        </button>
      )}
      {/* Top Header Controls (Language, Sound, Restart) */}
      <HeaderBar state={state} dispatch={dispatch} />

      {/* Top Status Counters & Defense Meter */}
      <TopStatusPill state={state} dispatch={dispatch} />

      {/* Breaking News Ticker (Clickable to open News Feed) */}
      <NewsAlertTicker state={state} dispatch={dispatch} />
      <ThreatStatus state={state} dispatch={dispatch} />

      {/* Floating Operational Emergency Alert (0px layout footprint, never resizes map) */}
      <FloatingEmergencyAlert state={state} dispatch={dispatch} />

      {/* Floating Interception Success Feedback Banner (0px layout footprint, auto-clearing) */}
      {state.interceptedToast && (
        <div
          onClick={() => dispatch({ type: 'CLEAR_INTERCEPTED_TOAST' })}
          title={translate(state.locale, 'App.97', [])}
          className="absolute top-[138px] inset-x-4 z-40 cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/95 via-emerald-800/95 to-emerald-950/95 border-2 border-emerald-400 shadow-2xl backdrop-blur-md p-2.5 text-white transition-all animate-in fade-in slide-in-from-top-2 flex items-center justify-between pointer-events-auto"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl flex-shrink-0 animate-bounce">🛡️</span>
            <div className="flex flex-col text-start">
              <span className="text-xs font-black text-emerald-200 font-rubik">
                {state.locale === 'he' ? state.interceptedToast.textHe : state.interceptedToast.textEn}
              </span>
              <span className="text-[10px] text-emerald-300 font-heebo">
                {translate(state.locale, 'App.107', [])}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: 'CLEAR_INTERCEPTED_TOAST' });
            }}
            className="text-emerald-300 hover:text-white p-1 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Critical Defense Perimeter Alert Vignette */}
      {(state.defenseScore <= 25 || dangerStatus(state)?.critical) && state.gameStatus === 'playing' && (
        <div className="pointer-events-none absolute inset-0 ring-4 ring-inset ring-red-600/60 animate-pulse z-30" />
      )}

      {/* The Interactive Hex Map Viewport */}
      <HexMapCanvas state={state} dispatch={dispatch} />

      {/* Soul Sparks Floating Particles */}
      <SoulSparksOverlay sparks={state.sparks} dispatch={dispatch} />

      {/* Bottom Action Deck: 3 Clay Buttons + Lord of Hosts Button */}
      <BottomActionDeck state={state} dispatch={dispatch} />

      {/* Modals */}
      <InfiltrationDefenseModal state={state} dispatch={dispatch} />
      <SettlementInspectorModal state={state} dispatch={dispatch} />
      <ThreatCommand state={state} dispatch={dispatch} />
      <October7DefeatModal state={state} dispatch={dispatch} />
      <RationalVictoryModal state={state} dispatch={dispatch} />
      <NewsFeedModal state={state} dispatch={dispatch} />
      <EntranceInstructionModal state={state} dispatch={dispatch} />
      <StrategyToolkitModal state={state} dispatch={dispatch} />
      <ModalAccessibility state={state} dispatch={dispatch} />
    </MobileFrame>
  );
}
