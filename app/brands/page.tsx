import type { Metadata } from "next";
import Link from "next/link";

import { AnalyticsPageView } from "@/components/analytics-page-view";
import { getBrandSummariesFromDb } from "@/lib/catalog/catalog-db";

export const metadata: Metadata = {
  title: "Бренды | PadelCompare CIS",
  description: "Все бренды в каталоге PadelCompare CIS: размеры линеек, сезоны и ценовые диапазоны."
};

export default async function BrandsIndexPage() {
  const brands = await getBrandSummariesFromDb();

  return (
    <main className="page-shell">
      <AnalyticsPageView page="brands_index" stage="discovery" source="brands_index" intent="browse_brands" />
      <nav className="compare-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Ракетки</Link>
        <span>/</span>
        <span>Бренды</span>
      </nav>

      <section className="hero-card product-hero">
        <div>
          <p className="eyebrow">Бренды</p>
          <h1>Открывай рынок через брендовые линейки.</h1>
          <p className="hero-text">
            Полезно для тех, кто уже знает производителя и хочет быстро посмотреть весь его сегмент, диапазон цен и объём линейки.
          </p>
        </div>
        <div className="hero-metrics">
          <div className="metric-card">
            <span>Бренды</span>
            <strong>{brands.length}</strong>
          </div>
          <div className="metric-card">
            <span>Самая большая линейка</span>
            <strong>{brands[0]?.count ?? 0} моделей</strong>
          </div>
        </div>
      </section>

      <section className="detail-related-grid">
        {brands.map((brand) => (
          <article key={brand.slug} className="detail-related-item">
            <div className="detail-related-copy">
              <p>Бренд</p>
              <h3>
                <Link href={`/brands/${brand.slug}`}>{brand.name}</Link>
              </h3>
              <span>
                {brand.count} моделей · последний сезон {brand.latestSeason} · EUR {brand.minPrice}-{brand.maxPrice}
              </span>
            </div>
            <div className="detail-related-actions">
              <Link href={`/brands/${brand.slug}`} className="button button-primary">
                Открыть бренд
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
