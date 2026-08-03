import type { CatalogRacket, FinderProfile } from "@/types/catalog";

export const labels = {
  shape: {
    round: "Круглая",
    tear: "Каплевидная",
    diamond: "Ромбовидная"
  },
  style: {
    control: "Контроль",
    power: "Мощность",
    balanced: "Баланс",
    comfort: "Комфорт"
  },
  level: {
    beginner: "Новичок",
    intermediate: "Средний",
    advanced: "Продвинутый"
  },
  hardness: {
    soft: "Мягкая",
    medium: "Средняя",
    hard: "Жёсткая"
  },
  balance: {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий"
  }
} as const;

export function labelFor(
  group: keyof typeof labels,
  value: string
): string {
  return (labels[group] as Record<string, string>)[value] ?? value;
}

export function formatPrice(value: number, currency = "EUR") {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

function clamp(value: number) {
  return Math.max(65, Math.min(98, Math.round(value)));
}

export type MetricKey =
  | "power"
  | "control"
  | "comfort"
  | "maneuverability"
  | "forgiveness"
  | "spin";

export const metrics: Array<{ key: MetricKey; label: string }> = [
  { key: "power", label: "Мощность" },
  { key: "control", label: "Контроль" },
  { key: "comfort", label: "Комфорт" },
  { key: "maneuverability", label: "Манёвренность" },
  { key: "forgiveness", label: "Прощение ошибок" },
  { key: "spin", label: "Вращение" }
];

export function metricScore(racket: CatalogRacket, key: MetricKey) {
  const shape = racket.shape;
  const style = racket.playStyle;
  const hardness = racket.hardness;
  const balance = racket.balance;
  const sweetSpot = racket.sweetSpot;
  const weight = racket.weight;

  const scores: Record<MetricKey, number> = {
    power:
      77 +
      (style === "power" ? 10 : style === "balanced" ? 6 : 2) +
      (shape === "diamond" ? 5 : shape === "tear" ? 3 : 1) +
      (balance === "high" ? 4 : balance === "medium" ? 2 : 0) +
      (hardness === "hard" ? 3 : hardness === "medium" ? 2 : 0),
    control:
      78 +
      (style === "control" ? 11 : style === "balanced" ? 7 : 3) +
      (shape === "round" ? 6 : shape === "tear" ? 3 : 0) +
      (balance === "low" ? 4 : balance === "medium" ? 2 : 0),
    comfort:
      78 +
      (hardness === "soft" ? 9 : hardness === "medium" ? 5 : 1) +
      (sweetSpot === "large" ? 5 : sweetSpot === "medium" ? 3 : 0) -
      (weight >= 368 ? 4 : weight >= 364 ? 2 : 0),
    maneuverability:
      79 +
      (weight <= 356 ? 8 : weight <= 361 ? 5 : weight <= 365 ? 2 : -2) +
      (balance === "low" ? 6 : balance === "medium" ? 3 : 0),
    forgiveness:
      77 +
      (sweetSpot === "large" ? 8 : sweetSpot === "medium" ? 4 : 1) +
      (hardness === "soft" ? 6 : hardness === "medium" ? 3 : 0),
    spin:
      78 +
      (shape === "diamond" ? 6 : shape === "tear" ? 4 : 2) +
      (style === "power" ? 5 : style === "balanced" ? 3 : 2)
  };

  return clamp(scores[key]);
}

export function averageScore(racket: CatalogRacket) {
  return Math.round(
    metrics.reduce((total, metric) => total + metricScore(racket, metric.key), 0) /
      metrics.length
  );
}

export function finderScore(racket: CatalogRacket, profile: FinderProfile) {
  let score = averageScore(racket);
  if (profile.level === "beginner") {
    score += racket.skillLevel === "intermediate" ? 6 : -8;
    score +=
      (metricScore(racket, "forgiveness") +
        metricScore(racket, "comfort") +
        metricScore(racket, "maneuverability")) *
      0.05;
  } else if (profile.level === racket.skillLevel) {
    score += 6;
  }
  if (profile.feel === racket.hardness) score += 5;

  const priority =
    profile.priority === "balanced"
      ? (metricScore(racket, "control") +
          metricScore(racket, "power") +
          metricScore(racket, "comfort")) /
        3
      : metricScore(racket, profile.priority);
  score += priority * 0.18;

  const ceiling =
    profile.budget === "under_280"
      ? 280
      : profile.budget === "under_330"
        ? 330
        : Number.POSITIVE_INFINITY;
  if (racket.currentPrice <= ceiling) score += 7;
  else score -= Math.min(14, Math.round((racket.currentPrice - ceiling) / 12));
  if (profile.budget === "premium" && racket.currentPrice >= 300) score += 4;

  return Math.round(score);
}

export function findRecommendations(
  rackets: CatalogRacket[],
  profile: FinderProfile,
  limit = 5
) {
  return [...rackets]
    .sort((left, right) => finderScore(right, profile) - finderScore(left, profile))
    .slice(0, limit);
}

export function explainFit(racket: CatalogRacket, profile: FinderProfile) {
  const reasons: string[] = [];
  if (profile.level === "beginner" && racket.skillLevel === "intermediate") {
    reasons.push("подходит для первого шага");
  } else if (racket.skillLevel === profile.level) {
    reasons.push("подходит по уровню");
  }
  if (racket.hardness === profile.feel) reasons.push("нужное ощущение");
  if (
    profile.priority === racket.playStyle ||
    (profile.priority === "balanced" && racket.playStyle === "balanced")
  ) {
    reasons.push("совпадает стиль");
  }
  if (
    (profile.budget === "under_280" && racket.currentPrice <= 280) ||
    (profile.budget === "under_330" && racket.currentPrice <= 330)
  ) {
    reasons.push("внутри бюджета");
  }
  return reasons.slice(0, 3).join(" · ") || "сильный общий профиль";
}

export function safeDescription(racket: CatalogRacket) {
  if (/[РС][^\s]{1,2}[РС]/.test(racket.verdict)) {
    return `${labelFor("style", racket.playStyle)} · ${labelFor(
      "shape",
      racket.shape
    )} · ${labelFor("hardness", racket.hardness)}. Подходит игрокам уровня «${labelFor(
      "level",
      racket.skillLevel
    ).toLowerCase()}».`;
  }
  return racket.verdict;
}

export function topDeals(rackets: CatalogRacket[], limit = 20) {
  return rackets
    .map((racket) => {
      const best = racket.offers[0];
      const previous = best?.previousPrice ?? racket.currentPrice;
      const discount =
        previous > racket.currentPrice
          ? Math.round(((previous - racket.currentPrice) / previous) * 100)
          : 0;
      return { racket, discount };
    })
    .filter((item) => item.discount > 0)
    .sort((left, right) => right.discount - left.discount)
    .slice(0, limit);
}
