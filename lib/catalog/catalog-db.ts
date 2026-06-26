import { prisma } from "@/lib/db";
import { getRacketImageUrl } from "@/lib/catalog/racket-media";

export type CatalogRacket = {
  id: string;
  brand: string;
  model: string;
  fullName: string;
  season: number;
  shape: string;
  skillLevel: string;
  playStyle: string;
  hardness: string;
  weight: number;
  balance: string;
  sweetSpot: string;
  faceMaterial: string;
  frameMaterial: string;
  coreMaterial: string;
  currentPrice: number;
  verdict: string;
  whoItFits: string;
  pros: string[];
  cons: string[];
  shopName: string;
  shopUrl: string;
  image: string;
  imageUrl: string;
};

export type CatalogFilters = {
  search?: string;
  brand?: string;
  shape?: string;
  skill?: string;
  style?: string;
  hardness?: string;
  priceMax?: number;
};

export type CatalogStats = {
  brands: string[];
  shapes: string[];
  skills: string[];
  styles: string[];
  hardnessLevels: string[];
  minPrice: number;
  maxPrice: number;
  total: number;
};

export type AnalyticsSummary = {
  compareOpens: number;
  offerClicks: number;
  leadSubmits: number;
};

function makeImageMark(brand: string, model: string) {
  const token = `${brand} ${model}`
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return token || "PC";
}

function toCatalogRacket(row: Awaited<ReturnType<typeof fetchRackets>>[number]): CatalogRacket {
  const cheapestOffer = [...row.offers].sort(
    (left, right) => Number(left.priceAmount) - Number(right.priceAmount)
  )[0];

  return {
    id: row.slug,
    brand: row.brand.name,
    model: row.model,
    fullName: row.fullName,
    season: row.season,
    shape: row.shape,
    skillLevel: row.skillLevel,
    playStyle: row.playStyle,
    hardness: row.hardness,
    weight: row.weightG,
    balance: row.balance,
    sweetSpot: row.sweetSpot,
    faceMaterial: row.faceMaterial,
    frameMaterial: row.frameMaterial,
    coreMaterial: row.coreMaterial,
    currentPrice: cheapestOffer ? Number(cheapestOffer.priceAmount) : 0,
    verdict: row.verdict,
    whoItFits: row.whoItFits,
    pros: row.pros.sort((a, b) => a.position - b.position).map((item) => item.text),
    cons: row.cons.sort((a, b) => a.position - b.position).map((item) => item.text),
    shopName: cheapestOffer?.merchant.name ?? "No shop yet",
    shopUrl: cheapestOffer?.productUrl ?? "#",
    image: makeImageMark(row.brand.name, row.model),
    imageUrl: getRacketImageUrl(row.slug)
  };
}

async function fetchRackets() {
  return prisma.racket.findMany({
    include: {
      brand: true,
      pros: true,
      cons: true,
      offers: {
        include: {
          merchant: true
        }
      }
    },
    orderBy: [
      { brand: { name: "asc" } },
      { model: "asc" }
    ]
  });
}

function normalizeCompareIds(ids: string[]) {
  return [...new Set(ids.map((item) => item.trim()).filter(Boolean))].slice(0, 4);
}

export async function listRacketsFromDb(filters: CatalogFilters = {}) {
  const query = filters.search?.trim().toLowerCase();
  const rows = await fetchRackets();

  return rows
    .map(toCatalogRacket)
    .filter((racket) => {
      const matchesSearch =
        !query ||
        [racket.brand, racket.model, racket.fullName, racket.verdict]
          .join(" ")
          .toLowerCase()
          .includes(query);

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

export async function getCatalogStatsFromDb(): Promise<CatalogStats> {
  const rackets = await listRacketsFromDb();
  const prices = rackets.map((racket) => racket.currentPrice);

  return {
    brands: [...new Set(rackets.map((racket) => racket.brand))].sort(),
    shapes: [...new Set(rackets.map((racket) => racket.shape))].sort(),
    skills: [...new Set(rackets.map((racket) => racket.skillLevel))].sort(),
    styles: [...new Set(rackets.map((racket) => racket.playStyle))].sort(),
    hardnessLevels: [...new Set(rackets.map((racket) => racket.hardness))].sort(),
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    total: rackets.length
  };
}

export async function getAnalyticsSummaryFromDb(): Promise<AnalyticsSummary> {
  const grouped = await prisma.analyticsEvent.groupBy({
    by: ["type"],
    _count: {
      _all: true
    },
    where: {
      type: {
        in: ["compare_open", "offer_click", "lead_submit"]
      }
    }
  });

  const map = new Map(grouped.map((item) => [item.type, item._count._all]));

  return {
    compareOpens: map.get("compare_open") ?? 0,
    offerClicks: map.get("offer_click") ?? 0,
    leadSubmits: map.get("lead_submit") ?? 0
  };
}

export async function getRacketBySlugFromDb(slug: string) {
  const row = await prisma.racket.findUnique({
    where: { slug },
    include: {
      brand: true,
      pros: true,
      cons: true,
      offers: {
        include: {
          merchant: true
        }
      }
    }
  });

  return row ? toCatalogRacket(row) : null;
}

export async function getCompareSetFromDb(ids: string[]) {
  const normalized = normalizeCompareIds(ids);
  const rows = await fetchRackets();
  const byId = new Map(rows.map(toCatalogRacket).map((racket) => [racket.id, racket]));
  return normalized.map((id) => byId.get(id)).filter((racket): racket is CatalogRacket => Boolean(racket));
}

function getSimilarityScore(base: CatalogRacket, candidate: CatalogRacket) {
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

export async function getRelatedRacketsFromDb(slug: string, limit = 3) {
  const rows = await fetchRackets();
  const rackets = rows.map(toCatalogRacket);
  const base = rackets.find((item) => item.id === slug);

  if (!base) {
    return [];
  }

  return rackets
    .filter((item) => item.id !== slug)
    .sort((left, right) => getSimilarityScore(base, right) - getSimilarityScore(base, left))
    .slice(0, limit);
}
