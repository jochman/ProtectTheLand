/**
 * Safe mobile haptic feedback helper using the Web Vibration API.
 * Provides subtle tactile feedback on mobile devices.
 */
export const haptics = {
  /** Light click tick (10ms) for UI buttons */
  light: () => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Safe guard for restricted environments
      }
    }
  },

  /** Double-chime pulse for coin collection / municipal tax */
  coin: () => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 30, 15]);
      } catch {
        // Safe guard
      }
    }
  },

  /** Warning vibration for sirens / red infiltration alerts */
  warning: () => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 40, 30]);
      } catch {
        // Safe guard
      }
    }
  },

  /** Heavy impact vibration for attack strikes / collapse */
  impact: () => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([60, 50, 60]);
      } catch {
        // Safe guard
      }
    }
  },
};
