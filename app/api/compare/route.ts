import { NextResponse } from "next/server";

import { getCompareSetFromDb } from "@/lib/catalog/catalog-db";
import { compareQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = compareQuerySchema.safeParse({
    ids: searchParams.get("ids") ?? ""
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid compare query", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const rackets = await getCompareSetFromDb(parsed.data.ids);

  return NextResponse.json({
    rackets,
    total: rackets.length,
    source: "prisma-db"
  });
}
