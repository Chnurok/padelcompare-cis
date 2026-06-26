import { rackets } from "@/data/rackets.js";

export type DemoRacket = (typeof rackets)[number];

export type CatalogFilters = {
  search?: string;
  brand?: string;
  shape?: string;
  skill?: string;
  style?: string;
  hardness?: string;
  priceMax?: number;
};

export function getCatalogSnapshot() {
  return {
    total: rackets.length,
    brands: [...new Set(rackets.map((racket) => racket.brand))].sort()
  };
}

export function listRackets(filters: CatalogFilters = {}) {
  const search = filters.search?.trim().toLowerCase();

  return rackets.filter((racket) => {
    const matchesSearch =
      !search ||
      [racket.brand, racket.model, racket.fullName].join(" ").toLowerCase().includes(search);

    return (
      matchesSearch &&
      (!filters.brand || filters.brand === "all" || racket.brand === filters.brand) &&
      (!filters.shape || filters.shape === "all" || racket.shape === filters.shape) &&
      (!filters.skill || filters.skill === "all" || racket.skillLevel === filters.skill) &&
      (!filters.style || filters.style === "all" || racket.playStyle === filters.style) &&
      (!filters.hardness || filters.hardness === "all" || racket.hardness === filters.hardness) &&
      (!filters.priceMax || racket.currentPrice <= filters.priceMax)
    );
  });
}

export function getRacketBySlug(slug: string) {
  return rackets.find((racket) => racket.id === slug) ?? null;
}

export function getCompareSet(ids: string[]) {
  const normalized = ids.slice(0, 4);
  return rackets.filter((racket) => normalized.includes(racket.id));
}
