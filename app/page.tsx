import { CatalogExperience } from "@/components/catalog-experience";
import { getCatalogStatsFromDb, listRacketsFromDb } from "@/lib/catalog/catalog-db";

export default async function HomePage() {
  const [rackets, stats] = await Promise.all([listRacketsFromDb(), getCatalogStatsFromDb()]);

  return (
    <main className="page-shell">
      <CatalogExperience rackets={rackets} stats={stats} />
    </main>
  );
}
