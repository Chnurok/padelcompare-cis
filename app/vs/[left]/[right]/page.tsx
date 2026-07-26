import type { Metadata } from "next/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AffiliateDisclosure } from "@/components/affiliate-disclosure";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { getCompareSetFromDb } from "@/lib/catalog/catalog-db";
import { getAverageScore, getMetricScore, scoreLabel } from "@/lib/catalog/recommendation";
import { getRacketImageAlt } from "@/lib/catalog/racket-media";
import { getSeoVsPage, SEO_VS_PAGES } from "@/lib/seo/landing-pages";

type PageProps = {
  params: Promise<{
    left: string;
    right: string;
  }>;
};

const HIGHLIGHTS = [
  { key: "power", label: "Power" },
  { key: "control", label: "Control" },
  { key: "comfort", label: "Comfort" },
  { key: "maneuverability", label: "Maneuverability" }
] as const;

export function generateStaticParams() {
  return SEO_VS_PAGES.map((page) => ({ left: page.left, right: page.right }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { left, right } = await params;
  const page = getSeoVsPage(left, right);

  if (!page) {
    return { title: "VS page not found" };
  }

  return {
    title: page.title,
    description: page.description
  };
}

export default async function VsPage({ params }: PageProps) {
  const { left, right } = await params;
  const page = getSeoVsPage(left, right);
  if (!page) notFound();

  const rackets = await getCompareSetFromDb([left, right]);
  if (rackets.length < 2) notFound();

  return (
    <main className="page-shell">
      <AnalyticsPageView
        page={`seo-vs:${left}:${right}`}
        compareIds={rackets.map((item) => item.id)}
        stage="acquisition"
        source="seo_vs"
        intent="compare_specific_models"
      />
      <nav className="compare-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Rackets</Link>
        <span>/</span>
        <span>VS</span>
        <span>/</span>
        <span>{page.title}</span>
      </nav>

      <section className="hero-card compare-hero">
        <div>
          <p className="eyebrow">VS landing</p>
          <h1>{page.title}</h1>
          <p className="hero-text">{page.description}</p>
          <p className="panel-text">{page.intro}</p>
        </div>
        <Link href={`/compare?ids=${rackets.map((item) => item.id).join(",")}`} className="button button-primary">
          Открыть full compare
        </Link>
      </section>

      <section className="compare-cards-grid">
        {rackets.map((racket) => (
          <article key={racket.id} className="compare-racket-card">
            <div className="compare-score">{getAverageScore(racket)}</div>
            <div className="compare-score-label">{scoreLabel(getAverageScore(racket))}</div>
            <div className="compare-racket-visual">
              <Image src={racket.imageUrl} alt={getRacketImageAlt(racket.fullName)} width={480} height={600} />
            </div>
            <div className="compare-racket-copy">
              <p>
                {racket.brand} / {racket.season}
              </p>
              <h2>
                <Link href={`/rackets/${racket.id}`}>{racket.fullName}</Link>
              </h2>
              <span>{racket.whoItFits}</span>
            </div>
            <ul className="compare-points">
              {HIGHLIGHTS.map((item) => (
                <li key={`${racket.id}-${item.key}`}>
                  {item.label}: {getMetricScore(racket, item.key)}
                </li>
              ))}
            </ul>
            <div className="compare-price-tag">
              <strong>€{racket.currentPrice}</strong>
              <span>{racket.shopName}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="card detail-card">
        <p className="eyebrow">Следующий шаг</p>
        <h2>Если всё ещё сомневаешься</h2>
        <p>
          Этот `vs`-экран закрывает acquisition intent, но финальное решение удобнее дожать через полный
          compare и персональный подбор с сохранением shortlist.
        </p>
        <div className="hero-actions">
          <Link href={`/compare?ids=${rackets.map((item) => item.id).join(",")}`} className="button button-primary">
            Открыть full compare
          </Link>
          <Link href="/finder#personal-fitting" className="button">
            Попросить персональный подбор
          </Link>
        </div>
        <AffiliateDisclosure compact />
      </section>
    </main>
  );
}
