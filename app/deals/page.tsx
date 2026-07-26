import type { Metadata } from "next/types";
import Image from "next/image";
import Link from "next/link";

import { AnalyticsPageView } from "@/components/analytics-page-view";
import {
  getMerchantSummariesFromDb,
  getTopDealsFromDb
} from "@/lib/catalog/catalog-db";
import { getRacketImageAlt } from "@/lib/catalog/racket-media";

export const metadata: Metadata = {
  title: "Скидки | PadelCompare CIS",
  description: "Отдельный экран скидок: где сейчас самые заметные предложения, у каких магазинов и по каким моделям."
};

export default async function DealsPage() {
  const [topDeals, merchants] = await Promise.all([getTopDealsFromDb(18), getMerchantSummariesFromDb(8)]);

  return (
    <main className="page-shell">
      <AnalyticsPageView page="deals" stage="discovery" source="deals_marketplace" intent="browse_deals" />
      <nav className="compare-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Ракетки</Link>
        <span>/</span>
        <span>Скидки</span>
      </nav>

      <section className="hero-card investor-hero app-preview-hero">
        <div className="investor-copy">
          <p className="eyebrow">Скидки</p>
          <h1>Отдельный экран для лучших цен и скидок.</h1>
          <p className="hero-text">
            Здесь вход в продукт идёт не от бренда, а от текущей выгоды на рынке: заметные скидки,
            магазины и быстрые переходы в сравнение.
          </p>
          <div className="hero-actions">
            <Link href="/finder" className="button button-primary">
              Подбор под себя
            </Link>
            <Link href="/compare?ids=nox-at10-18k-25,bullpadel-vertex-04-25" className="button">
              Открыть пример сравнения
            </Link>
          </div>
        </div>

        <div className="investor-proof">
          <div className="proof-card">
            <span>Живые скидки</span>
            <strong>{topDeals.length}</strong>
          </div>
          <div className="proof-card">
            <span>Магазины</span>
            <strong>{merchants.length}</strong>
          </div>
          <div className="proof-card">
            <span>Лучшая видимая скидка</span>
            <strong>{merchants[0]?.bestDiscountPercent ?? 0}%</strong>
          </div>
        </div>
      </section>

      <section className="investor-grid">
        {merchants.map((merchant) => (
          <article key={merchant.slug} className="investor-panel">
            <p className="eyebrow">Магазин</p>
            <h2>{merchant.name}</h2>
            <p>
              {merchant.offers} предложений по {merchant.rackets} ракеткам. Лучшая видимая скидка сейчас: {merchant.bestDiscountPercent}%.
            </p>
            <Link href={`/shops/${merchant.slug}`} className="text-link">
              Открыть страницу магазина
            </Link>
          </article>
        ))}
      </section>

      <section className="catalog-grid">
        {topDeals.map((racket) => {
          const compareMate = topDeals.find((item) => item.id !== racket.id && item.brand !== racket.brand) ?? topDeals.find((item) => item.id !== racket.id);

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
                скидка EUR {racket.discountAmount} ({racket.discountPercent}%) · {racket.shape} · {racket.playStyle}
              </p>
              <p className="racket-copy">{racket.verdict}</p>
              <div className="racket-pills">
                <span>{racket.shopName}</span>
                <span>сейчас EUR {racket.currentPrice}</span>
                <span>было EUR {racket.offers[0]?.previousPrice ?? racket.currentPrice}</span>
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
                <a href={racket.shopUrl} className="button button-primary" target="_blank" rel="noreferrer">
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
