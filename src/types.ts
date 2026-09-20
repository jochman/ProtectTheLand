export type TerrainType = 'israel' | 'westbank' | 'border' | 'sea' | 'desert';

export interface HexCoord {
  q: number;
  r: number;
}

export interface HexTile {
  id: string;
  coord: HexCoord;
  x: number;
  y: number;
  terrain: TerrainType;
  label?: string;
  hasSettlement: boolean;
  settlementName?: string;
  garrisonCount: number; // Soldiers stationed here
  isBorderCheckpoint?: boolean;
  isLocalCity?: boolean;
  subLabel?: string;
  isBreached?: boolean;
  hasAlert?: boolean;
  hp?: number; // Settlement health 0..100
  maxHp?: number;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  category?: 'politics' | 'celebs' | 'military' | 'rabbis';
  arcId?: string;
  arcStep?: number;
  totalArcSteps?: number;
  timestamp?: string;
  isUrgent?: boolean;
}

export interface SparkParticle {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  createdAt: number;
}

export interface MovingTroop {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  createdAt: number;
}

export interface ClashEvent {
  id: string;
  settlementId: string;
  arabCityId: string;
  settlerInitiated: boolean; // true = settlers raid village/orchard, false = village youth clash at settlement
  settlementName: string;
  arabCityName: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  midX: number;
  midY: number;
  createdAt: number;
  durationMs: number;
  title: string;
  isGarrisoned: boolean;
}

export interface FinancialPenalty {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
}

export interface GreenSideAttack {
  id: string;
  breachId: string;
  targetCityId: string;
  targetCityName: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number; // 0..1
  createdAt: number;
  durationMs: number;
}

export interface GameState {
  locale: 'he' | 'en';
  soundEnabled: boolean;
  gameStatus: 'playing' | 'catastrophe' | 'rational_victory';
  
  // Numerical stats & Resources
  budget: number; // Coalition funds / Resources (₪)
  maxBudget: number;
  incomeRate: number; // Current passive income per tick (slows down with reserves!)
  settlementsCount: number;
  soldiersTotal: number;
  soldiersAtBorder: number;
  soldiersAtSettlements: number;
  reservesBatchesLeft: number; // Max 3
  defenseScore: number; // 0% to 100%
  isBuildMode: boolean; // True when player tapped "Build" and is selecting a hex
  
  // Active constructions in progress (tileId -> progress 0..100)
  constructions: Record<string, { progress: number; tileName: string }>;

  // Collectible budget coins spawning on Israel cities
  collectibleCoins: {
    id: string;
    x: number;
    y: number;
    amount: number;
    createdAt: number;
  }[];

  // The Satirical "יהוה צבאות" Deception Engine
  lordOfHosts: {
    chargePercent: number; // 12% -> 99.0% -> 99.9%
    stage: 1 | 2 | 3 | 4;
    stageGoalText: string;
    countdownSeconds: number | null; // e.g. 30 -> 0
    isPanicMashMode: boolean; // Triggered when defense collapses to 0
    mashCount: number; // How many times mashed
    isCracked: boolean; // Fractures on 7th mash
    piousToast: string | null;
  };

  // World & Grid
  tiles: Record<string, HexTile>;
  activeBreaches: string[];
  infiltratingTrucks: {
    id: string;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    progress: number;
  }[];

  // News ticker & messaging
  currentNews: NewsItem | null;
  newsHistory: NewsItem[];
  isNewsModalOpen: boolean;
  activeStoryArcs: Record<string, number>;
  lastNewsTick: number;
  selectedSettlementId: string | null;
  isScreenShaking: boolean;
  sparks: SparkParticle[];
  movingTroops: MovingTroop[];
  clashes: ClashEvent[];
  lastClashTick: number;
  latestPenalty: FinancialPenalty | null;
  lastPenaltyTick: number;
  greenSideAttacks: GreenSideAttack[];
  lastGreenAttackTick: number;
}

export type GameAction =
  | { type: 'BUILD_SETTLEMENT'; tileId?: string }
  | { type: 'TOGGLE_BUILD_MODE' }
  | { type: 'SELECT_TILE_TO_BUILD'; tileId: string }
  | { type: 'COLLECT_COIN'; id: string }
  | { type: 'DEPLOY_TROOPS' }
  | { type: 'CALL_RESERVES' }
  | { type: 'CLICK_LORD_OF_HOSTS' }
  | { type: 'MASH_LORD_OF_HOSTS' }
  | { type: 'SELECT_TILE'; tileId: string | null }
  | { type: 'EVACUATE_SETTLEMENT'; tileId: string }
  | { type: 'DISMISS_TOAST' }
  | { type: 'SET_LOCALE'; locale: 'he' | 'en' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'RESTART_GAME' }
  | { type: 'TICK_TIMER' }
  | { type: 'CLEAR_SPARK'; id: string }
  | { type: 'CLEAR_MOVING_TROOP'; id: string }
  | { type: 'CLEAR_CLASH'; id: string }
  | { type: 'CLEAR_PENALTY' }
  | { type: 'CLEAR_GREEN_ATTACK'; id: string }
  | { type: 'OPEN_NEWS_MODAL' }
  | { type: 'CLOSE_NEWS_MODAL' }
  | { type: 'CYCLE_NEXT_NEWS' }
  | { type: 'RECALL_TROOP'; tileId: string }
  | { type: 'RECALL_ALL_TROOPS' };
