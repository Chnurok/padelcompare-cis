import type { Metadata } from "next/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnalyticsPageView } from "@/components/analytics-page-view";
import {
  getMerchantSummariesFromDb,
  getRacketsByMerchantSlugFromDb
} from "@/lib/catalog/catalog-db";
import { formatAvailability, formatPlayStyle, formatShape } from "@/lib/catalog/format";
import { getRacketImageAlt } from "@/lib/catalog/racket-media";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function generateStaticParams() {
  const merchants = await getMerchantSummariesFromDb(32);
  return merchants.map((merchant) => ({ slug: merchant.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const merchants = await getMerchantSummariesFromDb(32);
  const merchant = merchants.find((item) => item.slug === slug);

  if (!merchant) {
    return { title: "Магазин не найден" };
  }

  return {
    title: `${merchant.name} deals`,
    description: `${merchant.name} offers in the catalog with current deal coverage and compare entrypoints.`
  };
}

export default async function ShopMerchantPage({ params }: PageProps) {
  const { slug } = await params;
  const [merchants, rackets] = await Promise.all([
    getMerchantSummariesFromDb(32),
    getRacketsByMerchantSlugFromDb(slug)
  ]);

  const merchant = merchants.find((item) => item.slug === slug);

  if (!merchant || rackets.length === 0) {
    notFound();
  }

  return (
    <main className="page-shell">
      <AnalyticsPageView page={`merchant:${merchant.slug}`} stage="discovery" source="merchant_page" intent="browse_merchant_deals" />
      <nav className="compare-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Ракетки</Link>
        <span>/</span>
        <Link href="/deals">Скидки</Link>
        <span>/</span>
        <span>{merchant.name}</span>
      </nav>

      <section className="hero-card product-hero">
        <div>
          <p className="eyebrow">Страница магазина</p>
          <h1>{merchant.name}</h1>
          <p className="hero-text">
            Отдельный market-entity слой: какие модели у этого merchant сейчас видны в каталоге и где у него самые заметные price cuts.
          </p>
        </div>
        <div className="hero-metrics">
          <div className="metric-card">
            <span>Предложения</span>
            <strong>{merchant.offers}</strong>
          </div>
          <div className="metric-card">
            <span>Ракетки</span>
            <strong>{merchant.rackets}</strong>
          </div>
          <div className="metric-card">
            <span>Лучшая скидка</span>
            <strong>{merchant.bestDiscountPercent}%</strong>
          </div>
        </div>
      </section>

      <section className="catalog-grid">
        {rackets.map((racket) => {
          const merchantOffer = racket.offers.find((offer) => slugify(offer.merchant) === slug);
          const compareMate = rackets.find((item) => item.id !== racket.id);
          const previousPrice = merchantOffer?.previousPrice ?? merchantOffer?.price ?? racket.currentPrice;
          const discountAmount = Math.max(0, previousPrice - (merchantOffer?.price ?? racket.currentPrice));
          const discountPercent = previousPrice > 0 ? Math.round((discountAmount / previousPrice) * 100) : 0;

          return (
            <article key={racket.id} className="racket-card">
              <div className="racket-media">
                <Image src={racket.imageUrl} alt={getRacketImageAlt(racket.fullName)} width={480} height={600} />
              </div>
              <div className="racket-head">
                <p>{racket.brand}</p>
                <h3>
                  <Link href={`/rackets/${racket.id}`}>{racket.fullName}</Link>
                </h3>
              </div>
              <p className="racket-meta">
                скидка EUR {discountAmount} ({discountPercent}%) · {formatShape(racket.shape)} · {formatPlayStyle(racket.playStyle)}
              </p>
              <p className="racket-copy">{racket.verdict}</p>
              <div className="racket-pills">
                <span>{merchant.name}</span>
                <span>сейчас EUR {merchantOffer?.price ?? racket.currentPrice}</span>
                <span>{formatAvailability(merchantOffer?.availability ?? "in_stock")}</span>
              </div>
              <div className="racket-actions">
                <Link href={`/rackets/${racket.id}`} className="button">
                  Детали
                </Link>
                {compareMate ? (
                  <Link href={`/compare?ids=${racket.id},${compareMate.id}`} className="button">
                    Сравнить
                  </Link>
                ) : null}
                <a href={merchantOffer?.url ?? racket.shopUrl} className="button button-primary" target="_blank" rel="noreferrer">
                  Открыть
                </a>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
