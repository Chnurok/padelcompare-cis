import test from "node:test";
import assert from "node:assert/strict";

import { rackets } from "@/data/rackets.js";
import { getPresetRecommendations, RECOMMENDATION_PRESETS } from "@/lib/catalog/recommendation";
import type { CatalogRacket } from "@/lib/catalog/catalog-db";

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
