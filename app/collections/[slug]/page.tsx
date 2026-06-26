import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnalyticsPageView } from "@/components/analytics-page-view";
import { getCatalogStatsFromDb, listRacketsFromDb } from "@/lib/catalog/catalog-db";
import { getCollectionBySlug } from "@/lib/catalog/collections";
import { getRacketImageAlt } from "@/lib/catalog/racket-media";

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const collection = getCollectionBySlug(params.slug);

  if (!collection) {
    return {
      title: "Подборка не найдена"
    };
  }

  return {
    title: collection.title,
    description: collection.description
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const collection = getCollectionBySlug(params.slug);

  if (!collection) {
    notFound();
  }

  const [rackets, stats] = await Promise.all([listRacketsFromDb(), getCatalogStatsFromDb()]);
  const items = rackets.filter(collection.criteria);
  const compareHref =
    items.length >= 2
      ? (`/compare?ids=${items
          .slice(0, 3)
          .map((item) => item.id)
          .join(",")}` as const)
      : null;

  return (
    <main className="page-shell">
      <AnalyticsPageView page={`collection:${collection.slug}`} />
      <nav className="compare-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Rackets</Link>
        <span>/</span>
        <span>Collections</span>
        <span>/</span>
        <span>{collection.title}</span>
      </nav>

      <section className="hero-card product-hero">
        <div>
          <p className="eyebrow">Collection</p>
          <h1>{collection.title}</h1>
          <p className="hero-text">{collection.description}</p>
          <p className="panel-text">{collection.intro}</p>
          <div className="hero-actions">
            {compareHref ? (
              <Link href={compareHref} className="button button-primary">
                Открыть sample compare
              </Link>
            ) : null}
            <Link href="/" className="button">
              Вернуться в каталог
            </Link>
          </div>
        </div>
        <div className="hero-metrics">
          <div className="metric-card">
            <span>В подборке</span>
            <strong>{items.length} моделей</strong>
          </div>
          <div className="metric-card">
            <span>Всего в каталоге</span>
            <strong>{stats.total} моделей</strong>
          </div>
          <div className="metric-card">
            <span>Ценовой коридор</span>
            <strong>€{stats.minPrice} - €{stats.maxPrice}</strong>
          </div>
        </div>
      </section>

      <section className="catalog-grid">
        {items.map((racket) => (
          <article key={racket.id} className="racket-card">
            <div className="racket-media">
              <img src={racket.imageUrl} alt={getRacketImageAlt(racket.fullName)} />
            </div>
            <div className="racket-head">
              <p>{racket.brand}</p>
              <h3>
                <Link href={`/rackets/${racket.id}`}>{racket.model}</Link>
              </h3>
            </div>
            <p className="racket-meta">
              {racket.shape} · {racket.playStyle} · {racket.hardness}
            </p>
            <p className="racket-copy">{racket.verdict}</p>
            <div className="racket-pills">
              <span>{racket.skillLevel}</span>
              <span>{racket.balance} balance</span>
              <span>{racket.weight} g</span>
            </div>
            <div className="racket-price">
              <strong>€{racket.currentPrice}</strong>
              <span>{racket.shopName}</span>
            </div>
            <div className="racket-actions">
              <Link href={`/rackets/${racket.id}`} className="button">
                Детали
              </Link>
              {items.find((item) => item.id !== racket.id) ? (
                <Link
                  href={`/compare?ids=${racket.id},${items.find((item) => item.id !== racket.id)!.id}`}
                  className="button"
                >
                  В compare
                </Link>
              ) : (
                <a href={`/rackets/${racket.id}#compare-builder`} className="button">
                  Собрать compare
                </a>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
