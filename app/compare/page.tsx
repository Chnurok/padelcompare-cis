import type { Metadata } from "next";
import Link from "next/link";

import { getCompareSetFromDb } from "@/lib/catalog/catalog-db";
import type { CatalogRacket } from "@/lib/catalog/catalog-db";
import { getRacketImageAlt } from "@/lib/catalog/racket-media";

type PageProps = {
  searchParams: {
    ids?: string;
  };
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
  ["Face", "faceMaterial"],
  ["Frame", "frameMaterial"],
  ["Core", "coreMaterial"],
  ["Уровень", "skillLevel"],
  ["Профиль", "playStyle"],
  ["Sweet spot", "sweetSpot"],
  ["Цена", "currentPrice"]
];

const RATING_ROWS = [
  { key: "power", label: "Power" },
  { key: "control", label: "Control" },
  { key: "comfort", label: "Comfort" },
  { key: "maneuverability", label: "Maneuverability" },
  { key: "forgiveness", label: "Forgiveness" },
  { key: "spin", label: "Spin" }
] as const;

type RatingKey = (typeof RATING_ROWS)[number]["key"];

type InsightCard = {
  title: string;
  value: string;
  note: string;
};

function clampScore(value: number) {
  return Math.max(68, Math.min(96, Math.round(value)));
}

function scoreLabel(score: number) {
  if (score >= 92) return "Elite";
  if (score >= 88) return "Excellent";
  if (score >= 83) return "Very good";
  if (score >= 77) return "Good";
  return "Solid";
}

function RacketVisual({ racket }: { racket: CatalogRacket }) {
  return (
    <div className="compare-racket-visual">
      <img src={racket.imageUrl} alt={getRacketImageAlt(racket.fullName)} />
    </div>
  );
}

function getMetricScore(racket: CatalogRacket, key: RatingKey) {
  const shape = racket.shape.toLowerCase();
  const playStyle = racket.playStyle.toLowerCase();
  const hardness = racket.hardness.toLowerCase();
  const balance = racket.balance.toLowerCase();
  const skill = racket.skillLevel.toLowerCase();
  const sweetSpot = racket.sweetSpot.toLowerCase();
  const weight = racket.weight;

  const shapeBoost = {
    diamond: 5,
    tear: 3,
    round: 1
  }[shape] ?? 0;

  const balanceBoost = {
    high: 4,
    medium: 2,
    low: 0
  }[balance] ?? 0;

  const comfortBase =
    78 +
    (hardness === "soft" ? 9 : hardness === "medium" ? 5 : 1) +
    (sweetSpot === "large" ? 5 : sweetSpot === "medium" ? 3 : 0) -
    (weight >= 368 ? 4 : weight >= 364 ? 2 : 0);

  const scores: Record<RatingKey, number> = {
    power:
      77 +
      (playStyle === "power" ? 10 : playStyle === "balanced" ? 6 : 2) +
      shapeBoost +
      balanceBoost +
      (hardness === "hard" ? 3 : hardness === "medium" ? 2 : 0),
    control:
      78 +
      (playStyle === "control" ? 11 : playStyle === "balanced" ? 7 : 3) +
      (shape === "round" ? 6 : shape === "tear" ? 3 : 0) +
      (balance === "low" ? 4 : balance === "medium" ? 2 : 0) +
      (sweetSpot === "large" ? 3 : 1),
    comfort: comfortBase,
    maneuverability:
      79 +
      (weight <= 356 ? 8 : weight <= 361 ? 5 : weight <= 365 ? 2 : -2) +
      (balance === "low" ? 6 : balance === "medium" ? 3 : 0) +
      (shape === "round" ? 3 : shape === "tear" ? 2 : 0),
    forgiveness:
      77 +
      (sweetSpot === "large" ? 8 : sweetSpot === "medium" ? 4 : 1) +
      (hardness === "soft" ? 6 : hardness === "medium" ? 3 : 0) +
      (skill === "intermediate" ? 4 : 1),
    spin:
      78 +
      (shape === "diamond" ? 6 : shape === "tear" ? 4 : 2) +
      (playStyle === "power" ? 5 : playStyle === "balanced" ? 3 : 2) +
      (hardness === "hard" ? 4 : hardness === "medium" ? 2 : 0)
  };

  return clampScore(scores[key]);
}

function getRatings(racket: CatalogRacket) {
  return RATING_ROWS.map((row) => ({
    ...row,
    score: getMetricScore(racket, row.key)
  }));
}

function getAverageScore(racket: CatalogRacket) {
  return Math.round(
    getRatings(racket).reduce((sum, item) => sum + item.score, 0) / RATING_ROWS.length
  );
}

function getLeaderByMetric(rackets: CatalogRacket[], key: RatingKey) {
  return [...rackets].sort((left, right) => getMetricScore(right, key) - getMetricScore(left, key))[0];
}

function getCheapestRacket(rackets: CatalogRacket[]) {
  return [...rackets].sort((left, right) => left.currentPrice - right.currentPrice)[0];
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
      title: "Best overall",
      value: overallLeader.fullName,
      note: `${getAverageScore(overallLeader)} overall score · ${overallLeader.verdict}`
    },
    {
      title: "Best for control",
      value: controlLeader.fullName,
      note: `${scoreLabel(getMetricScore(controlLeader, "control"))} control profile`
    },
    {
      title: "Best for power",
      value: powerLeader.fullName,
      note: `${scoreLabel(getMetricScore(powerLeader, "power"))} attacking profile`
    },
    {
      title: "Best value entry",
      value: valueLeader.fullName,
      note: `От €${valueLeader.currentPrice} · ${valueLeader.shopName}`
    }
  ];
}

export function generateMetadata({ searchParams }: PageProps): Metadata {
  const ids = normalizeIds(searchParams.ids);

  return {
    title: ids.length >= 2 ? "Сравнение ракеток | PadelCompare CIS" : "Compare | PadelCompare CIS",
    description:
      ids.length >= 2
        ? "Сравнивай характеристики, профиль и trade-offs нескольких padel-ракеток на одном экране."
        : "Выбери минимум две модели, чтобы открыть полноценное сравнение padel-ракеток."
  };
}

export default async function ComparePage({ searchParams }: PageProps) {
  const ids = normalizeIds(searchParams.ids);
  const rackets = await getCompareSetFromDb(ids);
  const insights = buildInsights(rackets);

  return (
    <main className="page-shell">
      <nav className="compare-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Rackets</Link>
        <span>/</span>
        <span>Compare</span>
      </nav>

      <section className="hero-card compare-hero">
        <div>
          <p className="eyebrow">Compare view</p>
          <h1>Сравнивай модели как отдельные продуктовые карточки, а не как сухую таблицу.</h1>
          <p className="hero-text">
            Подтянул layout ближе к референсу: крупные визуалы ракеток, быстрые лидеры и компактный
            ratings-блок под карточками.
          </p>
        </div>
        <Link href="/" className="button button-primary">
          Вернуться в каталог
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

            <section className="compare-cards-grid">
              {rackets.map((racket) => {
                const totalScore = getAverageScore(racket);

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
                    <div className="compare-card-footer">
                      <div className="compare-price-tag">
                        <strong>€{racket.currentPrice}</strong>
                        <span>{racket.shopName}</span>
                      </div>
                      <div className="compare-card-actions">
                        <Link href={`/rackets/${racket.id}`} className="button">
                          Детали
                        </Link>
                        <a href={racket.shopUrl} target="_blank" rel="noreferrer" className="button button-primary">
                          Смотреть оффер
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="ratings-panel">
              <div className="ratings-panel-head">
                <h2>Ratings</h2>
                <p>Каждая строка показывает одну характеристику сразу по всем выбранным моделям.</p>
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
                <h2>Specs</h2>
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
                    <td>Best for</td>
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
