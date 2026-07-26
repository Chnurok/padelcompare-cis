import type { Metadata } from "next/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnalyticsPageView } from "@/components/analytics-page-view";
import { getBrandSummariesFromDb, getRacketsByBrandSlugFromDb } from "@/lib/catalog/catalog-db";
import { getRacketImageAlt } from "@/lib/catalog/racket-media";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const brands = await getBrandSummariesFromDb();
  return brands.map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brands = await getBrandSummariesFromDb();
  const brand = brands.find((item) => item.slug === slug);

  if (!brand) {
    return { title: "Brand not found" };
  }

  return {
    title: `${brand.name} padel rackets`,
    description: `${brand.name} rackets in the catalog with current price range and direct compare entrypoints.`
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const [brands, rackets] = await Promise.all([
    getBrandSummariesFromDb(),
    getRacketsByBrandSlugFromDb(slug)
  ]);

  const brand = brands.find((item) => item.slug === slug);

  if (!brand || rackets.length === 0) {
    notFound();
  }

  return (
    <main className="page-shell">
      <AnalyticsPageView
        page={`brand:${brand.slug}`}
        stage="discovery"
        source="brand_page"
        intent="browse_brand"
      />
      <nav className="compare-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Rackets</Link>
        <span>/</span>
        <Link href="/brands">Brands</Link>
        <span>/</span>
        <span>{brand.name}</span>
      </nav>

      <section className="hero-card product-hero">
        <div>
          <p className="eyebrow">Brand hub</p>
          <h1>{brand.name}</h1>
          <p className="hero-text">
            Отдельная brand depth страница по {brand.name}: текущие модели, цены и быстрые входы в compare.
          </p>
        </div>
        <div className="hero-metrics">
          <div className="metric-card">
            <span>Моделей</span>
            <strong>{brand.count}</strong>
          </div>
          <div className="metric-card">
            <span>Последний сезон</span>
            <strong>{brand.latestSeason}</strong>
          </div>
          <div className="metric-card">
            <span>Price range</span>
            <strong>€{brand.minPrice} - €{brand.maxPrice}</strong>
          </div>
        </div>
      </section>

      <section className="catalog-grid">
        {rackets.map((racket) => (
          <article key={racket.id} className="racket-card">
            <div className="racket-media">
              <Image src={racket.imageUrl} alt={getRacketImageAlt(racket.fullName)} width={480} height={600} />
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
            <div className="racket-price">
              <strong>€{racket.currentPrice}</strong>
              <span>{racket.shopName}</span>
            </div>
            <div className="racket-actions">
              <Link href={`/rackets/${racket.id}`} className="button">
                Детали
              </Link>
              <a href={`/similar?to=${racket.id}`} className="button">
                Similar
              </a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
