import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(3).max(120),
  intent: z.string().trim().min(1).max(40),
  notes: z.string().trim().max(500).optional().default(""),
  selectedId: z.string().trim().optional(),
  compareIds: z.array(z.string().trim()).max(4).optional().default([])
});

export const eventSchema = z.object({
  type: z.string().trim().min(1).max(60),
  page: z.string().trim().max(120).optional(),
  racketId: z.string().trim().max(120).optional(),
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
