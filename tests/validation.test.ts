import test from "node:test";
import assert from "node:assert/strict";

import {
  catalogQuerySchema,
  compareQuerySchema,
  eventSchema,
  leadSchema
} from "@/lib/validation";

test("compare query schema deduplicates and caps ids", () => {
  const parsed = compareQuerySchema.parse({
    ids: "a,b,a,c,d,e"
  });

  assert.deepEqual(parsed.ids, ["a", "b", "c", "d"]);
});

test("lead schema rejects too-short payloads", () => {
  const parsed = leadSchema.safeParse({
    name: "A",
    contact: "1",
    intent: ""
  });

  assert.equal(parsed.success, false);
});

test("event schema keeps structured meta", () => {
  const parsed = eventSchema.parse({
    type: "offer_click",
    meta: {
      merchant: "Padel Zone",
      rank: 1,
      featured: true
    }
  });

  assert.deepEqual(parsed.meta, {
    merchant: "Padel Zone",
    rank: 1,
    featured: true
  });
});

test("catalog query schema parses numeric filters", () => {
  const parsed = catalogQuerySchema.parse({
    brand: "Nox",
    price_max: "300"
  });

  assert.equal(parsed.brand, "Nox");
  assert.equal(parsed.price_max, 300);
});
