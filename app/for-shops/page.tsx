import type { Metadata } from "next";
import Link from "next/link";

import { AffiliateDisclosure } from "@/components/affiliate-disclosure";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { AFFILIATE_PROGRAMS } from "@/lib/commerce/affiliate";

export const metadata: Metadata = {
  title: "Offer for shops and brands",
  description:
    "Первый коммерческий оффер PadelCompare для магазинов и брендов: affiliate-ready traffic, buyer leads и intent pages."
};

const DELIVERABLES = [
  "Карточки товаров и compare-экраны с переходом в магазин",
  "SEO-страницы под buyer intent и модельные VS-запросы",
  "Лиды на персональный подбор с shortlist и контекстом игрока",
  "Отчётность по кликам, compares и входящим заявкам"
];

const PACKAGES = [
  {
    title: "Starter placement",
    price: "€290 / месяц",
    body: "1 бренд или магазин, placement в deals и detail pages, affiliate-ready deeplinks, еженедельный мини-отчёт."
  },
  {
    title: "Intent capture",
    price: "€590 / месяц",
    body: "Всё из Starter + 2 SEO landing pages, приоритет в shortlist surfaces и buyer leads из персонального подбора."
  },
  {
    title: "Launch partner",
    price: "€990 setup + revenue share",
    body: "Категорийные и VS-страницы, импорт фида, ручная доработка offer copy и совместный тест первой воронки."
  }
];

const TARGETS = AFFILIATE_PROGRAMS.map((item) => ({
  merchant: item.merchant,
  network: item.network,
  notes: item.notes,
  programUrl: item.programUrl
}));

export default function ForShopsPage() {
  return (
    <main className="page-shell">
      <AnalyticsPageView
        page="for-shops"
        stage="commercial"
        source="b2b_offer"
        intent="partner_offer"
      />

      <section className="hero-card product-hero">
        <div>
          <p className="eyebrow">B2B offer</p>
          <h1>Первый оффер для магазинов и брендов padel.</h1>
          <p className="hero-text">
            PadelCompare приводит не просто трафик, а пользователя уже в режиме выбора: через shortlist,
            compare и персональный подбор.
          </p>
          <div className="hero-actions">
            <a href="#packages" className="button button-primary">
              Смотреть пакеты
            </a>
            <Link href="/finder#personal-fitting" className="button">
              Посмотреть lead flow
            </Link>
          </div>
        </div>
      </section>

      <section className="grid">
        <article className="card">
          <p className="eyebrow">Что продаём</p>
          <h2>Buyer-intent surface</h2>
          <ul className="detail-list">
            {DELIVERABLES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="card">
          <p className="eyebrow">Кому подходит</p>
          <h2>Когда оффер имеет смысл</h2>
          <ul className="detail-list">
            <li>Магазину нужен новый performance-канал поверх обычного каталога.</li>
            <li>Бренду нужен controlled shelf для launch или push конкретной линейки.</li>
            <li>Есть готовность тестировать affiliate или revenue-share вместе с lead flow.</li>
          </ul>
        </article>
      </section>

      <section className="card detail-list-card" id="packages">
        <p className="eyebrow">Packages</p>
        <h2>Стартовые пакеты</h2>
        <div className="partner-packages">
          {PACKAGES.map((item) => (
            <article key={item.title} className="partner-package">
              <p>{item.title}</p>
              <h3>{item.price}</h3>
              <span>{item.body}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="card detail-list-card">
        <p className="eyebrow">Affiliate now</p>
        <h2>Где партнёрский слой уже подтверждён</h2>
        <div className="partner-packages">
          {TARGETS.map((item) => (
            <article key={item.merchant} className="partner-package">
              <p>{item.network}</p>
              <h3>{item.merchant}</h3>
              <span>{item.notes}</span>
              <a href={item.programUrl} className="text-link" target="_blank" rel="noreferrer">
                Source
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="card detail-card">
        <p className="eyebrow">Дальше</p>
        <h2>Как продавать это в первом письме</h2>
        <p>
          Тезис: “Мы ловим игрока в момент выбора между 2-4 моделями и можем отправлять его в ваш магазин
          или отдавать вам лид на персональный подбор. Предлагаем первый тестовый слот на 30 дней.”
        </p>
        <div className="hero-actions">
          <a href="https://www.awin.com/gb/advertisers/case-studies/padel-market-internationalising-affiliate-marketing" className="button" target="_blank" rel="noreferrer">
            Padel Market proof
          </a>
          <a href="https://noxsportusa.com/pages/become-an-ambassador" className="button" target="_blank" rel="noreferrer">
            NOX USA proof
          </a>
        </div>
        <AffiliateDisclosure />
      </section>
    </main>
  );
}
