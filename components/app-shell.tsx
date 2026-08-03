"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Главная", icon: "Home" },
  { href: "/finder", label: "Подбор", icon: "Quiz" },
  { href: "/similar", label: "Похожие", icon: "Match" },
  { href: "/compare", label: "Сравнение", icon: "Grid" },
  { href: "/deals", label: "Скидки", icon: "Price" },
  { href: "/app", label: "Приложение", icon: "Android" }
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <div className="app-shell">
      <div className="app-shell__backdrop" />
      <div className="app-frame">
        <header className="app-topbar">
          <div>
            <p className="app-kicker">Выбор padel-ракеток</p>
            <Link href="/" className="app-brand" aria-label="PadelCompare — главная">
              PadelCompare
            </Link>
          </div>
          <div className="app-topbar__meta">
            <span>Русский сценарий выбора</span>
            <strong>Сначала Android</strong>
          </div>
        </header>

        <div className="app-content">{children}</div>

        {isAdminRoute ? null : (
          <nav className="app-tabbar" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`app-tab${active ? " app-tab--active" : ""}`}
                >
                  <span>{item.icon}</span>
                  <strong>{item.label}</strong>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
