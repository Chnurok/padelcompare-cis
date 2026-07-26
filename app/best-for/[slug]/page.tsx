import type { Metadata } from "next/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnalyticsPageView } from "@/components/analytics-page-view";
import { listRacketsFromDb } from "@/lib/catalog/catalog-db";
import { getAverageScore, scoreLabel } from "@/lib/catalog/recommendation";
import { getRacketImageAlt } from "@/lib/catalog/racket-media";
import {
  getSeoCategoryPage,
  getSeoCategoryRecommendations,
  SEO_CATEGORY_PAGES
} from "@/lib/seo/landing-pages";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return SEO_CATEGORY_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoCategoryPage(slug);

  if (!page) {
    return { title: "SEO page not found" };
  }

  return {
    title: page.title,
    description: page.description
  };
}

export default async function BestForPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSeoCategoryPage(slug);
  if (!page) notFound();

  const rackets = await listRacketsFromDb();
  const items = getSeoCategoryRecommendations(rackets, slug, 4);
  const compareHref =
    items.length >= 2 ? `/compare?ids=${items.slice(0, 3).map((item) => item.id).join(",")}` : null;
  const faq = [
    {
      question: `Как выбрать страницу ${page.title}?`,
      answer: "Сначала смотри на форму, feel и роль ракетки в розыгрыше, а потом уже на бренд и цену."
    },
    {
      question: "Нужно ли сразу идти в compare?",
      answer: "Да, если shortlist уже сузился до 2-3 моделей. Так быстрее видно реальные trade-offs."
    }
  ];

  return (
    <main className="page-shell">
      <AnalyticsPageView
        page={`seo:${page.slug}`}
        stage="acquisition"
        source="seo_landing"
        intent="discover_recommendations"
      />
      <nav className="compare-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Rackets</Link>
        <span>/</span>
        <Link href="/best-for">Best for</Link>
        <span>/</span>
        <span>{page.title}</span>
      </nav>

      <section className="hero-card product-hero">
        <div>
          <p className="eyebrow">SEO landing</p>
          <h1>{page.title}</h1>
          <p className="hero-text">{page.description}</p>
          <p className="panel-text">{page.intro}</p>
          <div className="hero-actions">
            {compareHref ? (
              <a href={compareHref} className="button button-primary">
                {page.compareTitle}
              </a>
            ) : null}
            <Link href="/" className="button">
              Открыть весь каталог
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer
              }
            }))
          })
        }}
      />

      <section className="catalog-grid">
        {items.map((racket) => {
          const totalScore = getAverageScore(racket);
          const compareMate = items.find((item) => item.id !== racket.id);

          return (
            <article key={racket.id} className="racket-card">
              <div className="racket-media">
                <Image src={racket.imageUrl} alt={getRacketImageAlt(racket.fullName)} width={480} height={600} />
              </div>
              <div className="racket-head">
                <p>{racket.brand}</p>
                <h2>
                  <Link href={`/rackets/${racket.id}`}>{racket.fullName}</Link>
                </h2>
              </div>
              <p className="racket-copy">{racket.verdict}</p>
              <div className="racket-pills">
                <span>{scoreLabel(totalScore)} {totalScore}</span>
                <span>{racket.shape}</span>
                <span>{racket.playStyle}</span>
              </div>
              <div className="racket-price">
                <strong>€{racket.currentPrice}</strong>
                <span>{racket.shopName}</span>
              </div>
              <div className="racket-actions">
                <Link href={`/rackets/${racket.id}`} className="button">
                  Детали
                </Link>
                {compareMate ? (
                  <Link href={`/compare?ids=${racket.id},${compareMate.id}`} className="button">
                    Compare
                  </Link>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>

      <section className="card detail-list-card">
        <p className="eyebrow">FAQ</p>
        <h2>Что обычно хочет понять человек с этим запросом</h2>
        <ul className="detail-list">
          {faq.map((item) => (
            <li key={item.question}>
              <strong>{item.question}</strong> {item.answer}
            </li>
          ))}
        </ul>
        <div className="hero-actions">
          <Link href="/finder#personal-fitting" className="button button-primary">
            Получить персональный shortlist
          </Link>
        </div>
      </section>
    </main>
  );
}
