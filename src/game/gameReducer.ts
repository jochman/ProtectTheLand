import { GameState, GameAction } from '../types';
import { INITIAL_TILES, SETTLEMENT_CANDIDATE_IDS } from './hexGridData';
import { he } from '../locales/he';
import { en } from '../locales/en';
import { sounds } from '../audio/soundEngine';

export const INITIAL_STATE: GameState = {
  locale: 'he',
  soundEnabled: true,
  gameStatus: 'playing',
  settlementsCount: 0,
  soldiersTotal: 8,
  soldiersAtBorder: 8,
  soldiersAtSettlements: 0,
  reservesBatchesLeft: 3,
  defenseScore: 100,
  lordOfHosts: {
    chargePercent: 12,
    stage: 1,
    stageGoalText: he.lordOfHosts.stage1Goal,
    countdownSeconds: null,
    isPanicMashMode: false,
    mashCount: 0,
    isCracked: false,
    piousToast: null,
  },
  tiles: JSON.parse(JSON.stringify(INITIAL_TILES)),
  activeBreaches: [],
  infiltratingTrucks: [],
  currentNews: {
    id: 'start',
    headline: he.news.start,
    source: 'מבזק חדשות',
  },
  selectedSettlementId: null,
  isScreenShaking: false,
  sparks: [],
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  const strings = state.locale === 'he' ? he : en;

  switch (action.type) {
    case 'SET_LOCALE': {
      const nextStrings = action.locale === 'he' ? he : en;
      let stageGoal = nextStrings.lordOfHosts.stage1Goal;
      if (state.lordOfHosts.stage === 2) stageGoal = nextStrings.lordOfHosts.stage2Goal;
      if (state.lordOfHosts.stage === 3) stageGoal = nextStrings.lordOfHosts.stage3Goal;
      return {
        ...state,
        locale: action.locale,
        lordOfHosts: {
          ...state.lordOfHosts,
          stageGoalText: stageGoal,
        },
      };
    }

    case 'TOGGLE_SOUND': {
      const nextSound = !state.soundEnabled;
      sounds.setMuted(!nextSound);
      return { ...state, soundEnabled: nextSound };
    }

    case 'BUILD_SETTLEMENT': {
      if (state.gameStatus !== 'playing') return state;

      // Find next unbuilt candidate tile
      const nextTileId = action.tileId || SETTLEMENT_CANDIDATE_IDS.find(id => !state.tiles[id]?.hasSettlement);
      if (!nextTileId || !state.tiles[nextTileId]) return state;

      const updatedTiles = { ...state.tiles };
      updatedTiles[nextTileId] = {
        ...updatedTiles[nextTileId],
        hasSettlement: true,
      };

      const newSettlementsCount = state.settlementsCount + 1;
      sounds.playBuild();

      // Calculate new deceptive Lord of Hosts charge percent
      let newCharge = Math.min(99.0, 12 + newSettlementsCount * 6.5);
      let newStage = state.lordOfHosts.stage;
      let stageGoalText = state.lordOfHosts.stageGoalText;

      if (newSettlementsCount >= 6 && newStage === 1) {
        newStage = 2;
        stageGoalText = strings.lordOfHosts.stage2Goal;
        newCharge = Math.max(newCharge, 55);
        sounds.playDeploy();
      } else if (newSettlementsCount >= 11 && newStage === 2) {
        newStage = 3;
        stageGoalText = strings.lordOfHosts.stage3Goal;
        newCharge = Math.max(newCharge, 85);
        sounds.playDeploy();
      } else if (newSettlementsCount >= 15) {
        newCharge = 99.0;
      }

      // Add soul spark animation
      const targetTile = updatedTiles[nextTileId];
      const newSpark = {
        id: `spark-${Date.now()}-${Math.random()}`,
        startX: targetTile.x,
        startY: targetTile.y,
        targetX: 200,
        targetY: 720,
        createdAt: Date.now(),
      };
      sounds.playSparkChime();

      return {
        ...state,
        settlementsCount: newSettlementsCount,
        tiles: updatedTiles,
        lordOfHosts: {
          ...state.lordOfHosts,
          chargePercent: Math.round(newCharge),
          stage: newStage,
          stageGoalText,
          piousToast: null,
        },
        sparks: [...state.sparks, newSpark],
        currentNews: {
          id: `build-${Date.now()}`,
          headline: `${strings.news.settlementBuilt} (${updatedTiles[nextTileId].settlementName || 'מאחז חדש'})`,
          source: 'מבזק',
        },
      };
    }

    case 'DEPLOY_TROOPS': {
      if (state.gameStatus !== 'playing') return state;

      // Find ungarrisoned settlements
      const ungarrisonedSettlementIds = Object.keys(state.tiles).filter(
        id => state.tiles[id].hasSettlement && state.tiles[id].garrisonCount === 0
      );

      if (ungarrisonedSettlementIds.length === 0) {
        return state;
      }

      // Find border checkpoints that currently have a soldier
      const mannedBorderIds = Object.keys(state.tiles).filter(
        id => state.tiles[id].isBorderCheckpoint && state.tiles[id].garrisonCount > 0
      );

      if (mannedBorderIds.length === 0) {
        return state;
      }

      const updatedTiles = { ...state.tiles };
      let transferredCount = 0;

      for (const settlementId of ungarrisonedSettlementIds) {
        const borderId = mannedBorderIds.pop();
        if (!borderId) break;

        // Move soldier from border to settlement
        updatedTiles[borderId] = {
          ...updatedTiles[borderId],
          garrisonCount: updatedTiles[borderId].garrisonCount - 1,
          isBreached: true,
          hasAlert: true,
        };

        updatedTiles[settlementId] = {
          ...updatedTiles[settlementId],
          garrisonCount: 1,
        };

        transferredCount++;
      }

      if (transferredCount === 0) return state;

      sounds.playDeploy();

      const newBorderSoldiers = Math.max(0, state.soldiersAtBorder - transferredCount);
      const newSettlementSoldiers = state.soldiersAtSettlements + transferredCount;
      const newDefenseScore = Math.round((newBorderSoldiers / 8) * 100);

      // Check breaches
      const activeBreaches = Object.keys(updatedTiles).filter(
        id => updatedTiles[id].isBorderCheckpoint && updatedTiles[id].garrisonCount === 0
      );

      // In-game news headline based on defense drop
      let newsHeadline = strings.news.troopsDiverted;
      if (newDefenseScore <= 50) {
        newsHeadline = strings.news.chiefOfStaffWarning;
        sounds.playSiren();
      }
      if (newDefenseScore <= 20) {
        newsHeadline = strings.news.borderBreach;
        sounds.playSiren();
      }

      // If defense is critically low, activate miracle countdown!
      let countdown = state.lordOfHosts.countdownSeconds;
      let newStage = state.lordOfHosts.stage;
      if (newDefenseScore <= 35 && countdown === null) {
        countdown = 30;
        newStage = 4;
      }

      const isPanic = newDefenseScore === 0;

      return {
        ...state,
        soldiersAtBorder: newBorderSoldiers,
        soldiersAtSettlements: newSettlementSoldiers,
        defenseScore: newDefenseScore,
        tiles: updatedTiles,
        activeBreaches,
        lordOfHosts: {
          ...state.lordOfHosts,
          stage: newStage,
          countdownSeconds: countdown,
          isPanicMashMode: isPanic,
          chargePercent: isPanic ? 99.9 : Math.max(state.lordOfHosts.chargePercent, 88),
          piousToast: isPanic ? strings.lordOfHosts.panicMashPrompt : null,
        },
        currentNews: {
          id: `deploy-${Date.now()}`,
          headline: newsHeadline,
          source: 'דובר צה״ל / קבינט',
          isUrgent: newDefenseScore < 50,
        },
      };
    }

    case 'CALL_RESERVES': {
      if (state.gameStatus !== 'playing') return state;
      if (state.reservesBatchesLeft <= 0) return state;

      const newBatchesLeft = state.reservesBatchesLeft - 1;
      const addedSoldiers = 4;
      const newTotal = state.soldiersTotal + addedSoldiers;
      const newBorder = state.soldiersAtBorder + addedSoldiers;

      sounds.playReserves();

      // Re-garrison any breached border checkpoints
      const updatedTiles = { ...state.tiles };
      let remainingToPlace = addedSoldiers;
      const breachedCheckpoints = Object.keys(updatedTiles).filter(
        id => updatedTiles[id].isBorderCheckpoint && updatedTiles[id].garrisonCount === 0
      );

      for (const bId of breachedCheckpoints) {
        if (remainingToPlace <= 0) break;
        updatedTiles[bId] = {
          ...updatedTiles[bId],
          garrisonCount: 1,
          isBreached: false,
          hasAlert: false,
        };
        remainingToPlace--;
      }

      const activeBorderCheckpoints = Object.values(updatedTiles).filter(
        t => t.isBorderCheckpoint && t.garrisonCount > 0
      ).length;
      const newDefenseScore = Math.min(100, Math.round((activeBorderCheckpoints / 8) * 100));

      const activeBreaches = Object.keys(updatedTiles).filter(
        id => updatedTiles[id].isBorderCheckpoint && updatedTiles[id].garrisonCount === 0
      );

      let newsHeadline = `${strings.news.reservesCalled} (${newBatchesLeft} ${strings.stats.reservesLeft})`;
      if (newBatchesLeft === 0) {
        newsHeadline = strings.news.reservesExhausted;
      }

      return {
        ...state,
        soldiersTotal: newTotal,
        soldiersAtBorder: newBorder,
        reservesBatchesLeft: newBatchesLeft,
        defenseScore: newDefenseScore,
        tiles: updatedTiles,
        activeBreaches,
        lordOfHosts: {
          ...state.lordOfHosts,
          isPanicMashMode: newDefenseScore === 0,
        },
        currentNews: {
          id: `reserves-${Date.now()}`,
          headline: newsHeadline,
          source: 'אגף כוח אדם (אכ״א)',
        },
      };
    }

    case 'CLICK_LORD_OF_HOSTS': {
      if (state.lordOfHosts.isPanicMashMode) {
        return gameReducer(state, { type: 'MASH_LORD_OF_HOSTS' });
      }

      sounds.playLordOfHostsClick();
      const excuses = strings.lordOfHosts.excuses;
      const randomExcuse = excuses[Math.floor(Math.random() * excuses.length)];

      return {
        ...state,
        lordOfHosts: {
          ...state.lordOfHosts,
          piousToast: randomExcuse,
        },
      };
    }

    case 'MASH_LORD_OF_HOSTS': {
      const nextMashCount = state.lordOfHosts.mashCount + 1;
      sounds.playPanicMashThud();

      if (nextMashCount >= 7) {
        sounds.playCrackCollapse();
        return {
          ...state,
          isScreenShaking: false,
          gameStatus: 'catastrophe',
          lordOfHosts: {
            ...state.lordOfHosts,
            mashCount: nextMashCount,
            isCracked: true,
            isPanicMashMode: false,
            piousToast: strings.lordOfHosts.crackedText,
          },
        };
      }

      return {
        ...state,
        isScreenShaking: true,
        lordOfHosts: {
          ...state.lordOfHosts,
          mashCount: nextMashCount,
        },
      };
    }

    case 'TICK_TIMER': {
      let countdown = state.lordOfHosts.countdownSeconds;
      let toast = state.lordOfHosts.piousToast;

      if (countdown !== null && countdown > 0) {
        countdown -= 1;
      } else if (countdown === 0) {
        // Shifting excuse when countdown ends!
        countdown = 20;
        toast = strings.lordOfHosts.excuses[5];
        sounds.playSparkChime();
      }

      // Check if breaches exist and spawn infiltrating pickup trucks
      const trucks = [...state.infiltratingTrucks];
      if (state.defenseScore < 30 && state.activeBreaches.length > 0) {
        if (Math.random() > 0.6 && trucks.length < 5) {
          const randomBreach = state.activeBreaches[Math.floor(Math.random() * state.activeBreaches.length)];
          const breachTile = state.tiles[randomBreach];
          if (breachTile) {
            trucks.push({
              id: `truck-${Date.now()}`,
              x: breachTile.x,
              y: breachTile.y,
              targetX: breachTile.x - 70,
              targetY: breachTile.y + (Math.random() * 40 - 20),
              progress: 0,
            });
          }
        }
      }

      // Advance trucks
      const updatedTrucks = trucks.map(t => ({
        ...t,
        progress: Math.min(1, t.progress + 0.1),
      }));

      // If defense is 0% and breaches uncontained, activate panic mode
      const isPanic = state.defenseScore === 0 && state.activeBreaches.length >= 2;

      return {
        ...state,
        isScreenShaking: false,
        infiltratingTrucks: updatedTrucks,
        lordOfHosts: {
          ...state.lordOfHosts,
          countdownSeconds: countdown,
          piousToast: toast,
          isPanicMashMode: isPanic,
        },
      };
    }

    case 'SELECT_TILE': {
      return {
        ...state,
        selectedSettlementId: action.tileId,
      };
    }

    case 'EVACUATE_SETTLEMENT': {
      const tileId = action.tileId;
      const tile = state.tiles[tileId];
      if (!tile || !tile.hasSettlement) return state;

      const updatedTiles = { ...state.tiles };
      const hadGarrison = tile.garrisonCount > 0;

      updatedTiles[tileId] = {
        ...updatedTiles[tileId],
        hasSettlement: false,
        garrisonCount: 0,
      };

      let newBorderSoldiers = state.soldiersAtBorder;
      let newSettlementSoldiers = state.soldiersAtSettlements;

      if (hadGarrison) {
        newSettlementSoldiers = Math.max(0, newSettlementSoldiers - 1);
        newBorderSoldiers += 1;

        // Place freed soldier back to an empty border checkpoint
        const emptyBorder = Object.keys(updatedTiles).find(
          id => updatedTiles[id].isBorderCheckpoint && updatedTiles[id].garrisonCount === 0
        );
        if (emptyBorder) {
          updatedTiles[emptyBorder] = {
            ...updatedTiles[emptyBorder],
            garrisonCount: 1,
            isBreached: false,
            hasAlert: false,
          };
        }
      }

      sounds.playClick();

      const newSettlementsCount = Math.max(0, state.settlementsCount - 1);
      const activeBorderCheckpoints = Object.values(updatedTiles).filter(
        t => t.isBorderCheckpoint && t.garrisonCount > 0
      ).length;
      const newDefenseScore = Math.min(100, Math.round((activeBorderCheckpoints / 8) * 100));

      const activeBreaches = Object.keys(updatedTiles).filter(
        id => updatedTiles[id].isBorderCheckpoint && updatedTiles[id].garrisonCount === 0
      );

      // Check if player achieved rational victory (all 8 border checkpoints fully manned, 0 breaches, <= 2 settlements)
      const isRationalVictory = newDefenseScore === 100 && newSettlementsCount <= 2 && state.settlementsCount >= 3;
      if (isRationalVictory) {
        sounds.playVictory();
      }

      return {
        ...state,
        settlementsCount: newSettlementsCount,
        soldiersAtBorder: newBorderSoldiers,
        soldiersAtSettlements: newSettlementSoldiers,
        defenseScore: newDefenseScore,
        tiles: updatedTiles,
        activeBreaches,
        selectedSettlementId: null,
        gameStatus: isRationalVictory ? 'rational_victory' : 'playing',
        currentNews: {
          id: `evac-${Date.now()}`,
          headline: `מאחז פונה. הכוחות הוחזרו לעיבוי קו הגבול הריבוני.`,
          source: 'פיקוד מרכז',
        },
      };
    }

    case 'DISMISS_TOAST': {
      return {
        ...state,
        lordOfHosts: {
          ...state.lordOfHosts,
          piousToast: null,
        },
      };
    }

    case 'CLEAR_SPARK': {
      return {
        ...state,
        sparks: state.sparks.filter(s => s.id !== action.id),
      };
    }

    case 'RESTART_GAME': {
      return {
        ...INITIAL_STATE,
        locale: state.locale,
        soundEnabled: state.soundEnabled,
      };
    }

    default:
      return state;
  }
}
