import { NextResponse } from "next/server";

import { getRacketBySlugFromDb } from "@/lib/catalog/catalog-db";

export async function GET(
  _request: Request,
  context: { params: { slug: string } }
) {
  const racket = await getRacketBySlugFromDb(context.params.slug);

  if (!racket) {
    return NextResponse.json({ error: "Racket not found" }, { status: 404 });
  }

  return NextResponse.json({ racket, source: "prisma-db" });
}
