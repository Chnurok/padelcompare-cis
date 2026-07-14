import type { Route } from "next";

export function buildCompareHref(ids: Array<string | null | undefined>) {
  const uniqueIds = [...new Set(ids.map((item) => item?.trim()).filter(Boolean) as string[])];
  return uniqueIds.length >= 2 ? (`/compare?ids=${uniqueIds.join(",")}` as Route) : null;
}

export function normalizeOfferUrl(rawUrl: string) {
  const url = rawUrl.trim();
  if (!url) return "#";

  const [base, ...rest] = url.split("?");
  if (rest.length <= 1) {
    return url;
  }

  const params = rest
    .flatMap((chunk) => chunk.split("&"))
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return params.length ? `${base}?${params.join("&")}` : base;
}
