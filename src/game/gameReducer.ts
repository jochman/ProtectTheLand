import { GameState, GameAction } from '../types';
import { INITIAL_TILES, SETTLEMENT_CANDIDATE_IDS } from './hexGridData';
import { he } from '../locales/he';
import { en } from '../locales/en';
import { sounds } from '../audio/soundEngine';

export const INITIAL_STATE: GameState = {
  locale: 'he',
  soundEnabled: true,
  gameStatus: 'playing',
  budget: 150, // Initial coalition funds (₪)
  maxBudget: 400,
  settlementsCount: 0,
  soldiersTotal: 8,
  soldiersAtBorder: 8,
  soldiersAtSettlements: 0,
  reservesBatchesLeft: 3,
  defenseScore: 100,
  isBuildMode: false,
  constructions: {},
  collectibleCoins: [
    { id: 'coin-1', x: 110, y: 215, amount: 25, createdAt: Date.now() }, // Tel Aviv
    { id: 'coin-2', x: 130, y: 65, amount: 25, createdAt: Date.now() },  // Haifa
  ],
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

const SETTLEMENT_COST = 100;

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

    case 'TOGGLE_BUILD_MODE': {
      if (state.gameStatus !== 'playing') return state;

      if (state.budget < SETTLEMENT_COST) {
        sounds.playError();
        return {
          ...state,
          lordOfHosts: {
            ...state.lordOfHosts,
            piousToast: state.locale === 'he'
              ? 'אין מספיק תקציב לבנייה! אסוף כספים קואליציוניים (100 ₪ נדרשים)'
              : 'Not enough budget! Collect funds from cities (₪100 required)',
          },
        };
      }

      sounds.playClick();
      return {
        ...state,
        isBuildMode: !state.isBuildMode,
        selectedSettlementId: null,
      };
    }

    case 'SELECT_TILE_TO_BUILD': {
      if (state.gameStatus !== 'playing') return state;
      const tileId = action.tileId;
      const tile = state.tiles[tileId];

      if (!tile || tile.terrain !== 'westbank' || tile.hasSettlement || state.constructions[tileId]) {
        return state;
      }

      if (state.budget < SETTLEMENT_COST) {
        sounds.playError();
        return {
          ...state,
          isBuildMode: false,
          lordOfHosts: {
            ...state.lordOfHosts,
            piousToast: state.locale === 'he'
              ? 'אין מספיק תקציב! אסוף מטבעות מהערים (100 ₪ נדרשים)'
              : 'Insufficient budget! (₪100 required)',
          },
        };
      }

      sounds.playHammer();

      return {
        ...state,
        budget: state.budget - SETTLEMENT_COST,
        isBuildMode: false,
        constructions: {
          ...state.constructions,
          [tileId]: {
            progress: 10,
            tileName: tile.settlementName || 'מאחז חדש',
          },
        },
        currentNews: {
          id: `const-${Date.now()}`,
          headline: `החלה הכשרת קרקע והקמת ${tile.settlementName || 'מאחז חדש'}!`,
          source: 'מנהלת ההתיישבות',
        },
      };
    }

    case 'BUILD_SETTLEMENT': {
      // Direct quick-build fallback if triggered directly
      const nextTileId = action.tileId || SETTLEMENT_CANDIDATE_IDS.find(
        id => !state.tiles[id]?.hasSettlement && !state.constructions[id]
      );
      if (!nextTileId) return state;
      return gameReducer(state, { type: 'SELECT_TILE_TO_BUILD', tileId: nextTileId });
    }

    case 'COLLECT_COIN': {
      const coin = state.collectibleCoins.find(c => c.id === action.id);
      if (!coin) return state;

      sounds.playCoinCollect();
      return {
        ...state,
        budget: Math.min(state.maxBudget, state.budget + coin.amount),
        collectibleCoins: state.collectibleCoins.filter(c => c.id !== action.id),
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

      const activeBreaches = Object.keys(updatedTiles).filter(
        id => updatedTiles[id].isBorderCheckpoint && updatedTiles[id].garrisonCount === 0
      );

      let newsHeadline = strings.news.troopsDiverted;
      if (newDefenseScore <= 50) {
        newsHeadline = strings.news.chiefOfStaffWarning;
        sounds.playSiren();
      }
      if (newDefenseScore <= 20) {
        newsHeadline = strings.news.borderBreach;
        sounds.playSiren();
      }

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

      // 1. Ticking countdown
      if (countdown !== null && countdown > 0) {
        countdown -= 1;
      } else if (countdown === 0) {
        countdown = 20;
        toast = strings.lordOfHosts.excuses[5];
        sounds.playSparkChime();
      }

      // 2. Passive budget income
      const newBudget = Math.min(state.maxBudget, state.budget + 6);

      // 3. Update constructions
      const updatedConstructions = { ...state.constructions };
      const updatedTiles = { ...state.tiles };
      let newSettlementsCount = state.settlementsCount;
      let newCharge = state.lordOfHosts.chargePercent;
      let newStage = state.lordOfHosts.stage;
      let stageGoalText = state.lordOfHosts.stageGoalText;
      const newSparks = [...state.sparks];

      for (const [tileId, c] of Object.entries(updatedConstructions)) {
        if (c.progress >= 100) {
          // Completed!
          delete updatedConstructions[tileId];
          updatedTiles[tileId] = {
            ...updatedTiles[tileId],
            hasSettlement: true,
          };
          newSettlementsCount += 1;
          sounds.playBuild();

          // Update deceptive Lord of Hosts charge percent
          newCharge = Math.min(99.0, 12 + newSettlementsCount * 6.5);
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
          const targetTile = updatedTiles[tileId];
          newSparks.push({
            id: `spark-${Date.now()}-${Math.random()}`,
            startX: targetTile.x,
            startY: targetTile.y,
            targetX: 200,
            targetY: 720,
            createdAt: Date.now(),
          });
          sounds.playSparkChime();
        } else {
          updatedConstructions[tileId] = {
            ...c,
            progress: c.progress + 30, // 3-4 ticks to build
          };
        }
      }

      // 4. Spawn collectible coins on Israel cities
      const coins = [...state.collectibleCoins];
      if (coins.length < 3 && Math.random() > 0.5) {
        const israelCityTiles = [
          { x: 110, y: 215 }, // Tel Aviv
          { x: 120, y: 140 }, // Netanya
          { x: 105, y: 290 }, // Shfela
          { x: 95, y: 365 },  // Ashdod
          { x: 95, y: 440 },  // Beer Sheva
        ];
        const randomCity = israelCityTiles[Math.floor(Math.random() * israelCityTiles.length)];
        coins.push({
          id: `coin-${Date.now()}`,
          x: randomCity.x,
          y: randomCity.y,
          amount: 25,
          createdAt: Date.now(),
        });
      }

      // 5. Infiltrating trucks
      const trucks = [...state.infiltratingTrucks];
      if (state.defenseScore < 30 && state.activeBreaches.length > 0) {
        if (Math.random() > 0.6 && trucks.length < 5) {
          const randomBreach = state.activeBreaches[Math.floor(Math.random() * state.activeBreaches.length)];
          const breachTile = updatedTiles[randomBreach];
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

      const updatedTrucks = trucks.map(t => ({
        ...t,
        progress: Math.min(1, t.progress + 0.1),
      }));

      const isPanic = state.defenseScore === 0 && state.activeBreaches.length >= 2;

      return {
        ...state,
        budget: newBudget,
        settlementsCount: newSettlementsCount,
        constructions: updatedConstructions,
        tiles: updatedTiles,
        sparks: newSparks,
        collectibleCoins: coins,
        isScreenShaking: false,
        infiltratingTrucks: updatedTrucks,
        lordOfHosts: {
          ...state.lordOfHosts,
          chargePercent: Math.round(newCharge),
          stage: newStage,
          stageGoalText,
          countdownSeconds: countdown,
          piousToast: toast,
          isPanicMashMode: isPanic,
        },
      };
    }

    case 'SELECT_TILE': {
      // Robust tile selection for inspector
      return {
        ...state,
        isBuildMode: false,
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
