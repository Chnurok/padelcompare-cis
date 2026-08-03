"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { trackEvent } from "@/lib/analytics";
import type { CatalogRacket, CatalogStats } from "@/lib/catalog/catalog-db";
import { formatBalance, formatHardness, formatPlayStyle, formatShape, formatSkillLevel } from "@/lib/catalog/format";
import { getRacketImageAlt } from "@/lib/catalog/racket-media";
import { buildCompareHref } from "@/lib/catalog/links";
import {
  getAverageScore,
  getMetricScore,
  getQuizRecommendationReason,
  getQuizRecommendationScore,
  getQuizRecommendations,
  scoreLabel,
  type QuizProfile
} from "@/lib/catalog/recommendation";

type Props = {
  rackets: CatalogRacket[];
  stats: CatalogStats;
};

function buildProfileHeadline(profile: QuizProfile) {
  const budget =
    {
      under_280: "бюджет до EUR 280",
      under_330: "бюджет до EUR 330",
      premium: "премиум-бюджет"
    }[profile.budget] ?? profile.budget;

  const feel = { soft: "мягкое", medium: "среднее", hard: "жёсткое" }[profile.feel];
  const priority = { balanced: "баланс", control: "контроль", power: "мощность", comfort: "комфорт" }[profile.priority];

  return `${formatSkillLevel(profile.level)} · приоритет ${priority} · ощущение ${feel} · ${budget}`;
}

function buildExplanation(racket: CatalogRacket, profile: QuizProfile) {
  const control = getMetricScore(racket, "control");
  const power = getMetricScore(racket, "power");
  const comfort = getMetricScore(racket, "comfort");
  const maneuverability = getMetricScore(racket, "maneuverability");

  const primaryMetric =
    profile.priority === "control"
      ? `Контроль ${control}`
      : profile.priority === "power"
        ? `Мощность ${power}`
        : profile.priority === "comfort"
          ? `Комфорт ${comfort}`
          : `Универсальность ${Math.round((control + power + comfort) / 3)}`;

  return [
    primaryMetric,
    `форма ${formatShape(racket.shape)}`,
    `баланс ${formatBalance(racket.balance)}`,
    `маневренность ${maneuverability}`,
    racket.currentPrice <= 330 ? `цена EUR ${racket.currentPrice}` : `премиум-цена EUR ${racket.currentPrice}`
  ];
}

export function RacketFinder({ rackets, stats }: Props) {
  const [profile, setProfile] = useState<QuizProfile>({
    budget: "under_330",
    priority: "balanced",
    level: "intermediate",
    feel: "medium"
  });
  const [leadState, setLeadState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const recommendations = useMemo(() => getQuizRecommendations(rackets, profile, 5), [profile, rackets]);
  const best = recommendations[0];
  const alternatives = recommendations.slice(1, 5);
  const cheaperAlternatives = useMemo(
    () =>
      recommendations
        .filter((racket) => racket.currentPrice <= (best?.currentPrice ?? Number.MAX_SAFE_INTEGER))
        .slice(1, 3),
    [best?.currentPrice, recommendations]
  );

  function update<Key extends keyof QuizProfile>(key: Key, value: QuizProfile[Key]) {
    setProfile((current) => ({ ...current, [key]: value }));
    void trackEvent({
      type: "finder_change",
      page: "finder",
      stage: "intake",
      source: "finder_form",
      intent: `${key}:${value}`
    });
  }

  async function submitLead(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    const contact = String(formData.get("contact") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();
    const currentRacket = String(formData.get("currentRacket") ?? "").trim();
    const purchaseTimeline = String(formData.get("purchaseTimeline") ?? "").trim();
    const contactPreference = String(formData.get("contactPreference") ?? "").trim();

    if (!name || !contact || !best) {
      setLeadState("error");
      return false;
    }

    const structuredNotes = [
      `Profile: ${buildProfileHeadline(profile)}`,
      currentRacket ? `Current racket: ${currentRacket}` : "",
      purchaseTimeline ? `Timing: ${purchaseTimeline}` : "",
      contactPreference ? `Contact pref: ${contactPreference}` : "",
      notes ? `User note: ${notes}` : "",
      `Top picks: ${recommendations.slice(0, 3).map((item) => item.fullName).join(" | ")}`
    ]
      .filter(Boolean)
      .join(" || ")
      .slice(0, 500);

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
          intent: "finder_follow_up",
          sourcePage: "finder",
          selectedId: best.id,
          compareIds: recommendations.slice(0, 4).map((item) => item.id),
          notes: structuredNotes
        })
      });

      setLeadState(response.ok ? "sent" : "error");

      if (response.ok) {
        await trackEvent({
          type: "lead_submit",
          page: "finder",
          racketId: best.id,
          compareIds: recommendations.slice(0, 4).map((item) => item.id),
          intent: "finder_follow_up",
          source: "finder_cta",
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
      <section className="hero-card investor-hero finder-hero">
        <div className="investor-copy">
          <p className="eyebrow">Подбор ракетки</p>
          <h1>Подбор с объяснением, а не магический «топ-3».</h1>
          <p className="hero-text">
            Учитываем бюджет, стиль, уровень и ощущения, затем показываем причины выбора и сразу даём
            сравнить лучшие варианты.
          </p>
          <div className="hero-actions">
            <Link href="/methodology" className="button">Как считаются рекомендации</Link>
          </div>
        </div>

        <div className="investor-proof">
          <div className="proof-card">
            <span>Каталог для подбора</span>
            <strong>{stats.total} моделей</strong>
          </div>
          <div className="proof-card">
            <span>Ценовой коридор</span>
            <strong>EUR {stats.minPrice}-{stats.maxPrice}</strong>
          </div>
          <div className="proof-card">
            <span>Главная цель</span>
            <strong>объяснимый выбор</strong>
          </div>
        </div>
      </section>

      <section className="workspace-grid">
        <aside className="filters-panel">
          <div>
            <p className="eyebrow">Профиль игрока</p>
            <h2>Настрой под себя</h2>
            <p className="panel-text">Несколько параметров дают достаточно точную первую подборку.</p>
          </div>

          <label className="field">
            <span>Бюджет</span>
            <select value={profile.budget} onChange={(event) => update("budget", event.target.value as QuizProfile["budget"])}>
              <option value="under_280">До 280</option>
              <option value="under_330">До 330</option>
              <option value="premium">Премиум</option>
            </select>
          </label>

          <label className="field">
            <span>Приоритет</span>
            <select value={profile.priority} onChange={(event) => update("priority", event.target.value as QuizProfile["priority"])}>
              <option value="balanced">Баланс</option>
              <option value="control">Контроль</option>
              <option value="power">Мощность</option>
              <option value="comfort">Комфорт</option>
            </select>
          </label>

          <label className="field">
            <span>Уровень</span>
            <select value={profile.level} onChange={(event) => update("level", event.target.value as QuizProfile["level"])}>
              <option value="beginner">Новичок</option>
              <option value="intermediate">Средний</option>
              <option value="advanced">Продвинутый</option>
            </select>
          </label>

          <label className="field">
            <span>Ощущение</span>
            <select value={profile.feel} onChange={(event) => update("feel", event.target.value as QuizProfile["feel"])}>
              <option value="soft">Мягкое</option>
              <option value="medium">Среднее</option>
              <option value="hard">Жесткое</option>
            </select>
          </label>

          <div className="panel-note">
            <strong>{buildProfileHeadline(profile)}</strong>
            <span>Текущий профиль для рекомендаций.</span>
          </div>
        </aside>

        <div className="catalog-column">
          {best ? (
            <section className="hero-card finder-top-pick">
              <div className="finder-top-copy">
                <p className="eyebrow">Лучшее совпадение</p>
                <h2>{best.fullName}</h2>
                <p className="hero-text">{best.verdict}</p>
                <div className="racket-detail-pills">
                  <span>{scoreLabel(getAverageScore(best))} общий балл</span>
                  <span>Баллы подбора {getQuizRecommendationScore(best, profile)}</span>
                  <span>EUR {best.currentPrice}</span>
                </div>
                <ul className="detail-list">
                  {buildExplanation(best, profile).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="hero-actions">
                  <Link href={`/rackets/${best.id}`} className="button button-primary">
                    Открыть детали
                  </Link>
                  <Link href={`/similar?to=${best.id}`} className="button">
                    Похожие модели
                  </Link>
                  {alternatives[0] ? (
                    <Link href={buildCompareHref([best.id, alternatives[0].id, alternatives[1]?.id]) ?? "/compare"} className="button">
                      Сравнить подборку
                    </Link>
                  ) : null}
                </div>
              </div>
              <div className="racket-detail-visual">
                <Image src={best.imageUrl} alt={getRacketImageAlt(best.fullName)} width={480} height={600} />
              </div>
            </section>
          ) : null}

          <section className="detail-related-grid">
            <article className="detail-list-card">
              <p className="eyebrow">Почему подходит</p>
              <h3>Объяснение выбора</h3>
              <ul className="detail-list">
                {recommendations.slice(0, 3).map((racket) => (
                  <li key={`reason-${racket.id}`}>
                    <Link href={`/rackets/${racket.id}`}>{racket.fullName}</Link> · {getQuizRecommendationReason(racket, profile)}
                  </li>
                ))}
              </ul>
            </article>

            <article className="detail-list-card">
              <p className="eyebrow">Более безопасные по цене</p>
              <h3>Если не хочется переплачивать</h3>
              <ul className="detail-list">
                {(cheaperAlternatives.length > 0 ? cheaperAlternatives : recommendations.slice(1, 3)).map((racket) => (
                  <li key={`budget-${racket.id}`}>
                    <Link href={`/rackets/${racket.id}`}>{racket.fullName}</Link> · EUR {racket.currentPrice} · {scoreLabel(getAverageScore(racket))}
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="finder-results-grid">
            {recommendations.map((racket, index) => (
              <article key={racket.id} className="racket-card">
                <div className="racket-media">
                  <Image src={racket.imageUrl} alt={getRacketImageAlt(racket.fullName)} width={480} height={600} />
                </div>
                <div className="racket-head">
                  <p>#{index + 1} рекомендация</p>
                  <h3>
                    <Link href={`/rackets/${racket.id}`}>{racket.fullName}</Link>
                  </h3>
                </div>
                <p className="racket-meta">
                  {formatShape(racket.shape)} · {racket.playStyle === "balanced" ? "баланс" : formatPlayStyle(racket.playStyle)} · {formatHardness(racket.hardness)}
                </p>
                <p className="racket-copy">{getQuizRecommendationReason(racket, profile)}</p>
                <div className="racket-pills">
                  <span>Подбор {getQuizRecommendationScore(racket, profile)}</span>
                  <span>{scoreLabel(getAverageScore(racket))}</span>
                  <span>EUR {racket.currentPrice}</span>
                </div>
                <div className="racket-actions">
                  <Link href={`/rackets/${racket.id}`} className="button">
                    Детали
                  </Link>
                  {buildCompareHref([best?.id ?? racket.id, racket.id]) ? (
                    <Link href={buildCompareHref([best?.id ?? racket.id, racket.id])!} className="button">
                      Сравнить
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </section>

          <section className="card investor-cta-card" id="personal-fitting">
            <div className="investor-cta-copy">
              <p className="eyebrow">Персональный подбор</p>
              <h2>Оставь контакт — сохраним подборку для консультации</h2>
              <p>
                Сохраним профиль игрока и лучшие совпадения, чтобы продолжить подбор с учётом магазина,
                бренда или совета специалиста.
              </p>
            </div>

            <form
              className="investor-form"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const ok = await submitLead(new FormData(form));

                if (ok) {
                  form.reset();
                }
              }}
            >
              <label className="field">
                <span>Имя</span>
                <input name="name" placeholder="Михаил" />
              </label>
              <label className="field">
                <span>Контакт</span>
                <input name="contact" placeholder="@telegram, email, WhatsApp" />
              </label>
              <label className="field">
                <span>Комментарий</span>
                <input name="notes" placeholder="Нужна помощь с подборкой или совет по ощущениям" />
              </label>
              <label className="field">
                <span>Текущая ракетка</span>
                <input name="currentRacket" placeholder="Например: Head Evo / играю без своей" />
              </label>
              <label className="field">
                <span>Когда хочешь купить</span>
                <select name="purchaseTimeline" defaultValue="this_month">
                  <option value="this_week">На этой неделе</option>
                  <option value="this_month">В этом месяце</option>
                  <option value="just_researching">Пока просто изучаю</option>
                </select>
              </label>
              <label className="field">
                <span>Как удобнее связаться</span>
                <select name="contactPreference" defaultValue="telegram">
                  <option value="telegram">Telegram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
              </label>
              <button type="submit" className="button button-primary">
                {leadState === "sending" ? "Сохраняю..." : "Сохранить персональный запрос"}
              </button>
              <p className="form-state">
                {leadState === "sent"
                  ? "Запрос сохранён вместе с профилем и текущей подборкой."
                  : leadState === "error"
                  ? "Нужны имя, контакт и валидная лучшая рекомендация."
                  : "В заявку уйдут профиль игрока, лучшая рекомендация и топ-подборка из подбора."}
              </p>
            </form>
          </section>
        </div>
      </section>
    </>
  );
}
