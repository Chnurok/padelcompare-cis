import type { Metadata } from "next/types";
import Link from "next/link";

import { AnalyticsPageView } from "@/components/analytics-page-view";
import { getCatalogStatsFromDb, listRacketsFromDb } from "@/lib/catalog/catalog-db";
import { COLLECTIONS } from "@/lib/catalog/collections";

export const metadata: Metadata = {
  title: "Collections | PadelCompare CIS",
  description: "Curated collection hubs: beginner-friendly, control, power and value-led padel racket shortlists."
};

export default async function CollectionsIndexPage() {
  const [rackets, stats] = await Promise.all([listRacketsFromDb(), getCatalogStatsFromDb()]);
  const items = COLLECTIONS.map((collection) => ({
    ...collection,
    count: rackets.filter(collection.criteria).length
  }));

  return (
    <main className="page-shell">
      <AnalyticsPageView
        page="collections_index"
        stage="discovery"
        source="collections_index"
        intent="browse_collections"
      />
      <nav className="compare-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Rackets</Link>
        <span>/</span>
        <span>Collections</span>
      </nav>

      <section className="hero-card product-hero">
        <div>
          <p className="eyebrow">Collections hub</p>
          <h1>Готовые подборки под частые сценарии выбора.</h1>
          <p className="hero-text">
            Если пользователь ещё не знает точную модель, ему проще зайти через готовый use-case:
            контроль, power, первый апгрейд или сильный value до определённого бюджета.
          </p>
        </div>
        <div className="hero-metrics">
          <div className="metric-card">
            <span>Collections</span>
            <strong>{items.length}</strong>
          </div>
          <div className="metric-card">
            <span>Catalog size</span>
            <strong>{stats.total} models</strong>
          </div>
          <div className="metric-card">
            <span>Largest collection</span>
            <strong>{Math.max(...items.map((item) => item.count), 0)} models</strong>
          </div>
        </div>
      </section>

      <section className="detail-related-grid">
        {items.map((collection) => (
          <article key={collection.slug} className="detail-related-item">
            <div className="detail-related-copy">
              <p>Collection</p>
              <h3>
                <Link href={`/collections/${collection.slug}`}>{collection.title}</Link>
              </h3>
              <span>{collection.count} models</span>
              <p className="panel-text">{collection.description}</p>
            </div>
            <div className="detail-related-actions">
              <Link href={`/collections/${collection.slug}`} className="button button-primary">
                Открыть подборку
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
