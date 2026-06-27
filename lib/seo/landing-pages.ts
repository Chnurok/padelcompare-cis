import type { CatalogRacket } from "@/lib/catalog/catalog-db";
import {
  getPresetRecommendations,
  RECOMMENDATION_PRESETS
} from "@/lib/catalog/recommendation";

export type SeoCategoryPage = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  compareTitle: string;
  presetSlug: string;
};

export type SeoVsPage = {
  left: string;
  right: string;
  title: string;
  description: string;
  intro: string;
};

export const SEO_CATEGORY_PAGES: SeoCategoryPage[] = [
  {
    slug: "best-padel-racket-for-beginners",
    title: "Best padel racket for beginners",
    description: "Подборка комфортных и forgiving padel-ракеток для первых серьёзных шагов.",
    intro:
      "Эта страница собирает модели, которые легче читать в защите, проще ускорять и безопаснее брать как первый осознанный апгрейд.",
    compareTitle: "Сравнить beginner-friendly варианты",
    presetSlug: "beginner-step-up"
  },
  {
    slug: "best-control-padel-rackets",
    title: "Best control padel rackets",
    description: "Контрольные padel-ракетки для точной игры, защиты и устойчивого sweet spot.",
    intro:
      "Здесь выше вес у моделей, которые помогают строить розыгрыш через placement, комфорт и предсказуемый отклик.",
    compareTitle: "Сравнить control модели",
    presetSlug: "control-builder"
  },
  {
    slug: "best-power-padel-rackets",
    title: "Best power padel rackets",
    description: "Атакующие padel-ракетки для finish shots, speed-up и более жёсткого offensive profile.",
    intro:
      "Эта полка собрана под игроков, которые чаще ищут взрывной выход мяча, overhead pressure и finishing ability.",
    compareTitle: "Сравнить power модели",
    presetSlug: "power-finisher"
  },
  {
    slug: "best-padel-rackets-under-300",
    title: "Best padel rackets under 300",
    description: "Сильные padel-ракетки до 300 евро без ухода в верхний premium сегмент.",
    intro:
      "Фокус здесь не просто на низкой цене, а на моделях, которые дают лучший decision value в своём бюджете.",
    compareTitle: "Сравнить модели до 300 евро",
    presetSlug: "value-hunter"
  }
];

export const SEO_VS_PAGES: SeoVsPage[] = [
  {
    left: "nox-at10-18k-25",
    right: "bullpadel-vertex-04-25",
    title: "Nox AT10 Genius 18K vs Bullpadel Vertex 04",
    description: "Сравнение универсального premium all-court варианта против более жёсткой power-first модели.",
    intro:
      "Это хороший матчап для пользователя, который колеблется между balance/control feel и более жёсткой атакующей рамой."
  },
  {
    left: "adidas-metalbone-ctrl-25",
    right: "babolat-air-viper-25",
    title: "Adidas Metalbone Ctrl vs Babolat Air Viper",
    description: "Control-oriented round profile против более взрывной и быстрой attacking модели.",
    intro:
      "Полезно для игрока, который решает, важнее ли ему точность и sweet spot или speed-up и острота в атаке."
  },
  {
    left: "head-speed-motion-25",
    right: "starvie-triton-soft-25",
    title: "Head Speed Motion vs StarVie Triton Soft",
    description: "Лёгкая универсальная модель против мягкой power-entry ракетки для более смелой игры сверху.",
    intro:
      "Такой compare особенно полезен для intermediate игрока, который хочет понять, стоит ли уходить в power-сегмент."
  }
];

export function getSeoCategoryPage(slug: string) {
  return SEO_CATEGORY_PAGES.find((page) => page.slug === slug) ?? null;
}

export function getSeoVsPage(left: string, right: string) {
  return (
    SEO_VS_PAGES.find(
      (page) =>
        (page.left === left && page.right === right) || (page.left === right && page.right === left)
    ) ?? null
  );
}

export function getSeoCategoryRecommendations(rackets: CatalogRacket[], slug: string, limit = 4) {
  const page = getSeoCategoryPage(slug);
  if (!page) return [];

  const preset = RECOMMENDATION_PRESETS.find((item) => item.slug === page.presetSlug);
  if (!preset) return [];

  return getPresetRecommendations(rackets, preset, limit);
}
