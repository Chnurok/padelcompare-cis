import type { CatalogRacket } from "@/lib/catalog/catalog-db";

export const RATING_ROWS = [
  { key: "power", label: "Мощность" },
  { key: "control", label: "Контроль" },
  { key: "comfort", label: "Комфорт" },
  { key: "maneuverability", label: "Манёвренность" },
  { key: "forgiveness", label: "Прощение ошибок" },
  { key: "spin", label: "Вращение" }
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

export type QuizProfile = {
  budget: "under_280" | "under_330" | "premium";
  priority: "control" | "power" | "comfort" | "balanced";
  level: "beginner" | "intermediate" | "advanced";
  feel: "soft" | "medium" | "hard";
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
  if (score >= 92) return "Топовый";
  if (score >= 88) return "Отличный";
  if (score >= 83) return "Очень хороший";
  if (score >= 77) return "Хороший";
  return "Надёжный";
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

export function getValueScore(racket: CatalogRacket) {
  return Math.round(getAverageScore(racket) + Math.max(0, 340 - racket.currentPrice) / 18);
}

export function getTopMetric(racket: CatalogRacket) {
  return getRatings(racket).sort((left, right) => right.score - left.score)[0];
}

export function getPlayerFitLabel(racket: CatalogRacket) {
  if (racket.playStyle === "power" || racket.balance === "high") {
    return "Для игрока, который хочет давить первым ударом и мощно завершать розыгрыш.";
  }

  if (racket.playStyle === "control" || racket.shape === "round") {
    return "Для игрока, который строит розыгрыш через стабильность, защиту и точность.";
  }

  if (racket.hardness === "soft" || racket.sweetSpot === "large") {
    return "Для игрока, которому нужен более дружелюбный контакт и запас по комфорту.";
  }

  return "Для универсального игрока, которому нужен баланс между обороной, переходом и атакой.";
}

export function getTradeoffNote(racket: CatalogRacket) {
  if (racket.hardness === "hard" && racket.weight >= 365) {
    return "Компромисс: плотный контакт и меньше бесплатного комфорта в медленной защите.";
  }

  if (racket.playStyle === "power" && racket.shape === "diamond") {
    return "Компромисс: в защите и на медленных мячах требовательнее круглых контрольных моделей.";
  }

  if (racket.playStyle === "control" || racket.shape === "round") {
    return "Компромисс: меньше лёгкой мощности в завершающих ударах, чем у атакующих альтернатив.";
  }

  if (racket.hardness === "soft") {
    return "Компромисс: контакт комфортный, но при максимальном ускорении меньше плотности и стабильности.";
  }

  return "Компромисс: универсальность хорошая, но по отдельным качествам есть более специализированные модели.";
}

export function getCompareEdgeHighlights(racket: CatalogRacket, peers: CatalogRacket[]) {
  const others = peers.filter((item) => item.id !== racket.id);
  if (others.length === 0) return [];

  const averageOtherMetric = (key: RatingKey) =>
    Math.round(others.reduce((sum, item) => sum + getMetricScore(item, key), 0) / others.length);

  const edges = RATING_ROWS.map((row) => ({
    key: row.key,
    label: row.label,
    delta: getMetricScore(racket, row.key) - averageOtherMetric(row.key),
    score: getMetricScore(racket, row.key)
  }))
    .sort((left, right) => right.delta - left.delta)
    .filter((item) => item.delta > 0)
    .slice(0, 2)
    .map((item) => `${item.label} ${item.score} (+${item.delta} к среднему в сравнении)`);

  if (racket.currentPrice === Math.min(...peers.map((item) => item.currentPrice))) {
    edges.push(`Лучшая цена в подборке · EUR ${racket.currentPrice}`);
  }

  return edges.slice(0, 3);
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

export function getQuizRecommendationScore(racket: CatalogRacket, profile: QuizProfile) {
  let score = getAverageScore(racket);

  if (profile.level === "beginner") {
    score += racket.skillLevel === "intermediate" ? 6 : -8;
    score +=
      (getMetricScore(racket, "forgiveness") +
        getMetricScore(racket, "comfort") +
        getMetricScore(racket, "maneuverability")) *
      0.05;
  } else if (profile.level === racket.skillLevel) {
    score += 6;
  }
  if (profile.feel === racket.hardness) score += 5;

  if (profile.priority === "control") score += getMetricScore(racket, "control") * 0.18;
  if (profile.priority === "power") score += getMetricScore(racket, "power") * 0.18;
  if (profile.priority === "comfort") score += getMetricScore(racket, "comfort") * 0.18;
  if (profile.priority === "balanced") {
    score +=
      (getMetricScore(racket, "control") +
        getMetricScore(racket, "power") +
        getMetricScore(racket, "comfort")) *
      0.06;
  }

  if (profile.budget === "under_280") {
    score += racket.currentPrice <= 280 ? 8 : -Math.min(12, Math.round((racket.currentPrice - 280) / 12));
  }

  if (profile.budget === "under_330") {
    score += racket.currentPrice <= 330 ? 5 : -Math.min(8, Math.round((racket.currentPrice - 330) / 15));
  }

  if (profile.budget === "premium") {
    score += racket.currentPrice >= 300 ? 4 : 0;
  }

  return Math.round(score);
}

export function getQuizRecommendations(
  rackets: CatalogRacket[],
  profile: QuizProfile,
  limit = 3
) {
  return [...rackets]
    .sort((left, right) => getQuizRecommendationScore(right, profile) - getQuizRecommendationScore(left, profile))
    .slice(0, limit);
}

export function getQuizRecommendationReason(racket: CatalogRacket, profile: QuizProfile) {
  const reasons: string[] = [];

  if (profile.priority === "control" && (racket.playStyle === "control" || racket.shape === "round")) {
    reasons.push("акцент на контроль");
  }

  if (profile.priority === "power" && (racket.playStyle === "power" || racket.balance === "high")) {
    reasons.push("для атакующей игры");
  }

  if (profile.priority === "comfort" && (racket.hardness === "soft" || racket.sweetSpot === "large")) {
    reasons.push("более комфортный контакт");
  }

  if (profile.priority === "balanced" && racket.playStyle === "balanced") {
    reasons.push("сбалансированный профиль");
  }

  if (profile.level === "beginner" && racket.skillLevel === "intermediate") {
    reasons.push("подходит для первого шага");
  } else if (profile.level === racket.skillLevel) {
    reasons.push(profile.level === "advanced" ? "для продвинутого уровня" : "для среднего уровня");
  }

  if (profile.feel === racket.hardness) {
    reasons.push(
      {
        soft: "мягкое ощущение",
        medium: "среднее ощущение",
        hard: "жёсткое ощущение"
      }[racket.hardness] ?? "подходящее ощущение"
    );
  }

  if (profile.budget === "under_280" && racket.currentPrice <= 280) {
    reasons.push("внутри бюджета");
  }

  if (profile.budget === "under_330" && racket.currentPrice <= 330) {
    reasons.push("выгодная цена");
  }

  if (profile.budget === "premium" && racket.currentPrice >= 300) {
    reasons.push("премиум-класс");
  }

  return reasons.slice(0, 3).join(" · ") || "сбалансированное совпадение с профилем";
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
