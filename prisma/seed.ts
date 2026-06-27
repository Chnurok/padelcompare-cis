import { PrismaClient } from "@prisma/client";

import { rackets } from "../data/rackets.js";

const prisma = new PrismaClient();

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildExtraOffers(racket: (typeof rackets)[number]) {
  const variants = [
    { name: `${racket.brand} Direct`, delta: 0, suffix: "?channel=direct" },
    { name: "Padel Pro Shop", delta: 9, suffix: "?channel=pro-shop" },
    { name: "Court Side Deals", delta: -7, suffix: "?channel=deal" }
  ];

  return variants.map((variant, index) => ({
    merchantName: index === 0 ? racket.shopName : variant.name,
    url: index === 0 ? racket.shopUrl : `${racket.shopUrl}${variant.suffix}`,
    price: Math.max(199, racket.currentPrice + variant.delta)
  }));
}

async function main() {
  await prisma.analyticsEvent.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.racketPro.deleteMany();
  await prisma.racketCon.deleteMany();
  await prisma.racket.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.brand.deleteMany();

  for (const racket of rackets) {
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
        pros: {
          create: racket.pros.map((text, position) => ({
            text,
            position
          }))
        },
        cons: {
          create: racket.cons.map((text, position) => ({
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
          priceAmount: offer.price
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
