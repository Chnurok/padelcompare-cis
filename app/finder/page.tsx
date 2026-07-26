import type { Metadata } from "next/types";

import { AnalyticsPageView } from "@/components/analytics-page-view";
import { RacketFinder } from "@/components/racket-finder";
import { getCatalogStatsFromDb, listRacketsFromDb } from "@/lib/catalog/catalog-db";

export const metadata: Metadata = {
  title: "Подбор ракетки | PadelCompare",
  description: "App-style подбор padel-ракетки по бюджету, стилю, уровню и feel с explainable shortlist."
};

export default async function FinderPage() {
  const [rackets, stats] = await Promise.all([listRacketsFromDb(), getCatalogStatsFromDb()]);

  return (
    <main className="page-shell">
      <AnalyticsPageView page="finder" stage="intake" source="finder_page" intent="recommend_racket" />
      <RacketFinder rackets={rackets} stats={stats} />
    </main>
  );
}
