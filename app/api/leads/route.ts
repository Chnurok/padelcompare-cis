import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(3).max(120),
  intent: z.string().trim().min(1).max(40),
  notes: z.string().trim().max(500).optional().default(""),
  selectedId: z.string().trim().optional(),
  compareIds: z.array(z.string().trim()).max(4).optional().default([])
});

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
      notes: parsed.data.notes,
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
