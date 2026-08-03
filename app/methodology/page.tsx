import type { Metadata } from "next/types";
import Link from "next/link";

import { AnalyticsPageView } from "@/components/analytics-page-view";

export const metadata: Metadata = {
  title: "Как мы считаем рекомендации",
  description:
    "Прозрачная методика рейтингов и подбора PadelCompare: игровые метрики, влияние профиля игрока, цены и ограничения данных."
};

const METRICS = [
  ["Мощность", "Форма, баланс, жёсткость и атакующий профиль модели."],
  ["Контроль", "Круглая или каплевидная форма, низкий баланс, размер зоны оптимального удара."],
  ["Комфорт", "Жёсткость сердцевины, размер зоны удара и вес ракетки."],
  ["Манёвренность", "Вес, баланс и геометрия ракетки."],
  ["Прощение ошибок", "Размер зоны удара, мягкость и требуемый уровень игрока."],
  ["Вращение", "Форма, игровой профиль и жёсткость конструкции."]
] as const;

export default function MethodologyPage() {
  return (
    <main className="page-shell">
      <AnalyticsPageView page="methodology" stage="trust" source="finder" intent="understand_scoring" />

      <section className="hero-card investor-hero">
        <div className="investor-copy">
          <p className="eyebrow">Прозрачная методика</p>
          <h1>Почему одна ракетка оказывается выше другой.</h1>
          <p className="hero-text">
            PadelCompare не выдаёт рекламу за рекомендацию. Показываем, какие данные влияют на рейтинг,
            где заканчивается алгоритм и зачем всё равно стоит протестировать ракетку лично.
          </p>
          <div className="hero-actions">
            <Link href="/finder" className="button button-primary">Открыть подбор</Link>
            <Link href="/compare" className="button">Открыть сравнение</Link>
          </div>
        </div>
        <div className="investor-proof">
          <div className="proof-card"><span>Игровые оси</span><strong>6 метрик</strong></div>
          <div className="proof-card"><span>Профиль игрока</span><strong>4 ответа</strong></div>
          <div className="proof-card"><span>Брендовый бонус</span><strong>0 баллов</strong></div>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Базовый рейтинг</p>
            <h2>Шесть игровых характеристик</h2>
            <p className="panel-text">
              Каждая модель получает сопоставимые баллы по шкале 0–100 на основе нормализованных характеристик каталога.
            </p>
          </div>
        </div>
        <div className="partner-packages">
          {METRICS.map(([title, text]) => (
            <article key={title} className="partner-package">
              <p>Метрика</p>
              <h3>{title}</h3>
              <span>{text}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="investor-grid">
        <article className="investor-panel">
          <p className="eyebrow">Персонализация</p>
          <h2>Как профиль меняет порядок</h2>
          <ul className="detail-list">
            <li>Бюджет поощряет модели внутри выбранного диапазона и снижает позиции слишком дорогих.</li>
            <li>Приоритет усиливает контроль, мощность, комфорт или сбалансированный профиль.</li>
            <li>Уровень новичка повышает вес комфорта, манёвренности и прощения ошибок.</li>
            <li>Желаемое ощущение сопоставляется с мягкостью ракетки.</li>
          </ul>
        </article>
        <article className="investor-panel">
          <p className="eyebrow">Независимость</p>
          <h2>Цена ссылки не влияет на место</h2>
          <p>
            Магазин, партнёрская программа и размер возможной комиссии не участвуют в рейтинге. Сначала
            рассчитывается соответствие игроку, затем показываются доступные предложения.
          </p>
          <Link href="/privacy" className="text-link">Конфиденциальность и раскрытие партнёрства</Link>
        </article>
      </section>

      <section className="mobile-privacy-card">
        <div>
          <p className="eyebrow">Важное ограничение</p>
          <h2>Это модель выбора, а не лабораторный тест.</h2>
          <p>
            Баллы рассчитываются из характеристик каталога и помогают сузить выбор. Они не являются
            инструментальным измерением конкретного экземпляра и не заменяют тест на корте, особенно при боли в руке,
            нестандартном весе или выраженных предпочтениях по контакту.
          </p>
        </div>
        <Link href="/finder" className="button">Подобрать с учётом профиля</Link>
      </section>
    </main>
  );
}
