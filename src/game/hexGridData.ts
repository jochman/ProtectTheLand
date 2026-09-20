import { HexTile } from '../types';

export const INITIAL_TILES: Record<string, HexTile> = {
  // --- ISRAEL (GREEN ZONE - WEST) ---
  'isr-1': { id: 'isr-1', coord: { q: 0, r: 0 }, x: 60, y: 70, terrain: 'sea', label: 'הים התיכון', hasSettlement: false, garrisonCount: 0 },
  'isr-2': { id: 'isr-2', coord: { q: 1, r: 0 }, x: 130, y: 65, terrain: 'israel', label: 'חיפה והצפון', hasSettlement: false, garrisonCount: 0 },
  'isr-3': { id: 'isr-3', coord: { q: 0, r: 1 }, x: 55, y: 145, terrain: 'sea', hasSettlement: false, garrisonCount: 0 },
  'isr-4': { id: 'isr-4', coord: { q: 1, r: 1 }, x: 120, y: 140, terrain: 'israel', label: 'נתניה', hasSettlement: false, garrisonCount: 0 },
  'isr-5': { id: 'isr-5', coord: { q: 0, r: 2 }, x: 50, y: 220, terrain: 'sea', hasSettlement: false, garrisonCount: 0 },
  'isr-6': { id: 'isr-6', coord: { q: 1, r: 2 }, x: 110, y: 215, terrain: 'israel', label: 'תל אביב', hasSettlement: false, garrisonCount: 0 },
  'isr-7': { id: 'isr-7', coord: { q: 0, r: 3 }, x: 45, y: 295, terrain: 'sea', hasSettlement: false, garrisonCount: 0 },
  'isr-8': { id: 'isr-8', coord: { q: 1, r: 3 }, x: 105, y: 290, terrain: 'israel', label: 'השפלה', hasSettlement: false, garrisonCount: 0 },
  'isr-9': { id: 'isr-9', coord: { q: 0, r: 4 }, x: 40, y: 370, terrain: 'sea', hasSettlement: false, garrisonCount: 0 },
  'isr-10': { id: 'isr-10', coord: { q: 1, r: 4 }, x: 95, y: 365, terrain: 'israel', label: 'אשדוד / אשקלון', hasSettlement: false, garrisonCount: 0 },
  'isr-11': { id: 'isr-11', coord: { q: 0, r: 5 }, x: 40, y: 445, terrain: 'israel', label: 'עוטף עזה', hasSettlement: false, garrisonCount: 0 },
  'isr-12': { id: 'isr-12', coord: { q: 1, r: 5 }, x: 95, y: 440, terrain: 'israel', label: 'באר שבע והנגב', hasSettlement: false, garrisonCount: 0 },

  // --- BORDER CHECKPOINTS (ALONG THE GREEN LINE) ---
  'bdr-1': { id: 'bdr-1', coord: { q: 2, r: 0 }, x: 195, y: 65, terrain: 'border', isBorderCheckpoint: true, hasSettlement: false, garrisonCount: 1 },
  'bdr-2': { id: 'bdr-2', coord: { q: 2, r: 1 }, x: 185, y: 135, terrain: 'border', isBorderCheckpoint: true, hasSettlement: false, garrisonCount: 1 },
  'bdr-3': { id: 'bdr-3', coord: { q: 2, r: 2 }, x: 175, y: 210, terrain: 'border', isBorderCheckpoint: true, hasSettlement: false, garrisonCount: 1 },
  'bdr-4': { id: 'bdr-4', coord: { q: 2, r: 3 }, x: 165, y: 285, terrain: 'border', isBorderCheckpoint: true, hasSettlement: false, garrisonCount: 1 },
  'bdr-5': { id: 'bdr-5', coord: { q: 2, r: 4 }, x: 160, y: 360, terrain: 'border', isBorderCheckpoint: true, hasSettlement: false, garrisonCount: 1 },
  'bdr-6': { id: 'bdr-6', coord: { q: 2, r: 5 }, x: 160, y: 435, terrain: 'border', isBorderCheckpoint: true, hasSettlement: false, garrisonCount: 1 },
  'bdr-7': { id: 'bdr-7', coord: { q: 1, r: 6 }, x: 120, y: 485, terrain: 'border', isBorderCheckpoint: true, hasSettlement: false, garrisonCount: 1 },
  'bdr-8': { id: 'bdr-8', coord: { q: 2, r: 6 }, x: 180, y: 490, terrain: 'border', isBorderCheckpoint: true, hasSettlement: false, garrisonCount: 1 },

  // --- WEST BANK (YELLOW/OCHRE ZONE - EAST) ---
  'wb-1': { id: 'wb-1', coord: { q: 3, r: 0 }, x: 260, y: 70, terrain: 'westbank', settlementName: 'דותן', hasSettlement: false, garrisonCount: 0 },
  'wb-2': { id: 'wb-2', coord: { q: 4, r: 0 }, x: 330, y: 75, terrain: 'westbank', settlementName: 'מחולה', hasSettlement: false, garrisonCount: 0 },
  'wb-3': { id: 'wb-3', coord: { q: 3, r: 1 }, x: 250, y: 145, terrain: 'westbank', settlementName: 'שבי שומרון', hasSettlement: false, garrisonCount: 0 },
  'wb-4': { id: 'wb-4', coord: { q: 4, r: 1 }, x: 320, y: 150, terrain: 'westbank', settlementName: 'אלון מורה', hasSettlement: false, garrisonCount: 0 },
  'wb-5': { id: 'wb-5', coord: { q: 3, r: 2 }, x: 240, y: 220, terrain: 'westbank', settlementName: 'אריאל', hasSettlement: false, garrisonCount: 0 },
  'wb-6': { id: 'wb-6', coord: { q: 4, r: 2 }, x: 310, y: 225, terrain: 'westbank', settlementName: 'עלי', hasSettlement: false, garrisonCount: 0 },
  'wb-7': { id: 'wb-7', coord: { q: 3, r: 3 }, x: 230, y: 295, terrain: 'westbank', settlementName: 'בית אל', hasSettlement: false, garrisonCount: 0 },
  'wb-8': { id: 'wb-8', coord: { q: 4, r: 3 }, x: 300, y: 300, terrain: 'westbank', settlementName: 'עפרה', hasSettlement: false, garrisonCount: 0 },
  'wb-9': { id: 'wb-9', coord: { q: 3, r: 4 }, x: 235, y: 370, terrain: 'westbank', settlementName: 'גוש עציון', hasSettlement: false, garrisonCount: 0 },
  'wb-10': { id: 'wb-10', coord: { q: 4, r: 4 }, x: 305, y: 375, terrain: 'westbank', settlementName: 'תקוע', hasSettlement: false, garrisonCount: 0 },
  'wb-11': { id: 'wb-11', coord: { q: 3, r: 5 }, x: 240, y: 440, terrain: 'westbank', settlementName: 'קריית ארבע', hasSettlement: false, garrisonCount: 0 },
  'wb-12': { id: 'wb-12', coord: { q: 4, r: 5 }, x: 310, y: 445, terrain: 'desert', label: 'ים המלח', hasSettlement: false, garrisonCount: 0 },
  'wb-13': { id: 'wb-13', coord: { q: 3, r: 6 }, x: 250, y: 505, terrain: 'westbank', settlementName: 'עתניאל', hasSettlement: false, garrisonCount: 0 },
  'wb-14': { id: 'wb-14', coord: { q: 4, r: 6 }, x: 320, y: 510, terrain: 'westbank', settlementName: 'סוסיא', hasSettlement: false, garrisonCount: 0 },
  'wb-15': { id: 'wb-15', coord: { q: 5, r: 2 }, x: 370, y: 230, terrain: 'westbank', settlementName: 'מאחז גבעת עולם', hasSettlement: false, garrisonCount: 0 },
  'wb-16': { id: 'wb-16', coord: { q: 5, r: 3 }, x: 365, y: 305, terrain: 'westbank', settlementName: 'מאחז מעלה אהוביה', hasSettlement: false, garrisonCount: 0 },
};

// Settlement candidate queue
export const SETTLEMENT_CANDIDATE_IDS = [
  'wb-5', // אריאל
  'wb-7', // בית אל
  'wb-3', // שבי שומרון
  'wb-9', // גוש עציון
  'wb-6', // עלי
  'wb-11', // קריית ארבע
  'wb-8', // עפרה
  'wb-4', // אלון מורה
  'wb-1', // דותן
  'wb-10', // תקוע
  'wb-13', // עתניאל
  'wb-2', // מחולה
  'wb-14', // סוסיא
  'wb-15', // מאחז גבעת עולם
  'wb-16', // מאחז מעלה אהוביה
];
