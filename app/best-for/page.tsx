import type { Metadata } from "next";
import Link from "next/link";

import { AnalyticsPageView } from "@/components/analytics-page-view";
import { listRacketsFromDb } from "@/lib/catalog/catalog-db";
import { getSeoCategoryRecommendations, SEO_CATEGORY_PAGES } from "@/lib/seo/landing-pages";

export const metadata: Metadata = {
  title: "Best For | PadelCompare CIS",
  description: "Intent-led landing hub for beginner, control, power and value-focused padel racket discovery."
};

export default async function BestForIndexPage() {
  const rackets = await listRacketsFromDb();
  const pages = SEO_CATEGORY_PAGES.map((page) => ({
    ...page,
    picks: getSeoCategoryRecommendations(rackets, page.slug, 3)
  }));

  return (
    <main className="page-shell">
      <AnalyticsPageView page="best_for_index" stage="acquisition" source="best_for_index" intent="browse_intents" />
      <nav className="compare-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Rackets</Link>
        <span>/</span>
        <span>Best for</span>
      </nav>

      <section className="hero-card product-hero">
        <div>
          <p className="eyebrow">Intent hub</p>
          <h1>Заход в каталог от задачи игрока, а не от случайной модели.</h1>
          <p className="hero-text">
            Эти страницы работают как SEO и buyer-intent слой: помогают быстро перейти к полке под
            новичка, control-first игру, power profile или value budget.
          </p>
        </div>
        <div className="hero-metrics">
          <div className="metric-card">
            <span>Intent pages</span>
            <strong>{pages.length}</strong>
          </div>
          <div className="metric-card">
            <span>Featured picks</span>
            <strong>{pages.reduce((sum, page) => sum + page.picks.length, 0)}</strong>
          </div>
        </div>
      </section>

      <section className="detail-related-grid">
        {pages.map((page) => (
          <article key={page.slug} className="detail-related-item">
            <div className="detail-related-copy">
              <p>Best for</p>
              <h3>
                <Link href={`/best-for/${page.slug}`}>{page.title}</Link>
              </h3>
              <span>{page.picks.length} рекомендаций готовы</span>
              <p className="panel-text">{page.description}</p>
              {page.picks.length ? (
                <p className="panel-text">
                  {page.picks.map((racket) => racket.model).join(" · ")}
                </p>
              ) : null}
            </div>
            <div className="detail-related-actions">
              <Link href={`/best-for/${page.slug}`} className="button button-primary">
                Открыть intent page
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
