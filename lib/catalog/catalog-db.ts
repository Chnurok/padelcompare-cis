import { prisma } from "@/lib/db";
import { normalizeOfferUrl } from "@/lib/catalog/links";
import { getRacketImageUrl } from "@/lib/catalog/racket-media";
import { buildAffiliateLink } from "@/lib/commerce/affiliate";
import {
  getPresetRecommendations,
  getSimilarityScore,
  RECOMMENDATION_PRESETS
} from "@/lib/catalog/recommendation";

export type CatalogOffer = {
  merchant: string;
  url: string;
  isAffiliate: boolean;
  affiliateLabel?: string;
  currency: string;
  price: number;
  previousPrice?: number;
  availability: string;
  stockNote?: string;
  lastCheckedAt?: string;
  sourceLabel?: string;
  importedAt?: string;
  priceHistory: Array<{
    price: number;
    currency: string;
    availability: string;
    capturedAt: string;
  }>;
};

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
  sourceLabel?: string;
  importedAt?: string;
  pros: string[];
  cons: string[];
  offers: CatalogOffer[];
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

export type BrandSummary = {
  slug: string;
  name: string;
  count: number;
  latestSeason: number;
  minPrice: number;
  maxPrice: number;
};

export type MerchantSummary = {
  slug: string;
  name: string;
  offers: number;
  rackets: number;
  bestDiscountPercent: number;
};

export type AnalyticsSummary = {
  compareOpens: number;
  offerClicks: number;
  leadSubmits: number;
};

export type DealRailItem = CatalogRacket & {
  discountAmount: number;
  discountPercent: number;
};

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

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
  const offers = [...row.offers]
    .sort(
    (left, right) => Number(left.priceAmount) - Number(right.priceAmount)
    )
    .map((offer) => {
      const affiliate = buildAffiliateLink(normalizeOfferUrl(offer.productUrl));

      return {
      merchant: offer.merchant.name,
      url: affiliate.url,
      isAffiliate: affiliate.isAffiliate,
      affiliateLabel: affiliate.label,
      currency: offer.currency,
      price: Number(offer.priceAmount),
      previousPrice: offer.previousPrice ? Number(offer.previousPrice) : undefined,
      availability: offer.availability,
      stockNote: offer.stockNote ?? undefined,
      lastCheckedAt: offer.lastCheckedAt?.toISOString(),
      sourceLabel: offer.sourceLabel ?? undefined,
        importedAt: offer.importedAt?.toISOString(),
        priceHistory: offer.priceHistory.map((entry) => ({
          price: Number(entry.priceAmount),
        currency: entry.currency,
        availability: entry.availability,
          capturedAt: entry.capturedAt.toISOString()
        }))
      };
    });
  const cheapestOffer = offers[0];

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
    currentPrice: cheapestOffer?.price ?? 0,
    verdict: row.verdict,
    whoItFits: row.whoItFits,
    sourceLabel: row.sourceLabel ?? undefined,
    importedAt: row.importedAt?.toISOString(),
    pros: row.pros.sort((a, b) => a.position - b.position).map((item) => item.text),
    cons: row.cons.sort((a, b) => a.position - b.position).map((item) => item.text),
    offers,
    shopName: cheapestOffer?.merchant ?? "No shop yet",
    shopUrl: cheapestOffer?.url ?? "#",
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
          merchant: true,
          priceHistory: {
            orderBy: {
              capturedAt: "desc"
            },
            take: 6
          }
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
          merchant: true,
          priceHistory: {
            orderBy: {
              capturedAt: "desc"
            },
            take: 6
          }
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

export async function getCatalogRacketsByIdsFromDb(ids: string[]) {
  const rows = await fetchRackets();
  const byId = new Map(rows.map(toCatalogRacket).map((racket) => [racket.id, racket]));
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
    .map((id) => byId.get(id))
    .filter((racket): racket is CatalogRacket => Boolean(racket));
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

export async function getRecommendationRailFromDb() {
  const rackets = await listRacketsFromDb();

  return RECOMMENDATION_PRESETS.map((preset) => ({
    ...preset,
    rackets: getPresetRecommendations(rackets, preset, 3)
  }));
}

export async function getTopDealsFromDb(limit = 4): Promise<DealRailItem[]> {
  const rackets = await listRacketsFromDb();

  return rackets
    .map((racket) => {
      const bestOffer = racket.offers[0];
      const previousPrice = bestOffer?.previousPrice ?? racket.currentPrice;
      const discountAmount = Math.max(0, previousPrice - racket.currentPrice);
      const discountPercent =
        previousPrice > 0 ? Math.round((discountAmount / previousPrice) * 100) : 0;

      return {
        ...racket,
        discountAmount,
        discountPercent
      };
    })
    .filter((racket) => racket.discountAmount > 0)
    .sort((left, right) => {
      if (right.discountPercent !== left.discountPercent) {
        return right.discountPercent - left.discountPercent;
      }

      return right.discountAmount - left.discountAmount;
    })
    .slice(0, limit);
}

export async function getMerchantSummariesFromDb(limit = 8): Promise<MerchantSummary[]> {
  const rackets = await listRacketsFromDb();
  const map = new Map<string, { name: string; offers: number; rackets: Set<string>; bestDiscountPercent: number }>();

  for (const racket of rackets) {
    for (const offer of racket.offers) {
      const previousPrice = offer.previousPrice ?? offer.price;
      const discountAmount = Math.max(0, previousPrice - offer.price);
      const discountPercent = previousPrice > 0 ? Math.round((discountAmount / previousPrice) * 100) : 0;
      const current = map.get(offer.merchant) ?? {
        name: offer.merchant,
        offers: 0,
        rackets: new Set<string>(),
        bestDiscountPercent: 0
      };

      current.offers += 1;
      current.rackets.add(racket.id);
      current.bestDiscountPercent = Math.max(current.bestDiscountPercent, discountPercent);
      map.set(offer.merchant, current);
    }
  }

  return [...map.values()]
    .map((item) => ({
      slug: slugify(item.name),
      name: item.name,
      offers: item.offers,
      rackets: item.rackets.size,
      bestDiscountPercent: item.bestDiscountPercent
    }))
    .sort((left, right) => {
      if (right.bestDiscountPercent !== left.bestDiscountPercent) {
        return right.bestDiscountPercent - left.bestDiscountPercent;
      }

      return right.offers - left.offers;
    })
    .slice(0, limit);
}

export async function getLatestRacketsFromDb(limit = 4) {
  const rackets = await listRacketsFromDb();

  return [...rackets]
    .sort((left, right) => {
      if (right.season !== left.season) {
        return right.season - left.season;
      }

      return right.currentPrice - left.currentPrice;
    })
    .slice(0, limit);
}

export async function getBrandSummariesFromDb(): Promise<BrandSummary[]> {
  const rackets = await listRacketsFromDb();
  const groups = new Map<string, CatalogRacket[]>();

  for (const racket of rackets) {
    const current = groups.get(racket.brand) ?? [];
    current.push(racket);
    groups.set(racket.brand, current);
  }

  return [...groups.entries()]
    .map(([name, items]) => ({
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      name,
      count: items.length,
      latestSeason: Math.max(...items.map((item) => item.season)),
      minPrice: Math.min(...items.map((item) => item.currentPrice)),
      maxPrice: Math.max(...items.map((item) => item.currentPrice))
    }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

export async function getRacketsByBrandSlugFromDb(slug: string) {
  const rackets = await listRacketsFromDb();
  return rackets.filter(
    (racket) => racket.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") === slug
  );
}

export async function getRacketsByMerchantSlugFromDb(slug: string) {
  const rackets = await listRacketsFromDb();

  return rackets.filter((racket) =>
    racket.offers.some((offer) => slugify(offer.merchant) === slug)
  );
}
