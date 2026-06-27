import type { CatalogRacket } from "@/lib/catalog/catalog-db";

export const RATING_ROWS = [
  { key: "power", label: "Power" },
  { key: "control", label: "Control" },
  { key: "comfort", label: "Comfort" },
  { key: "maneuverability", label: "Maneuverability" },
  { key: "forgiveness", label: "Forgiveness" },
  { key: "spin", label: "Spin" }
] as const;

export type RatingKey = (typeof RATING_ROWS)[number]["key"];

export type RecommendationPreset = {
  slug: string;
  title: string;
  note: string;
  emphasis: Partial<Record<RatingKey, number>>;
  preferredSkill?: CatalogRacket["skillLevel"];
  preferredStyle?: CatalogRacket["playStyle"];
  preferredHardness?: CatalogRacket["hardness"];
  maxPrice?: number;
};

export const RECOMMENDATION_PRESETS: RecommendationPreset[] = [
  {
    slug: "beginner-step-up",
    title: "Beginner step-up",
    note: "Прощающие и управляемые модели без жёсткого pro-feel.",
    emphasis: {
      comfort: 1.25,
      forgiveness: 1.25,
      maneuverability: 1.1,
      control: 1.05
    },
    preferredSkill: "intermediate",
    preferredHardness: "soft",
    maxPrice: 310
  },
  {
    slug: "control-builder",
    title: "Control builder",
    note: "Для тех, кто строит розыгрыш через точность, защиту и sweet spot.",
    emphasis: {
      control: 1.35,
      forgiveness: 1.1,
      comfort: 1.05
    },
    preferredStyle: "control"
  },
  {
    slug: "power-finisher",
    title: "Power finisher",
    note: "Лучшие кандидаты под агрессивную игру и завершение сверху.",
    emphasis: {
      power: 1.4,
      spin: 1.1,
      control: 0.95
    },
    preferredStyle: "power"
  },
  {
    slug: "value-hunter",
    title: "Value hunter",
    note: "Модели с сильным общим профилем без ухода в верхний ценовой коридор.",
    emphasis: {
      comfort: 1.05,
      control: 1.05,
      maneuverability: 1.05
    },
    maxPrice: 300
  }
];

function clampScore(value: number) {
  return Math.max(68, Math.min(96, Math.round(value)));
}

export function scoreLabel(score: number) {
  if (score >= 92) return "Elite";
  if (score >= 88) return "Excellent";
  if (score >= 83) return "Very good";
  if (score >= 77) return "Good";
  return "Solid";
}

export function getMetricScore(racket: CatalogRacket, key: RatingKey) {
  const shape = racket.shape.toLowerCase();
  const playStyle = racket.playStyle.toLowerCase();
  const hardness = racket.hardness.toLowerCase();
  const balance = racket.balance.toLowerCase();
  const skill = racket.skillLevel.toLowerCase();
  const sweetSpot = racket.sweetSpot.toLowerCase();
  const weight = racket.weight;

  const shapeBoost =
    {
      diamond: 5,
      tear: 3,
      round: 1
    }[shape] ?? 0;

  const balanceBoost =
    {
      high: 4,
      medium: 2,
      low: 0
    }[balance] ?? 0;

  const comfortBase =
    78 +
    (hardness === "soft" ? 9 : hardness === "medium" ? 5 : 1) +
    (sweetSpot === "large" ? 5 : sweetSpot === "medium" ? 3 : 0) -
    (weight >= 368 ? 4 : weight >= 364 ? 2 : 0);

  const scores: Record<RatingKey, number> = {
    power:
      77 +
      (playStyle === "power" ? 10 : playStyle === "balanced" ? 6 : 2) +
      shapeBoost +
      balanceBoost +
      (hardness === "hard" ? 3 : hardness === "medium" ? 2 : 0),
    control:
      78 +
      (playStyle === "control" ? 11 : playStyle === "balanced" ? 7 : 3) +
      (shape === "round" ? 6 : shape === "tear" ? 3 : 0) +
      (balance === "low" ? 4 : balance === "medium" ? 2 : 0) +
      (sweetSpot === "large" ? 3 : 1),
    comfort: comfortBase,
    maneuverability:
      79 +
      (weight <= 356 ? 8 : weight <= 361 ? 5 : weight <= 365 ? 2 : -2) +
      (balance === "low" ? 6 : balance === "medium" ? 3 : 0) +
      (shape === "round" ? 3 : shape === "tear" ? 2 : 0),
    forgiveness:
      77 +
      (sweetSpot === "large" ? 8 : sweetSpot === "medium" ? 4 : 1) +
      (hardness === "soft" ? 6 : hardness === "medium" ? 3 : 0) +
      (skill === "intermediate" ? 4 : 1),
    spin:
      78 +
      (shape === "diamond" ? 6 : shape === "tear" ? 4 : 2) +
      (playStyle === "power" ? 5 : playStyle === "balanced" ? 3 : 2) +
      (hardness === "hard" ? 4 : hardness === "medium" ? 2 : 0)
  };

  return clampScore(scores[key]);
}

export function getRatings(racket: CatalogRacket) {
  return RATING_ROWS.map((row) => ({
    ...row,
    score: getMetricScore(racket, row.key)
  }));
}

export function getAverageScore(racket: CatalogRacket) {
  return Math.round(
    getRatings(racket).reduce((sum, item) => sum + item.score, 0) / RATING_ROWS.length
  );
}

function getPricePenalty(racket: CatalogRacket, maxPrice?: number) {
  if (!maxPrice) return 0;
  if (racket.currentPrice <= maxPrice) return 4;

  return -Math.min(10, Math.round((racket.currentPrice - maxPrice) / 18));
}

function getPreferenceBonus(racket: CatalogRacket, preset: RecommendationPreset) {
  let bonus = 0;

  if (preset.preferredSkill && racket.skillLevel === preset.preferredSkill) bonus += 4;
  if (preset.preferredStyle && racket.playStyle === preset.preferredStyle) bonus += 5;
  if (preset.preferredHardness && racket.hardness === preset.preferredHardness) bonus += 3;

  return bonus + getPricePenalty(racket, preset.maxPrice);
}

export function getPresetScore(racket: CatalogRacket, preset: RecommendationPreset) {
  const weighted = RATING_ROWS.reduce((sum, row) => {
    const weight = preset.emphasis[row.key] ?? 1;
    return sum + getMetricScore(racket, row.key) * weight;
  }, 0);

  const divisor = RATING_ROWS.reduce((sum, row) => sum + (preset.emphasis[row.key] ?? 1), 0);

  return Math.round(weighted / divisor + getPreferenceBonus(racket, preset));
}

export function getPresetRecommendations(
  rackets: CatalogRacket[],
  preset: RecommendationPreset,
  limit = 3
) {
  return [...rackets]
    .sort((left, right) => getPresetScore(right, preset) - getPresetScore(left, preset))
    .slice(0, limit);
}

export function getSimilarityScore(base: CatalogRacket, candidate: CatalogRacket) {
  let score = 0;

  if (base.id === candidate.id) return -1;
  if (base.shape === candidate.shape) score += 4;
  if (base.playStyle === candidate.playStyle) score += 4;
  if (base.skillLevel === candidate.skillLevel) score += 3;
  if (base.hardness === candidate.hardness) score += 2;
  if (base.balance === candidate.balance) score += 2;
  if (base.brand === candidate.brand) score += 1;

  score -= Math.min(4, Math.round(Math.abs(base.currentPrice - candidate.currentPrice) / 35));
  score -= Math.min(3, Math.round(Math.abs(base.weight - candidate.weight) / 4));

  return score;
}
