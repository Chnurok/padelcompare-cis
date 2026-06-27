import { AnalyticsPageView } from "@/components/analytics-page-view";
import { CatalogExperience } from "@/components/catalog-experience";
import { getFunnelDashboardFromDb } from "@/lib/analytics-dashboard";
import {
  getAnalyticsSummaryFromDb,
  getCatalogStatsFromDb,
  getLatestRacketsFromDb,
  getRecommendationRailFromDb,
  getTopDealsFromDb,
  listRacketsFromDb
} from "@/lib/catalog/catalog-db";
import { COLLECTIONS } from "@/lib/catalog/collections";
import { SEO_CATEGORY_PAGES, SEO_VS_PAGES } from "@/lib/seo/landing-pages";

export default async function HomePage() {
  const [rackets, stats, analytics, recommendationRail, funnelDashboard, topDeals, latestRackets] = await Promise.all([
    listRacketsFromDb(),
    getCatalogStatsFromDb(),
    getAnalyticsSummaryFromDb(),
    getRecommendationRailFromDb(),
    getFunnelDashboardFromDb(),
    getTopDealsFromDb(),
    getLatestRacketsFromDb()
  ]);

  return (
    <main className="page-shell">
      <AnalyticsPageView page="home" stage="discovery" source="homepage" intent="browse_catalog" />
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
        adminHref="/admin/import"
        funnel={{
          compareCtaClicks: funnelDashboard.compareCtaClicks,
          compareLinkCopies: funnelDashboard.compareLinkCopies,
          topSource: funnelDashboard.bySource[0]?.label,
          topIntent: funnelDashboard.byIntent[0]?.label
        }}
        topDeals={topDeals}
        latestRackets={latestRackets}
      />
    </main>
  );
}
