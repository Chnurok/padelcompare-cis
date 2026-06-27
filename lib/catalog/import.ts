import { prisma } from "@/lib/db";
import { catalogImportSchema } from "@/lib/validation";

export type ImportPayload = {
  dryRun?: boolean;
  items: Array<{
    externalKey: string;
    slug: string;
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
    verdict: string;
    whoItFits: string;
    pros: string[];
    cons: string[];
    imageUrl: string;
    offers: Array<{
      merchant: string;
      url: string;
      currency: string;
      price: number;
    }>;
  }>;
};

export type ImportSummary = {
  dryRun: boolean;
  rackets: number;
  created: number;
  updated: number;
  offers: number;
  brands: number;
  merchants: number;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseCatalogImportPayload(input: unknown) {
  return catalogImportSchema.parse(input);
}

export async function importCatalogPayload(raw: unknown): Promise<ImportSummary> {
  const payload = parseCatalogImportPayload(raw);

  if (payload.dryRun) {
    return {
      dryRun: true,
      rackets: payload.items.length,
      created: payload.items.length,
      updated: 0,
      offers: payload.items.reduce((sum, item) => sum + item.offers.length, 0),
      brands: new Set(payload.items.map((item) => item.brand)).size,
      merchants: new Set(payload.items.flatMap((item) => item.offers.map((offer) => offer.merchant))).size
    };
  }

  return prisma.$transaction(async (tx) => {
    let created = 0;
    let updated = 0;
    const brandNames = new Set<string>();
    const merchantNames = new Set<string>();
    let offerCount = 0;

    for (const item of payload.items) {
      brandNames.add(item.brand);

      const brand = await tx.brand.upsert({
        where: { slug: slugify(item.brand) },
        update: {
          name: item.brand
        },
        create: {
          slug: slugify(item.brand),
          name: item.brand
        }
      });

      const existing = await tx.racket.findUnique({
        where: { externalKey: item.externalKey },
        select: { id: true }
      });

      const racket = await tx.racket.upsert({
        where: { externalKey: item.externalKey },
        update: {
          slug: item.slug,
          brandId: brand.id,
          model: item.model,
          fullName: item.fullName,
          season: item.season,
          shape: item.shape,
          skillLevel: item.skillLevel,
          playStyle: item.playStyle,
          hardness: item.hardness,
          weightG: item.weight,
          balance: item.balance,
          sweetSpot: item.sweetSpot,
          faceMaterial: item.faceMaterial,
          frameMaterial: item.frameMaterial,
          coreMaterial: item.coreMaterial,
          verdict: item.verdict,
          whoItFits: item.whoItFits
        },
        create: {
          externalKey: item.externalKey,
          slug: item.slug,
          brandId: brand.id,
          model: item.model,
          fullName: item.fullName,
          season: item.season,
          shape: item.shape,
          skillLevel: item.skillLevel,
          playStyle: item.playStyle,
          hardness: item.hardness,
          weightG: item.weight,
          balance: item.balance,
          sweetSpot: item.sweetSpot,
          faceMaterial: item.faceMaterial,
          frameMaterial: item.frameMaterial,
          coreMaterial: item.coreMaterial,
          verdict: item.verdict,
          whoItFits: item.whoItFits
        }
      });

      if (existing) {
        updated += 1;
        await tx.racketPro.deleteMany({ where: { racketId: racket.id } });
        await tx.racketCon.deleteMany({ where: { racketId: racket.id } });
        await tx.offer.deleteMany({ where: { racketId: racket.id } });
      } else {
        created += 1;
      }

      await tx.racketPro.createMany({
        data: item.pros.map((text, position) => ({
          racketId: racket.id,
          text,
          position
        }))
      });

      await tx.racketCon.createMany({
        data: item.cons.map((text, position) => ({
          racketId: racket.id,
          text,
          position
        }))
      });

      for (const offer of item.offers) {
        merchantNames.add(offer.merchant);
        offerCount += 1;

        const merchant = await tx.merchant.upsert({
          where: { slug: slugify(offer.merchant) },
          update: {
            name: offer.merchant
          },
          create: {
            slug: slugify(offer.merchant),
            name: offer.merchant
          }
        });

        await tx.offer.create({
          data: {
            racketId: racket.id,
            merchantId: merchant.id,
            productUrl: offer.url,
            currency: offer.currency,
            priceAmount: offer.price
          }
        });
      }
    }

    return {
      dryRun: false,
      rackets: payload.items.length,
      created,
      updated,
      offers: offerCount,
      brands: brandNames.size,
      merchants: merchantNames.size
    };
  });
}
