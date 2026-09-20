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
import { NewsFeedModal } from './components/NewsFeedModal';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  // Sync HTML dir and lang attributes with state.locale
  useEffect(() => {
    document.documentElement.lang = state.locale;
    document.documentElement.dir = state.locale === 'he' ? 'rtl' : 'ltr';
  }, [state.locale]);

  // Game loop tick every 1 second
  useEffect(() => {
    if (state.gameStatus !== 'playing') return;

    const interval = setInterval(() => {
      dispatch({ type: 'TICK_TIMER' });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.gameStatus]);

  return (
    <MobileFrame isShaking={state.isScreenShaking}>
      {/* Top Header Controls (Language, Sound, Restart) */}
      <HeaderBar state={state} dispatch={dispatch} />

      {/* Top Status Counters & Defense Meter */}
      <TopStatusPill state={state} />

      {/* Breaking News Ticker (Clickable to open News Feed) */}
      <NewsAlertTicker state={state} dispatch={dispatch} />

      {/* The Interactive Hex Map Viewport */}
      <HexMapCanvas state={state} dispatch={dispatch} />

      {/* Soul Sparks Floating Particles */}
      <SoulSparksOverlay sparks={state.sparks} dispatch={dispatch} />

      {/* Bottom Action Deck: 3 Clay Buttons + Lord of Hosts Button */}
      <BottomActionDeck state={state} dispatch={dispatch} />

      {/* Modals */}
      <SettlementInspectorModal state={state} dispatch={dispatch} />
      <October7DefeatModal state={state} dispatch={dispatch} />
      <RationalVictoryModal state={state} dispatch={dispatch} />
      <NewsFeedModal state={state} dispatch={dispatch} />
    </MobileFrame>
  );
}
