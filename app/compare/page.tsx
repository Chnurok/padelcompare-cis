import type { Metadata } from "next/types";
import Image from "next/image";
import Link from "next/link";

import { AffiliateDisclosure } from "@/components/affiliate-disclosure";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { TrackedOutboundLink } from "@/components/tracked-outbound-link";
import { getCompareSetFromDb } from "@/lib/catalog/catalog-db";
import type { CatalogRacket } from "@/lib/catalog/catalog-db";
import { getRacketImageAlt } from "@/lib/catalog/racket-media";
import {
  getAverageScore,
  getCompareEdgeHighlights,
  getMetricScore,
  getPlayerFitLabel,
  RATING_ROWS,
  type RatingKey,
  scoreLabel,
  getTradeoffNote,
  getValueScore
} from "@/lib/catalog/recommendation";

type PageProps = {
  searchParams: Promise<{
    ids?: string;
  }>;
};

function normalizeIds(value: string | undefined) {
  return [...new Set((value ?? "").split(",").map((item) => item.trim()).filter(Boolean))].slice(0, 4);
}

const FIELDS: Array<[string, string]> = [
  ["Бренд", "brand"],
  ["Модель", "model"],
  ["Год", "season"],
  ["Форма", "shape"],
  ["Вес", "weight"],
  ["Баланс", "balance"],
  ["Жесткость", "hardness"],
  ["Поверхность", "faceMaterial"],
  ["Рама", "frameMaterial"],
  ["Сердцевина", "coreMaterial"],
  ["Уровень", "skillLevel"],
  ["Профиль", "playStyle"],
  ["Сладкая точка", "sweetSpot"],
  ["Цена", "currentPrice"]
];

type InsightCard = {
  title: string;
  value: string;
  note: string;
};

type DecisionAngle = {
  title: string;
  winner: string;
  note: string;
};

function RacketVisual({ racket }: { racket: CatalogRacket }) {
  return (
    <div className="compare-racket-visual">
      <Image src={racket.imageUrl} alt={getRacketImageAlt(racket.fullName)} width={480} height={600} />
    </div>
  );
}

function getLeaderByMetric(rackets: CatalogRacket[], key: RatingKey) {
  return [...rackets].sort((left, right) => getMetricScore(right, key) - getMetricScore(left, key))[0];
}

function getCheapestRacket(rackets: CatalogRacket[]) {
  return [...rackets].sort((left, right) => left.currentPrice - right.currentPrice)[0];
}

function getBestValueRacket(rackets: CatalogRacket[]) {
  return [...rackets].sort((left, right) => getValueScore(right) - getValueScore(left))[0];
}

function getMostForgivingRacket(rackets: CatalogRacket[]) {
  return [...rackets].sort((left, right) => getMetricScore(right, "forgiveness") - getMetricScore(left, "forgiveness"))[0];
}

function buildDecisionAngles(rackets: CatalogRacket[]): DecisionAngle[] {
  if (rackets.length === 0) return [];

  const comfortLeader = getLeaderByMetric(rackets, "comfort");
  const forgivingLeader = getMostForgivingRacket(rackets);
  const valueLeader = getBestValueRacket(rackets);

  return [
    {
      title: "Самый безопасный выбор",
      winner: forgivingLeader.fullName,
      note: `${getMetricScore(forgivingLeader, "forgiveness")} forgiveness · ${getPlayerFitLabel(forgivingLeader)}`
    },
    {
      title: "Лучший comfort / easy transition",
      winner: comfortLeader.fullName,
      note: `${getMetricScore(comfortLeader, "comfort")} comfort · ${getTradeoffNote(comfortLeader)}`
    },
    {
      title: "Лучший value-for-money",
      winner: valueLeader.fullName,
      note: `Value score ${getValueScore(valueLeader)} · EUR ${valueLeader.currentPrice}`
    }
  ];
}

function buildInsights(rackets: CatalogRacket[]): InsightCard[] {
  if (rackets.length === 0) {
    return [];
  }

  const overallLeader = [...rackets].sort((left, right) => getAverageScore(right) - getAverageScore(left))[0];
  const controlLeader = getLeaderByMetric(rackets, "control");
  const powerLeader = getLeaderByMetric(rackets, "power");
  const valueLeader = getCheapestRacket(rackets);

  return [
    {
      title: "Лучший общий выбор",
      value: overallLeader.fullName,
      note: `${getAverageScore(overallLeader)} overall score · ${overallLeader.verdict}`
    },
    {
      title: "Лучший для контроля",
      value: controlLeader.fullName,
      note: `${scoreLabel(getMetricScore(controlLeader, "control"))} control profile`
    },
    {
      title: "Лучший для атаки",
      value: powerLeader.fullName,
      note: `${scoreLabel(getMetricScore(powerLeader, "power"))} attacking profile`
    },
    {
      title: "Лучший по цене",
      value: valueLeader.fullName,
      note: `От €${valueLeader.currentPrice} · ${valueLeader.shopName}`
    }
  ];
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { ids: rawIds } = await searchParams;
  const ids = normalizeIds(rawIds);

  return {
    title: ids.length >= 2 ? "Сравнение ракеток | PadelCompare CIS" : "Сравнение | PadelCompare CIS",
    description:
      ids.length >= 2
        ? "Сравнивай характеристики, профиль и trade-offs нескольких padel-ракеток на одном экране."
        : "Выбери минимум две модели, чтобы открыть полноценное сравнение padel-ракеток."
  };
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { ids: rawIds } = await searchParams;
  const ids = normalizeIds(rawIds);
  const rackets = await getCompareSetFromDb(ids);
  const insights = buildInsights(rackets);
  const decisionAngles = buildDecisionAngles(rackets);

  return (
    <main className="page-shell">
      <AnalyticsPageView
        page="compare"
        type="compare_open"
        compareIds={ids}
        stage="decision"
        source="compare_screen"
        intent="evaluate_shortlist"
      />
      <nav className="compare-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Ракетки</Link>
        <span>/</span>
        <span>Сравнение</span>
      </nav>

      <section className="hero-card compare-hero">
        <div>
          <p className="eyebrow">Сравнение</p>
          <h1>Сравнивай shortlist как экран приложения, а не как сухую таблицу.</h1>
          <p className="hero-text">
            Этот экран должен работать как финальная decision surface для будущего iPhone-клиента:
            крупные карточки, быстрые лидеры и понятные trade-offs.
          </p>
        </div>
        <Link href="/" className="button button-primary">
          Вернуться домой
        </Link>
      </section>

      <section className="compare-table-card">
        {rackets.length === 0 ? (
          <div className="empty-box">
            <h2>Пока нечего сравнивать</h2>
            <p>Вернись в каталог и выбери 2-4 модели.</p>
          </div>
        ) : rackets.length === 1 ? (
          <div className="empty-box">
            <h2>Нужна ещё одна модель</h2>
            <p>
              Сейчас выбрана только <strong>{rackets[0].fullName}</strong>. Добавь ещё хотя бы одну ракетку
              из каталога или со страницы деталей, чтобы открыть полноценный compare.
            </p>
            <div className="hero-actions">
              <Link href={`/rackets/${rackets[0].id}`} className="button">
                Вернуться к деталям
              </Link>
              <Link href="/" className="button button-primary">
                Выбрать вторую модель
              </Link>
            </div>
          </div>
        ) : (
          <div className="compare-layout">
            <section className="insights-grid">
              {insights.map((item) => (
                <article key={item.title} className="insight-card">
                  <p>{item.title}</p>
                  <h2>{item.value}</h2>
                  <span>{item.note}</span>
                </article>
              ))}
            </section>

            <section className="insights-grid">
              {decisionAngles.map((item) => (
                <article key={item.title} className="insight-card">
                  <p>{item.title}</p>
                  <h2>{item.winner}</h2>
                  <span>{item.note}</span>
                </article>
              ))}
            </section>

            <section className="compare-cards-grid">
              {rackets.map((racket) => {
                const totalScore = getAverageScore(racket);
                const edgeHighlights = getCompareEdgeHighlights(racket, rackets);

                return (
                  <article key={racket.id} className="compare-racket-card">
                    <div className="compare-score">{totalScore}</div>
                    <div className="compare-score-label">{scoreLabel(totalScore)}</div>
                    <RacketVisual racket={racket} />
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
                      {racket.pros.slice(0, 2).map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <div className="compare-explainer">
                      <p><strong>Подойдет если:</strong> {getPlayerFitLabel(racket)}</p>
                      <p><strong>Учти:</strong> {getTradeoffNote(racket)}</p>
                    </div>
                    <div className="compare-edge-list">
                      {edgeHighlights.map((item) => (
                        <span key={`${racket.id}-${item}`}>{item}</span>
                      ))}
                    </div>
                    <div className="compare-card-footer">
                      <div className="compare-price-tag">
                        <strong>€{racket.currentPrice}</strong>
                        <span>
                          {racket.shopName}
                          {racket.offers.length > 1 ? ` · ${racket.offers.length} офферов` : ""}
                        </span>
                      </div>
                      <div className="compare-card-actions">
                        <Link href={`/rackets/${racket.id}`} className="button">
                          Детали
                        </Link>
                        <TrackedOutboundLink
                          href={racket.shopUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="button button-primary"
                          page="compare"
                          racketId={racket.id}
                          compareIds={ids}
                          intent="visit_offer"
                          meta={{ merchant: racket.shopName }}
                          source="compare_card"
                          stage="offer"
                        >
                          Смотреть предложение
                        </TrackedOutboundLink>
                      </div>
                    </div>
                    {racket.offers.some((offer) => offer.isAffiliate) ? <AffiliateDisclosure compact /> : null}
                  </article>
                );
              })}
            </section>

            <section className="ratings-panel">
              <div className="ratings-panel-head">
                <h2>Оценки</h2>
                <p>Каждая строка показывает одну характеристику сразу по всем выбранным моделям, чтобы было видно не только кто лучше, но и по какой оси.</p>
              </div>

              <div className="ratings-compare-head">
                {rackets.map((racket) => (
                  <div key={`${racket.id}-head`} className="ratings-compare-pill">
                    <strong>{racket.brand}</strong>
                    <span>{racket.model}</span>
                  </div>
                ))}
              </div>

              <div className="ratings-grid">
                {RATING_ROWS.map((row) => (
                  <div key={row.key} className="rating-row">
                    <div className="rating-label">{row.label}</div>
                    <div className="rating-columns">
                      {rackets.map((racket) => {
                        const score = getMetricScore(racket, row.key);

                        return (
                          <div key={`${racket.id}-${row.key}`} className="rating-cell">
                            <div className="rating-track">
                              <div className="rating-fill" style={{ width: `${score}%` }} />
                            </div>
                            <div className="rating-caption">
                              {scoreLabel(score)} ({(score / 10).toFixed(1)})
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="specs-panel">
              <div className="ratings-panel-head">
                <h2>Характеристики</h2>
                <p>Ниже оставил и сухие характеристики, чтобы экран был не только красивым, но и полезным.</p>
              </div>

              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Поле</th>
                    {rackets.map((racket) => (
                      <th key={racket.id}>
                        {racket.brand}
                        <br />
                        {racket.model}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FIELDS.map(([label, field]) => {
                    const values = rackets.map((racket) =>
                      field === "currentPrice"
                        ? `€${racket.currentPrice}`
                        : String(racket[field as keyof typeof racket] ?? "")
                    );
                    const hasDifference = new Set(values).size > 1;

                    return (
                      <tr key={field}>
                        <td>{label}</td>
                        {values.map((value, index) => (
                          <td key={`${field}-${index}`} className={hasDifference ? "is-different" : ""}>
                            {value}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr>
                    <td>Вердикт</td>
                    {rackets.map((racket) => (
                      <td key={`${racket.id}-verdict`} className="verdict-cell">
                        {racket.verdict}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Кому подходит</td>
                    {rackets.map((racket) => (
                      <td key={`${racket.id}-who`} className="verdict-cell">
                        {racket.whoItFits}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
