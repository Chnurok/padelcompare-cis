import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";

const eventSchema = z.object({
  type: z.string().trim().min(1).max(60),
  page: z.string().trim().max(120).optional(),
  racketId: z.string().trim().max(120).optional(),
  compareIds: z.array(z.string().trim().max(120)).max(4).optional().default([]),
  meta: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional().default({})
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid analytics payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await prisma.analyticsEvent.create({
    data: {
      type: parsed.data.type,
      page: parsed.data.page,
      racketId: parsed.data.racketId,
      compareIds: JSON.stringify(parsed.data.compareIds),
      meta: JSON.stringify(parsed.data.meta)
    }
  });

  return NextResponse.json({ ok: true });
}
