import { AnalyticsPageView } from "@/components/analytics-page-view";
import { CatalogExperience } from "@/components/catalog-experience";
import { getFunnelDashboardFromDb } from "@/lib/analytics-dashboard";
import {
  getAnalyticsSummaryFromDb,
  getBrandSummariesFromDb,
  getCatalogStatsFromDb,
  getLatestRacketsFromDb,
  getTopDealsFromDb,
  listRacketsFromDb
} from "@/lib/catalog/catalog-db";
import { COLLECTIONS } from "@/lib/catalog/collections";

export default async function HomePage() {
  const [rackets, stats, analytics, funnelDashboard, topDeals, latestRackets, brands] = await Promise.all([
    listRacketsFromDb(),
    getCatalogStatsFromDb(),
    getAnalyticsSummaryFromDb(),
    getFunnelDashboardFromDb(),
    getTopDealsFromDb(),
    getLatestRacketsFromDb(),
    getBrandSummariesFromDb()
  ]);

  return (
    <main className="page-shell">
      <AnalyticsPageView page="home" stage="discovery" source="homepage" intent="browse_catalog" />
      <CatalogExperience
        rackets={rackets}
        stats={stats}
        analytics={analytics}
        collections={COLLECTIONS.map(({ slug, title }) => ({ slug, title }))}
        funnel={{
          compareCtaClicks: funnelDashboard.compareCtaClicks,
          compareLinkCopies: funnelDashboard.compareLinkCopies,
          topSource: funnelDashboard.bySource[0]?.label,
          topIntent: funnelDashboard.byIntent[0]?.label
        }}
        topDeals={topDeals}
        latestRackets={latestRackets}
        brands={brands}
      />
    </main>
  );
}
