import { HexTile } from '../types';

const ENGLISH_NAMES: Record<string, string> = {
  'isr-2': 'Haifa / North', 'isr-4': 'Netanya / Sharon', 'isr-6': 'Tel Aviv',
  'isr-8': "Shfela / Modi'in", 'isr-10': 'Ashdod / Ashkelon', 'isr-11': 'Gaza envelope',
  'isr-12': 'Beer Sheva / Negev', 'wb-deadsea': 'Dead Sea',
  'wb-ariel': 'Ariel', 'wb-beitel': 'Beit El', 'wb-gush': 'Gush Etzion',
  'wb-dotan': 'Mevo Dotan', 'wb-yitzhar': 'Yitzhar', 'wb-kiryatarba': 'Kiryat Arba',
  'wb-elonmoreh': 'Elon Moreh', 'wb-itamar': 'Itamar', 'wb-eli': 'Eli / Shilo',
  'wb-ofra': 'Ofra', 'wb-tekoa': 'Tekoa', 'wb-susia': 'Susia', 'wb-mehola': 'Mehola',
  'wb-givatolam': 'Givat Olam', 'wb-jordanval': 'Jordan Valley', 'wb-adumim': 'Maale Adumim',
  'wb-havatmaon': 'Havat Maon',
};

export const tileName = (tile: HexTile, locale: 'he' | 'en') => locale === 'he'
  ? tile.label || tile.settlementName || tile.id
  : ENGLISH_NAMES[tile.id] || tile.subLabel || tile.id;

export const INITIAL_TILES: Record<string, HexTile> = {
  // ==========================================
  // 1. ISRAEL (COASTAL PLAIN & GREEN ZONE - WEST)
  // ==========================================
  'isr-1': { id: 'isr-1', coord: { q: 0, r: 0 }, x: 50, y: 65, terrain: 'sea', hasSettlement: false, garrisonCount: 0 },
  'isr-2': { id: 'isr-2', coord: { q: 1, r: 0 }, x: 115, y: 60, terrain: 'israel', label: 'חיפה והצפון', hasSettlement: false, garrisonCount: 0 },
  'isr-3': { id: 'isr-3', coord: { q: 0, r: 1 }, x: 45, y: 140, terrain: 'sea', hasSettlement: false, garrisonCount: 0 },
  'isr-4': { id: 'isr-4', coord: { q: 1, r: 1 }, x: 110, y: 135, terrain: 'israel', label: 'נתניה / השרון', hasSettlement: false, garrisonCount: 0 },
  'isr-5': { id: 'isr-5', coord: { q: 0, r: 2 }, x: 40, y: 215, terrain: 'sea', hasSettlement: false, garrisonCount: 0 },
  'isr-6': { id: 'isr-6', coord: { q: 1, r: 2 }, x: 105, y: 210, terrain: 'israel', label: 'תל אביב', hasSettlement: false, garrisonCount: 0 },
  'isr-7': { id: 'isr-7', coord: { q: 0, r: 3 }, x: 40, y: 290, terrain: 'sea', hasSettlement: false, garrisonCount: 0 },
  'isr-8': { id: 'isr-8', coord: { q: 1, r: 3 }, x: 100, y: 285, terrain: 'israel', label: 'השפלה / מודיעין', hasSettlement: false, garrisonCount: 0 },
  'isr-9': { id: 'isr-9', coord: { q: 0, r: 4 }, x: 35, y: 365, terrain: 'sea', hasSettlement: false, garrisonCount: 0 },
  'isr-10': { id: 'isr-10', coord: { q: 1, r: 4 }, x: 95, y: 360, terrain: 'israel', label: 'אשדוד / אשקלון', hasSettlement: false, garrisonCount: 0 },
  'isr-11': { id: 'isr-11', coord: { q: 0, r: 5 }, x: 35, y: 440, terrain: 'israel', label: 'עוטף עזה', hasSettlement: false, garrisonCount: 0 },
  'isr-12': { id: 'isr-12', coord: { q: 1, r: 5 }, x: 95, y: 435, terrain: 'israel', label: 'באר שבע והנגב', hasSettlement: false, garrisonCount: 0 },

  // ==========================================
  // 2. GREEN LINE BORDER CHECKPOINTS (PERIMETER)
  // ==========================================
  'bdr-1': { id: 'bdr-1', coord: { q: 2, r: 0 }, x: 175, y: 60, terrain: 'border', isBorderCheckpoint: true, hasSettlement: false, garrisonCount: 1 },
  'bdr-2': { id: 'bdr-2', coord: { q: 2, r: 1 }, x: 170, y: 130, terrain: 'border', isBorderCheckpoint: true, hasSettlement: false, garrisonCount: 1 },
  'bdr-3': { id: 'bdr-3', coord: { q: 2, r: 2 }, x: 165, y: 205, terrain: 'border', isBorderCheckpoint: true, hasSettlement: false, garrisonCount: 1 },
  'bdr-4': { id: 'bdr-4', coord: { q: 2, r: 3 }, x: 160, y: 280, terrain: 'border', isBorderCheckpoint: true, hasSettlement: false, garrisonCount: 1 },
  'bdr-5': { id: 'bdr-5', coord: { q: 2, r: 4 }, x: 155, y: 355, terrain: 'border', isBorderCheckpoint: true, hasSettlement: false, garrisonCount: 1 },
  'bdr-6': { id: 'bdr-6', coord: { q: 2, r: 5 }, x: 155, y: 430, terrain: 'border', isBorderCheckpoint: true, hasSettlement: false, garrisonCount: 1 },
  'bdr-7': { id: 'bdr-7', coord: { q: 1, r: 6 }, x: 110, y: 485, terrain: 'border', isBorderCheckpoint: true, hasSettlement: false, garrisonCount: 1 },
  'bdr-8': { id: 'bdr-8', coord: { q: 2, r: 6 }, x: 170, y: 490, terrain: 'border', isBorderCheckpoint: true, hasSettlement: false, garrisonCount: 1 },

  // ==========================================
  // 3. WEST BANK - COLUMN 3 (WESTERN SAMARIA & JUDEA)
  // ==========================================
  'wb-tulkarm': { id: 'wb-tulkarm', coord: { q: 3, r: 0 }, x: 235, y: 65, terrain: 'westbank', isLocalCity: true, label: 'טולכרם', subLabel: 'Tulkarm', hasSettlement: false, garrisonCount: 0 },
  'wb-qalqilya': { id: 'wb-qalqilya', coord: { q: 3, r: 1 }, x: 230, y: 135, terrain: 'westbank', isLocalCity: true, label: 'קלקיליה', subLabel: 'Qalqilya', hasSettlement: false, garrisonCount: 0 },
  'wb-ariel': { id: 'wb-ariel', coord: { q: 3, r: 2 }, x: 225, y: 210, terrain: 'westbank', settlementName: 'אריאל', hasSettlement: false, garrisonCount: 0 },
  'wb-salfit': { id: 'wb-salfit', coord: { q: 3, r: 3 }, x: 220, y: 285, terrain: 'westbank', isLocalCity: true, label: 'סלפית', subLabel: 'Salfit', hasSettlement: false, garrisonCount: 0 },
  'wb-beitel': { id: 'wb-beitel', coord: { q: 3, r: 4 }, x: 220, y: 355, terrain: 'westbank', settlementName: 'בית אל', hasSettlement: false, garrisonCount: 0 },
  'wb-gush': { id: 'wb-gush', coord: { q: 3, r: 5 }, x: 220, y: 430, terrain: 'westbank', settlementName: 'גוש עציון', hasSettlement: false, garrisonCount: 0 },
  'wb-hebron': { id: 'wb-hebron', coord: { q: 3, r: 6 }, x: 225, y: 500, terrain: 'westbank', isLocalCity: true, label: 'חברון', subLabel: 'Hebron', hasSettlement: false, garrisonCount: 0 },

  // ==========================================
  // 4. WEST BANK - COLUMN 4 (CENTRAL SPINE / SAMARIA & JUDEAN HILLS)
  // ==========================================
  'wb-jenin': { id: 'wb-jenin', coord: { q: 4, r: 0 }, x: 295, y: 65, terrain: 'westbank', isLocalCity: true, label: 'ג\'נין', subLabel: 'Jenin', hasSettlement: false, garrisonCount: 0 },
  'wb-dotan': { id: 'wb-dotan', coord: { q: 4, r: 1 }, x: 290, y: 135, terrain: 'westbank', settlementName: 'מבוא דותן', hasSettlement: false, garrisonCount: 0 },
  'wb-nablus': { id: 'wb-nablus', coord: { q: 4, r: 2 }, x: 285, y: 210, terrain: 'westbank', isLocalCity: true, label: 'שכם', subLabel: 'Nablus', hasSettlement: false, garrisonCount: 0 },
  'wb-yitzhar': { id: 'wb-yitzhar', coord: { q: 4, r: 3 }, x: 280, y: 285, terrain: 'westbank', settlementName: 'יצהר', hasSettlement: false, garrisonCount: 0 },
  'wb-ramallah': { id: 'wb-ramallah', coord: { q: 4, r: 4 }, x: 280, y: 355, terrain: 'westbank', isLocalCity: true, label: 'רמאללה', subLabel: 'Ramallah', hasSettlement: false, garrisonCount: 0 },
  'wb-bethlehem': { id: 'wb-bethlehem', coord: { q: 4, r: 5 }, x: 280, y: 430, terrain: 'westbank', isLocalCity: true, label: 'בית לחם', subLabel: 'Bethlehem', hasSettlement: false, garrisonCount: 0 },
  'wb-kiryatarba': { id: 'wb-kiryatarba', coord: { q: 4, r: 6 }, x: 285, y: 500, terrain: 'westbank', settlementName: 'קריית ארבע', hasSettlement: false, garrisonCount: 0 },

  // ==========================================
  // 5. WEST BANK - COLUMN 5 (EASTERN HILLTOPS & JUDEAN DESERT)
  // ==========================================
  'wb-tubas': { id: 'wb-tubas', coord: { q: 5, r: 0 }, x: 355, y: 65, terrain: 'westbank', isLocalCity: true, label: 'טובאס', subLabel: 'Tubas', hasSettlement: false, garrisonCount: 0 },
  'wb-elonmoreh': { id: 'wb-elonmoreh', coord: { q: 5, r: 1 }, x: 350, y: 135, terrain: 'westbank', settlementName: 'אלון מורה', hasSettlement: false, garrisonCount: 0 },
  'wb-itamar': { id: 'wb-itamar', coord: { q: 5, r: 2 }, x: 345, y: 210, terrain: 'westbank', settlementName: 'איתמר', hasSettlement: false, garrisonCount: 0 },
  'wb-eli': { id: 'wb-eli', coord: { q: 5, r: 3 }, x: 340, y: 285, terrain: 'westbank', settlementName: 'עלי / שילה', hasSettlement: false, garrisonCount: 0 },
  'wb-ofra': { id: 'wb-ofra', coord: { q: 5, r: 4 }, x: 340, y: 355, terrain: 'westbank', settlementName: 'עפרה', hasSettlement: false, garrisonCount: 0 },
  'wb-tekoa': { id: 'wb-tekoa', coord: { q: 5, r: 5 }, x: 340, y: 430, terrain: 'westbank', settlementName: 'תקוע', hasSettlement: false, garrisonCount: 0 },
  'wb-susia': { id: 'wb-susia', coord: { q: 5, r: 6 }, x: 345, y: 500, terrain: 'westbank', settlementName: 'סוסיא', hasSettlement: false, garrisonCount: 0 },

  // ==========================================
  // 6. WEST BANK - COLUMN 6 (JORDAN VALLEY & DEAD SEA - EAST)
  // ==========================================
  'wb-mehola': { id: 'wb-mehola', coord: { q: 6, r: 0 }, x: 415, y: 65, terrain: 'westbank', settlementName: 'מחולה', hasSettlement: false, garrisonCount: 0 },
  'wb-givatolam': { id: 'wb-givatolam', coord: { q: 6, r: 1 }, x: 410, y: 135, terrain: 'westbank', settlementName: 'מאחז גבעת עולם', hasSettlement: false, garrisonCount: 0 },
  'wb-jordanval': { id: 'wb-jordanval', coord: { q: 6, r: 2 }, x: 405, y: 210, terrain: 'westbank', settlementName: 'בקעת הירדן', hasSettlement: false, garrisonCount: 0 },
  'wb-jericho': { id: 'wb-jericho', coord: { q: 6, r: 3 }, x: 400, y: 285, terrain: 'westbank', isLocalCity: true, label: 'יריחו', subLabel: 'Jericho', hasSettlement: false, garrisonCount: 0 },
  'wb-adumim': { id: 'wb-adumim', coord: { q: 6, r: 4 }, x: 400, y: 355, terrain: 'westbank', settlementName: 'מעלה אדומים', hasSettlement: false, garrisonCount: 0 },
  'wb-deadsea': { id: 'wb-deadsea', coord: { q: 6, r: 5 }, x: 400, y: 430, terrain: 'desert', label: 'ים המלח', hasSettlement: false, garrisonCount: 0 },
  'wb-havatmaon': { id: 'wb-havatmaon', coord: { q: 6, r: 6 }, x: 405, y: 500, terrain: 'westbank', settlementName: 'חוות מעון', hasSettlement: false, garrisonCount: 0 },
};

// Settlement candidate queue for build order
export const SETTLEMENT_CANDIDATE_IDS = [
  'wb-ariel',      // אריאל
  'wb-beitel',     // בית אל
  'wb-yitzhar',    // יצהר
  'wb-gush',       // גוש עציון
  'wb-ofra',       // עפרה
  'wb-itamar',     // איתמר
  'wb-eli',        // עלי / שילה
  'wb-kiryatarba', // קריית ארבע
  'wb-elonmoreh',  // אלון מורה
  'wb-dotan',      // מבוא דותן
  'wb-tekoa',      // תקוע
  'wb-susia',      // סוסיא
  'wb-adumim',     // מעלה אדומים
  'wb-mehola',     // מחולה
  'wb-givatolam',  // מאחז גבעת עולם
  'wb-havatmaon',  // חוות מעון
  'wb-jordanval',  // בקעת הירדן
];
