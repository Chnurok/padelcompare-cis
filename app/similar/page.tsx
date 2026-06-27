import type { Metadata } from "next";
import Link from "next/link";

import { AnalyticsPageView } from "@/components/analytics-page-view";
import {
  getRacketBySlugFromDb,
  getRelatedRacketsFromDb,
  listRacketsFromDb
} from "@/lib/catalog/catalog-db";
import { getRacketImageAlt } from "@/lib/catalog/racket-media";
import { getSimilarityScore } from "@/lib/catalog/recommendation";

type PageProps = {
  searchParams: {
    to?: string;
  };
};

export const metadata: Metadata = {
  title: "Similar rackets finder",
  description: "Find similar padel rackets by shape, style, level, hardness, balance, weight and price corridor."
};

export default async function SimilarPage({ searchParams }: PageProps) {
  const rackets = await listRacketsFromDb();
  const selectedId = searchParams.to && rackets.some((item) => item.id === searchParams.to)
    ? searchParams.to
    : rackets[0]?.id;

  const [base, similar] = selectedId
    ? await Promise.all([
        getRacketBySlugFromDb(selectedId),
        getRelatedRacketsFromDb(selectedId, 8)
      ])
    : [null, []];

  return (
    <main className="page-shell">
      <AnalyticsPageView
        page="similar_finder"
        racketId={base?.id}
        stage="evaluation"
        source="similar_tool"
        intent="find_alternatives"
      />
      <nav className="compare-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Rackets</Link>
        <span>/</span>
        <span>Similar finder</span>
      </nav>

      <section className="hero-card compare-hero">
        <div>
          <p className="eyebrow">Similar rackets tool</p>
          <h1>Найди похожие варианты быстро</h1>
          <p className="hero-text">
            Отдельный вход в продукт для сценария “мне нравится эта модель, но хочу ещё 5-8 близких альтернатив”.
          </p>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Base racket</p>
            <h2>Выбери модель</h2>
          </div>
        </div>
        <div className="hero-actions">
          {rackets.slice(0, 16).map((racket) => (
            <a
              key={racket.id}
              href={`/similar?to=${racket.id}`}
              className={`button${racket.id === selectedId ? " button-primary" : ""}`}
            >
              {racket.brand} {racket.model}
            </a>
          ))}
        </div>
      </section>

      {base ? (
        <>
          <section className="hero-card product-hero">
            <div>
              <p className="eyebrow">Selected base</p>
              <h2>{base.fullName}</h2>
              <p className="panel-text">{base.verdict}</p>
            </div>
            <div className="hero-metrics">
              <div className="metric-card">
                <span>Profile</span>
                <strong>{base.shape} · {base.playStyle}</strong>
              </div>
              <div className="metric-card">
                <span>Level</span>
                <strong>{base.skillLevel}</strong>
              </div>
              <div className="metric-card">
                <span>Цена</span>
                <strong>€{base.currentPrice}</strong>
              </div>
            </div>
          </section>

          <section className="catalog-grid">
            {similar.map((racket) => (
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
                  match {getSimilarityScore(base, racket)} · {racket.shape} · {racket.playStyle}
                </p>
                <p className="racket-copy">{racket.whoItFits}</p>
                <div className="racket-price">
                  <strong>€{racket.currentPrice}</strong>
                  <span>{racket.shopName}</span>
                </div>
                <div className="racket-actions">
                  <Link href={`/rackets/${racket.id}`} className="button">
                    Детали
                  </Link>
                  <Link href={`/compare?ids=${base.id},${racket.id}`} className="button">
                    Compare
                  </Link>
                </div>
              </article>
            ))}
          </section>
        </>
      ) : null}
    </main>
  );
}
