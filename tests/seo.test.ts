import test from "node:test";
import assert from "node:assert/strict";

import { rackets } from "@/data/rackets.js";
import type { CatalogRacket } from "@/lib/catalog/catalog-db";
import {
  getSeoCategoryPage,
  getSeoCategoryRecommendations,
  getSeoVsPage
} from "@/lib/seo/landing-pages";

const catalog = rackets.map((racket) => ({
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

test("seo category pages resolve known slugs", () => {
  const page = getSeoCategoryPage("best-control-padel-rackets");

  assert.ok(page);
  assert.equal(page.presetSlug, "control-builder");
});

test("seo category recommendations return ranked rackets", () => {
  const items = getSeoCategoryRecommendations(catalog, "best-power-padel-rackets", 4);

  assert.equal(items.length, 4);
  assert.ok(items.some((item) => item.playStyle === "power"));
});

test("vs pages resolve regardless of side order", () => {
  const page = getSeoVsPage("bullpadel-vertex-04-25", "nox-at10-18k-25");

  assert.ok(page);
  assert.match(page.title, /Nox AT10 Genius 18K vs Bullpadel Vertex 04/);
});
