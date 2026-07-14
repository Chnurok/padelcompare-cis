import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { leadSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid lead payload",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const lead = await prisma.lead.create({
    data: {
      name: parsed.data.name,
      contact: parsed.data.contact,
      intent: parsed.data.intent,
      notes: [parsed.data.sourcePage ? `Source page: ${parsed.data.sourcePage}` : "", parsed.data.notes]
        .filter(Boolean)
        .join(" || "),
      selectedId: parsed.data.selectedId,
      compareIds: JSON.stringify(parsed.data.compareIds)
    }
  });

  return NextResponse.json({
    ok: true,
    lead,
    persistence: "prisma-db"
  });
}
