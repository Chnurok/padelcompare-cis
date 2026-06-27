"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { trackEvent } from "@/lib/analytics";
import type {
  AnalyticsSummary,
  BrandSummary,
  DealRailItem,
  CatalogRacket,
  CatalogStats
} from "@/lib/catalog/catalog-db";
import { getRacketImageAlt } from "@/lib/catalog/racket-media";
import {
  getAverageScore,
  getQuizRecommendationReason,
  getQuizRecommendations,
  scoreLabel,
  type QuizProfile
} from "@/lib/catalog/recommendation";

type CollectionLink = {
  slug: string;
  title: string;
};

type Props = {
  rackets: CatalogRacket[];
  stats: CatalogStats;
  analytics: AnalyticsSummary;
  collections: CollectionLink[];
  recommendationRail: Array<{
    slug: string;
    title: string;
    note: string;
    rackets: CatalogRacket[];
  }>;
  seoPages: {
    categories: Array<{ slug: string; title: string }>;
    versus: Array<{ left: string; right: string; title: string }>;
  };
  adminHref: string;
  funnel: {
    compareCtaClicks: number;
    compareLinkCopies: number;
    topSource?: string;
    topIntent?: string;
  };
  topDeals: DealRailItem[];
  latestRackets: CatalogRacket[];
  brands: BrandSummary[];
};

const MAX_COMPARE = 4;
const STARTER_COMPARE = [
  "nox-at10-18k-25",
  "bullpadel-vertex-04-25",
  "adidas-metalbone-ctrl-25"
];

const INVESTOR_POINTS = [
  {
    title: "Покупатель тонет в шуме",
    text: "Спеки, feel, форма, вес и живые цены раскиданы между магазинами, обзорами и брендовыми страницами."
  },
  {
    title: "Выигрывает нормализованный слой",
    text: "Moat здесь не блог. Это структурированный каталог, который питает compare, рекомендации и коммерческие переходы."
  },
  {
    title: "У интента есть деньги",
    text: "Пользователь приходит почти на покупке. Значит можно монетизировать через affiliate, лиды, магазины и клубы."
  }
];

const ROADMAP_STEPS = [
  "Расширить demo-каталог до первого по-настоящему полезного market inventory.",
  "Добавить recommendation paths для beginner, control, power и budget-sensitive сценариев.",
  "Собирать shortlist и заявки как готовый qualified lead для shops, coaches и clubs."
];

export function CatalogExperience({
  rackets,
  stats,
  analytics,
  collections,
  recommendationRail,
  seoPages,
  adminHref,
  funnel,
  topDeals,
  latestRackets,
  brands
}: Props) {
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("all");
  const [shape, setShape] = useState("all");
  const [skill, setSkill] = useState("all");
  const [style, setStyle] = useState("all");
  const [hardness, setHardness] = useState("all");
  const [priceMax, setPriceMax] = useState(stats.maxPrice);
  const [leadState, setLeadState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [compareIds, setCompareIds] = useState<string[]>([
    rackets[0]?.id ?? "",
    rackets[1]?.id ?? ""
  ].filter(Boolean));
  const [compareState, setCompareState] = useState<"idle" | "copied" | "error">("idle");
  const [quiz, setQuiz] = useState<QuizProfile>({
    budget: "under_330",
    priority: "balanced",
    level: "intermediate",
    feel: "medium"
  });

  const featuredRacket = rackets[0];
  const starterCompareIds = STARTER_COMPARE.filter((id) => rackets.some((racket) => racket.id === id));

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rackets.filter((racket) => {
      const matchesSearch =
        !query ||
        [racket.brand, racket.model, racket.fullName, racket.verdict, racket.whoItFits]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return (
        matchesSearch &&
        (brand === "all" || racket.brand === brand) &&
        (shape === "all" || racket.shape === shape) &&
        (skill === "all" || racket.skillLevel === skill) &&
        (style === "all" || racket.playStyle === style) &&
        (hardness === "all" || racket.hardness === hardness) &&
        racket.currentPrice <= priceMax
      );
    });
  }, [brand, hardness, priceMax, rackets, search, shape, skill, style]);

  const compareRackets = useMemo(
    () => rackets.filter((racket) => compareIds.includes(racket.id)),
    [compareIds, rackets]
  );
  const quizResults = useMemo(() => getQuizRecommendations(rackets, quiz, 3), [quiz, rackets]);

  const isCompareReady = compareIds.length >= 2;
  const hasFilters =
    Boolean(search.trim()) ||
    brand !== "all" ||
    shape !== "all" ||
    skill !== "all" ||
    style !== "all" ||
    hardness !== "all" ||
    priceMax !== stats.maxPrice;

  function resetFilters() {
    setSearch("");
    setBrand("all");
    setShape("all");
    setSkill("all");
    setStyle("all");
    setHardness("all");
    setPriceMax(stats.maxPrice);
  }

  function updateQuiz<Key extends keyof QuizProfile>(key: Key, value: QuizProfile[Key]) {
    setQuiz((current) => ({
      ...current,
      [key]: value
    }));
  }

  function toggleCompare(id: string) {
    setCompareState("idle");
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      if (current.length >= MAX_COMPARE) {
        return [...current.slice(1), id];
      }

      return [...current, id];
    });
  }

  async function copyCompareLink() {
    if (!isCompareReady) return;

    const url = `${window.location.origin}/compare?ids=${compareIds.join(",")}`;

    try {
      await navigator.clipboard.writeText(url);
      setCompareState("copied");
      await trackEvent({
        type: "compare_link_copy",
        page: "home",
        compareIds,
        intent: "share_shortlist",
        source: "shortlist_banner",
        stage: "decision"
      });
    } catch {
      setCompareState("error");
    }
  }

  async function submitInvestorLead(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    const contact = String(formData.get("contact") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();

    if (!name || !contact) {
      setLeadState("error");
      return false;
    }

    try {
      setLeadState("sending");

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          name,
          contact,
          notes,
          intent: "partner-follow-up",
          selectedId: featuredRacket?.id,
          compareIds
        })
      });

      setLeadState(response.ok ? "sent" : "error");

      if (response.ok) {
        await trackEvent({
          type: "lead_submit",
          page: "home",
          racketId: featuredRacket?.id,
          compareIds,
          intent: "partner_follow_up",
          source: "investor_cta",
          stage: "lead"
        });
      }

      return response.ok;
    } catch {
      setLeadState("error");
      return false;
    }
  }

  return (
    <>
      <section className="hero-card investor-hero">
        <div className="investor-copy">
          <p className="eyebrow">Live preview</p>
          <h1>PadelCompare превращает выбор ракетки в decision product, а не в хаос вкладок.</h1>
          <p className="hero-text">
            Уже есть рабочий каталог, shortlist на 2-4 модели, отдельный compare screen, detail pages
            и переходы в оффер. Это не концепт на словах, а показываемый продуктовый слой.
          </p>
          <div className="hero-actions">
            <Link
              href={`/compare?ids=${starterCompareIds.join(",")}`}
              className="button button-primary"
            >
              Открыть sample compare
            </Link>
            {featuredRacket ? (
              <Link href={`/rackets/${featuredRacket.id}`} className="button">
                Открыть detail page
              </Link>
            ) : null}
          </div>
        </div>

        <div className="investor-proof">
          <div className="proof-card">
            <span>Каталог live</span>
            <strong>{stats.total} моделей</strong>
          </div>
          <div className="proof-card">
            <span>Нормализовано</span>
            <strong>{stats.brands.length} брендов</strong>
          </div>
          <div className="proof-card">
            <span>Цена</span>
            <strong>€{stats.minPrice} - €{stats.maxPrice}</strong>
          </div>
          <div className="proof-card">
            <span>Decision flow</span>
            <strong>catalog → detail → compare</strong>
          </div>
        </div>
      </section>

      <section className="hero-card product-hero">
        <div>
          <p className="eyebrow">Product thesis</p>
          <h2>Сайт уже отвечает на вопрос “что мне брать?”, а не просто показывает SKU.</h2>
          <p className="hero-text">
            Пользователь видит verdict, профиль игрока, trade-offs, цены, shortlist и прямой
            переход в оффер. То есть путь идёт от confusion к decision, а не к ещё десяти открытым вкладкам.
          </p>
        </div>
        <div className="hero-metrics">
          <div className="metric-card">
            <span>Каталог</span>
            <strong>{stats.total} моделей</strong>
          </div>
          <div className="metric-card">
            <span>Compare flow</span>
            <strong>До {MAX_COMPARE} ракеток</strong>
          </div>
          <div className="metric-card">
            <span>Moat layer</span>
            <strong>Specs + verdict + route</strong>
          </div>
          <div className="metric-card">
            <span>Funnel signals</span>
            <strong>{analytics.offerClicks} clicks / {analytics.leadSubmits} leads</strong>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Signals</p>
            <h2>Поведение уже читается как воронка</h2>
            <p className="panel-text">
              Compare CTA, копирование shortlist и offer clicks теперь можно разрезать по stage/source/intent.
            </p>
          </div>
        </div>
        <div className="hero-metrics">
          <div className="metric-card">
            <span>Compare CTA</span>
            <strong>{funnel.compareCtaClicks}</strong>
          </div>
          <div className="metric-card">
            <span>Link copies</span>
            <strong>{funnel.compareLinkCopies}</strong>
          </div>
          <div className="metric-card">
            <span>Top source</span>
            <strong>{funnel.topSource ?? "no data"}</strong>
          </div>
          <div className="metric-card">
            <span>Top intent</span>
            <strong>{funnel.topIntent ?? "no data"}</strong>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Quiz intake</p>
            <h2>Подбор под игрока, а не только общие полки</h2>
            <p className="panel-text">
              Этот intake уже собирает базовый player profile и сразу перестраивает top picks под budget, priority, level и feel.
            </p>
          </div>
        </div>

        <div className="detail-related-grid">
          <article className="detail-list-card">
            <p className="eyebrow">Player profile</p>
            <h3>Intake</h3>
            <div className="grid">
              <label className="field">
                <span>Budget</span>
                <select
                  value={quiz.budget}
                  onChange={(event) => {
                    const value = event.target.value as QuizProfile["budget"];
                    updateQuiz("budget", value);
                    void trackEvent({ type: "quiz_change", page: "home", stage: "intake", source: "quiz", intent: value });
                  }}
                >
                  <option value="under_280">Under 280</option>
                  <option value="under_330">Under 330</option>
                  <option value="premium">Premium</option>
                </select>
              </label>
              <label className="field">
                <span>Priority</span>
                <select
                  value={quiz.priority}
                  onChange={(event) => updateQuiz("priority", event.target.value as QuizProfile["priority"])}
                >
                  <option value="balanced">Balanced</option>
                  <option value="control">Control</option>
                  <option value="power">Power</option>
                  <option value="comfort">Comfort</option>
                </select>
              </label>
              <label className="field">
                <span>Level</span>
                <select
                  value={quiz.level}
                  onChange={(event) => updateQuiz("level", event.target.value as QuizProfile["level"])}
                >
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
              <label className="field">
                <span>Feel</span>
                <select
                  value={quiz.feel}
                  onChange={(event) => updateQuiz("feel", event.target.value as QuizProfile["feel"])}
                >
                  <option value="soft">Soft</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
            </div>
          </article>

          <article className="detail-list-card">
            <p className="eyebrow">Personal picks</p>
            <h3>Top 3 right now</h3>
            <ul className="detail-list">
              {quizResults.map((racket) => {
                const score = getAverageScore(racket);

                return (
                  <li key={`quiz-${racket.id}`}>
                    <Link href={`/rackets/${racket.id}`}>{racket.fullName}</Link> · {scoreLabel(score)} {score} · €{racket.currentPrice}
                    <br />
                    {getQuizRecommendationReason(racket, quiz)}
                  </li>
                );
              })}
            </ul>
          </article>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Market view</p>
            <h2>Как у сильных price-comparison аналогов</h2>
            <p className="panel-text">
              Добавил два самых важных buyer-oriented слоя: заметные deals и быстрый вход в свежие модели сезона.
            </p>
          </div>
        </div>

        <div className="detail-related-grid">
          <article className="detail-list-card">
            <p className="eyebrow">Top deals</p>
            <h3>Где скидка реально заметна</h3>
            <ul className="detail-list">
              {topDeals.map((racket) => (
                <li key={`deal-${racket.id}`}>
                  <Link href={`/rackets/${racket.id}`}>{racket.fullName}</Link> · save €{racket.discountAmount} ({racket.discountPercent}%) · now €{racket.currentPrice}
                </li>
              ))}
            </ul>
          </article>

          <article className="detail-list-card">
            <p className="eyebrow">Latest rackets</p>
            <h3>Быстрый вход в свежие модели</h3>
            <ul className="detail-list">
              {latestRackets.map((racket) => (
                <li key={`latest-${racket.id}`}>
                  <Link href={`/rackets/${racket.id}`}>{racket.fullName}</Link> · {racket.shape} · €{racket.currentPrice}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Discovery tools</p>
            <h2>Похожие модели и brand depth</h2>
            <p className="panel-text">
              Ещё один важный слой против аналогов: отдельный similar finder и входы в брендовые каталоги.
            </p>
          </div>
        </div>

        <div className="detail-related-grid">
          <article className="detail-list-card">
            <p className="eyebrow">Similar finder</p>
            <h3>Alternative-first entrypoint</h3>
            <ul className="detail-list">
              {latestRackets.slice(0, 4).map((racket) => (
                <li key={`similar-entry-${racket.id}`}>
                  <a href={`/similar?to=${racket.id}`}>{racket.fullName}</a>
                </li>
              ))}
            </ul>
          </article>

          <article className="detail-list-card">
            <p className="eyebrow">Brands</p>
            <h3>Browse by manufacturer</h3>
            <ul className="detail-list">
              {brands.slice(0, 6).map((brand) => (
                <li key={brand.slug}>
                  <Link href={`/brands/${brand.slug}`}>{brand.name}</Link> · {brand.count} models
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Recommendation engine</p>
            <h2>Smart picks вместо ручных подборок на глаз</h2>
            <p className="panel-text">
              Один scoring layer теперь ранжирует модели под разные сценарии, а не просто раскладывает
              каталог по фильтрам.
            </p>
          </div>
        </div>

        <div className="detail-related-grid">
          {recommendationRail.map((rail) => (
            <article key={rail.slug} className="detail-list-card">
              <p className="eyebrow">{rail.title}</p>
              <h3>{rail.note}</h3>
              <ul className="detail-list">
                {rail.rackets.map((racket) => {
                  const score = getAverageScore(racket);

                  return (
                    <li key={`${rail.slug}-${racket.id}`}>
                      <Link href={`/rackets/${racket.id}`}>
                        {racket.fullName}
                      </Link>{" "}
                      · {scoreLabel(score)} {score} · from €{racket.currentPrice}
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">SEO structure</p>
            <h2>Scale pages под органику уже заведены в routing</h2>
            <p className="panel-text">
              Это уже не только каталог и collections: появились шаблоны под intent-страницы и `X vs Y`.
            </p>
          </div>
        </div>

        <div className="detail-related-grid">
          <article className="detail-list-card">
            <p className="eyebrow">Best for</p>
            <h3>Intent pages</h3>
            <ul className="detail-list">
              {seoPages.categories.map((page) => (
                <li key={page.slug}>
                  <Link href={`/best-for/${page.slug}`}>{page.title}</Link>
                </li>
              ))}
            </ul>
          </article>

          <article className="detail-list-card">
            <p className="eyebrow">VS pages</p>
            <h3>Search-friendly comparisons</h3>
            <ul className="detail-list">
              {seoPages.versus.map((page) => (
                <li key={`${page.left}-${page.right}`}>
                  <Link href={`/vs/${page.left}/${page.right}`}>{page.title}</Link>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Catalog ops</p>
            <h2>Admin import flow уже подключен</h2>
            <p className="panel-text">
              Следующий уровень после demo seed: bulk upsert ракеток и multi-offer пакетов через внутренний экран.
            </p>
          </div>
          <a href={adminHref} className="button button-primary">
            Открыть import console
          </a>
        </div>
      </section>

      <section className="investor-grid">
        {INVESTOR_POINTS.map((point) => (
          <article key={point.title} className="investor-panel">
            <p className="eyebrow">Почему это важно</p>
            <h2>{point.title}</h2>
            <p>{point.text}</p>
          </article>
        ))}
      </section>

      <section className="investor-grid">
        <article className="investor-panel">
          <p className="eyebrow">Collections</p>
          <h2>Готовые входы в каталог</h2>
          <p>Сайт уже умеет вести пользователя не только в общий каталог, но и в подборки под конкретный intent.</p>
          <div className="hero-actions">
            {collections.map((collection) => (
              <Link key={collection.slug} href={`/collections/${collection.slug}`} className="button">
                {collection.title}
              </Link>
            ))}
          </div>
        </article>
        <article className="investor-panel">
          <p className="eyebrow">Signals</p>
          <h2>Первые продуктовые сигналы</h2>
          <p>Теперь сайт может копить не только контент и каталог, но и базовую продуктовую аналитику.</p>
          <div className="bullet-grid">
            <div>
              <strong>{analytics.compareOpens}</strong>
              <span>compare opens</span>
            </div>
            <div>
              <strong>{analytics.offerClicks}</strong>
              <span>offer clicks</span>
            </div>
            <div>
              <strong>{analytics.leadSubmits}</strong>
              <span>lead submits</span>
            </div>
          </div>
        </article>
      </section>

      <section className="workspace-grid">
        <aside className="filters-panel">
          <div>
            <p className="eyebrow">Фильтры</p>
            <h2>Каталог</h2>
            <p className="panel-text">Можно быстро сузить рынок по бренду, форме, профилю и бюджету.</p>
          </div>

          <label className="field">
            <span>Поиск</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nox AT10, control, beginner..."
            />
          </label>

          <label className="field">
            <span>Бренд</span>
            <select value={brand} onChange={(event) => setBrand(event.target.value)}>
              <option value="all">Все</option>
              {stats.brands.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Форма</span>
            <select value={shape} onChange={(event) => setShape(event.target.value)}>
              <option value="all">Все</option>
              {stats.shapes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Уровень</span>
            <select value={skill} onChange={(event) => setSkill(event.target.value)}>
              <option value="all">Все</option>
              {stats.skills.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Профиль</span>
            <select value={style} onChange={(event) => setStyle(event.target.value)}>
              <option value="all">Все</option>
              {stats.styles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Жесткость</span>
            <select value={hardness} onChange={(event) => setHardness(event.target.value)}>
              <option value="all">Все</option>
              {stats.hardnessLevels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Бюджет до €{priceMax}</span>
            <input
              type="range"
              min={stats.minPrice}
              max={stats.maxPrice}
              step={5}
              value={priceMax}
              onChange={(event) => setPriceMax(Number(event.target.value))}
            />
          </label>

          <div className="panel-note">
            <strong>{filtered.length}</strong>
            <span>моделей попало в текущую выборку</span>
          </div>

          <div className="panel-note">
            <strong>{compareRackets.length}</strong>
            <span>моделей уже в shortlist</span>
          </div>

          <button type="button" className="button" onClick={resetFilters} disabled={!hasFilters}>
            Сбросить фильтры
          </button>
        </aside>

        <div className="catalog-column">
          <section className="compare-banner">
            <div>
              <p className="eyebrow">Compare</p>
              <h2>Собран shortlist</h2>
              <p className="panel-text">
                Выбрано {compareRackets.length} из {MAX_COMPARE}. Уже можно вынести это на отдельный compare screen.
              </p>
              <div className="compare-tags">
                {compareRackets.map((racket) => (
                  <span key={racket.id}>{racket.brand} {racket.model}</span>
                ))}
              </div>
            </div>
            <div className="compare-banner-actions">
            <Link
              href={isCompareReady ? `/compare?ids=${compareIds.join(",")}` : "#"}
              className={`button button-primary${isCompareReady ? "" : " is-disabled"}`}
              onClick={() => {
                if (!isCompareReady) return;
                void trackEvent({
                  type: "compare_cta_click",
                  page: "home",
                  compareIds,
                  intent: "open_compare",
                  source: "shortlist_banner",
                  stage: "decision"
                });
              }}
            >
              {isCompareReady ? "Открыть сравнение" : "Нужно 2 модели"}
            </Link>
              <button type="button" className="button" onClick={copyCompareLink} disabled={!isCompareReady}>
                Скопировать ссылку
              </button>
            </div>
            <p className="form-state">
              {compareState === "copied"
                ? "Ссылка на compare скопирована."
                : compareState === "error"
                  ? "Не удалось скопировать ссылку."
                  : "Compare URL можно отправлять партнёру или клиенту как готовый shortlist."}
            </p>
          </section>

          {filtered.length === 0 ? (
            <section className="empty-box">
              <h2>По этим фильтрам ничего не нашлось</h2>
              <p>Сбрось часть ограничений или подними бюджет, чтобы снова увидеть каталог.</p>
              <button type="button" className="button button-primary" onClick={resetFilters}>
                Показать все модели
              </button>
            </section>
          ) : (
            <section className="catalog-grid">
              {filtered.map((racket) => {
                const inCompare = compareIds.includes(racket.id);

                return (
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
                      {racket.shape} · {racket.playStyle} · {racket.hardness}
                    </p>
                    <p className="racket-copy">{racket.verdict}</p>
                    <div className="racket-pills">
                      <span>{racket.skillLevel}</span>
                      <span>{racket.balance} balance</span>
                      <span>{racket.weight} g</span>
                    </div>
                    <div className="racket-price">
                      <strong>€{racket.currentPrice}</strong>
                      <span>
                        {racket.shopName}
                        {racket.offers.length > 1 ? ` · ${racket.offers.length} offers` : ""}
                      </span>
                    </div>
                    <div className="racket-actions">
                      <Link href={`/rackets/${racket.id}`} className="button">
                        Детали
                      </Link>
                      <button
                        type="button"
                        className="button"
                        onClick={() => toggleCompare(racket.id)}
                      >
                        {inCompare ? "Убрать" : "Сравнить"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </section>

      <section className="bottom-grid">
        <article className="card business-card">
          <p className="eyebrow">Monetization</p>
          <h2>Как это может зарабатывать</h2>
          <div className="bullet-grid">
            <div>
              <strong>Affiliate offers</strong>
              <span>Переходы в магазины из catalog, detail и compare.</span>
            </div>
            <div>
              <strong>Qualified leads</strong>
              <span>Shortlist и заявки можно маршрутизировать в shops, coaches и clubs.</span>
            </div>
            <div>
              <strong>B2B data layer</strong>
              <span>Нормализованный каталог можно развивать как backend для реселлеров и контента.</span>
            </div>
          </div>
        </article>

        <article className="card roadmap-card">
          <p className="eyebrow">Roadmap</p>
          <h2>Что усиливать дальше</h2>
          <ol className="roadmap-list">
            {ROADMAP_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      </section>

      <section className="card investor-cta-card">
        <div className="investor-cta-copy">
          <p className="eyebrow">Next step</p>
          <h2>Partner / investor follow-up</h2>
          <p>
            Можно оставить контакт прямо из демо. Так сайт показывает не только интерфейс, но и готовность
            собирать коммерческий интерес вокруг shortlist и каталога.
          </p>
        </div>

        <form
          className="investor-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const ok = await submitInvestorLead(new FormData(event.currentTarget));

            if (ok) {
              event.currentTarget.reset();
            }
          }}
        >
          <label className="field">
            <span>Имя</span>
            <input name="name" placeholder="Михаил / фонд / магазин" />
          </label>
          <label className="field">
            <span>Контакт</span>
            <input name="contact" placeholder="@telegram, email, WhatsApp" />
          </label>
          <label className="field">
            <span>Комментарий</span>
            <input name="notes" placeholder="Партнёрство, дистрибуция, SEO, инвестиции..." />
          </label>
          <button type="submit" className="button button-primary">
            {leadState === "sending" ? "Сохраняю..." : "Сохранить контакт"}
          </button>
          <p className="form-state">
            {leadState === "sent"
              ? "Контакт сохранён в локальную базу."
              : leadState === "error"
                ? "Нужны имя и контакт, либо API вернул ошибку."
                : "Лид сохраняется вместе с текущим shortlist и featured racket."}
          </p>
        </form>
      </section>
    </>
  );
}
