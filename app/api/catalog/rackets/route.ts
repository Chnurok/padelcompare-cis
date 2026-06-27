import { NextResponse } from "next/server";

import { listRacketsFromDb } from "@/lib/catalog/catalog-db";
import { catalogQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = catalogQuerySchema.safeParse({
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
