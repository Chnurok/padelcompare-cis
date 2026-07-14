import { prisma } from "@/lib/db";
import { getCatalogRacketsByIdsFromDb } from "@/lib/catalog/catalog-db";

export type LeadInboxItem = {
  id: string;
  name: string;
  contact: string;
  intent: string;
  notes?: string;
  selectedId?: string;
  compareIds: string[];
  createdAt: string;
  selectedRacket?: {
    id: string;
    fullName: string;
  };
  compareRackets: Array<{
    id: string;
    fullName: string;
  }>;
};

function parseCompareIds(value?: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export async function getLeadInboxFromDb(): Promise<LeadInboxItem[]> {
  const leads = await prisma.lead.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  const selectedIds = leads.map((lead) => lead.selectedId).filter((item): item is string => Boolean(item));
  const compareIds = leads.flatMap((lead) => parseCompareIds(lead.compareIds));
  const rackets = await getCatalogRacketsByIdsFromDb([...new Set([...selectedIds, ...compareIds])]);
  const byId = new Map(rackets.map((racket) => [racket.id, racket]));

  return leads.map((lead) => {
    const leadCompareIds = parseCompareIds(lead.compareIds);

    return {
      id: lead.id,
      name: lead.name,
      contact: lead.contact,
      intent: lead.intent,
      notes: lead.notes ?? undefined,
      selectedId: lead.selectedId ?? undefined,
      compareIds: leadCompareIds,
      createdAt: lead.createdAt.toISOString(),
      selectedRacket: lead.selectedId
        ? byId.get(lead.selectedId)
          ? {
              id: lead.selectedId,
              fullName: byId.get(lead.selectedId)!.fullName
            }
          : undefined
        : undefined,
      compareRackets: leadCompareIds
        .map((id) => byId.get(id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map((item) => ({
          id: item.id,
          fullName: item.fullName
        }))
    };
  });
}
