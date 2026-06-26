import { CatalogExperience } from "@/components/catalog-experience";
import {
  getAnalyticsSummaryFromDb,
  getCatalogStatsFromDb,
  listRacketsFromDb
} from "@/lib/catalog/catalog-db";
import { COLLECTIONS } from "@/lib/catalog/collections";

export default async function HomePage() {
  const [rackets, stats, analytics] = await Promise.all([
    listRacketsFromDb(),
    getCatalogStatsFromDb(),
    getAnalyticsSummaryFromDb()
  ]);

  return (
    <main className="page-shell">
      <CatalogExperience
        rackets={rackets}
        stats={stats}
        analytics={analytics}
        collections={COLLECTIONS.map(({ slug, title }) => ({ slug, title }))}
      />
    </main>
  );
}
