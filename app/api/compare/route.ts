import { NextResponse } from "next/server";
import { z } from "zod";

import { getCompareSetFromDb } from "@/lib/catalog/catalog-db";

const compareSchema = z.object({
  ids: z
    .string()
    .trim()
    .min(1)
    .transform((value) => [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))].slice(0, 4))
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = compareSchema.safeParse({
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
