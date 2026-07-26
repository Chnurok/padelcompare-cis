import { NextResponse } from "next/server";

import { getRacketBySlugFromDb } from "@/lib/catalog/catalog-db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const racket = await getRacketBySlugFromDb(slug);

  if (!racket) {
    return NextResponse.json({ error: "Racket not found" }, { status: 404 });
  }

  return NextResponse.json({ racket, source: "prisma-db" });
}
