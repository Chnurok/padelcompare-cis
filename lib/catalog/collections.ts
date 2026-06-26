import type { CatalogRacket } from "@/lib/catalog/catalog-db";

export type CollectionDefinition = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  criteria: (racket: CatalogRacket) => boolean;
  compareIds?: string[];
};

export const COLLECTIONS: CollectionDefinition[] = [
  {
    slug: "beginner-friendly",
    title: "Ракетки для beginner / easy transition",
    description: "Комфортные и более forgiving модели для первых серьёзных шагов в padel.",
    intro: "Здесь модели с мягким feel, дружелюбной защитой и более широким sweet spot.",
    criteria: (racket) =>
      racket.skillLevel === "intermediate" &&
      (racket.hardness === "soft" || racket.balance === "low" || racket.sweetSpot === "large")
  },
  {
    slug: "control-rackets",
    title: "Контрольные ракетки",
    description: "Подборка для тех, кто строит розыгрыш через точность, защиту и стабильность.",
    intro: "Главный акцент здесь на control, sweet spot и читаемость мяча в обороне.",
    criteria: (racket) => racket.playStyle === "control" || racket.shape === "round"
  },
  {
    slug: "power-rackets",
    title: "Атакующие power-ракетки",
    description: "Модели для агрессивной игры сверху, finish shots и более взрывного выхода мяча.",
    intro: "Эта полка собирает power-first ракетки с high balance, diamond/tear geometry и attacking profile.",
    criteria: (racket) => racket.playStyle === "power" || racket.balance === "high"
  },
  {
    slug: "under-300",
    title: "Лучшие до 300 евро",
    description: "Подборка ракеток, которые уже дают сильный уровень продукта без premium price tag.",
    intro: "Полезно для price-sensitive покупателя: отобраны модели, которые укладываются в €300 и ниже.",
    criteria: (racket) => racket.currentPrice <= 300
  }
];

export function getCollectionBySlug(slug: string) {
  return COLLECTIONS.find((collection) => collection.slug === slug) ?? null;
}
