export type CatalogOffer = {
  merchant: string;
  url: string;
  currency: string;
  price: number;
  previousPrice: number | null;
  availability: string;
  stockNote: string | null;
  lastCheckedAt: string | null;
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
  pros: string[];
  cons: string[];
  imageUrl: string | null;
  offers: CatalogOffer[];
};

export type FinderProfile = {
  budget: "under_280" | "under_330" | "premium";
  priority: "control" | "power" | "comfort" | "balanced";
  level: "beginner" | "intermediate" | "advanced";
  feel: "soft" | "medium" | "hard";
};
