import type { Metadata } from "next/types";
import { AppShell } from "@/components/app-shell";
import { getSiteUrl } from "@/lib/site-config";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "PadelCompare CIS",
    template: "%s | PadelCompare CIS"
  },
  description: "Русскоязычный decision layer для выбора padel-ракеток: каталог, detail pages и compare flow.",
  openGraph: {
    title: "PadelCompare CIS",
    description: "Каталог, detail pages и compare flow для выбора padel-ракеток.",
    url: siteUrl.toString(),
    siteName: "PadelCompare CIS",
    locale: "ru_RU",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "PadelCompare CIS",
    description: "Каталог, detail pages и compare flow для выбора padel-ракеток."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
