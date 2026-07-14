import { NextResponse } from "next/server";

import { getLeadInboxFromDb } from "@/lib/admin/leads";

export const dynamic = "force-dynamic";

export async function GET() {
  const leads = await getLeadInboxFromDb();

  return NextResponse.json({
    ok: true,
    total: leads.length,
    leads
  });
}
