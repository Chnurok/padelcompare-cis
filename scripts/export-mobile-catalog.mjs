import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:./dev.db"
    }
  }
});
const target = resolve("mobile/src/data/catalog.json");

const photoById = {
  "bullpadel-vertex-04-25": "/rackets/photos/bullpadel-vertex-04-25.jpg",
  "nox-at10-18k-25": "/rackets/photos/nox-at10-18k-25.webp",
  "adidas-metalbone-ctrl-25": "/rackets/photos/adidas-metalbone-ctrl-25.webp",
  "babolat-counter-viper-25": "/rackets/photos/babolat-counter-viper-25.jpg",
  "babolat-air-viper-25": "/rackets/photos/babolat-air-viper-25.jpg",
  "head-speed-motion-25": "/rackets/photos/head-speed-motion-25.webp",
  "wilson-blade-pro-v3": "/rackets/photos/wilson-blade-pro-v3.jpg",
  "siux-electra-stupa-pro": "/rackets/photos/siux-electra-stupa-pro.jpg",
  "starvie-triton-soft-25": "/rackets/photos/starvie-triton-soft-25.png",
  "adidas-cross-it-light-25": "/rackets/photos/adidas-cross-it-light-25.webp",
  "adidas-metalbone-hrd-25": "/rackets/photos/adidas-metalbone-hrd-25.webp",
  "starvie-basalto-soft-25": "/rackets/photos/starvie-basalto-soft-25.jpg",
  "nox-ml10-ventus-control-26": "/rackets/photos/nox-ml10-ventus-control-26.png",
  "babolat-technical-viper-25": "/rackets/photos/babolat-technical-viper-25.jpg",
  "nox-at10-attack-12k-26": "/rackets/photos/nox-at10-attack-12k-26.png",
  "bullpadel-hack-03-25": "/rackets/photos/bullpadel-hack-03-25.jpg",
  "head-extreme-pro-25": "/rackets/photos/head-extreme-pro-25.png",
  "siux-diablo-pro-4-25": "/rackets/photos/siux-diablo-pro-4-25.jpg",
  "starvie-astrum-soft-25": "/rackets/photos/starvie-astrum-soft-25.webp",
  "wilson-defy-pro-v1-25": "/rackets/photos/wilson-defy-pro-v1-25.webp",
  "adidas-cross-it-light-26-marta": "/rackets/photos/adidas-cross-it-light-26-marta.webp",
  "adidas-metalbone-team-light-26": "/rackets/photos/adidas-metalbone-team-light-26.webp",
  "nox-equation-soft-advanced-26": "/rackets/photos/nox-equation-soft-advanced-26.webp",
  "royal-padel-m27-poly-26": "/rackets/photos/royal-padel-m27-poly-26.webp",
  "starvie-raptor-plus-26": "/rackets/photos/starvie-raptor-plus-26.webp"
};

function imageFor(slug) {
  if (photoById[slug]) return photoById[slug];
  const base = Object.keys(photoById).find((id) => slug.startsWith(`${id}-`));
  return base ? photoById[base] : null;
}

try {
  const rows = await prisma.racket.findMany({
    include: {
      brand: true,
      pros: { orderBy: { position: "asc" } },
      cons: { orderBy: { position: "asc" } },
      offers: {
        include: {
          merchant: true,
          priceHistory: {
            orderBy: { capturedAt: "desc" },
            take: 6
          }
        },
        orderBy: { priceAmount: "asc" }
      }
    },
    orderBy: [{ brand: { name: "asc" } }, { model: "asc" }]
  });

  const catalog = rows.map((row) => ({
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
    currentPrice: Number(row.offers[0]?.priceAmount ?? 0),
    verdict: row.verdict,
    whoItFits: row.whoItFits,
    pros: row.pros.map((item) => item.text),
    cons: row.cons.map((item) => item.text),
    imageUrl: imageFor(row.slug),
    offers: row.offers.map((offer) => ({
      merchant: offer.merchant.name,
      url: offer.productUrl,
      currency: offer.currency,
      price: Number(offer.priceAmount),
      previousPrice: offer.previousPrice ? Number(offer.previousPrice) : null,
      availability: offer.availability,
      stockNote: offer.stockNote,
      lastCheckedAt: offer.lastCheckedAt?.toISOString() ?? null,
      priceHistory: offer.priceHistory.map((entry) => ({
        price: Number(entry.priceAmount),
        currency: entry.currency,
        availability: entry.availability,
        capturedAt: entry.capturedAt.toISOString()
      }))
    }))
  }));

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  console.log(`Exported ${catalog.length} rackets to ${target}`);
} finally {
  await prisma.$disconnect();
}
