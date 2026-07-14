import test from "node:test";
import assert from "node:assert/strict";

import { AFFILIATE_PROGRAMS, buildAffiliateLink } from "@/lib/commerce/affiliate";

test("affiliate config contains multiple real programs", () => {
  assert.ok(AFFILIATE_PROGRAMS.length >= 4);
  assert.ok(AFFILIATE_PROGRAMS.some((item) => item.merchant === "Padel Market"));
  assert.ok(AFFILIATE_PROGRAMS.some((item) => item.merchant === "NOX USA"));
});

test("affiliate builder only decorates supported domains", () => {
  const supported = buildAffiliateLink("https://head.com/en_US/p/speed-motion");
  const unsupported = buildAffiliateLink("https://example.com/racket");

  assert.equal(supported.isAffiliate, true);
  assert.match(supported.url, /utm_medium=affiliate/);
  assert.equal(unsupported.isAffiliate, false);
});
