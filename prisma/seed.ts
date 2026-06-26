import { PrismaClient } from "@prisma/client";

import { rackets } from "../data/rackets.js";

const prisma = new PrismaClient();

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
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

    const merchant = await prisma.merchant.upsert({
      where: { name: racket.shopName },
      update: {},
      create: {
        name: racket.shopName,
        slug: slugify(racket.shopName)
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

    await prisma.offer.create({
      data: {
        racketId: createdRacket.id,
        merchantId: merchant.id,
        productUrl: racket.shopUrl,
        currency: "EUR",
        priceAmount: racket.currentPrice
      }
    });
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
