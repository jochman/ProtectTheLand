import { GameState, GameAction, NewsItem } from '../types';
import { INITIAL_TILES, SETTLEMENT_CANDIDATE_IDS } from './hexGridData';
import { he } from '../locales/he';
import { en } from '../locales/en';
import { sounds } from '../audio/soundEngine';
import { getProgressiveNews, getNextJuicyNews } from './newsContent';

export const INITIAL_STATE: GameState = {
  locale: 'he',
  soundEnabled: true,
  gameStatus: 'playing',
  budget: 120, // Initial coalition funds (₪) - allows 1st settlement + modest buffer
  maxBudget: 250, // Capped treasury to prevent hoarding and keep penalties impactful
  incomeRate: 2, // Steady baseline civilian economy (+2 ₪/s)
  settlementsCount: 0,
  soldiersTotal: 8,
  soldiersAtBorder: 8,
  soldiersAtSettlements: 0,
  reservesBatchesLeft: 3,
  defenseScore: 100,
  isBuildMode: false,
  constructions: {},
  collectibleCoins: [
    { id: 'coin-1', x: 110, y: 215, amount: 20, createdAt: Date.now() }, // Tel Aviv
    { id: 'coin-2', x: 130, y: 65, amount: 20, createdAt: Date.now() },  // Haifa
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
    category: 'military',
    timestamp: '12:00',
  },
  newsHistory: [
    {
      id: 'start',
      headline: he.news.start,
      source: 'מבזק חדשות',
      category: 'military',
      timestamp: '12:00',
    },
  ],
  isNewsModalOpen: false,
  activeStoryArcs: {},
  lastNewsTick: 0,
  selectedSettlementId: null,
  isScreenShaking: false,
  sparks: [],
  movingTroops: [],
  clashes: [],
  lastClashTick: 0,
  latestPenalty: null,
  lastPenaltyTick: 0,
};

function withNews(state: GameState, item: NewsItem): { currentNews: NewsItem; newsHistory: NewsItem[]; lastNewsTick: number } {
  const prev = state.currentNews;
  const history = prev && prev.id !== item.id
    ? [prev, ...(state.newsHistory || []).filter(n => n.id !== item.id && n.id !== prev.id)].slice(0, 30)
    : state.newsHistory || [];
  return {
    currentNews: item,
    newsHistory: history,
    lastNewsTick: 0,
  };
}

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

      const progressiveNews = getProgressiveNews(
        { ...state, settlementsCount: state.settlementsCount + 1 },
        'build'
      );

      return {
        ...state,
        budget: state.budget - SETTLEMENT_COST,
        isBuildMode: false,
        activeStoryArcs: progressiveNews.nextArcs,
        constructions: {
          ...state.constructions,
          [tileId]: {
            progress: 10,
            tileName: tile.settlementName || 'מאחז חדש',
          },
        },
        ...withNews(state, progressiveNews.item),
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

      // Randomly shuffle border checkpoints so forces are pulled randomly along the border instead of bottom-up
      const shuffledBorderIds = [...mannedBorderIds].sort(() => Math.random() - 0.5);

      // Randomly shuffle ungarrisoned settlements so forces are distributed organically across the map
      const shuffledSettlementIds = [...ungarrisonedSettlementIds].sort(() => Math.random() - 0.5);

      const updatedTiles = { ...state.tiles };
      const newMovingTroops = [...(state.movingTroops || [])];
      let transferredCount = 0;

      for (const settlementId of shuffledSettlementIds) {
        const borderId = shuffledBorderIds.pop();
        if (!borderId) break;

        const borderTile = updatedTiles[borderId];
        const settlementTile = updatedTiles[settlementId];

        updatedTiles[borderId] = {
          ...borderTile,
          garrisonCount: borderTile.garrisonCount - 1,
          isBreached: true,
          hasAlert: true,
        };

        updatedTiles[settlementId] = {
          ...settlementTile,
          garrisonCount: 1,
        };

        newMovingTroops.push({
          id: `troop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          fromX: borderTile.x,
          fromY: borderTile.y,
          toX: settlementTile.x,
          toY: settlementTile.y,
          createdAt: Date.now(),
        });

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

      const progressiveDeploy = getProgressiveNews(
        { ...state, defenseScore: newDefenseScore },
        'deploy'
      );

      let deployNewsItem = progressiveDeploy.item;
      if (newDefenseScore <= 20) {
        sounds.playSiren();
        deployNewsItem = {
          id: `breach-${Date.now()}`,
          headline: strings.news.borderBreach,
          source: state.locale === 'he' ? 'פיקוד דרום ומרכז' : 'Southern & Central Command',
          category: 'military',
          isUrgent: true,
          timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        };
      } else if (newDefenseScore <= 50 && Math.random() < 0.4) {
        sounds.playSiren();
        deployNewsItem = {
          id: `warning-${Date.now()}`,
          headline: strings.news.chiefOfStaffWarning,
          source: state.locale === 'he' ? 'לשכת הרמטכ״ל' : 'Chief of Staff',
          category: 'military',
          isUrgent: true,
          timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        };
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
        activeStoryArcs: progressiveDeploy.nextArcs,
        movingTroops: newMovingTroops,
        lordOfHosts: {
          ...state.lordOfHosts,
          stage: newStage,
          countdownSeconds: countdown,
          isPanicMashMode: isPanic,
          chargePercent: isPanic ? 99.9 : Math.max(state.lordOfHosts.chargePercent, 88),
          piousToast: isPanic ? strings.lordOfHosts.panicMashPrompt : null,
        },
        ...withNews(state, deployNewsItem),
      };
    }

    case 'CALL_RESERVES': {
      if (state.gameStatus !== 'playing') return state;
      if (state.reservesBatchesLeft <= 0) return state;

      const newBatchesLeft = state.reservesBatchesLeft - 1;
      const callsMade = 3 - newBatchesLeft;
      const addedSoldiers = 4;
      const newTotal = state.soldiersTotal + addedSoldiers;
      const newBorder = state.soldiersAtBorder + addedSoldiers;

      // Economic Tradeoff: Mobilizing workers cripples the civilian economy!
      const newIncomeRate = callsMade === 1 ? 1 : 0;

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

      let newsHeadline = state.locale === 'he'
        ? `צו 8! פלוגות מילואים גויסו. עובדים נגרעו מהמשק — קצב הכנסות הואט ל-${newIncomeRate}₪ לשנייה בלבד (${newBatchesLeft} סבבים נותרו).`
        : `Emergency Call-Up! Troops mobilized, civilian economy slowed to ₪${newIncomeRate}/s (${newBatchesLeft} calls left).`;

      if (callsMade === 2) {
        newsHeadline = state.locale === 'he'
          ? `גל גיוס שני! מחסור חמור בידיים עובדות — המשק שותק, 0₪ הכנסה פסיבית!`
          : `Second Mobilization Wave! Severe labor shortage — economy stagnant at ₪0/s!`;
      } else if (callsMade === 3) {
        newsHeadline = state.locale === 'he'
          ? `קריסה במערך המילואים! שיתוק כלכלי מוחלט — 0₪ הכנסה, תלות מלאה במטבעות ותרומות!`
          : `Reserve Exhaustion! Total economic paralysis — ₪0/s passive income!`;
      }

      return {
        ...state,
        soldiersTotal: newTotal,
        soldiersAtBorder: newBorder,
        incomeRate: newIncomeRate,
        reservesBatchesLeft: newBatchesLeft,
        defenseScore: newDefenseScore,
        tiles: updatedTiles,
        activeBreaches,
        lordOfHosts: {
          ...state.lordOfHosts,
          isPanicMashMode: newDefenseScore === 0,
        },
        ...withNews(state, {
          id: `reserves-${Date.now()}`,
          headline: newsHeadline,
          source: state.locale === 'he' ? 'אגף כוח אדם והאוצר' : 'Personnel & Treasury',
          category: 'military',
          isUrgent: callsMade >= 2,
          timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        }),
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

      // 2. State clones for tick calculations
      const updatedConstructions = { ...state.constructions };
      const updatedTiles = { ...state.tiles };

      // 3. Passive budget income (affected by reserve mobilization & settlement maintenance drag!)
      const baseIncome = state.incomeRate ?? 2;
      const builtCount = Object.values(updatedTiles).filter(t => t.hasSettlement).length;
      const settlementDrain = Math.floor(builtCount / 3);
      const effectiveIncome = Math.max(0, baseIncome - settlementDrain);
      let newBudget = Math.min(state.maxBudget, state.budget + effectiveIncome);

      // 4. Update constructions
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

      // 4. Spawn collectible coins on Israel cities (slows down drastically with reserves!)
      const coins = [...state.collectibleCoins];
      const reservesMobilized = 3 - state.reservesBatchesLeft;
      const maxAllowedCoins = reservesMobilized === 0 ? 3 : reservesMobilized === 1 ? 2 : 1;
      const coinSpawnChance = reservesMobilized === 0 ? 0.55 : reservesMobilized === 1 ? 0.30 : reservesMobilized === 2 ? 0.15 : 0.05;

      if (coins.length < maxAllowedCoins && Math.random() < coinSpawnChance) {
        const israelCityTiles = [
          { x: 105, y: 210 }, // Tel Aviv
          { x: 110, y: 135 }, // Netanya
          { x: 100, y: 285 }, // Shfela
          { x: 95, y: 360 },  // Ashdod
          { x: 95, y: 435 },  // Beer Sheva
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

      // 6. Ambient Spicy News & Multi-part Story Arc Progress (paced naturally every 28 seconds)
      let nextCurrentNews = state.currentNews;
      let nextNewsHistory = state.newsHistory || [];
      let nextStoryArcs = state.activeStoryArcs || {};
      let nextNewsTick = (state.lastNewsTick || 0) + 1;

      if (nextNewsTick >= 28 && state.defenseScore > 20) {
        const { item, nextArcs } = getNextJuicyNews(state);
        nextStoryArcs = nextArcs;
        nextNewsTick = 0;
        if (nextCurrentNews) {
          nextNewsHistory = [nextCurrentNews, ...nextNewsHistory.filter(n => n.id !== nextCurrentNews?.id)].slice(0, 30);
        }
        nextCurrentNews = item;
      }

      // 7. Random West Bank Clashes (עימותים הדדיים) between Jewish settlements and Arabic cities
      const now = Date.now();
      let activeClashes = (state.clashes || []).filter(c => now - c.createdAt < c.durationMs);
      let nextClashTick = (state.lastClashTick || 0) + 1;

      // Find all built settlements in West Bank and local Arabic cities
      const builtSettlementList = Object.values(updatedTiles).filter(t => t.hasSettlement);
      const arabCitiesList = Object.values(updatedTiles).filter(t => t.isLocalCity);

      // Clashes only occur if there are Jewish settlements in the West Bank, and frequency scales with settlement count
      if (builtSettlementList.length > 0 && arabCitiesList.length > 0) {
        // Frequency increases significantly as more settlements are built:
        // 1 settlement: ~9.5% per tick, 3 settlements: ~18.5%, 5 settlements: ~27.5%, 8+ settlements: ~40%
        const clashChance = Math.min(0.40, 0.05 + builtSettlementList.length * 0.045);

        // Cooldown: at least 7 seconds between clash triggers, and at most 2 concurrent clashes
        if (nextClashTick >= 7 && activeClashes.length < 2 && Math.random() < clashChance) {
          // Pick a random built settlement
          const settlement = builtSettlementList[Math.floor(Math.random() * builtSettlementList.length)];

          // Find the closest Arabic cities by Euclidean distance
          const sortedArabCities = [...arabCitiesList].sort((a, b) => {
            const distA = Math.hypot(a.x - settlement.x, a.y - settlement.y);
            const distB = Math.hypot(b.x - settlement.x, b.y - settlement.y);
            return distA - distB;
          });

          // Pick from the 2 closest Arabic cities
          const targetArabCity = sortedArabCities[Math.random() < 0.7 ? 0 : Math.min(1, sortedArabCities.length - 1)];

          const settlerInitiated = Math.random() < 0.5;
          const settlementName = settlement.settlementName || (state.locale === 'he' ? 'מאחז חדש' : 'Outpost');
          const arabCityName = (state.locale === 'he' ? targetArabCity.label : targetArabCity.subLabel) || (state.locale === 'he' ? 'הכפר הסמוך' : 'Nearby Village');
          const isGarrisoned = settlement.garrisonCount > 0;

          // Titles and narrative headlines
          let clashHeadline = '';
          let clashTitle = '';
          let clashSource = '';
          let isUrgentClash = false;

          if (settlerInitiated) {
            clashTitle = state.locale === 'he'
              ? `פשיטה: ${settlementName} ⚔️ ${arabCityName}`
              : `Raid: ${settlementName} vs ${arabCityName}`;

            if (state.locale === 'he') {
              const variants = [
                `עימות אלים: קבוצת צעירים מ${settlementName} פשטה על פאתי ${arabCityName}, יודו אבנים הדדיות.`,
                `חיכוך בשומרון: מתנחלים מ${settlementName} נכנסו למסיק זיתים סמוך ל${arabCityName}.`,
                `הפגנה סוערת: תושבים מ${settlementName} חסמו את כביש הגישה ל${arabCityName} והבעירו צמיגים.`,
                `פעולת 'תג מחיר': ריסוס כתובות ועימותים בין תושבי ${settlementName} לפאתי ${arabCityName}.`,
              ];
              clashHeadline = variants[Math.floor(Math.random() * variants.length)];
            } else {
              clashHeadline = `Violent clash: Settlers from ${settlementName} raided outskirts of ${arabCityName}, stones exchanged.`;
            }
          } else {
            clashTitle = state.locale === 'he'
              ? `יידוי אבנים: ${arabCityName} ⚔️ ${settlementName}`
              : `Stones: ${arabCityName} vs ${settlementName}`;

            if (state.locale === 'he') {
              const variants = [
                `התפרעות אלימה: עשרות מיידי אבנים יצאו מ${arabCityName} לעבר כביש הגישה ל${settlementName}.`,
                `חיכוך סמוך לגדר: בקבוקי תבערה וזיקוקים מ${arabCityName} נורו לעבר בתי ${settlementName}.`,
                `מארב אבנים: רכבים נרגמו באבנים בציר הסמוך ל${arabCityName}, סמוך ל${settlementName}.`,
                `הפרת סדר בצומת: עשרות צעירים מ${arabCityName} התעמתו בפאתי המאחז ${settlementName}.`,
              ];
              clashHeadline = variants[Math.floor(Math.random() * variants.length)];
            } else {
              clashHeadline = `Violent riot: Stone throwers from ${arabCityName} targeted access road to ${settlementName}.`;
            }
          }

          if (isGarrisoned) {
            clashSource = state.locale === 'he' ? 'דובר צה״ל' : 'IDF Spokesperson';
            sounds.playClash();
          } else {
            // UNGARRISONED OUTPOST: Severe tension, no military buffer!
            clashSource = state.locale === 'he' ? 'משטרת מחוז ש״י' : 'District Police';
            isUrgentClash = true;
            sounds.playSiren();
            updatedTiles[settlement.id] = { ...settlement, hasAlert: true };
            if (newBudget >= 15) {
              newBudget = Math.max(0, newBudget - 15);
            }
          }

          const clashEvent = {
            id: `clash-${now}-${Math.random().toString(36).slice(2, 6)}`,
            settlementId: settlement.id,
            arabCityId: targetArabCity.id,
            settlerInitiated,
            settlementName,
            arabCityName,
            startX: settlement.x,
            startY: settlement.y,
            targetX: targetArabCity.x,
            targetY: targetArabCity.y,
            midX: (settlement.x + targetArabCity.x) / 2,
            midY: (settlement.y + targetArabCity.y) / 2,
            createdAt: now,
            durationMs: 7500,
            title: clashTitle,
            isGarrisoned,
          };

          activeClashes.push(clashEvent);
          nextClashTick = 0;

          // Dispatch news item for this clash
          const clashNewsItem: NewsItem = {
            id: `clash-news-${now}`,
            headline: clashHeadline,
            source: clashSource,
            category: 'military',
            isUrgent: isUrgentClash,
            timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          };

          if (nextCurrentNews) {
            nextNewsHistory = [nextCurrentNews, ...nextNewsHistory.filter(n => n.id !== nextCurrentNews?.id)].slice(0, 30);
          }
          nextCurrentNews = clashNewsItem;
        }
      }

      // 8. Periodic Settlement Financial Penalties (more settlements = more frequent & harsher penalties!)
      let latestPenalty = state.latestPenalty;
      if (latestPenalty && now - latestPenalty.timestamp > 4000) {
        latestPenalty = null;
      }
      let nextPenaltyTick = (state.lastPenaltyTick || 0) + 1;

      const settlementsCount = builtSettlementList.length;

      // Penalties only occur if player has built settlements in the West Bank!
      if (settlementsCount > 0) {
        // Cooldown: at least 12 seconds between penalties
        // Probability scales with number of settlements:
        // 1 settlement: ~8% chance per tick (avg ~24s), 3 settlements: ~16%, 5 settlements: ~25%, 8+ settlements: ~36%
        const penaltyChance = Math.min(0.38, 0.04 + settlementsCount * 0.04);

        if (nextPenaltyTick >= 12 && Math.random() < penaltyChance) {
          // Penalty amount scales heavily with number of settlements:
          // 1 settlement: ~30₪ - 35₪ (takes 15-20s of +2₪/s to recover!)
          // 2 settlements: ~42₪ - 48₪
          // 3 settlements: ~55₪ - 60₪ (takes ~60s of +1₪/s to recover!)
          // 5 settlements: ~75₪ - 85₪
          // 8+ settlements: ~100₪ - 125₪ (can completely wipe out treasury!)
          const basePenalty = 22 + settlementsCount * 12;
          const variance = (Math.floor(Math.random() * 3) - 1) * 5;
          const penaltyAmount = Math.max(20, basePenalty + variance);
          const actualDeducted = Math.min(newBudget, penaltyAmount);
          newBudget = Math.max(0, newBudget - actualDeducted);

          const reasonsHe = [
            'סלילת כביש עוקף ממוגן ירי',
            'הצבת מצלמות תרמיות וכיתת כוננות',
            'מימון שירותי הסעות ואוטובוסים ממוגנים',
            'פיצויים על פלישה לקרקעות פרטיות',
            'סנקציות בינלאומיות והורדת דירוג אשראי',
            'הוצאות משפטיות להסדרת מאחזים',
            'תחזוקת תשתיות מים וחשמל למאחזים מבודדים',
            'בור תקציבי וגירעון קואליציוני מעמיק',
          ];

          const reasonsEn = [
            'Bulletproof bypass road construction',
            'Thermal cameras & outpost security squad',
            'Armored student shuttle subsidies',
            'Private land trespass compensation',
            'International sanctions & credit downgrade',
            'Legal fees for retroactive outpost authorization',
            'Utility infrastructure for isolated outposts',
            'Deepening coalition budget deficit',
          ];

          const reasonIdx = Math.floor(Math.random() * reasonsHe.length);
          const reason = state.locale === 'he' ? reasonsHe[reasonIdx] : reasonsEn[reasonIdx];

          latestPenalty = {
            id: `penalty-${now}`,
            amount: penaltyAmount,
            reason,
            timestamp: now,
          };
          nextPenaltyTick = 0;
          sounds.playPenalty();

          // Dispatch news alert
          const penaltyNews: NewsItem = {
            id: `penalty-news-${now}`,
            headline: state.locale === 'he'
              ? `קנס תקציבי (${penaltyAmount}₪-): ${reason}. הקופה הקואליציונית נשחקת.`
              : `Budget Penalty (-${penaltyAmount}₪): ${reason}. Coalition funds drained.`,
            source: state.locale === 'he' ? 'משרד האוצר' : 'Ministry of Finance',
            category: 'politics',
            timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          };

          if (nextCurrentNews) {
            nextNewsHistory = [nextCurrentNews, ...nextNewsHistory.filter(n => n.id !== nextCurrentNews?.id)].slice(0, 30);
          }
          nextCurrentNews = penaltyNews;
        }
      }

      return {
        ...state,
        budget: newBudget,
        incomeRate: effectiveIncome,
        settlementsCount: newSettlementsCount,
        constructions: updatedConstructions,
        tiles: updatedTiles,
        sparks: newSparks,
        collectibleCoins: coins,
        isScreenShaking: false,
        infiltratingTrucks: updatedTrucks,
        currentNews: nextCurrentNews,
        newsHistory: nextNewsHistory,
        activeStoryArcs: nextStoryArcs,
        lastNewsTick: nextNewsTick,
        clashes: activeClashes,
        lastClashTick: nextClashTick,
        latestPenalty,
        lastPenaltyTick: nextPenaltyTick,
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

      const newMovingTroops = [...(state.movingTroops || [])];

      if (hadGarrison) {
        newSettlementSoldiers = Math.max(0, newSettlementSoldiers - 1);
        newBorderSoldiers += 1;

        const emptyBorderIds = Object.keys(updatedTiles).filter(
          id => updatedTiles[id].isBorderCheckpoint && updatedTiles[id].garrisonCount === 0
        );
        if (emptyBorderIds.length > 0) {
          const chosenBorderId = emptyBorderIds[Math.floor(Math.random() * emptyBorderIds.length)];
          const borderTile = updatedTiles[chosenBorderId];

          updatedTiles[chosenBorderId] = {
            ...borderTile,
            garrisonCount: 1,
            isBreached: false,
            hasAlert: false,
          };

          // Animate troop moving from Right (Settlement) to Left (Border)
          newMovingTroops.push({
            id: `troop-evac-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            fromX: tile.x,
            fromY: tile.y,
            toX: borderTile.x,
            toY: borderTile.y,
            createdAt: Date.now(),
          });
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
        movingTroops: newMovingTroops,
        selectedSettlementId: null,
        gameStatus: isRationalVictory ? 'rational_victory' : 'playing',
        ...withNews(state, {
          id: `evac-${Date.now()}`,
          headline: state.locale === 'he'
            ? `מאחז פונה. הכוחות הוחזרו לעיבוי קו הגבול הריבוני.`
            : `Outpost evacuated. Troops returned to reinforce sovereign border.`,
          source: state.locale === 'he' ? 'פיקוד מרכז' : 'Central Command',
          category: 'military',
          timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        }),
      };
    }

    case 'RECALL_TROOP': {
      const tileId = action.tileId;
      const tile = state.tiles[tileId];
      if (!tile || tile.garrisonCount <= 0) return state;

      const updatedTiles = { ...state.tiles };
      const emptyBorderIds = Object.keys(updatedTiles).filter(
        id => updatedTiles[id].isBorderCheckpoint && updatedTiles[id].garrisonCount === 0
      );

      if (emptyBorderIds.length === 0) return state;

      const chosenBorderId = emptyBorderIds[Math.floor(Math.random() * emptyBorderIds.length)];
      const borderTile = updatedTiles[chosenBorderId];

      updatedTiles[tileId] = {
        ...updatedTiles[tileId],
        garrisonCount: Math.max(0, updatedTiles[tileId].garrisonCount - 1),
      };

      updatedTiles[chosenBorderId] = {
        ...borderTile,
        garrisonCount: 1,
        isBreached: false,
        hasAlert: false,
      };

      const newSettlementSoldiers = Math.max(0, state.soldiersAtSettlements - 1);
      const newBorderSoldiers = state.soldiersAtBorder + 1;
      const newDefenseScore = Math.min(100, Math.round((newBorderSoldiers / 8) * 100));

      // Animate troop moving from Right (Settlement) to Left (Border)
      const newMovingTroops = [
        ...(state.movingTroops || []),
        {
          id: `troop-recall-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          fromX: tile.x,
          fromY: tile.y,
          toX: borderTile.x,
          toY: borderTile.y,
          createdAt: Date.now(),
        },
      ];

      const activeBreaches = Object.keys(updatedTiles).filter(
        id => updatedTiles[id].isBorderCheckpoint && updatedTiles[id].garrisonCount === 0
      );

      sounds.playDeploy();

      return {
        ...state,
        soldiersAtBorder: newBorderSoldiers,
        soldiersAtSettlements: newSettlementSoldiers,
        defenseScore: newDefenseScore,
        tiles: updatedTiles,
        activeBreaches,
        movingTroops: newMovingTroops,
        selectedSettlementId: null,
        ...withNews(state, {
          id: `recall-${Date.now()}`,
          headline: state.locale === 'he'
            ? `כוח צה״ל נסוג מ${tile.settlementName || 'המאחז'} ושב לבצר את קו הגבול המערבי.`
            : `Troops recalled from ${tile.settlementName || 'outpost'} to secure the western border.`,
          source: state.locale === 'he' ? 'פיקוד מרכז' : 'Central Command',
          category: 'military',
          timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        }),
      };
    }

    case 'RECALL_ALL_TROOPS': {
      const guardedSettlementIds = Object.keys(state.tiles).filter(
        id => state.tiles[id].hasSettlement && state.tiles[id].garrisonCount > 0
      );
      if (guardedSettlementIds.length === 0) return state;

      const updatedTiles = { ...state.tiles };
      const emptyBorderIds = Object.keys(updatedTiles).filter(
        id => updatedTiles[id].isBorderCheckpoint && updatedTiles[id].garrisonCount === 0
      );

      // Randomly shuffle empty borders so arriving troops fill them organically
      const shuffledEmptyBorders = [...emptyBorderIds].sort(() => Math.random() - 0.5);
      const newMovingTroops = [...(state.movingTroops || [])];
      let recalledCount = 0;

      for (const sId of guardedSettlementIds) {
        const borderId = shuffledEmptyBorders.pop();
        if (!borderId) break;

        const sTile = updatedTiles[sId];
        const bTile = updatedTiles[borderId];

        updatedTiles[sId] = {
          ...sTile,
          garrisonCount: 0,
        };

        updatedTiles[borderId] = {
          ...bTile,
          garrisonCount: 1,
          isBreached: false,
          hasAlert: false,
        };

        // Animate each troop moving from Right (Settlement) to Left (Border)
        newMovingTroops.push({
          id: `troop-recall-all-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          fromX: sTile.x,
          fromY: sTile.y,
          toX: bTile.x,
          toY: bTile.y,
          createdAt: Date.now(),
        });

        recalledCount++;
      }

      if (recalledCount === 0) return state;

      const newSettlementSoldiers = Math.max(0, state.soldiersAtSettlements - recalledCount);
      const newBorderSoldiers = state.soldiersAtBorder + recalledCount;
      const newDefenseScore = Math.min(100, Math.round((newBorderSoldiers / 8) * 100));

      const activeBreaches = Object.keys(updatedTiles).filter(
        id => updatedTiles[id].isBorderCheckpoint && updatedTiles[id].garrisonCount === 0
      );

      sounds.playDeploy();

      return {
        ...state,
        soldiersAtBorder: newBorderSoldiers,
        soldiersAtSettlements: newSettlementSoldiers,
        defenseScore: newDefenseScore,
        tiles: updatedTiles,
        activeBreaches,
        movingTroops: newMovingTroops,
        selectedSettlementId: null,
        ...withNews(state, {
          id: `recall-all-${Date.now()}`,
          headline: state.locale === 'he'
            ? `נסיגה טקטית מלאה! ${recalledCount} לוחמים פונו מהמאחזים וחזרו לאבטח את הגבול המערבי.`
            : `Full tactical pullback! ${recalledCount} soldiers recalled from outposts to secure the western border.`,
          source: state.locale === 'he' ? 'המטה הכללי' : 'General Staff',
          category: 'military',
          timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        }),
      };
    }

    case 'OPEN_NEWS_MODAL': {
      sounds.playClick();
      return {
        ...state,
        isNewsModalOpen: true,
      };
    }

    case 'CLOSE_NEWS_MODAL': {
      sounds.playClick();
      return {
        ...state,
        isNewsModalOpen: false,
      };
    }

    case 'CYCLE_NEXT_NEWS': {
      sounds.playClick();
      const { item, nextArcs } = getNextJuicyNews(state);
      const prev = state.currentNews;
      const history = prev
        ? [prev, ...(state.newsHistory || []).filter(n => n.id !== prev.id)].slice(0, 30)
        : state.newsHistory || [];

      return {
        ...state,
        currentNews: item,
        newsHistory: history,
        activeStoryArcs: nextArcs,
        lastNewsTick: 0,
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

    case 'CLEAR_MOVING_TROOP': {
      return {
        ...state,
        movingTroops: (state.movingTroops || []).filter(t => t.id !== action.id),
      };
    }

    case 'CLEAR_CLASH': {
      return {
        ...state,
        clashes: (state.clashes || []).filter(c => c.id !== action.id),
      };
    }

    case 'CLEAR_PENALTY': {
      return {
        ...state,
        latestPenalty: null,
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
