import type { MetalTier } from "./router";

export type AchievementSpec = {
  motif: string;
  numeral?: string;
  tier: MetalTier;
};

/** Concrete center subjects for PuffPal unlocks — titles are not motifs. */
export const PUFFPAL_SPECS: Record<string, AchievementSpec> = {
  streak_3_days: {
    motif: "a small flame",
    numeral: "3",
    tier: "bronze",
  },
  streak_7_days: {
    motif: "a small flame",
    numeral: "7",
    tier: "silver",
  },
  streak_14_days: {
    motif: "a small flame",
    numeral: "14",
    tier: "gold",
  },
  streak_30_days: {
    motif: "a laurel sprig",
    numeral: "30",
    tier: "gold",
  },
  streak_60_days: {
    motif: "a laurel sprig",
    numeral: "60",
    tier: "platinum",
  },
  streak_90_days: {
    motif: "a laurel wreath",
    numeral: "90",
    tier: "platinum",
  },
  streak_180_days: {
    motif: "a laurel wreath",
    numeral: "180",
    tier: "platinum",
  },
  streak_365_days: {
    motif: "a sun",
    numeral: "365",
    tier: "platinum",
  },
  tracking_first_log: {
    motif: "a checkmark over a small notepad",
    numeral: "1",
    tier: "bronze",
  },
  tracking_7_days: {
    motif: "a simple calendar page",
    numeral: "7",
    tier: "silver",
  },
  tracking_30_days: {
    motif: "a simple calendar page",
    numeral: "30",
    tier: "gold",
  },
  tracking_90_days: {
    motif: "a clipboard",
    numeral: "90",
    tier: "gold",
  },
  tracking_180_days: {
    motif: "a clipboard",
    numeral: "180",
    tier: "platinum",
  },
  tracking_365_days: {
    motif: "a clipboard",
    numeral: "365",
    tier: "platinum",
  },
  reduction_first_save: {
    motif: "a downward arrow over a small puff of smoke",
    tier: "bronze",
  },
  reduction_50_saved: {
    motif: "a downward arrow",
    numeral: "50",
    tier: "silver",
  },
  reduction_100_saved: {
    motif: "a downward arrow",
    numeral: "100",
    tier: "gold",
  },
  reduction_500_saved: {
    motif: "a downward arrow",
    numeral: "500",
    tier: "gold",
  },
  reduction_1000_saved: {
    motif: "a downward arrow",
    numeral: "1000",
    tier: "platinum",
  },
  reduction_half: {
    motif: "a circle split vertically, left half filled",
    tier: "gold",
  },
  reduction_zero_day: {
    motif: "a broken cigarette",
    numeral: "0",
    tier: "gold",
  },
  reduction_zero_3_days: {
    motif: "a broken cigarette",
    numeral: "3",
    tier: "gold",
  },
  reduction_zero_7_days: {
    motif: "a broken cigarette",
    numeral: "7",
    tier: "platinum",
  },
  pet_named: {
    motif: "a bone-shaped name tag on a collar",
    tier: "bronze",
  },
  pet_evolution_1: {
    motif: "a small hatchling dragon silhouette",
    numeral: "1",
    tier: "bronze",
  },
  pet_evolution_2: {
    motif: "a young dragon silhouette",
    numeral: "2",
    tier: "silver",
  },
  pet_evolution_3: {
    motif: "a grown dragon silhouette",
    numeral: "3",
    tier: "gold",
  },
  pet_evolution_4: {
    motif: "a large dragon silhouette with spread wings",
    numeral: "4",
    tier: "platinum",
  },
  pet_full_health: {
    motif: "a full heart",
    tier: "gold",
  },
  pet_full_health_7: {
    motif: "a full heart",
    numeral: "7",
    tier: "platinum",
  },
  journal_first: {
    motif: "an open book with a quill",
    tier: "bronze",
  },
  journal_7: {
    motif: "an open book with a quill",
    numeral: "7",
    tier: "silver",
  },
  journal_30: {
    motif: "an open book",
    numeral: "30",
    tier: "gold",
  },
  journal_streak_7: {
    motif: "an open book",
    numeral: "7",
    tier: "gold",
  },
  mission_first: {
    motif: "a small flag on a pole",
    tier: "bronze",
  },
  mission_all_day: {
    motif: "three small checkmarks in a row",
    numeral: "3",
    tier: "gold",
  },
  mission_sweep_7: {
    motif: "three small checkmarks",
    numeral: "7",
    tier: "platinum",
  },
  mission_puff_free: {
    motif: "an empty hourglass",
    tier: "gold",
  },
  mission_craving: {
    motif: "a chain link snapping in half",
    tier: "gold",
  },
  money_10: {
    motif: "a coin",
    numeral: "10",
    tier: "bronze",
  },
  money_50: {
    motif: "a coin",
    numeral: "50",
    tier: "silver",
  },
  money_100: {
    motif: "a coin stack",
    numeral: "100",
    tier: "gold",
  },
  money_500: {
    motif: "a coin stack",
    numeral: "500",
    tier: "gold",
  },
  money_1000: {
    motif: "a coin stack",
    numeral: "1000",
    tier: "platinum",
  },
  health_first: {
    motif: "a seedling sprout",
    tier: "bronze",
  },
  health_all: {
    motif: "a heart over a pair of lungs",
    numeral: "8",
    tier: "platinum",
  },
  awareness_triggers_3: {
    motif: "an exclamation mark in a diamond",
    numeral: "3",
    tier: "silver",
  },
  awareness_moods_3: {
    motif: "a simple round face",
    numeral: "3",
    tier: "silver",
  },
  awareness_locations_3: {
    motif: "a map pin",
    numeral: "3",
    tier: "silver",
  },
};

export const specForAchievement = (
  id: string,
  fallback: { title: string; description: string },
): AchievementSpec =>
  PUFFPAL_SPECS[id] ?? {
    motif: `a simple iconic silhouette for "${fallback.title}" (${fallback.description})`,
    tier: "gold",
  };
