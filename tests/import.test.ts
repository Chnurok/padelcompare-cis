import test from "node:test";
import assert from "node:assert/strict";

import { importCatalogPayload, parseCatalogImportPayload } from "@/lib/catalog/import";

const validPayload = {
  dryRun: true,
  items: [
    {
      externalKey: "head-gravity-pro-26",
      slug: "head-gravity-pro-26",
      brand: "Head",
      model: "Gravity Pro",
      fullName: "Head Gravity Pro 2026",
      season: 2026,
      shape: "round",
      skillLevel: "advanced",
      playStyle: "control",
      hardness: "medium",
      weight: 365,
      balance: "low",
      sweetSpot: "large",
      faceMaterial: "Hybrid Carbon",
      frameMaterial: "Carbon",
      coreMaterial: "Control Foam",
      verdict: "Контрольная рама для игроков, которым нужен более собранный feel и стабильный sweet spot.",
      whoItFits:
        "Тем, кто строит розыгрыш через placement, volley control и defence-to-attack transitions.",
      pros: ["плотный контроль", "стабильность в блоке", "широкий sweet spot"],
      cons: ["меньше free power", "новичкам может казаться требовательной"],
      imageUrl: "/rackets/head-gravity-pro-26.svg",
      offers: [
        {
          merchant: "Padel Pro Shop",
          url: "https://example.com/head-gravity-pro-26",
          currency: "EUR",
          price: 319
        }
      ]
    }
  ]
};

test("catalog import payload parses valid racket package", () => {
  const parsed = parseCatalogImportPayload(validPayload);

  assert.equal(parsed.items.length, 1);
  assert.equal(parsed.items[0]?.offers.length, 1);
  assert.equal(parsed.items[0]?.externalKey, "head-gravity-pro-26");
});

test("catalog import payload rejects malformed offers", () => {
  assert.throws(() =>
    parseCatalogImportPayload({
      dryRun: true,
      items: [
        {
          ...validPayload.items[0],
          offers: []
        }
      ]
    })
  );
});

test("catalog import dry run returns summary without db writes", async () => {
  const summary = await importCatalogPayload(validPayload);

  assert.equal(summary.dryRun, true);
  assert.equal(summary.rackets, 1);
  assert.equal(summary.offers, 1);
  assert.equal(summary.created, 1);
});
