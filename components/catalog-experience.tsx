"use client";

import Image from "next/image";
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
import { buildCompareHref } from "@/lib/catalog/links";
import {
  getAverageScore,
  getQuizRecommendationReason,
  getQuizRecommendations,
  scoreLabel,
  type QuizProfile
} from "@/lib/catalog/recommendation";

type Props = {
  rackets: CatalogRacket[];
  stats: CatalogStats;
  analytics: AnalyticsSummary;
  collections: Array<{
    slug: string;
    title: string;
  }>;
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

const QUICK_PATHS = [
  {
    eyebrow: "Подбор",
    title: "Подобрать под свой профиль",
    text: "Отвечаешь на несколько вопросов и сразу получаешь shortlist с объяснением почему именно эти модели выше.",
    href: "/finder",
    cta: "Открыть подбор"
  },
  {
    eyebrow: "Похожие",
    title: "Найти альтернативу текущей ракетке",
    text: "Полезно, если уже смотришь конкретную модель и хочешь понять, какие варианты рядом по feel и профилю.",
    href: "/similar",
    cta: "Открыть похожие"
  },
  {
    eyebrow: "Сравнение",
    title: "Сравнить shortlist в одном экране",
    text: "Собирай 2-4 модели и смотри различия как product cards, а не как сухую спецификацию в таблице.",
    href: `/compare?ids=${STARTER_COMPARE.join(",")}`,
    cta: "Открыть сравнение"
  },
  {
    eyebrow: "Скидки",
    title: "Зайти от лучшей цены на рынке",
    text: "Если пользователь price-sensitive, ему нужен отдельный вход в рынок скидок, а не только общий каталог.",
    href: "/deals",
    cta: "Открыть скидки"
  }
] as const;

function formatApproxPrice(value: number) {
  if (value <= 260) return "около EUR 250";
  if (value <= 300) return "около EUR 290";
  if (value <= 340) return "около EUR 330";
  return "около EUR 370";
}

function formatPriceBand(racket: CatalogRacket) {
  const prices = racket.offers.map((offer) => offer.price).filter((price) => Number.isFinite(price));

  if (!prices.length) {
    return "цена уточняется";
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (max - min <= 12) {
    return formatApproxPrice(min);
  }

  const roundedMin = Math.floor(min / 10) * 10;
  const roundedMax = Math.ceil(max / 10) * 10;
  return `примерно EUR ${roundedMin}-${roundedMax}`;
}

function formatQuizSummary(quiz: QuizProfile) {
  const budget =
    {
      under_280: "бюджет до EUR 280",
      under_330: "бюджет до EUR 330",
      premium: "премиум-бюджет"
    }[quiz.budget] ?? quiz.budget;

  return `${quiz.level} уровень, приоритет ${quiz.priority}, feel ${quiz.feel}, ${budget}`;
}

export function CatalogExperience({
  rackets,
  stats,
  analytics,
  collections,
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
  const homeHighlights = useMemo(() => {
    const pool = [...latestRackets, ...topDeals, ...rackets];
    const byBrand = new Set<string>();
    const byId = new Set<string>();
    const picked: CatalogRacket[] = [];

    for (const racket of pool) {
      if (picked.length >= 4) break;
      if (byId.has(racket.id)) continue;
      if (byBrand.has(racket.brand)) continue;
      byId.add(racket.id);
      byBrand.add(racket.brand);
      picked.push(racket);
    }

    if (picked.length < 4) {
      for (const racket of pool) {
        if (picked.length >= 4) break;
        if (byId.has(racket.id)) continue;
        byId.add(racket.id);
        picked.push(racket);
      }
    }

    return picked;
  }, [latestRackets, rackets, topDeals]);

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

  return (
    <>
      <section className="hero-card investor-hero app-preview-hero">
        <div className="investor-copy">
          <p className="eyebrow">Превью PadelCompare</p>
          <h1>Выбери ракетку быстро и по делу.</h1>
          <p className="hero-text">Подбор, сравнение, похожие модели и цены на одном экране.</p>
          <div className="hero-actions">
            <Link href="/finder" className="button button-primary">
              Подобрать ракетку
            </Link>
            <Link href={`/compare?ids=${starterCompareIds.join(",")}`} className="button">
              Открыть сравнение
            </Link>
            <Link href="/similar" className="button">
              Найти похожие
            </Link>
          </div>
        </div>

        <div className="hero-showcase">
          {homeHighlights.slice(0, 3).map((racket) => (
            <article key={`hero-${racket.id}`} className="hero-racket-card">
              <div className="hero-racket-media">
                <Image src={racket.imageUrl} alt={getRacketImageAlt(racket.fullName)} width={480} height={600} priority />
              </div>
              <div className="hero-racket-copy">
                <span>{racket.brand}</span>
                <strong>{racket.model}</strong>
                <small>{formatPriceBand(racket)}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="investor-grid">
        {QUICK_PATHS.map((item) => (
          <article key={item.title} className="investor-panel">
            <p className="eyebrow">{item.eyebrow}</p>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
            <Link href={item.href} className="text-link">
              {item.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Сейчас в фокусе</p>
            <h2>Фото, цены и быстрый вход</h2>
            <p className="panel-text">Самые заметные модели без длинных описаний.</p>
          </div>
        </div>

        <div className="home-highlights-grid">
          {homeHighlights.map((racket) => (
            <article key={`highlight-${racket.id}`} className="home-highlight-card">
              <Link href={`/rackets/${racket.id}`} className="home-highlight-media">
                <Image src={racket.imageUrl} alt={getRacketImageAlt(racket.fullName)} width={480} height={600} />
              </Link>
              <div className="home-highlight-copy">
                <p>{racket.brand}</p>
                <h3>
                  <Link href={`/rackets/${racket.id}`}>{racket.fullName}</Link>
                </h3>
                <span>{racket.shape} · {racket.playStyle} · {formatPriceBand(racket)}</span>
              </div>
              <div className="racket-actions">
                <Link href={`/rackets/${racket.id}`} className="button">
                  Смотреть
                </Link>
                <button type="button" className="button" onClick={() => toggleCompare(racket.id)}>
                  {compareIds.includes(racket.id) ? "Убрать" : "Сравнить"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Быстрый старт</p>
            <h2>Быстрый shortlist под твой профиль</h2>
            <p className="panel-text">Выбираешь профиль и сразу видишь 3 лучших варианта.</p>
          </div>
          <Link href="/finder" className="button button-primary">
            Полный подбор
          </Link>
        </div>

        <div className="detail-related-grid">
          <article className="detail-list-card">
            <p className="eyebrow">Профиль игрока</p>
            <h3>Ввод</h3>
            <div className="grid">
              <label className="field">
                <span>Бюджет</span>
                <select
                  value={quiz.budget}
                  onChange={(event) => {
                    const value = event.target.value as QuizProfile["budget"];
                    updateQuiz("budget", value);
                    void trackEvent({
                      type: "quiz_change",
                      page: "home",
                      stage: "intake",
                      source: "quiz_teaser",
                      intent: value
                    });
                  }}
                >
                  <option value="under_280">До 280</option>
                  <option value="under_330">До 330</option>
                  <option value="premium">Премиум</option>
                </select>
              </label>
              <label className="field">
                <span>Приоритет</span>
                <select
                  value={quiz.priority}
                  onChange={(event) => updateQuiz("priority", event.target.value as QuizProfile["priority"])}
                >
                  <option value="balanced">Баланс</option>
                  <option value="control">Контроль</option>
                  <option value="power">Мощность</option>
                  <option value="comfort">Комфорт</option>
                </select>
              </label>
              <label className="field">
                <span>Уровень</span>
                <select
                  value={quiz.level}
                  onChange={(event) => updateQuiz("level", event.target.value as QuizProfile["level"])}
                >
                  <option value="intermediate">Средний</option>
                  <option value="advanced">Продвинутый</option>
                </select>
              </label>
              <label className="field">
                <span>Ощущение</span>
                <select
                  value={quiz.feel}
                  onChange={(event) => updateQuiz("feel", event.target.value as QuizProfile["feel"])}
                >
                  <option value="soft">Мягкое</option>
                  <option value="medium">Среднее</option>
                  <option value="hard">Жесткое</option>
                </select>
              </label>
            </div>
            <div className="panel-note">
              <strong>{formatQuizSummary(quiz)}</strong>
              <span>Текущий профиль для рекомендаций.</span>
            </div>
          </article>

          <article className="detail-list-card">
            <p className="eyebrow">Текущие рекомендации</p>
            <h3>Топ-3 сейчас</h3>
            <ul className="detail-list">
              {quizResults.map((racket) => {
                const score = getAverageScore(racket);

                return (
                  <li key={`quiz-${racket.id}`}>
                    <Link href={`/rackets/${racket.id}`}>{racket.fullName}</Link> · {scoreLabel(score)} {score} · EUR {racket.currentPrice}
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
            <p className="eyebrow">Рынок</p>
            <h2>Скидки, свежие модели и рынок в том же сценарии</h2>
            <p className="panel-text">
              После выбора shortlist пользователь не выпадает обратно в сайт, а продолжает путь через скидки,
              новые модели и глубокие карточки.
            </p>
          </div>
        </div>

        <div className="detail-related-grid">
          <article className="detail-list-card">
            <p className="eyebrow">Лучшие скидки</p>
            <h3>Где сейчас выгоднее</h3>
            <ul className="detail-list">
              {topDeals.map((racket) => (
                <li key={`deal-${racket.id}`}>
                  <Link href={`/rackets/${racket.id}`}>{racket.fullName}</Link> · скидка EUR {racket.discountAmount} ({racket.discountPercent}%) · сейчас EUR {racket.currentPrice}
                </li>
              ))}
            </ul>
            <div className="hero-actions">
              <Link href="/deals" className="button button-primary">
                Все скидки
              </Link>
            </div>
          </article>

          <article className="detail-list-card">
            <p className="eyebrow">Новые ракетки</p>
            <h3>Что смотреть в свежих релизах</h3>
            <ul className="detail-list">
              {latestRackets.map((racket) => (
                <li key={`latest-${racket.id}`}>
                  <Link href={`/rackets/${racket.id}`}>{racket.fullName}</Link> · {racket.shape} · EUR {racket.currentPrice}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="investor-grid">
        <article className="investor-panel">
            <p className="eyebrow">Дополнительные входы</p>
            <h2>Бренды, коллекции и расширенные маршруты</h2>
            <p>Эти маршруты остаются вторым слоем и не ломают основной сценарий выбора.</p>
          <div className="hero-actions">
            <Link href="/brands" className="button button-primary">
              Все бренды
            </Link>
            <Link href="/collections" className="button">
              Все коллекции
            </Link>
            {brands.slice(0, 6).map((item) => (
              <Link key={item.slug} href={`/brands/${item.slug}`} className="button">
                {item.name} · {item.count}
              </Link>
            ))}
            {collections.slice(0, 4).map((item) => (
              <Link key={item.slug} href={`/collections/${item.slug}`} className="button">
                {item.title}
              </Link>
            ))}
          </div>
        </article>

        <article className="investor-panel">
            <p className="eyebrow">Сигналы</p>
            <h2>Ключевые цифры</h2>
          <div className="bullet-grid">
            <div>
              <strong>{analytics.compareOpens}</strong>
              <span>открытия сравнения</span>
            </div>
            <div>
              <strong>{analytics.offerClicks}</strong>
              <span>клики по предложениям</span>
            </div>
            <div>
              <strong>{funnel.compareLinkCopies}</strong>
              <span>поделились shortlist</span>
            </div>
          </div>
          <p className="panel-text">
            Главный источник: {funnel.topSource ?? "нет данных"} · главный intent: {funnel.topIntent ?? "нет данных"}
          </p>
        </article>
      </section>

      <section className="workspace-grid">
        <aside className="filters-panel">
          <div>
            <p className="eyebrow">Фильтры</p>
            <h2>Каталог</h2>
            <p className="panel-text">Фильтруй рынок по бренду, форме, стилю, feel и бюджету.</p>
          </div>

          <label className="field">
            <span>Поиск</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nox AT10, control, comfort..."
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
            <span>Бюджет до EUR {priceMax}</span>
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
            {(() => {
              const compareHref = buildCompareHref(compareIds);

              return (
                <>
            <div>
              <p className="eyebrow">Compare</p>
              <h2>Собран shortlist</h2>
              <p className="panel-text">
                Выбрано {compareRackets.length} из {MAX_COMPARE}. Уже можно открыть отдельный compare screen.
              </p>
              <div className="compare-tags">
                {compareRackets.map((racket) => (
                  <span key={racket.id}>
                    {racket.brand} {racket.model}
                  </span>
                ))}
              </div>
            </div>
            <div className="compare-banner-actions">
              {isCompareReady && compareHref ? (
                <Link
                  href={compareHref}
                  className="button button-primary"
                  onClick={() => {
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
                  Открыть сравнение
                </Link>
              ) : (
                <button type="button" className="button button-primary is-disabled" disabled>
                  Нужно 2 модели
                </button>
              )}
              <button type="button" className="button" onClick={copyCompareLink} disabled={!isCompareReady}>
                Скопировать ссылку
              </button>
            </div>
            <p className="form-state">
              {compareState === "copied"
                ? "Ссылка на compare скопирована."
                : compareState === "error"
                  ? "Не удалось скопировать ссылку."
                  : "Shortlist можно сохранить и отправить как готовую decision page."}
            </p>
                </>
              );
            })()}
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
                    <div className="racket-pills">
                      <span>{racket.skillLevel}</span>
                      <span>{racket.balance} balance</span>
                      <span>{racket.weight} g</span>
                    </div>
                    <div className="racket-price">
                      <strong>EUR {racket.currentPrice}</strong>
                      <span>
                        {racket.shopName}
                        {racket.offers.length > 1 ? ` · ${racket.offers.length} offers` : ""}
                      </span>
                    </div>
                    <div className="racket-actions">
                      <Link href={`/rackets/${racket.id}`} className="button">
                        Детали
                      </Link>
                      <button type="button" className="button" onClick={() => toggleCompare(racket.id)}>
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

    </>
  );
}
