import { NextResponse } from "next/server";
import { z } from "zod";

import { listRacketsFromDb } from "@/lib/catalog/catalog-db";

const querySchema = z.object({
  search: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  shape: z.string().trim().optional(),
  skill: z.string().trim().optional(),
  style: z.string().trim().optional(),
  hardness: z.string().trim().optional(),
  price_max: z.coerce.number().int().positive().optional()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    search: searchParams.get("search") ?? undefined,
    brand: searchParams.get("brand") ?? undefined,
    shape: searchParams.get("shape") ?? undefined,
    skill: searchParams.get("skill") ?? undefined,
    style: searchParams.get("style") ?? undefined,
    hardness: searchParams.get("hardness") ?? undefined,
    price_max: searchParams.get("price_max") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid catalog query", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const rackets = await listRacketsFromDb({
    search: parsed.data.search,
    brand: parsed.data.brand,
    shape: parsed.data.shape,
    skill: parsed.data.skill,
    style: parsed.data.style,
    hardness: parsed.data.hardness,
    priceMax: parsed.data.price_max
  });

  return NextResponse.json({
    rackets,
    total: rackets.length,
    source: "prisma-db"
  });
}
