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
  citizens?: number; // Civilians still alive in the outpost
  maxCitizens?: number;
  damagedUntil?: number; // Timestamp until when post-impact smoke/aftermath is shown
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  headlineHe?: string;
  headlineEn?: string;
  sourceHe?: string;
  sourceEn?: string;
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

export interface FinancialGrant {
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

export interface InterceptionToast {
  id: string;
  textHe: string;
  textEn: string;
  timestamp: number;
}

export interface TacticalThreat {
  id: string;
  tileId: string;
  required: number;
  deadline: number; // Simulation seconds; resolves after arrivals on this tick.
}

export interface Reinforcement {
  id: string;
  threatId: string;
  fromX: number;
  fromY: number;
  departedAt: number;
  arrivesAt: number;
}

export interface GameState {
  threats: TacticalThreat[];
  reinforcements: Reinforcement[];
  nextThreatAt: number | null;
  threatSequence: number;
  selectedThreatId: string | null;
  threatFeedback: { textHe: string; textEn: string; until: number } | null;
  elapsedSeconds: number;
  /** Maximum concurrent outposts reached after completing the guided opening. */
  peakSettlementsCount: number;
  /** Consecutive tactical attacks repelled while maintaining the expanded defensive line. */
  defenseStreak: number;
  defenseResetReason: 'battle' | 'outposts' | 'border' | 'guard' | 'raid' | 'citizens' | null;
  seed: number;
  tutorialStep: 'build' | 'deploy' | 'observe' | 'done';
  isDeployMode: boolean;
  metrics: { exposureDamage: number; raidDamage: number; clashDamage: number; threatDamage: number; intercepted: number; miracleClicks: number; reserveCalls: number };
  timeline: { second: number; kind: 'build' | 'deploy' | 'reserve' | 'recall' | 'evacuate' | 'seal' | 'raid' | 'clash' | 'reinforce' | 'threat'; borderId?: string; gaps: number; citizens: number; deaths?: number; intercepted?: number }[];
  locale: 'he' | 'en';
  soundEnabled: boolean;
  gameStatus: 'playing' | 'catastrophe' | 'rational_victory';
  
  // Numerical stats & Resources
  budget: number; // Coalition funds / Resources (₪)
  maxBudget: number;
  incomeRate: number; // Current passive income per tick (slows down with reserves!)
  settlementsCount: number;
  soldiersTotal: number;
  soldiersAtBorder: number; // Includes the unassigned pool; readiness uses checkpoint garrisons only.
  soldiersAtSettlements: number;
  reservesBatchesLeft: number; // Max 3
  defenseScore: number; // 0% to 100% (Border readiness)
  citizens: number; // Israeli citizens still alive; defeat at zero
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
    chargePercent: number; // Internal horizontal fill, 12–96 while charging, 100 when ready
    stage: 1 | 2 | 3 | 4;
    stageGoalText: string;
    countdownSeconds: number | null; // e.g. 30 -> 0
    isPanicMashMode: boolean; // Ready at <=25 defense; stays ready once tapping starts
    mashCount: number; // How many times mashed
    graceSecondsRemaining: number; // One brief simulation pause beginning on the first tap
    isCracked: boolean; // Fractures on 5th mash
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
  latestGrant: FinancialGrant | null;
  greenSideAttacks: GreenSideAttack[];
  lastGreenAttackTick: number;
  selectedInfiltrationId: string | null;
  lastCoinTick?: number;
  interceptedToast: InterceptionToast | null;
  lastCityTaxTimestamps?: Record<string, number>;
  isIntroModalOpen: boolean;
  isPaused: boolean;
  infoPopover: { title: string; text: string } | null;
  isToolkitOpen: boolean;
  reduceMotion: boolean;
  actionHistory: { id: string; kind: 'build' | 'deploy' | 'reserve' | 'recall' | 'evacuate'; timestamp: number }[];
}

export type GameAction =
  | { type: 'SELECT_THREAT'; id: string | null }
  | { type: 'REINFORCE_THREAT'; threatId: string; sourceId?: string }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'SHOW_INFO_POPOVER'; title: string; text: string }
  | { type: 'CLEAR_INFO_POPOVER' }
  | { type: 'OPEN_INTRO_MODAL' }
  | { type: 'CLOSE_INTRO_MODAL' }
  | { type: 'BUILD_SETTLEMENT'; tileId?: string }
  | { type: 'TOGGLE_BUILD_MODE' }
  | { type: 'SELECT_TILE_TO_BUILD'; tileId: string }
  | { type: 'COLLECT_COIN'; id: string }
  | { type: 'COLLECT_CITY_TAX'; cityId: string }
  | { type: 'DEPLOY_TROOPS' }
  | { type: 'DEPLOY_TROOP'; settlementId: string; borderId?: string }
  | { type: 'CALL_RESERVES' }
  | { type: 'CLICK_LORD_OF_HOSTS' }
  | { type: 'MASH_LORD_OF_HOSTS' }
  | { type: 'SELECT_TILE'; tileId: string | null }
  | { type: 'SELECT_INFILTRATION'; id: string | null }
  | { type: 'EVACUATE_SETTLEMENT'; tileId: string }
  | { type: 'DISMISS_TOAST' }
  | { type: 'SET_LOCALE'; locale: 'he' | 'en' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_REDUCE_MOTION' }
  | { type: 'OPEN_TOOLKIT' }
  | { type: 'CLOSE_TOOLKIT' }
  | { type: 'RESTART_GAME' }
  | { type: 'TICK_TIMER' }
  | { type: 'CLEAR_SPARK'; id: string }
  | { type: 'CLEAR_MOVING_TROOP'; id: string }
  | { type: 'CLEAR_CLASH'; id: string }
  | { type: 'CLEAR_PENALTY' }
  | { type: 'CLEAR_GREEN_ATTACK'; id: string }
  | { type: 'CLEAR_INTERCEPTED_TOAST' }
  | { type: 'OPEN_NEWS_MODAL' }
  | { type: 'CLOSE_NEWS_MODAL' }
  | { type: 'CYCLE_NEXT_NEWS' }
  | { type: 'RECALL_TROOP'; tileId: string; targetBorderId?: string }
  | { type: 'RECALL_ALL_TROOPS' }
  | { type: 'SEAL_BREACH'; checkpointId: string };
