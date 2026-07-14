import { PrismaClient } from "@prisma/client";

import { normalizeOfferUrl } from "../lib/catalog/links";
import { rackets } from "../data/rackets.js";

const prisma = new PrismaClient();
type SeedRacket = (typeof rackets)[number];

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildExtraOffers(racket: SeedRacket) {
  const variants = [
    {
      name: `${racket.brand} Direct`,
      delta: 0,
      previousDelta: 24,
      suffix: "?channel=direct",
      availability: "in_stock",
      stockNote: "Brand direct"
    },
    {
      name: "Padel Pro Shop",
      delta: 9,
      previousDelta: 18,
      suffix: "?channel=pro-shop",
      availability: "limited",
      stockNote: "Low stock"
    },
    {
      name: "Court Side Deals",
      delta: -7,
      previousDelta: 16,
      suffix: "?channel=deal",
      availability: "in_stock",
      stockNote: "Best current deal"
    }
  ];

  return variants.map((variant, index) => ({
    merchantName: index === 0 ? racket.shopName : variant.name,
    url: normalizeOfferUrl(index === 0 ? racket.shopUrl : `${racket.shopUrl}${variant.suffix}`),
    price: Math.max(199, racket.currentPrice + variant.delta),
    previousPrice: Math.max(205, racket.currentPrice + variant.previousDelta),
    availability: variant.availability,
    stockNote: variant.stockNote
  }));
}

async function main() {
  await prisma.analyticsEvent.deleteMany();
  await prisma.offerPriceLog.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.racketPro.deleteMany();
  await prisma.racketCon.deleteMany();
  await prisma.racket.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.brand.deleteMany();

  for (const racket of rackets as SeedRacket[]) {
    const brand = await prisma.brand.upsert({
      where: { name: racket.brand },
      update: {},
      create: {
        name: racket.brand,
        slug: slugify(racket.brand)
      }
    });

    const createdRacket = await prisma.racket.create({
      data: {
        externalKey: racket.id,
        slug: racket.id,
        brandId: brand.id,
        model: racket.model,
        fullName: racket.fullName,
        season: racket.season,
        shape: racket.shape,
        skillLevel: racket.skillLevel,
        playStyle: racket.playStyle,
        hardness: racket.hardness,
        weightG: racket.weight,
        balance: racket.balance,
        sweetSpot: racket.sweetSpot,
        faceMaterial: racket.faceMaterial,
        frameMaterial: racket.frameMaterial,
        coreMaterial: racket.coreMaterial,
        verdict: racket.verdict,
        whoItFits: racket.whoItFits,
        sourceLabel: "Seed catalog",
        importedAt: new Date("2026-06-28T00:00:00.000Z"),
        pros: {
          create: racket.pros.map((text: string, position: number) => ({
            text,
            position
          }))
        },
        cons: {
          create: racket.cons.map((text: string, position: number) => ({
            text,
            position
          }))
        }
      }
    });

    for (const offer of buildExtraOffers(racket)) {
      const merchant = await prisma.merchant.upsert({
        where: { name: offer.merchantName },
        update: {},
        create: {
          name: offer.merchantName,
          slug: slugify(offer.merchantName)
        }
      });

      await prisma.offer.create({
        data: {
          racketId: createdRacket.id,
          merchantId: merchant.id,
          productUrl: offer.url,
          currency: "EUR",
          priceAmount: offer.price,
          previousPrice: offer.previousPrice,
          availability: offer.availability,
          stockNote: offer.stockNote,
          lastCheckedAt: new Date(),
          sourceLabel: "Seed catalog",
          importedAt: new Date("2026-06-28T00:00:00.000Z"),
          priceHistory: {
            create: [
              {
                priceAmount: offer.previousPrice,
                currency: "EUR",
                availability: offer.availability,
                capturedAt: new Date("2026-06-20T12:00:00.000Z")
              },
              {
                priceAmount: offer.price,
                currency: "EUR",
                availability: offer.availability,
                capturedAt: new Date("2026-06-27T12:00:00.000Z")
              }
            ]
          }
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
