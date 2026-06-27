import { CatalogExperience } from "@/components/catalog-experience";
import {
  getAnalyticsSummaryFromDb,
  getCatalogStatsFromDb,
  getRecommendationRailFromDb,
  listRacketsFromDb
} from "@/lib/catalog/catalog-db";
import { COLLECTIONS } from "@/lib/catalog/collections";
import { SEO_CATEGORY_PAGES, SEO_VS_PAGES } from "@/lib/seo/landing-pages";

export default async function HomePage() {
  const [rackets, stats, analytics, recommendationRail] = await Promise.all([
    listRacketsFromDb(),
    getCatalogStatsFromDb(),
    getAnalyticsSummaryFromDb(),
    getRecommendationRailFromDb()
  ]);

  return (
    <main className="page-shell">
      <CatalogExperience
        rackets={rackets}
        stats={stats}
        analytics={analytics}
        collections={COLLECTIONS.map(({ slug, title }) => ({ slug, title }))}
        recommendationRail={recommendationRail}
        seoPages={{
          categories: SEO_CATEGORY_PAGES.map(({ slug, title }) => ({ slug, title })),
          versus: SEO_VS_PAGES.map(({ left, right, title }) => ({ left, right, title }))
        }}
      />
    </main>
  );
}
