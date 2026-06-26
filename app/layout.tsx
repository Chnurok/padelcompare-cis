import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://185.205.246.169:8087"),
  title: {
    default: "PadelCompare CIS",
    template: "%s | PadelCompare CIS"
  },
  description: "Русскоязычный decision layer для выбора padel-ракеток: каталог, detail pages и compare flow.",
  openGraph: {
    title: "PadelCompare CIS",
    description: "Каталог, detail pages и compare flow для выбора padel-ракеток.",
    url: "http://185.205.246.169:8087",
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
      <body>{children}</body>
    </html>
  );
}
