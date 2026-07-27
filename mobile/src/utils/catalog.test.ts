import assert from "node:assert/strict";
import test from "node:test";

import snapshot from "@/data/catalog.json";
import type { CatalogRacket, FinderProfile } from "@/types/catalog";
import {
  averageScore,
  findRecommendations,
  formatPrice,
  metricScore,
  topDeals
} from "@/utils/catalog";

const catalog = snapshot as CatalogRacket[];

test("bundled catalog contains the complete release snapshot", () => {
  assert.equal(catalog.length, 150);
  assert.equal(new Set(catalog.map((racket) => racket.id)).size, 150);
  assert.equal(new Set(catalog.map((racket) => racket.brand)).size, 9);
  assert.ok(catalog.every((racket) => racket.offers.length >= 1));
});

test("ratings remain inside the supported range", () => {
  for (const racket of catalog) {
    assert.ok(metricScore(racket, "power") >= 65);
    assert.ok(metricScore(racket, "control") <= 98);
    assert.ok(averageScore(racket) >= 65);
    assert.ok(averageScore(racket) <= 98);
  }
});

test("finder returns a unique ranked shortlist", () => {
  const profile: FinderProfile = {
    budget: "under_280",
    priority: "control",
    level: "intermediate",
    feel: "soft"
  };
  const results = findRecommendations(catalog, profile, 5);

  assert.equal(results.length, 5);
  assert.equal(new Set(results.map((racket) => racket.id)).size, 5);
  assert.ok(results.some((racket) => racket.currentPrice <= 280));
});

test("deal rail only includes genuine price reductions", () => {
  for (const item of topDeals(catalog)) {
    assert.ok(item.discount > 0);
    assert.ok((item.racket.offers[0]?.previousPrice ?? 0) > item.racket.currentPrice);
  }
});

test("prices are formatted for the Russian locale", () => {
  assert.match(formatPrice(329), /329/);
});
