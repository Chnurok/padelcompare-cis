import { prisma } from "@/lib/db";

export type ImportRunItem = {
  id: string;
  sourceLabel?: string;
  rackets: number;
  createdCount: number;
  updatedCount: number;
  offers: number;
  brands: number;
  merchants: number;
  payloadSize: number;
  createdAt: string;
};

export async function getImportRunsFromDb(limit = 12): Promise<ImportRunItem[]> {
  const rows = await prisma.importRun.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: limit
  });

  return rows.map((row) => ({
    id: row.id,
    sourceLabel: row.sourceLabel ?? undefined,
    rackets: row.rackets,
    createdCount: row.createdCount,
    updatedCount: row.updatedCount,
    offers: row.offers,
    brands: row.brands,
    merchants: row.merchants,
    payloadSize: row.payloadSize,
    createdAt: row.createdAt.toISOString()
  }));
}
