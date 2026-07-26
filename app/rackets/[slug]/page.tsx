import type { Metadata } from "next/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AffiliateDisclosure } from "@/components/affiliate-disclosure";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { RacketDetailCompare } from "@/components/racket-detail-compare";
import { TrackedOutboundLink } from "@/components/tracked-outbound-link";
import { getRacketBySlugFromDb, getRelatedRacketsFromDb } from "@/lib/catalog/catalog-db";
import { formatAvailability, formatBalance, formatHardness, formatPlayStyle, formatShape, formatSkillLevel, formatSweetSpot } from "@/lib/catalog/format";
import { getRacketImageAlt } from "@/lib/catalog/racket-media";
import { getAverageScore, getSimilarityScore, scoreLabel } from "@/lib/catalog/recommendation";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function buildProfile(racket: Awaited<ReturnType<typeof getRacketBySlugFromDb>>) {
  if (!racket) return [];

  return [
    { label: "Форма", value: formatShape(racket.shape) },
    { label: "Профиль", value: formatPlayStyle(racket.playStyle) },
    { label: "Уровень", value: formatSkillLevel(racket.skillLevel) },
    { label: "Баланс", value: formatBalance(racket.balance) }
  ];
}

function buildSpecs(racket: Awaited<ReturnType<typeof getRacketBySlugFromDb>>) {
  if (!racket) return [];

  return [
    { label: "Сезон", value: String(racket.season) },
    { label: "Вес", value: `${racket.weight} g` },
    { label: "Жесткость", value: formatHardness(racket.hardness) },
    { label: "Сладкая точка", value: formatSweetSpot(racket.sweetSpot) },
    { label: "Поверхность", value: racket.faceMaterial },
    { label: "Рама", value: racket.frameMaterial },
    { label: "Сердцевина", value: racket.coreMaterial }
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const racket = await getRacketBySlugFromDb(slug);

  if (!racket) {
    return {
      title: "Ракетка не найдена"
    };
  }

  return {
    title: racket.fullName,
    description: `${racket.verdict} ${racket.whoItFits}`,
    openGraph: {
      title: `${racket.fullName} | PadelCompare CIS`,
      description: racket.verdict,
      images: [{ url: racket.imageUrl }]
    }
  };
}

export default async function RacketDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [racket, relatedRackets] = await Promise.all([
    getRacketBySlugFromDb(slug),
    getRelatedRacketsFromDb(slug, 3)
  ]);

  if (!racket) {
    notFound();
  }

  const profile = buildProfile(racket);
  const specs = buildSpecs(racket);
  const starterCompareHref = relatedRackets[0]
    ? (`/compare?ids=${racket.id},${relatedRackets[0].id}` as const)
    : null;

  return (
    <main className="page-shell">
      <AnalyticsPageView
        page="detail"
        racketId={racket.id}
        stage="evaluation"
        source="racket_detail"
        intent="inspect_model"
      />
      <nav className="compare-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Ракетки</Link>
        <span>/</span>
        <span>{racket.brand}</span>
        <span>/</span>
        <span>{racket.model}</span>
      </nav>

      <section className="hero-card racket-detail-hero">
        <div className="racket-detail-copy">
          <p className="eyebrow">Профиль ракетки</p>
          <h1>{racket.fullName}</h1>
          <p className="hero-text">{racket.verdict}</p>

          <div className="racket-detail-pills">
            {profile.map((item) => (
              <span key={item.label}>
                <strong>{item.label}:</strong> {item.value}
              </span>
            ))}
          </div>

          <div className="racket-detail-actions">
            <TrackedOutboundLink
              href={racket.shopUrl}
              target="_blank"
              rel="noreferrer"
              className="button button-primary"
              page="detail"
              racketId={racket.id}
              intent="visit_offer"
              meta={{
                merchant: racket.shopName
              }}
              source="hero_offer_cta"
              stage="offer"
            >
              Смотреть оффер за €{racket.currentPrice}
            </TrackedOutboundLink>
            {starterCompareHref ? (
              <Link href={starterCompareHref} className="button">
                Сравнить с {relatedRackets[0].brand}
              </Link>
            ) : (
              <a href="#compare-builder" className="button">
                Собрать compare
              </a>
            )}
            <a href={`/similar?to=${racket.id}`} className="button">
              Найти похожие
            </a>
              <Link href="/finder" className="button">
              Открыть подбор
            </Link>
          </div>
        </div>

        <div className="racket-detail-visual">
          <Image src={racket.imageUrl} alt={getRacketImageAlt(racket.fullName)} width={640} height={800} priority />
        </div>
      </section>

      <section className="racket-detail-grid">
        <article className="card detail-card">
          <p className="eyebrow">Кому подходит</p>
          <h2>Кому подойдет</h2>
          <p>{racket.whoItFits}</p>
        </article>

        <article className="card detail-card">
          <p className="eyebrow">Оценка</p>
          <h2>{scoreLabel(getAverageScore(racket))} по профилю</h2>
          <p>
            Общий профиль модели сейчас оценивается в {getAverageScore(racket)}. Это уже идёт из общего
            scoring engine, который одновременно питает сравнение и рекомендации на главной.
          </p>
        </article>

        <article className="card detail-card">
          <p className="eyebrow">Следующий шаг</p>
          <h2>Нужен более точный shortlist?</h2>
          <p>
            Если выбираешь не эту модель конкретно, а класс ракетки под свой стиль, открой подбор и
            собери подбор уже от профиля игрока, бюджета и feel.
          </p>
          <div className="hero-actions">
            <Link href="/finder" className="button button-primary">
              Перейти в подбор
            </Link>
          </div>
        </article>

        <article className="card detail-card">
          <p className="eyebrow">Источник данных</p>
          <h2>Откуда эти данные</h2>
          <p>
            Источник: {racket.sourceLabel ?? "неизвестен"}
            {racket.importedAt ? ` · импорт ${racket.importedAt.slice(0, 10)}` : ""}
          </p>
        </article>
      </section>

      <section className="card detail-list-card">
        <p className="eyebrow">Предложения</p>
        <h2>Где покупать</h2>
        <AffiliateDisclosure compact />
        <ul className="detail-list">
          {racket.offers.map((offer) => (
            <li key={`${offer.merchant}-${offer.url}`}>
              <TrackedOutboundLink
                href={offer.url}
                target="_blank"
                rel="noreferrer"
                page="detail"
                racketId={racket.id}
                intent="visit_offer"
                meta={{ merchant: offer.merchant, price: offer.price }}
                source="offers_list"
                stage="offer"
              >
                {offer.merchant}
              </TrackedOutboundLink>{" "}
              · €{offer.price}
              {offer.isAffiliate ? " · affiliate" : ""}
              {offer.previousPrice ? ` (было €${offer.previousPrice})` : ""}
              {offer.stockNote ? ` · ${offer.stockNote}` : ""}
              {offer.lastCheckedAt ? ` · проверено ${offer.lastCheckedAt.slice(0, 10)}` : ""}
              {offer.sourceLabel ? ` · источник ${offer.sourceLabel}` : ""}
              {` · ${formatAvailability(offer.availability)}`}
            </li>
          ))}
        </ul>
      </section>

      <section className="card detail-list-card">
        <p className="eyebrow">История цены</p>
        <h2>Последние изменения цены</h2>
        <ul className="detail-list">
          {racket.offers.flatMap((offer) =>
            offer.priceHistory.slice(0, 2).map((entry) => (
              <li key={`${offer.merchant}-${entry.capturedAt}`}>
                {offer.merchant} · €{entry.price} · {formatAvailability(entry.availability)} ·{" "}
                {entry.capturedAt.slice(0, 10)}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="racket-detail-grid detail-split">
        <article className="card detail-list-card">
          <p className="eyebrow">Upsides</p>
          <h2>Что хорошо</h2>
          <ul className="detail-list">
            {racket.pros.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="card detail-list-card">
          <p className="eyebrow">Trade-offs</p>
          <h2>Что учитывать</h2>
          <ul className="detail-list">
            {racket.cons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card detail-specs-card">
        <p className="eyebrow">Specs</p>
        <h2>Характеристики</h2>
        <div className="detail-specs-grid">
          {specs.map((item) => (
            <div key={item.label} className="detail-spec">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <div id="compare-builder">
        <RacketDetailCompare current={racket} candidates={relatedRackets} />
      </div>

      <section className="card detail-related-card">
        <div className="detail-related-head">
          <div>
            <p className="eyebrow">Related rackets</p>
            <h2>Похожие варианты</h2>
            <p className="panel-text">
              Подобрал ближайшие модели по shape, style, level, hardness и ценовому коридору.
            </p>
          </div>
        </div>

        <div className="detail-related-grid">
          {relatedRackets.map((item) => (
            <article key={item.id} className="detail-related-item">
              <div className="detail-related-media">
                <Image src={item.imageUrl} alt={getRacketImageAlt(item.fullName)} width={480} height={600} />
              </div>
              <div className="detail-related-copy">
                <p>{item.brand}</p>
                <h3>
                  <Link href={`/rackets/${item.id}`}>{item.model}</Link>
                </h3>
                <span>
                  {item.shape} · {item.playStyle} · €{item.currentPrice} · match {getSimilarityScore(racket, item)}
                </span>
              </div>
              <div className="detail-related-actions">
                <Link href={`/rackets/${item.id}`} className="button">Детали</Link>
                <Link href={`/compare?ids=${racket.id},${item.id}`} className="button button-primary">
                  Сравнить
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
