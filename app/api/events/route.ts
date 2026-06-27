import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { eventSchema } from "@/lib/validation";

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
      meta: JSON.stringify({
        ...parsed.data.meta,
        stage: parsed.data.stage,
        source: parsed.data.source,
        intent: parsed.data.intent
      })
    }
  });

  return NextResponse.json({ ok: true });
}
