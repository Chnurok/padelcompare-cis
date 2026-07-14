import type { Metadata } from "next";
import Link from "next/link";

import { AdminImportHistory } from "@/components/admin-import-history";
import { AdminImportConsole } from "@/components/admin-import-console";
import { FunnelDashboard } from "@/components/funnel-dashboard";
import { getImportRunsFromDb } from "@/lib/admin/import-runs";
import { getFunnelDashboardFromDb } from "@/lib/analytics-dashboard";
import { getCatalogStatsFromDb } from "@/lib/catalog/catalog-db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin import",
  description: "Внутренний bulk import для загрузки ракеток и офферов в каталог."
};

const SAMPLE_PAYLOAD = JSON.stringify(
  [
    {
      externalKey: "head-gravity-pro-26",
      slug: "head-gravity-pro-26",
      brand: "Head",
      model: "Gravity Pro",
      fullName: "Head Gravity Pro 2026",
      season: 2026,
      shape: "round",
      skillLevel: "advanced",
      playStyle: "control",
      hardness: "medium",
      weight: 365,
      balance: "low",
      sweetSpot: "large",
      faceMaterial: "Hybrid Carbon",
      frameMaterial: "Carbon",
      coreMaterial: "Control Foam",
      verdict: "Контрольная рама для игроков, которым нужен более собранный feel и стабильный sweet spot.",
      whoItFits: "Тем, кто строит розыгрыш через placement, volley control и defence-to-attack transitions.",
      pros: ["плотный контроль", "стабильность в блоке", "широкий sweet spot"],
      cons: ["меньше free power", "новичкам может казаться требовательной"],
      imageUrl: "/rackets/head-gravity-pro-26.svg",
      offers: [
        {
          merchant: "Padel Pro Shop",
          url: "https://example.com/head-gravity-pro-26",
          currency: "EUR",
          price: 319,
          previousPrice: 339,
          availability: "limited",
          stockNote: "Low stock",
          lastCheckedAt: "2026-06-27T08:00:00.000Z"
        },
        {
          merchant: "Court Side Deals",
          url: "https://example.com/head-gravity-pro-26-deal",
          currency: "EUR",
          price: 309,
          previousPrice: 329,
          availability: "in_stock",
          stockNote: "Best current deal",
          lastCheckedAt: "2026-06-27T08:05:00.000Z"
        }
      ]
    }
  ],
  null,
  2
);

export default async function AdminImportPage() {
  const [stats, funnelDashboard, importRuns] = await Promise.all([
    getCatalogStatsFromDb(),
    getFunnelDashboardFromDb(),
    getImportRunsFromDb()
  ]);

  return (
    <main className="page-shell">
      <nav className="compare-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Rackets</Link>
        <span>/</span>
        <span>Admin</span>
        <span>/</span>
        <span>Import</span>
      </nav>

      <section className="hero-card compare-hero">
        <div>
          <p className="eyebrow">Catalog ops</p>
          <h1>Import console</h1>
          <p className="hero-text">
            Внутренний экран для bulk upsert ракеток и multi-offer данных прямо в Prisma, без ручной правки demo seed.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <span>Текущий каталог</span>
            <strong>{stats.total} моделей</strong>
          </div>
          <div className="metric-card">
            <span>Брендов</span>
            <strong>{stats.brands.length}</strong>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Admin navigation</p>
            <h2>Ops entrypoints</h2>
            <p className="panel-text">Из админки уже можно управлять не только каталогом, но и входящими product leads.</p>
          </div>
          <Link href="/admin/leads" className="button button-primary">
            Открыть lead inbox
          </Link>
        </div>
      </section>

      <AdminImportConsole samplePayload={SAMPLE_PAYLOAD} />
      <AdminImportHistory runs={importRuns} />
      <FunnelDashboard data={funnelDashboard} />
    </main>
  );
}
