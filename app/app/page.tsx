import type { Metadata } from "next/types";
import Image from "next/image";
import Link from "next/link";

import { AnalyticsPageView } from "@/components/analytics-page-view";
import { MobileAppWaitlist } from "@/components/mobile-app-waitlist";

export const metadata: Metadata = {
  title: "Приложение для Android",
  description:
    "PadelCompare для Android: каталог 150 ракеток, умный подбор, сравнение и сохранённый shortlist даже без интернета.",
  openGraph: {
    title: "PadelCompare для Android",
    description: "Выбрать, сравнить и сохранить padel-ракетку — в одном приложении."
  }
};

const FEATURES = [
  {
    number: "01",
    title: "150 моделей офлайн",
    text: "Каталог и ключевые характеристики доступны сразу после установки — даже без сети."
  },
  {
    number: "02",
    title: "Подбор с объяснением",
    text: "Учитываем уровень, стиль, жёсткость и бюджет, а затем объясняем каждую рекомендацию."
  },
  {
    number: "03",
    title: "Сравнение 2–4 ракеток",
    text: "Контроль, мощность, комфорт и другие игровые метрики собраны на одном экране."
  },
  {
    number: "04",
    title: "Shortlist всегда с вами",
    text: "Сохранённые модели остаются на устройстве и не требуют регистрации."
  }
] as const;

export default function MobileAppPage() {
  return (
    <main className="page-shell mobile-app-page">
      <AnalyticsPageView page="mobile_app" stage="discovery" source="website" intent="android_early_access" />

      <section className="mobile-app-hero">
        <div className="mobile-app-hero__copy">
          <p className="eyebrow">PadelCompare для Android</p>
          <div className="release-pill"><span /> Первый релиз — Google Play</div>
          <h1>Твоя следующая ракетка уже в кармане.</h1>
          <p className="hero-text">
            Подбор, сравнение, реальные предложения и сохранённый shortlist — в нативном приложении,
            которое работает даже без интернета.
          </p>
          <div className="hero-actions">
            <a href="#early-access" className="button button-primary">Попасть в Android-тест</a>
            <Link href="/finder" className="button">Попробовать подбор на сайте</Link>
          </div>
          <div className="mobile-proofline" aria-label="Главные возможности">
            <span><strong>150</strong> ракеток</span>
            <span><strong>9</strong> брендов</span>
            <span><strong>0</strong> регистраций</span>
          </div>
        </div>

        <div className="phone-stage" aria-label="Превью экранов приложения PadelCompare">
          <div className="phone phone--back">
            <div className="phone__screen phone__screen--finder">
              <div className="phone__status"><span>9:41</span><span>● ● ●</span></div>
              <p className="phone__eyebrow">УМНЫЙ ПОДБОР</p>
              <h2>Что важнее в игре?</h2>
              <div className="phone__option is-active">Баланс</div>
              <div className="phone__option">Контроль</div>
              <div className="phone__option">Мощность</div>
              <div className="phone__option">Комфорт</div>
              <div className="phone__cta">Показать рекомендации</div>
            </div>
          </div>
          <div className="phone phone--front">
            <div className="phone__screen">
              <div className="phone__status"><span>9:41</span><span>● ● ●</span></div>
              <p className="phone__eyebrow">ТОП ДЛЯ ТЕБ</p>
              <h2>Nox AT10 18K</h2>
              <div className="phone__racket">
                <Image src="/rackets/photos/nox-at10-18k-25.webp" alt="Nox AT10 18K" width={260} height={330} priority />
              </div>
              <div className="phone__score"><strong>9.1</strong><span>баланс и контроль</span></div>
              <div className="phone__metrics"><span>Контроль 9.4</span><span>Комфорт 8.8</span></div>
              <div className="phone__nav"><span>Главная</span><strong>Каталог</strong><span>Подбор</span><span>Мои</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mobile-feature-grid" aria-labelledby="mobile-features-title">
        <div className="mobile-feature-intro">
          <p className="eyebrow">Всё нужное, без шума</p>
          <h2 id="mobile-features-title">Решение, а не ещё один каталог.</h2>
          <p>Приложение помогает пройти путь от вопроса «что мне подойдёт» до уверенного shortlist.</p>
        </div>
        {FEATURES.map((feature) => (
          <article key={feature.number} className="mobile-feature-card">
            <span>{feature.number}</span>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>

      <section className="mobile-privacy-card">
        <div>
          <p className="eyebrow">Приватность по умолчанию</p>
          <h2>Без аккаунта. Без слежки.</h2>
          <p>
            Избранное и сравнения хранятся локально на устройстве. Приложение не просит доступ к контактам,
            геолокации, камере или фотографиям.
          </p>
        </div>
        <Link href="/privacy" className="button">Политика конфиденциальности</Link>
      </section>

      <section id="early-access" className="mobile-early-access">
        <div>
          <p className="eyebrow">Закрытое тестирование</p>
          <h2>Получите приложение первыми.</h2>
          <p>
            Оставьте контакт — пришлём официальную ссылку Google Play, как только откроется тестовый канал.
          </p>
        </div>
        <MobileAppWaitlist />
      </section>
    </main>
  );
}
