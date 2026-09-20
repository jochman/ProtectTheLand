import { GameState, GameAction, NewsItem, GreenSideAttack, FinancialPenalty } from '../types';
import { INITIAL_TILES, SETTLEMENT_CANDIDATE_IDS } from './hexGridData';
import { he } from '../locales/he';
import { en } from '../locales/en';
import { sounds } from '../audio/soundEngine';
import { getProgressiveNews, getNextJuicyNews, STORY_ARCS, STANDALONE_QUOTES } from './newsContent';

export const INITIAL_STATE: GameState = {
  locale: 'he',
  soundEnabled: true,
  gameStatus: 'playing',
  budget: 100, // Balanced initial funds (₪) - exactly covers 1st settlement (100₪) or troop deployment (25₪)
  maxBudget: 300, // Balanced treasury cap
  incomeRate: 3, // Paced civilian economy baseline (+3 ₪/s)
  settlementsCount: 0,
  soldiersTotal: 8,
  soldiersAtBorder: 8,
  soldiersAtSettlements: 0,
  reservesBatchesLeft: 3,
  defenseScore: 100,
  landHp: 100, // National Resilience starts at 100%
  isIntroModalOpen: true, // Entrance tutorial modal opens on game start
  isPaused: false,
  infoPopover: null,
  isBuildMode: false,
  constructions: {},
  collectibleCoins: [],
  lastCoinTick: 0,
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
    headlineHe: he.news.start,
    headlineEn: en.news.start,
    sourceHe: 'מבזק חדשות',
    sourceEn: 'Breaking News',
    category: 'military',
    timestamp: '12:00',
  },
  newsHistory: [
    {
      id: 'start',
      headline: he.news.start,
      source: 'מבזק חדשות',
      headlineHe: he.news.start,
      headlineEn: en.news.start,
      sourceHe: 'מבזק חדשות',
      sourceEn: 'Breaking News',
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
  latestGrant: null,
  greenSideAttacks: [],
  lastGreenAttackTick: 0,
  selectedInfiltrationId: null,
  interceptedToast: null,
  lastCityTaxTimestamps: {},
};

export const BORDER_TO_GREEN_CITY: Record<string, { cityId: string; nameHe: string; nameEn: string }> = {
  'bdr-1': { cityId: 'isr-2', nameHe: 'חיפה והצפון', nameEn: 'Haifa & North' },
  'bdr-2': { cityId: 'isr-4', nameHe: 'נתניה / השרון', nameEn: 'Netanya / Sharon' },
  'bdr-3': { cityId: 'isr-6', nameHe: 'תל אביב', nameEn: 'Tel Aviv' },
  'bdr-4': { cityId: 'isr-8', nameHe: 'השפלה / מודיעין', nameEn: 'Shfela / Modi\'in' },
  'bdr-5': { cityId: 'isr-10', nameHe: 'אשדוד / אשקלון', nameEn: 'Ashdod / Ashkelon' },
  'bdr-6': { cityId: 'isr-11', nameHe: 'עוטף עזה', nameEn: 'Gaza Envelope' },
  'bdr-7': { cityId: 'isr-11', nameHe: 'עוטף עזה', nameEn: 'Gaza Envelope' },
  'bdr-8': { cityId: 'isr-12', nameHe: 'באר שבע והנגב', nameEn: 'Beer Sheva & Negev' },
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

export function translateNewsItem(item: NewsItem, targetLocale: 'he' | 'en'): NewsItem {
  let headline = targetLocale === 'he' ? (item.headlineHe || item.headline) : (item.headlineEn || item.headline);
  let source = targetLocale === 'he' ? (item.sourceHe || item.source) : (item.sourceEn || item.source);

  // If specific bilingual fields were not stored, look up by story arc step or standalone quote
  if (targetLocale === 'en' && item.headlineHe && headline === item.headlineHe) {
    if (item.arcId && item.arcStep) {
      const arc = STORY_ARCS.find(a => a.id === item.arcId);
      const step = arc?.steps[item.arcStep - 1];
      if (step) {
        headline = step.en.headline;
        source = step.en.source;
      }
    } else {
      const quote = STANDALONE_QUOTES.find(q => q.he.headline === item.headline || q.en.headline === item.headline);
      if (quote) {
        headline = quote.en.headline;
        source = quote.en.source;
      }
    }
  } else if (targetLocale === 'he' && item.headlineEn && headline === item.headlineEn) {
    if (item.arcId && item.arcStep) {
      const arc = STORY_ARCS.find(a => a.id === item.arcId);
      const step = arc?.steps[item.arcStep - 1];
      if (step) {
        headline = step.he.headline;
        source = step.he.source;
      }
    } else {
      const quote = STANDALONE_QUOTES.find(q => q.en.headline === item.headline || q.he.headline === item.headline);
      if (quote) {
        headline = quote.he.headline;
        source = quote.he.source;
      }
    }
  }

  return {
    ...item,
    headline,
    source,
    headlineHe: item.headlineHe || (targetLocale === 'he' ? headline : undefined),
    headlineEn: item.headlineEn || (targetLocale === 'en' ? headline : undefined),
    sourceHe: item.sourceHe || (targetLocale === 'he' ? source : undefined),
    sourceEn: item.sourceEn || (targetLocale === 'en' ? source : undefined),
  };
}

const SETTLEMENT_COST = 100;

export function gameReducer(state: GameState, action: GameAction): GameState {
  const strings = state.locale === 'he' ? he : en;

  switch (action.type) {
    case 'SET_LOCALE': {
      const nextLocale = action.locale;
      const nextStrings = nextLocale === 'he' ? he : en;
      let stageGoal = nextStrings.lordOfHosts.stage1Goal;
      if (state.lordOfHosts.stage === 2) stageGoal = nextStrings.lordOfHosts.stage2Goal;
      if (state.lordOfHosts.stage === 3) stageGoal = nextStrings.lordOfHosts.stage3Goal;
      return {
        ...state,
        locale: nextLocale,
        currentNews: state.currentNews ? translateNewsItem(state.currentNews, nextLocale) : null,
        newsHistory: (state.newsHistory || []).map(item => translateNewsItem(item, nextLocale)),
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

    case 'OPEN_INTRO_MODAL': {
      sounds.playClick();
      return {
        ...state,
        isIntroModalOpen: true,
      };
    }

    case 'CLOSE_INTRO_MODAL': {
      sounds.playClick();
      try {
        localStorage.setItem('oct7_seen_intro_guide', 'true');
      } catch {
        // Safe guard for SSR/restricted environments
      }
      return {
        ...state,
        isIntroModalOpen: false,
      };
    }

    case 'TOGGLE_PAUSE': {
      sounds.playClick();
      return {
        ...state,
        isPaused: !state.isPaused,
      };
    }

    case 'SHOW_INFO_POPOVER': {
      sounds.playClick();
      return {
        ...state,
        infoPopover: {
          title: action.title,
          text: action.text,
        },
      };
    }

    case 'CLEAR_INFO_POPOVER': {
      return {
        ...state,
        infoPopover: null,
      };
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

      // Spawn burst of 3 golden particles traveling to budget counter
      const newSparks = [...(state.sparks || [])];
      for (let i = 0; i < 3; i++) {
        newSparks.push({
          id: `coin-spark-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
          startX: coin.x + (i - 1) * 6,
          startY: coin.y,
          targetX: 100,
          targetY: 80,
          createdAt: Date.now(),
        });
      }

      return {
        ...state,
        budget: Math.min(state.maxBudget, state.budget + coin.amount),
        collectibleCoins: state.collectibleCoins.filter(c => c.id !== action.id),
        sparks: newSparks,
        lastCoinTick: 0,
      };
    }

    case 'COLLECT_CITY_TAX': {
      if (state.gameStatus !== 'playing') return state;
      const cityTile = state.tiles[action.cityId];
      if (!cityTile) return state;

      const now = Date.now();
      const lastTax = (state.lastCityTaxTimestamps || {})[action.cityId] || 0;
      // 3.5s cooldown per city for modest municipal contribution
      if (now - lastTax < 3500) return state;

      const taxAmount = 2;
      const newBudget = Math.min(state.maxBudget, state.budget + taxAmount);
      sounds.playCoinCollect();

      const newSparks = [...state.sparks];
      newSparks.push({
        id: `spark-tax-${now}-${Math.random()}`,
        startX: cityTile.x,
        startY: cityTile.y,
        targetX: 200,
        targetY: 80,
        createdAt: now,
      });

      return {
        ...state,
        budget: newBudget,
        sparks: newSparks,
        lastCityTaxTimestamps: {
          ...(state.lastCityTaxTimestamps || {}),
          [action.cityId]: now,
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

      // Troop deployment costs 25₪ per soldier (transport, mobile trailers, security infrastructure)
      const DEPLOY_COST_PER_SOLDIER = 25;
      if (state.budget < DEPLOY_COST_PER_SOLDIER) {
        sounds.playPenalty();
        return state;
      }
      const maxAffordable = Math.floor(state.budget / DEPLOY_COST_PER_SOLDIER);

      // Randomly shuffle border checkpoints so forces are pulled randomly along the border instead of bottom-up
      const shuffledBorderIds = [...mannedBorderIds].sort(() => Math.random() - 0.5);

      // Randomly shuffle ungarrisoned settlements so forces are distributed organically across the map
      const shuffledSettlementIds = [...ungarrisonedSettlementIds].sort(() => Math.random() - 0.5);

      const updatedTiles = { ...state.tiles };
      const newMovingTroops = [...(state.movingTroops || [])];
      let transferredCount = 0;

      for (const settlementId of shuffledSettlementIds) {
        if (transferredCount >= maxAffordable) break;
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

      const deploymentCost = transferredCount * DEPLOY_COST_PER_SOLDIER;
      const newBudget = Math.max(0, state.budget - deploymentCost);

      sounds.playDeploy();
      sounds.playPenalty();

      const latestPenalty: FinancialPenalty = {
        id: `penalty-deploy-${Date.now()}`,
        amount: deploymentCost,
        reason: state.locale === 'he' ? 'עלות פריסת כוחות' : 'Troop Deployment Cost',
        timestamp: Date.now(),
      };

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
          headlineHe: he.news.borderBreach,
          headlineEn: en.news.borderBreach,
          sourceHe: 'פיקוד דרום ומרכז',
          sourceEn: 'Southern & Central Command',
          category: 'military',
          isUrgent: true,
          timestamp: new Date().toLocaleTimeString(state.locale === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        };
      } else {
        const conceptziaHeadlinesHe = [
          `עלות פריסת כוחות (₪${deploymentCost}-): כספי ביטחון הושקעו בשינוע כוחות לשמירה על מאחזים מבודדים על חשבון קווי הגבול.`,
          `דילול כוחות בגבול (₪${deploymentCost}-): שר האוצר והביטחון אישרו תקציב לאבטחת התיישבות. אמ״ן מרגיע: ״הגבול שקט״.`,
          `כוחות נגרעו מהגבול! אמ״ן בקבינט: ״חמאס מורתע לשנים קדימה, הפוקוס הביטחוני שייך למאחזים״.`,
          `הוצאות פריסה שוטפות (₪${deploymentCost}-): פיקוד העורף טוען שהמכשול ההרמטי והסנסורים יחפו על דילול הלוחמים.`,
        ];
        const conceptziaHeadlinesEn = [
          `Troop Deployment Cost (-₪${deploymentCost}): Defense budget spent moving forces to secure isolated outposts at border's expense.`,
          `Troops Shifted from Border (-₪${deploymentCost}): Defense budget allocated to outposts. Intel: "Border is quiet."`,
          `Forces diverted from border! Intel to cabinet: "Hamas is deterred for years; defense priority belongs on outposts."`,
          `Deployment Outlays (-₪${deploymentCost}): Military claims smart sensors compensate for thinned border checkpoints.`,
        ];
        const conceptziaSourcesHe = [
          'אגף המודיעין ומשרד האוצר',
          'לשכת שר האוצר והביטחון',
          'הקבינט המדיני-ביטחוני',
          'פיקוד דרום והמנהל האזרחי',
        ];
        const conceptziaSourcesEn = [
          'Military Intel & Treasury',
          'Finance & Defense Ministry',
          'Security Cabinet',
          'Southern Command & Civil Admin',
        ];
        const cIdx = Math.floor(Math.random() * conceptziaHeadlinesHe.length);
        deployNewsItem = {
          id: `conceptzia-${Date.now()}`,
          headline: state.locale === 'he' ? conceptziaHeadlinesHe[cIdx] : conceptziaHeadlinesEn[cIdx],
          source: state.locale === 'he' ? conceptziaSourcesHe[cIdx] : conceptziaSourcesEn[cIdx],
          headlineHe: conceptziaHeadlinesHe[cIdx],
          headlineEn: conceptziaHeadlinesEn[cIdx],
          sourceHe: conceptziaSourcesHe[cIdx],
          sourceEn: conceptziaSourcesEn[cIdx],
          category: 'politics',
          isUrgent: false,
          timestamp: new Date().toLocaleTimeString(state.locale === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
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
        budget: newBudget,
        latestPenalty,
        latestGrant: null,
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
          chargePercent: isPanic ? 99.9 : Math.min(99.0, Math.max(state.lordOfHosts.chargePercent + transferredCount * 4, 30)),
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

      // Economic Tradeoff: Mobilizing workers impacts civilian output, but keeps steady flow
      const newIncomeRate = Math.max(3, 6 - callsMade);

      sounds.playReserves();

      const updatedTiles = { ...state.tiles };
      let remainingToPlace = addedSoldiers;
      const breachedCheckpoints = Object.keys(updatedTiles).filter(
        id => updatedTiles[id].isBorderCheckpoint && updatedTiles[id].garrisonCount === 0
      );

      // Prioritize sealing checkpoints that are currently under hostile attack
      const activeAttackBreachIds = new Set((state.greenSideAttacks || []).map(a => a.breachId));
      const sortedBreachedCheckpoints = [...breachedCheckpoints].sort((a, b) => {
        const aActive = activeAttackBreachIds.has(a) ? 1 : 0;
        const bActive = activeAttackBreachIds.has(b) ? 1 : 0;
        return bActive - aActive;
      });

      for (const bId of sortedBreachedCheckpoints) {
        if (remainingToPlace <= 0) break;
        updatedTiles[bId] = {
          ...updatedTiles[bId],
          garrisonCount: 1,
          isBreached: false,
          hasAlert: false,
        };
        remainingToPlace--;
      }

      // If all border checkpoints are now secured, reinforce any ungarrisoned settlements!
      let reinforcedSettlementsCount = 0;
      if (remainingToPlace > 0) {
        const ungarrisonedSettlements = Object.keys(updatedTiles).filter(
          id => updatedTiles[id].hasSettlement && updatedTiles[id].garrisonCount === 0
        );
        for (const sId of ungarrisonedSettlements) {
          if (remainingToPlace <= 0) break;
          updatedTiles[sId] = {
            ...updatedTiles[sId],
            garrisonCount: 1,
          };
          remainingToPlace--;
          reinforcedSettlementsCount++;
        }
      }

      const activeBorderCheckpoints = Object.values(updatedTiles).filter(
        t => t.isBorderCheckpoint && t.garrisonCount > 0
      ).length;
      const newSettlementSoldiers = state.soldiersAtSettlements + reinforcedSettlementsCount;
      const newBorderSoldiers = newTotal - newSettlementSoldiers;
      const newDefenseScore = Math.min(100, Math.round((activeBorderCheckpoints / 8) * 100));

      const activeBreaches = Object.keys(updatedTiles).filter(
        id => updatedTiles[id].isBorderCheckpoint && updatedTiles[id].garrisonCount === 0
      );

      let newsHeadlineHe = reinforcedSettlementsCount > 0
        ? `צו 8! פלוגות מילואים גויסו — אטמו את פרצות הגבול ותיגברו ${reinforcedSettlementsCount} מאחזים חשופים!`
        : `צו 8! פלוגות מילואים גויסו. עובדים נגרעו מהמשק — קצב הכנסות הואט ל-${newIncomeRate}₪ לשנייה בלבד (${newBatchesLeft} סבבים נותרו).`;
      let newsHeadlineEn = reinforcedSettlementsCount > 0
        ? `Emergency Call-Up! Reserve units mobilized — sealed border breaches and reinforced ${reinforcedSettlementsCount} outposts!`
        : `Emergency Call-Up! Troops mobilized, civilian economy slowed to ₪${newIncomeRate}/s (${newBatchesLeft} calls left).`;

      if (callsMade === 2) {
        newsHeadlineHe = `גל גיוס שני! מחסור בידיים עובדות — קצב בסיס 4₪, הגבול והמאחזים מוגנים!`;
        newsHeadlineEn = `Second Mobilization Wave! Labor shortage — base rate ₪4/s, border & outposts secured!`;
      } else if (callsMade === 3) {
        newsHeadlineHe = `קריסה במערך המילואים! סבב גיוס אחרון מוצה — תלות מלאה במטבעות ותרומות!`;
        newsHeadlineEn = `Reserve Exhaustion! Final reserve wave deployed — relying on coins & donations!`;
      }

      // Intercept any green side attacks whose breach checkpoint was just re-manned!
      const sealedCheckpoints = new Set(breachedCheckpoints.slice(0, addedSoldiers - remainingToPlace));
      const remainingGreenAttacks = (state.greenSideAttacks || []).filter(
        atk => !sealedCheckpoints.has(atk.breachId)
      );
      const hadIntercepted = (state.greenSideAttacks || []).length > remainingGreenAttacks.length;

      if (hadIntercepted) {
        sounds.playShieldChime();
        newsHeadlineHe += ' כוחות המילואים בלמו ויירטו חוליות שחדרו לעורף!';
        newsHeadlineEn += ' Reserve forces intercepted hostile squads penetrating the home front!';
      }

      return {
        ...state,
        soldiersTotal: newTotal,
        soldiersAtBorder: newBorderSoldiers,
        soldiersAtSettlements: newSettlementSoldiers,
        incomeRate: newIncomeRate,
        reservesBatchesLeft: newBatchesLeft,
        defenseScore: newDefenseScore,
        tiles: updatedTiles,
        activeBreaches,
        greenSideAttacks: remainingGreenAttacks,
        interceptedToast: hadIntercepted ? {
          id: `intercept-${Date.now()}`,
          textHe: '🛡️ חדירה סוכלה בהצלחה!',
          textEn: '🛡️ Infiltration Thwarted Successfully!',
          timestamp: Date.now(),
        } : state.interceptedToast,
        lordOfHosts: {
          ...state.lordOfHosts,
          isPanicMashMode: newDefenseScore === 0,
        },
        ...withNews(state, {
          id: `reserves-${Date.now()}`,
          headline: state.locale === 'he' ? newsHeadlineHe : newsHeadlineEn,
          source: state.locale === 'he' ? 'אגף כוח אדם והאוצר' : 'Personnel & Treasury',
          headlineHe: newsHeadlineHe,
          headlineEn: newsHeadlineEn,
          sourceHe: 'אגף כוח אדם והאוצר',
          sourceEn: 'Personnel & Treasury',
          category: 'military',
          isUrgent: callsMade >= 2 || hadIntercepted,
          timestamp: new Date().toLocaleTimeString(state.locale === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
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

      // 3. Passive budget income: Guarded settlements generate coalition funding (+2₪/s per outpost)
      // Baseline civilian production decreases when reserve call-ups remove workers from the economy.
      const callsMade = 3 - (state.reservesBatchesLeft ?? 3);
      const baseCivilianIncome = Math.max(1, 4 - callsMade);
      const guardedSettlementCount = Object.values(updatedTiles).filter(t => t.hasSettlement && t.garrisonCount > 0).length;
      const guardedIncomeBonus = guardedSettlementCount * 2;
      const effectiveIncome = baseCivilianIncome + guardedIncomeBonus;
      const currentMaxBudget = 300 + Object.values(updatedTiles).filter(t => t.hasSettlement).length * 25;
      let newBudget = Math.min(currentMaxBudget, state.budget + effectiveIncome);
      let newLandHp = state.landHp !== undefined ? state.landHp : 100;

      // Defense holes bleed Homeland HP (0.4 HP/s per unsealed breach)
      const holeCount = state.activeBreaches.length;
      if (holeCount > 0) {
        const holeDrain = Math.round(holeCount * 0.4 * 10) / 10;
        newLandHp = Math.max(0, Number((newLandHp - holeDrain).toFixed(1)));
      } else if ((state.greenSideAttacks || []).length === 0 && newLandHp < 100) {
        // Safe, fortified borders naturally stabilize homeland security
        newLandHp = Math.min(100, Number((newLandHp + 0.5).toFixed(1)));
      }

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
            hp: 100,
            maxHp: 100,
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

      const now = Date.now();

      // Heal / repair garrisoned settlements gradually and clear expired damaged city states
      for (const tId of Object.keys(updatedTiles)) {
        const t = updatedTiles[tId];
        if (t.hasSettlement && t.garrisonCount > 0 && t.hp !== undefined && t.hp < 100) {
          updatedTiles[tId] = {
            ...t,
            hp: Math.min(100, t.hp + 5),
          };
        }
        if (t.damagedUntil && now >= t.damagedUntil) {
          updatedTiles[tId] = {
            ...t,
            damagedUntil: undefined,
            hasAlert: false,
          };
        }
      }

      // 4. Spawn collectible coins on Israeli cities (strictly at most 1 coin at a time)
      const coins = [...state.collectibleCoins];
      let nextCoinTick = (state.lastCoinTick || 0) + 1;
      const maxAllowedCoins = 1; // Paced: at most 1 coin at a time on screen

      // Cooldown of at least 16 seconds between coins
      if (coins.length < maxAllowedCoins && nextCoinTick >= 16 && Math.random() < 0.4) {
        const israelCityTiles = [
          { x: 105, y: 210 }, // תל אביב
          { x: 115, y: 60 },  // חיפה והצפון
          { x: 110, y: 135 }, // נתניה / השרון
          { x: 100, y: 285 }, // השפלה / מודיעין
          { x: 95, y: 360 },  // אשדוד / אשקלון
          { x: 95, y: 435 },  // באר שבע והנגב
        ];
        const randomCity = israelCityTiles[Math.floor(Math.random() * israelCityTiles.length)];
        coins.push({
          id: `coin-${Date.now()}`,
          x: randomCity.x,
          y: randomCity.y,
          amount: 15,
          createdAt: Date.now(),
        });
        nextCoinTick = 0;
      }

      let nextCurrentNews = state.currentNews;
      let nextNewsHistory = state.newsHistory || [];
      let nextStoryArcs = state.activeStoryArcs || {};
      let nextNewsTick = (state.lastNewsTick || 0) + 1;

      // 5. Attacks on the Green Side of the map via defense line holes (Active Breaches)
      let activeGreenAttacks = [...(state.greenSideAttacks || [])];
      let nextGreenAttackTick = (state.lastGreenAttackTick || 0) + 1;
      let newDefenseScore = state.defenseScore;

      if (state.activeBreaches.length > 0) {
        // Holes in the border fence allow hostile raids into the green side!
        // Dynamic scaling: early settlements get a significant grace cooldown!
        const totalSettlements = Object.values(updatedTiles).filter(t => t.hasSettlement).length;
        const minAttackCooldown = totalSettlements <= 1 ? 60 : totalSettlements === 2 ? 50 : 42;
        const attackChance = totalSettlements <= 1 ? 0.22 : totalSettlements === 2 ? 0.30 : 0.35;

        if (nextGreenAttackTick >= minAttackCooldown && activeGreenAttacks.length < 1 && Math.random() < attackChance) {
          const breachId = state.activeBreaches[Math.floor(Math.random() * state.activeBreaches.length)];
          const breachTile = updatedTiles[breachId];
          const targetInfo = BORDER_TO_GREEN_CITY[breachId] || { cityId: 'isr-11', nameHe: 'עוטף עזה', nameEn: 'Gaza Envelope' };
          const targetCityTile = updatedTiles[targetInfo.cityId];

          if (breachTile && targetCityTile) {
            const attackEvent: GreenSideAttack = {
              id: `green-attack-${now}-${Math.random().toString(36).slice(2, 6)}`,
              breachId,
              targetCityId: targetInfo.cityId,
              targetCityName: state.locale === 'he' ? targetInfo.nameHe : targetInfo.nameEn,
              startX: breachTile.x,
              startY: breachTile.y,
              targetX: targetCityTile.x,
              targetY: targetCityTile.y,
              progress: 0,
              createdAt: now,
              durationMs: 18000, // 18 seconds to give player plenty of time to read and react!
            };
            activeGreenAttacks.push(attackEvent);
            nextGreenAttackTick = 0;
            sounds.playSiren();

            const breachHeadlineHe = `התרעת חדירה: חוליית מחבלים חמושה פרצה דרך מוצב בלתי מאויש לעבר ${targetInfo.nameHe}!`;
            const breachHeadlineEn = `Infiltration alert: Armed squad penetrated through unmanned post toward ${targetInfo.nameEn}!`;
            const breachNewsItem: NewsItem = {
              id: `breach-raid-news-${now}`,
              headline: state.locale === 'he' ? breachHeadlineHe : breachHeadlineEn,
              source: state.locale === 'he' ? 'פיקוד העורף' : 'Home Front Command',
              headlineHe: breachHeadlineHe,
              headlineEn: breachHeadlineEn,
              sourceHe: 'פיקוד העורף',
              sourceEn: 'Home Front Command',
              category: 'military',
              isUrgent: true,
              timestamp: new Date().toLocaleTimeString(state.locale === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
            };
            if (nextCurrentNews) {
              nextNewsHistory = [nextCurrentNews, ...nextNewsHistory.filter(n => n.id !== nextCurrentNews?.id)].slice(0, 30);
            }
            nextCurrentNews = breachNewsItem;
          }
        }
      }

      // Progress active green side attacks and trigger impact on reach
      const survivingGreenAttacks: GreenSideAttack[] = [];
      for (const atk of activeGreenAttacks) {
        const nextProgress = atk.progress + 0.055; // ~18 seconds to cross (plenty of time to read and respond)
        if (nextProgress >= 1) {
          // RAID REACHED THE GREEN SIDE CITY!
          sounds.playPanicMashThud();
          sounds.playSiren();
          newDefenseScore = Math.max(0, newDefenseScore - 4);
          newBudget = Math.max(0, newBudget - 10);
          newLandHp = Math.max(0, Number((newLandHp - 12).toFixed(1)));
          updatedTiles[atk.targetCityId] = {
            ...updatedTiles[atk.targetCityId],
            hasAlert: false, // Infiltration message is removed; city is now in post-impact aftermath
            damagedUntil: now + 6500,
          };

          const impactHeadlineHe = `פגיעה ישירה בעורף: חוליה פגעה בפאתי ${atk.targetCityName}! (חוסן לאומי 12%- | 10₪- נזק)`;
          const impactHeadlineEn = `Direct home front strike: Squad attacked outskirts of ${atk.targetCityName}! (-12% HP | -₪10 damage)`;
          const impactNewsItem: NewsItem = {
            id: `green-impact-${now}-${atk.id}`,
            headline: state.locale === 'he' ? impactHeadlineHe : impactHeadlineEn,
            source: state.locale === 'he' ? 'חדשות 12 / מבזק' : 'Breaking News',
            headlineHe: impactHeadlineHe,
            headlineEn: impactHeadlineEn,
            sourceHe: 'חדשות 12 / מבזק',
            sourceEn: 'Breaking News',
            category: 'military',
            isUrgent: true,
            timestamp: new Date().toLocaleTimeString(state.locale === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          };
          if (nextCurrentNews) {
            nextNewsHistory = [nextCurrentNews, ...nextNewsHistory.filter(n => n.id !== nextCurrentNews?.id)].slice(0, 30);
          }
          nextCurrentNews = impactNewsItem;
        } else {
          survivingGreenAttacks.push({
            ...atk,
            progress: nextProgress,
          });
        }
      }
      activeGreenAttacks = survivingGreenAttacks;

      // Infiltrating trucks mapped from activeGreenAttacks
      const updatedTrucks = activeGreenAttacks.map(atk => ({
        id: atk.id,
        x: atk.startX,
        y: atk.startY,
        targetX: atk.targetX,
        targetY: atk.targetY,
        progress: atk.progress,
      }));

      const isPanic = newDefenseScore === 0 && state.activeBreaches.length >= 2;

      // 6. Ambient Spicy News & Multi-part Story Arc Progress (paced naturally every 28 seconds)
      if (nextNewsTick >= 28 && newDefenseScore > 20) {
        const { item, nextArcs } = getNextJuicyNews(state);
        nextStoryArcs = nextArcs;
        nextNewsTick = 0;
        if (nextCurrentNews) {
          nextNewsHistory = [nextCurrentNews, ...nextNewsHistory.filter(n => n.id !== nextCurrentNews?.id)].slice(0, 30);
        }
        nextCurrentNews = item;
      }

      // 7. Random West Bank Clashes (עימותים הדדיים) between Jewish settlements and Arabic cities
      let activeClashes = (state.clashes || []).filter(c => now - c.createdAt < c.durationMs);
      let nextClashTick = (state.lastClashTick || 0) + 1;

      // Find all built settlements in West Bank and local Arabic cities
      const builtSettlementList = Object.values(updatedTiles).filter(t => t.hasSettlement);
      const arabCitiesList = Object.values(updatedTiles).filter(t => t.isLocalCity);

      // Clashes only occur if there are Jewish settlements in the West Bank
      if (builtSettlementList.length > 0 && arabCitiesList.length > 0) {
        const unsecureSettlements = builtSettlementList.filter(t => t.garrisonCount === 0);
        const secureSettlements = builtSettlementList.filter(t => t.garrisonCount > 0);

        // Progressive scaling: give early settlements breathing room!
        const hasUnsecured = unsecureSettlements.length > 0;
        const totalBuilt = builtSettlementList.length;
        const minClashCooldown = hasUnsecured
          ? (totalBuilt <= 1 ? 45 : totalBuilt === 2 ? 38 : 32)
          : (totalBuilt <= 2 ? 60 : 50);
        const clashChance = hasUnsecured ? 0.28 : 0.10;

        if (nextClashTick >= minClashCooldown && activeClashes.length < 1 && Math.random() < clashChance) {
          // Fights happen significantly more against non-secured settlements (85% chance if any exist)!
          const pickUnsecured = hasUnsecured && (secureSettlements.length === 0 || Math.random() < 0.85);
          const settlement = pickUnsecured
            ? unsecureSettlements[Math.floor(Math.random() * unsecureSettlements.length)]
            : builtSettlementList[Math.floor(Math.random() * builtSettlementList.length)];

          // Find the closest Arabic cities by Euclidean distance
          const sortedArabCities = [...arabCitiesList].sort((a, b) => {
            const distA = Math.hypot(a.x - settlement.x, a.y - settlement.y);
            const distB = Math.hypot(b.x - settlement.x, b.y - settlement.y);
            return distA - distB;
          });

          // Pick from the 2 closest Arabic cities
          const targetArabCity = sortedArabCities[Math.random() < 0.7 ? 0 : Math.min(1, sortedArabCities.length - 1)];

          const isGarrisoned = settlement.garrisonCount > 0;
          const settlerInitiated = isGarrisoned ? Math.random() < 0.5 : Math.random() < 0.25;
          const settlementNameHe = settlement.settlementName || 'מאחז חדש';
          const settlementNameEn = settlement.settlementName || 'New Outpost';
          const arabCityNameHe = targetArabCity.label || 'הכפר הסמוך';
          const arabCityNameEn = targetArabCity.subLabel || 'Nearby Village';

          // Titles and narrative headlines
          let clashHeadlineHe = '';
          let clashHeadlineEn = '';
          let clashTitle = '';
          let clashSourceHe = isGarrisoned ? 'דובר צה״ל' : 'משטרת מחוז ש״י';
          let clashSourceEn = isGarrisoned ? 'IDF Spokesperson' : 'District Police';
          let isUrgentClash = false;

          if (settlerInitiated) {
            clashTitle = state.locale === 'he'
              ? `פשיטה: ${settlementNameHe} ⚔️ ${arabCityNameHe}`
              : `Raid: ${settlementNameEn} vs ${arabCityNameEn}`;

            const variantsHe = [
              `עימות אלים: קבוצת צעירים מ${settlementNameHe} פשטה על פאתי ${arabCityNameHe}, יודו אבנים הדדיות.`,
              `חיכוך בשומרון: מתנחלים מ${settlementNameHe} נכנסו למסיק זיתים סמוך ל${arabCityNameHe}.`,
              `הפגנה סוערת: תושבים מ${settlementNameHe} חסמו את כביש הגישה ל${arabCityNameHe} והבעירו צמיגים.`,
              `פעולת 'תג מחיר': ריסוס כתובות ועימותים בין תושבי ${settlementNameHe} לפאתי ${arabCityNameHe}.`,
            ];
            const variantsEn = [
              `Violent clash: Settlers from ${settlementNameEn} raided outskirts of ${arabCityNameEn}, stones exchanged.`,
              `Friction in Samaria: Settlers from ${settlementNameEn} entered olive groves near ${arabCityNameEn}.`,
              `Heated protest: Residents of ${settlementNameEn} blocked access road to ${arabCityNameEn} and burned tires.`,
              `Price tag incident: Graffiti sprayed and clashes between ${settlementNameEn} and outskirts of ${arabCityNameEn}.`,
            ];
            const vIdx = Math.floor(Math.random() * variantsHe.length);
            clashHeadlineHe = variantsHe[vIdx];
            clashHeadlineEn = variantsEn[vIdx];
          } else {
            clashTitle = state.locale === 'he'
              ? `מתקפה על מאחז: ${arabCityNameHe} ⚔️ ${settlementNameHe}`
              : `Outpost targeted: ${arabCityNameEn} vs ${settlementNameEn}`;

            const variantsHe = !isGarrisoned ? [
              `מאחז חשוף תחת מתקפה: בהיעדר כוחות צה״ל לשמירה, עשרות פורעים מ${arabCityNameHe} תקפו את פאתי ${settlementNameHe}!`,
              `חיכוך אלים במאחז לא מאובטח: בקבוקי תבערה וזיקוקים מ${arabCityNameHe} נורו לעבר בתי ${settlementNameHe} ללא כוח מגן צבאי!`,
              `מארב אבנים כבד: רכבים נרגמו סמוך ל${settlementNameHe} הבלתי-מאובטח, נזק כבד נגרם למבנים.`,
              `התפרעות ללא מענה ביטחוני: עשרות צעירים מ${arabCityNameHe} פרצו את גדר ${settlementNameHe} החשוף!`,
            ] : [
              `התפרעות אלימה: עשרות מיידי אבנים יצאו מ${arabCityNameHe} לעבר כביש הגישה ל${settlementNameHe}.`,
              `חיכוך סמוך לגדר: בקבוקי תבערה מ${arabCityNameHe} נורו לעבר בתי ${settlementNameHe}.`,
              `מארב אבנים: רכבים נרגמו באבנים בציר הסמוך ל${arabCityNameHe}, סמוך ל${settlementNameHe}.`,
              `הפרת סדר בצומת: עשרות צעירים מ${arabCityNameHe} התעמתו בפאתי המאחז ${settlementNameHe}.`,
            ];
            const variantsEn = !isGarrisoned ? [
              `Unsecured outpost under attack: With no IDF garrison at ${settlementNameEn}, dozens attacked from ${arabCityNameEn}!`,
              `Friction at exposed outpost: Molotov cocktails and fireworks from ${arabCityNameEn} hit ${settlementNameEn} with no army presence!`,
              `Heavy stone ambush: Vehicles and homes damaged at unprotected outpost ${settlementNameEn}.`,
              `Security vacuum: Youths from ${arabCityNameEn} breached perimeter of ungarrisoned ${settlementNameEn}!`,
            ] : [
              `Violent riot: Dozens of stone throwers came out of ${arabCityNameEn} toward the access road to ${settlementNameEn}.`,
              `Friction near perimeter: Molotov cocktails and fireworks from ${arabCityNameEn} fired toward ${settlementNameEn}.`,
              `Stone ambush: Vehicles pelted with stones on the road near ${arabCityNameEn}, close to ${settlementNameEn}.`,
              `Junction disturbance: Dozens of youths from ${arabCityNameEn} clashed at the outskirts of outpost ${settlementNameEn}.`,
            ];
            const vIdx = Math.floor(Math.random() * variantsHe.length);
            clashHeadlineHe = variantsHe[vIdx];
            clashHeadlineEn = variantsEn[vIdx];
          }

          if (isGarrisoned) {
            sounds.playClash();
          } else {
            // UNGARRISONED OUTPOST: Severe tension, no military buffer! Unprotected outpost takes HP damage!
            isUrgentClash = true;
            sounds.playSiren();
            if (newBudget >= 6) {
              newBudget = Math.max(0, newBudget - 6);
            }

            const currentHp = settlement.hp !== undefined ? settlement.hp : 100;
            const newHp = Math.max(0, currentHp - 25);

            if (newHp <= 0) {
              // Settlement destroyed!
              newLandHp = Math.max(0, Number((newLandHp - 10).toFixed(1)));
              updatedTiles[settlement.id] = {
                ...settlement,
                hasSettlement: false,
                hp: undefined,
                maxHp: undefined,
                settlementName: undefined,
                garrisonCount: 0,
                hasAlert: false,
              };
              newSettlementsCount = Math.max(0, newSettlementsCount - 1);
              sounds.playPanicMashThud();

              clashHeadlineHe = `אסון במאחז: ${settlementNameHe} ננטש ונשרף כליל עקב היעדר כוחות צה״ל לשמירה! (חוסן לאומי 10%-)`;
              clashHeadlineEn = `Outpost destroyed: ${settlementNameEn} abandoned and burned with no troops! (-10% HP)`;
            } else {
              updatedTiles[settlement.id] = {
                ...settlement,
                hp: newHp,
                hasAlert: true,
              };
              clashHeadlineHe += ` (עמידות המאחז ירדה ל-${newHp}%)`;
              clashHeadlineEn += ` (Outpost HP dropped to ${newHp}%)`;
            }
          }

          const clashEvent = {
            id: `clash-${now}-${Math.random().toString(36).slice(2, 6)}`,
            settlementId: settlement.id,
            arabCityId: targetArabCity.id,
            settlerInitiated,
            settlementName: state.locale === 'he' ? settlementNameHe : settlementNameEn,
            arabCityName: state.locale === 'he' ? arabCityNameHe : arabCityNameEn,
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
            headline: state.locale === 'he' ? clashHeadlineHe : clashHeadlineEn,
            source: state.locale === 'he' ? clashSourceHe : clashSourceEn,
            headlineHe: clashHeadlineHe,
            headlineEn: clashHeadlineEn,
            sourceHe: clashSourceHe,
            sourceEn: clashSourceEn,
            category: 'military',
            isUrgent: isUrgentClash,
            timestamp: new Date().toLocaleTimeString(state.locale === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          };

          if (nextCurrentNews) {
            nextNewsHistory = [nextCurrentNews, ...nextNewsHistory.filter(n => n.id !== nextCurrentNews?.id)].slice(0, 30);
          }
          nextCurrentNews = clashNewsItem;
        }
      }

      // 8. Periodic Coalition Ultimatums & Fines for UNGARRISONED Settlements
      // When settlements are left exposed without soldiers, coalition ministers demand immediate troop deployment!
      let latestPenalty = state.latestPenalty;
      if (latestPenalty && now - latestPenalty.timestamp > 4000) {
        latestPenalty = null;
      }
      let latestGrant = state.latestGrant;
      if (latestGrant && now - latestGrant.timestamp > 3800) {
        latestGrant = null;
      }
      let nextPenaltyTick = (state.lastPenaltyTick || 0) + 1;

      const ungarrisonedSettlements = builtSettlementList.filter(t => t.garrisonCount === 0);
      const ungarrisonedCount = ungarrisonedSettlements.length;

      // Penalties trigger only when settlements are built but LEFT UNPROTECTED!
      if (ungarrisonedCount > 0) {
        // Cooldown: increased from 16s to 36s (or 45s for first settlement)
        const totalBuilt = builtSettlementList.length;
        const minPenaltyCooldown = totalBuilt <= 1 ? 45 : 36;
        const penaltyChance = Math.min(0.32, 0.10 + ungarrisonedCount * 0.06);

        if (nextPenaltyTick >= minPenaltyCooldown && Math.random() < penaltyChance) {
          const basePenalty = 8 + ungarrisonedCount * 2;
          const variance = (Math.floor(Math.random() * 3) - 1) * 2;
          const penaltyAmount = Math.max(8, Math.min(14, basePenalty + variance));
          const actualDeducted = Math.min(newBudget, penaltyAmount);
          newBudget = Math.max(0, newBudget - actualDeducted);

          const reasonsHe = [
            'אולטימטום קואליציוני: מאחזים הופקרו ללא שמירה!',
            'הקפאת תקציבי פיתוח עקב היעדר אבטחה ביו״ש',
            'קנס קואליציוני: שרי הימין דורשים פריסת לוחמים מיידית',
            'עיקול כספי קואליציה: מאחז מבודד נותר חשוף',
            'איום בפירוק הממשלה אם לא יוצבו חיילים במאחז',
          ];

          const reasonsEn = [
            'Coalition Ultimatum: Outposts abandoned without guards!',
            'Development funds frozen due to lack of outpost security',
            'Coalition Penalty: Right-wing ministers demand immediate troop deployment',
            'Coalition fund freeze: Isolated outpost left unprotected',
            'Threat of government collapse unless soldiers are stationed',
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
          const penaltyHeadlineHe = `אולטימטום קואליציוני (${penaltyAmount}₪-): שרים מאיימים במשבר אם לא יוצבו כוחות במאחזים החשופים.`;
          const penaltyHeadlineEn = `Coalition Ultimatum (-${penaltyAmount}₪): Ministers threaten crisis unless troops are deployed to exposed outposts.`;
          const penaltyNews: NewsItem = {
            id: `penalty-news-${now}`,
            headline: state.locale === 'he' ? penaltyHeadlineHe : penaltyHeadlineEn,
            source: state.locale === 'he' ? 'סיעות הקואליציה' : 'Coalition Factions',
            headlineHe: penaltyHeadlineHe,
            headlineEn: penaltyHeadlineEn,
            sourceHe: 'סיעות הקואליציה',
            sourceEn: 'Coalition Factions',
            category: 'politics',
            timestamp: new Date().toLocaleTimeString(state.locale === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
            isUrgent: true,
          };

          if (nextCurrentNews) {
            nextNewsHistory = [nextCurrentNews, ...nextNewsHistory.filter(n => n.id !== nextCurrentNews?.id)].slice(0, 30);
          }
          nextCurrentNews = penaltyNews;
        }
      }

      if (newLandHp <= 0) {
        sounds.playCrackCollapse();
        sounds.playSiren();
        return {
          ...state,
          landHp: 0,
          budget: newBudget,
          defenseScore: 0,
          tiles: updatedTiles,
          isScreenShaking: true,
          gameStatus: 'catastrophe',
          ...withNews(state, {
            id: `catastrophe-collapse-${now}`,
            headline: state.locale === 'he'
              ? 'קריסת חוסן המדינה: ההגנה נשברה כליל! פרצות ממושכות ופגיעות ישירות הובילו ל-7 באוקטובר.'
              : 'Homeland Collapse: Defenses broken! Prolonged breaches and direct strikes led to October 7th.',
            source: state.locale === 'he' ? 'פיקוד העורף' : 'Home Front Command',
            headlineHe: 'קריסת חוסן המדינה: ההגנה נשברה כליל! פרצות ממושכות ופגיעות ישירות הובילו ל-7 באוקטובר.',
            headlineEn: 'Homeland Collapse: Defenses broken! Prolonged breaches and direct strikes led to October 7th.',
            sourceHe: 'פיקוד העורף',
            sourceEn: 'Home Front Command',
            category: 'military',
            isUrgent: true,
            timestamp: new Date().toLocaleTimeString(state.locale === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          }),
        };
      }

      return {
        ...state,
        budget: newBudget,
        maxBudget: currentMaxBudget,
        incomeRate: effectiveIncome,
        settlementsCount: newSettlementsCount,
        constructions: updatedConstructions,
        defenseScore: newDefenseScore,
        landHp: newLandHp,
        tiles: updatedTiles,
        sparks: newSparks,
        collectibleCoins: coins,
        lastCoinTick: nextCoinTick,
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
        latestGrant,
        greenSideAttacks: activeGreenAttacks,
        lastGreenAttackTick: nextGreenAttackTick,
        interceptedToast: (state.interceptedToast && now - state.interceptedToast.timestamp > 3800)
          ? null
          : state.interceptedToast,
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

    case 'CLEAR_INTERCEPTED_TOAST': {
      return {
        ...state,
        interceptedToast: null,
      };
    }

    case 'CLEAR_GREEN_ATTACK': {
      return {
        ...state,
        greenSideAttacks: (state.greenSideAttacks || []).filter(a => a.id !== action.id),
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
          headlineHe: `מאחז פונה. הכוחות הוחזרו לעיבוי קו הגבול הריבוני.`,
          headlineEn: `Outpost evacuated. Troops returned to reinforce sovereign border.`,
          sourceHe: 'פיקוד מרכז',
          sourceEn: 'Central Command',
          category: 'military',
          timestamp: new Date().toLocaleTimeString(state.locale === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        }),
      };
    }

    case 'SEAL_BREACH': {
      if (state.gameStatus !== 'playing') return state;
      const cpId = action.checkpointId;
      const cp = state.tiles[cpId];
      if (!cp || !cp.isBorderCheckpoint || cp.garrisonCount > 0) return state;

      const updatedTiles = { ...state.tiles };
      const guardedSettlements = Object.values(updatedTiles).filter(
        t => t.hasSettlement && t.garrisonCount > 0
      );

      // Priority 1: If troops are deployed at settlements, recall a soldier from the closest guarded settlement!
      if (guardedSettlements.length > 0) {
        const sortedGuarded = [...guardedSettlements].sort((a, b) => {
          const distA = Math.hypot(a.x - cp.x, a.y - cp.y);
          const distB = Math.hypot(b.x - cp.x, b.y - cp.y);
          return distA - distB;
        });
        const sourceSettlement = sortedGuarded[0];

        updatedTiles[sourceSettlement.id] = {
          ...sourceSettlement,
          garrisonCount: Math.max(0, sourceSettlement.garrisonCount - 1),
        };

        updatedTiles[cpId] = {
          ...cp,
          garrisonCount: 1,
          isBreached: false,
          hasAlert: false,
        };

        const newSettlementSoldiers = Math.max(0, state.soldiersAtSettlements - 1);
        const newBorderSoldiers = state.soldiersAtBorder + 1;
        const newDefenseScore = Math.min(100, Math.round((newBorderSoldiers / 8) * 100));

        const newMovingTroops = [
          ...(state.movingTroops || []),
          {
            id: `troop-seal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            fromX: sourceSettlement.x,
            fromY: sourceSettlement.y,
            toX: cp.x,
            toY: cp.y,
            createdAt: Date.now(),
          },
        ];

        const activeBreaches = Object.keys(updatedTiles).filter(
          id => updatedTiles[id].isBorderCheckpoint && updatedTiles[id].garrisonCount === 0
        );

        // Intercept any attack targeting through this checkpoint
        const remainingAttacks = (state.greenSideAttacks || []).filter(a => a.breachId !== cpId);
        const hadIntercepted = (state.greenSideAttacks || []).length > remainingAttacks.length;

        sounds.playShieldChime();

        const toastHe = hadIntercepted
          ? '🛡️ חדירה סוכלה בהצלחה! לוחם הוחזר ממאחז לבלימת הפרצה!'
          : '🛡️ הפרצה נבלמה! לוחם הוחזר ממאחז לאבטחת המוצב.';
        const toastEn = hadIntercepted
          ? '🛡️ Infiltration thwarted! Soldier recalled from outpost to seal breach!'
          : '🛡️ Breach sealed! Soldier recalled from outpost to secure post.';

        const headlineHe = `בלימת חירום: חייל הוחזר מ${sourceSettlement.settlementName || 'המאחז'} ואייש את מוצב הגבול שנפרץ.${hadIntercepted ? ' החדירה סוכלה בהצלחה!' : ''}`;
        const headlineEn = `Emergency containment: Soldier recalled from ${sourceSettlement.settlementName || 'outpost'} to seal the border breach.${hadIntercepted ? ' Infiltration thwarted!' : ''}`;

        return {
          ...state,
          soldiersAtBorder: newBorderSoldiers,
          soldiersAtSettlements: newSettlementSoldiers,
          defenseScore: newDefenseScore,
          landHp: Math.min(100, Number(((state.landHp ?? 100) + (hadIntercepted ? 5 : 2)).toFixed(1))),
          tiles: updatedTiles,
          activeBreaches,
          greenSideAttacks: remainingAttacks,
          interceptedToast: {
            id: `intercept-${Date.now()}`,
            textHe: toastHe,
            textEn: toastEn,
            timestamp: Date.now(),
          },
          movingTroops: newMovingTroops,
          selectedInfiltrationId: null,
          lordOfHosts: {
            ...state.lordOfHosts,
            isPanicMashMode: newDefenseScore === 0,
          },
          ...withNews(state, {
            id: `seal-${Date.now()}`,
            headline: state.locale === 'he' ? headlineHe : headlineEn,
            source: state.locale === 'he' ? 'חמ״ל גזרה' : 'Sector Operations',
            headlineHe,
            headlineEn,
            sourceHe: 'חמ״ל גזרה',
            sourceEn: 'Sector Operations',
            category: 'military',
            isUrgent: true,
            timestamp: new Date().toLocaleTimeString(state.locale === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          }),
        };
      }

      // Priority 2: If no troops in settlements, but reserves are available: deploy reserves directly to this breach!
      if (state.reservesBatchesLeft > 0) {
        const newBatchesLeft = state.reservesBatchesLeft - 1;
        const callsMade = 3 - newBatchesLeft;
        const addedSoldiers = 4;
        const newTotal = state.soldiersTotal + addedSoldiers;
        const newBorder = state.soldiersAtBorder + addedSoldiers;
        const newIncomeRate = Math.max(2, 4 - callsMade);

        sounds.playShieldChime();

        updatedTiles[cpId] = {
          ...cp,
          garrisonCount: 1,
          isBreached: false,
          hasAlert: false,
        };
        let remainingToPlace = addedSoldiers - 1;

        const otherBreaches = Object.keys(updatedTiles).filter(
          id => id !== cpId && updatedTiles[id].isBorderCheckpoint && updatedTiles[id].garrisonCount === 0
        );

        for (const bId of otherBreaches) {
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

        const remainingAttacks = (state.greenSideAttacks || []).filter(
          a => updatedTiles[a.breachId]?.garrisonCount === 0
        );
        const hadIntercepted = (state.greenSideAttacks || []).length > remainingAttacks.length;

        const newsHeadlineHe = `צו 8 חירום: כוחות מילואים הוזנקו וסתמו את הפרצה בגבול!${hadIntercepted ? ' החדירה נוטרלה!' : ''}`;
        const newsHeadlineEn = `Emergency Call-Up: Reserve forces sealed the border gap!${hadIntercepted ? ' Infiltration neutralized!' : ''}`;

        return {
          ...state,
          soldiersTotal: newTotal,
          soldiersAtBorder: newBorder,
          incomeRate: newIncomeRate,
          reservesBatchesLeft: newBatchesLeft,
          defenseScore: newDefenseScore,
          landHp: Math.min(100, Number(((state.landHp ?? 100) + (hadIntercepted ? 5 : 3)).toFixed(1))),
          tiles: updatedTiles,
          activeBreaches,
          greenSideAttacks: remainingAttacks,
          interceptedToast: {
            id: `intercept-${Date.now()}`,
            textHe: hadIntercepted ? '🛡️ מילואים הוזעקו וסיכלו את החדירה!' : '🛡️ כוחות מילואים איישו את הפרצה בגבול!',
            textEn: hadIntercepted ? '🛡️ Reserves deployed and thwarted infiltration!' : '🛡️ Reserve forces sealed the border breach!',
            timestamp: Date.now(),
          },
          selectedInfiltrationId: null,
          lordOfHosts: {
            ...state.lordOfHosts,
            isPanicMashMode: newDefenseScore === 0,
          },
          ...withNews(state, {
            id: `reserves-seal-${Date.now()}`,
            headline: state.locale === 'he' ? newsHeadlineHe : newsHeadlineEn,
            source: state.locale === 'he' ? 'אגף המבצעים' : 'Operations Directorate',
            headlineHe: newsHeadlineHe,
            headlineEn: newsHeadlineEn,
            sourceHe: 'אגף המבצעים',
            sourceEn: 'Operations Directorate',
            category: 'military',
            isUrgent: true,
            timestamp: new Date().toLocaleTimeString(state.locale === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          }),
        };
      }

      // Priority 3: Neither troops in settlements nor reserves
      sounds.playError();
      return {
        ...state,
        lordOfHosts: {
          ...state.lordOfHosts,
          piousToast: state.locale === 'he'
            ? 'אין חיילים זמינים! כל הלוחמים מרותקים למאחזים ואזלו המילואים!'
            : 'No troops available! Soldiers tied up in outposts and no reserves left!',
        },
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

      // Prioritize the breach checkpoint under active attack, or specified targetBorderId, or with alert!
      const activeAttackBreachId = (state.greenSideAttacks || []).map(a => a.breachId).find(bId => emptyBorderIds.includes(bId));
      const alertedBreachId = emptyBorderIds.find(id => updatedTiles[id]?.isBreached || updatedTiles[id]?.hasAlert);
      const chosenBorderId = (action.targetBorderId && emptyBorderIds.includes(action.targetBorderId))
        ? action.targetBorderId
        : (activeAttackBreachId || alertedBreachId || emptyBorderIds[0]);

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

      // Intercept any green side attacks whose breach checkpoint was just re-manned!
      const remainingGreenAttacks = (state.greenSideAttacks || []).filter(
        atk => atk.breachId !== chosenBorderId
      );
      const hadIntercepted = (state.greenSideAttacks || []).length > remainingGreenAttacks.length;

      if (hadIntercepted) {
        sounds.playShieldChime();
      } else {
        sounds.playDeploy();
      }

      const recallHeadlineHe = `כוח צה״ל נסוג מ${tile.settlementName || 'המאחז'} ושב לבצר את קו הגבול המערבי.${hadIntercepted ? ' חדירה סוכלה בהצלחה!' : ''}`;
      const recallHeadlineEn = `Troops recalled from ${tile.settlementName || 'outpost'} to secure the western border.${hadIntercepted ? ' Infiltration thwarted!' : ''}`;

      return {
        ...state,
        soldiersAtBorder: newBorderSoldiers,
        soldiersAtSettlements: newSettlementSoldiers,
        defenseScore: newDefenseScore,
        tiles: updatedTiles,
        activeBreaches,
        greenSideAttacks: remainingGreenAttacks,
        interceptedToast: hadIntercepted ? {
          id: `intercept-${Date.now()}`,
          textHe: '🛡️ חדירה סוכלה בהצלחה!',
          textEn: '🛡️ Infiltration Thwarted Successfully!',
          timestamp: Date.now(),
        } : state.interceptedToast,
        movingTroops: newMovingTroops,
        selectedSettlementId: null,
        selectedInfiltrationId: hadIntercepted ? null : state.selectedInfiltrationId,
        ...withNews(state, {
          id: `recall-${Date.now()}`,
          headline: state.locale === 'he' ? recallHeadlineHe : recallHeadlineEn,
          source: state.locale === 'he' ? 'פיקוד מרכז' : 'Central Command',
          headlineHe: recallHeadlineHe,
          headlineEn: recallHeadlineEn,
          sourceHe: 'פיקוד מרכז',
          sourceEn: 'Central Command',
          category: 'military',
          timestamp: new Date().toLocaleTimeString(state.locale === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
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

      // Intercept any green side attacks whose breach checkpoint was just re-manned!
      const remainingGreenAttacksAll = (state.greenSideAttacks || []).filter(
        atk => updatedTiles[atk.breachId]?.garrisonCount === 0
      );
      const hadInterceptedAll = (state.greenSideAttacks || []).length > remainingGreenAttacksAll.length;

      if (hadInterceptedAll) {
        sounds.playShieldChime();
      } else {
        sounds.playDeploy();
      }

      const recallAllHeadlineHe = `נסיגה טקטית מלאה! ${recalledCount} לוחמים פונו מהמאחזים וחזרו לאבטח את הגבול המערבי.${hadInterceptedAll ? ' חדירות נבלמו!' : ''}`;
      const recallAllHeadlineEn = `Full tactical pullback! ${recalledCount} soldiers recalled from outposts to secure the western border.${hadInterceptedAll ? ' Infiltrations thwarted!' : ''}`;

      return {
        ...state,
        soldiersAtBorder: newBorderSoldiers,
        soldiersAtSettlements: newSettlementSoldiers,
        defenseScore: newDefenseScore,
        tiles: updatedTiles,
        activeBreaches,
        greenSideAttacks: remainingGreenAttacksAll,
        interceptedToast: hadInterceptedAll ? {
          id: `intercept-${Date.now()}`,
          textHe: '🛡️ חדירות סוכלו בהצלחה!',
          textEn: '🛡️ Infiltrations Thwarted Successfully!',
          timestamp: Date.now(),
        } : state.interceptedToast,
        movingTroops: newMovingTroops,
        selectedSettlementId: null,
        ...withNews(state, {
          id: `recall-all-${Date.now()}`,
          headline: state.locale === 'he' ? recallAllHeadlineHe : recallAllHeadlineEn,
          source: state.locale === 'he' ? 'המטה הכללי' : 'General Staff',
          headlineHe: recallAllHeadlineHe,
          headlineEn: recallAllHeadlineEn,
          sourceHe: 'המטה הכללי',
          sourceEn: 'General Staff',
          category: 'military',
          timestamp: new Date().toLocaleTimeString(state.locale === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        }),
      };
    }

    case 'SELECT_INFILTRATION': {
      return {
        ...state,
        selectedInfiltrationId: action.id,
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
