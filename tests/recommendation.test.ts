import test from "node:test";
import assert from "node:assert/strict";

import { rackets } from "@/data/rackets.js";
import {
  getAverageScore,
  getCompareEdgeHighlights,
  getPlayerFitLabel,
  getPresetRecommendations,
  getQuizRecommendationReason,
  getQuizRecommendations,
  getTradeoffNote,
  getValueScore,
  RECOMMENDATION_PRESETS
} from "@/lib/catalog/recommendation";
import type { CatalogRacket } from "@/lib/catalog/catalog-db";

const catalog = rackets.map((racket: (typeof rackets)[number]) => ({
  ...racket,
  weight: racket.weight,
  offers: [
    {
      merchant: racket.shopName,
      url: racket.shopUrl,
      currency: "EUR",
      price: racket.currentPrice
    }
  ]
})) as CatalogRacket[];

test("value hunter recommendations stay in target budget corridor", () => {
  const preset = RECOMMENDATION_PRESETS.find((item) => item.slug === "value-hunter");
  assert.ok(preset);

  const results = getPresetRecommendations(catalog, preset, 4);

  assert.equal(results.length, 4);
  assert.ok(results.every((item) => item.currentPrice <= 320));
});

test("power finisher recommendations prioritize power-style rackets", () => {
  const preset = RECOMMENDATION_PRESETS.find((item) => item.slug === "power-finisher");
  assert.ok(preset);

  const results = getPresetRecommendations(catalog, preset, 3);

  assert.ok(results.every((item) => item.playStyle === "power"));
});

test("quiz recommendations respect control-oriented intermediate profile", () => {
  const results = getQuizRecommendations(
    catalog,
    {
      budget: "under_330",
      priority: "control",
      level: "intermediate",
      feel: "medium"
    },
    3
  );

  assert.equal(results.length, 3);
  assert.ok(results.some((item) => item.playStyle === "control" || item.shape === "round"));
});

test("beginner profile prioritizes forgiving intermediate rackets", () => {
  const profile = {
    budget: "under_280" as const,
    priority: "comfort" as const,
    level: "beginner" as const,
    feel: "soft" as const
  };
  const results = getQuizRecommendations(catalog, profile, 5);

  assert.equal(results.length, 5);
  assert.ok(results.every((item) => item.skillLevel === "intermediate"));
  assert.match(getQuizRecommendationReason(results[0], profile), /первого шага|комфорт/i);
});

test("value score rewards cheaper strong rackets", () => {
  const cheaper = catalog.find((item) => item.currentPrice <= 280);
  const expensive = catalog.find((item) => item.currentPrice >= 340);

  assert.ok(cheaper);
  assert.ok(expensive);
  assert.ok(getValueScore(cheaper) >= getAverageScore(cheaper));
  assert.ok(getValueScore(cheaper) >= getValueScore(expensive) - 20);
});

test("compare edge highlights surface concrete shortlist advantages", () => {
  const shortlist = catalog.slice(0, 3);
  const highlights = getCompareEdgeHighlights(shortlist[0], shortlist);

  assert.ok(highlights.length >= 1);
  assert.ok(highlights.every((item) => typeof item === "string" && item.length > 0));
});

test("fit and tradeoff notes stay explainable", () => {
  const sample = catalog[0];

  assert.match(getPlayerFitLabel(sample), /игрок/i);
  assert.match(getTradeoffNote(sample), /Компромисс/i);
});
