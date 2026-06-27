import { NextResponse } from "next/server";

import { importCatalogPayload } from "@/lib/catalog/import";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  try {
    const summary = await importCatalogPayload(body);

    return NextResponse.json({
      ok: true,
      summary
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Invalid import payload",
          message: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Unknown import error" }, { status: 500 });
  }
}
