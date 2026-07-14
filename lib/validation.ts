import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(3).max(120),
  intent: z.string().trim().min(1).max(40),
  sourcePage: z.string().trim().max(80).optional().default(""),
  notes: z.string().trim().max(500).optional().default(""),
  selectedId: z.string().trim().optional(),
  compareIds: z.array(z.string().trim()).max(4).optional().default([])
});

export const eventSchema = z.object({
  type: z.string().trim().min(1).max(60),
  page: z.string().trim().max(120).optional(),
  racketId: z.string().trim().max(120).optional(),
  stage: z.string().trim().max(60).optional(),
  source: z.string().trim().max(120).optional(),
  intent: z.string().trim().max(120).optional(),
  compareIds: z.array(z.string().trim().max(120)).max(4).optional().default([]),
  meta: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional().default({})
});

export const catalogQuerySchema = z.object({
  search: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  shape: z.string().trim().optional(),
  skill: z.string().trim().optional(),
  style: z.string().trim().optional(),
  hardness: z.string().trim().optional(),
  price_max: z.coerce.number().int().positive().optional()
});

export const compareQuerySchema = z.object({
  ids: z
    .string()
    .trim()
    .min(1)
    .transform((value) => [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))].slice(0, 4))
});

const importOfferSchema = z.object({
  merchant: z.string().trim().min(2).max(120),
  url: z.string().trim().url(),
  currency: z.string().trim().min(3).max(8).default("EUR"),
  price: z.coerce.number().positive(),
  previousPrice: z.coerce.number().positive().optional(),
  availability: z.enum(["in_stock", "limited", "preorder", "out_of_stock"]).default("in_stock"),
  stockNote: z.string().trim().max(120).optional(),
  lastCheckedAt: z.string().datetime().optional()
});

export const importRacketSchema = z.object({
  externalKey: z.string().trim().min(3).max(120),
  slug: z.string().trim().min(3).max(120),
  brand: z.string().trim().min(2).max(120),
  model: z.string().trim().min(2).max(120),
  fullName: z.string().trim().min(4).max(160),
  season: z.coerce.number().int().min(2020).max(2035),
  shape: z.string().trim().min(3).max(40),
  skillLevel: z.string().trim().min(3).max(40),
  playStyle: z.string().trim().min(3).max(40),
  hardness: z.string().trim().min(3).max(40),
  weight: z.coerce.number().int().min(300).max(420),
  balance: z.string().trim().min(2).max(40),
  sweetSpot: z.string().trim().min(2).max(40),
  faceMaterial: z.string().trim().min(2).max(120),
  frameMaterial: z.string().trim().min(2).max(120),
  coreMaterial: z.string().trim().min(2).max(120),
  verdict: z.string().trim().min(8).max(280),
  whoItFits: z.string().trim().min(8).max(220),
  pros: z.array(z.string().trim().min(2).max(120)).min(2).max(6),
  cons: z.array(z.string().trim().min(2).max(120)).min(2).max(6),
  imageUrl: z.string().trim().min(3).max(240),
  offers: z.array(importOfferSchema).min(1).max(8)
});

export const catalogImportSchema = z.object({
  dryRun: z.boolean().optional().default(false),
  sourceLabel: z.string().trim().min(2).max(120).optional(),
  items: z.array(importRacketSchema).min(1).max(100)
});
