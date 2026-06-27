import { prisma } from "@/lib/db";

type EventMeta = {
  intent?: string;
  source?: string;
  stage?: string;
};

export type FunnelDashboard = {
  funnel: Array<{ label: string; value: number }>;
  bySource: Array<{ label: string; value: number }>;
  byIntent: Array<{ label: string; value: number }>;
  byStage: Array<{ label: string; value: number }>;
  compareLinkCopies: number;
  compareCtaClicks: number;
};

function parseMeta(input: string | null): EventMeta {
  if (!input) return {};

  try {
    const parsed = JSON.parse(input) as EventMeta;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function countBy(items: string[]) {
  const map = new Map<string, number>();

  for (const item of items.filter(Boolean)) {
    map.set(item, (map.get(item) ?? 0) + 1);
  }

  return [...map.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));
}

export async function getFunnelDashboardFromDb(): Promise<FunnelDashboard> {
  const events = await prisma.analyticsEvent.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 5000,
    select: {
      type: true,
      page: true,
      meta: true
    }
  });

  const metas = events.map((event) => parseMeta(event.meta));

  const pageViews = events.filter((event) => event.type === "page_view");
  const detailViews = pageViews.filter((event) => event.page === "detail");
  const compareOpens = events.filter((event) => event.type === "compare_open");
  const offerClicks = events.filter((event) => event.type === "offer_click");
  const leadSubmits = events.filter((event) => event.type === "lead_submit");
  const compareLinkCopies = events.filter((event) => event.type === "compare_link_copy").length;
  const compareCtaClicks = events.filter((event) => event.type === "compare_cta_click").length;

  return {
    funnel: [
      { label: "Home / landing views", value: pageViews.filter((event) => event.page === "home").length },
      { label: "Detail views", value: detailViews.length },
      { label: "Compare opens", value: compareOpens.length },
      { label: "Offer clicks", value: offerClicks.length },
      { label: "Lead submits", value: leadSubmits.length }
    ],
    bySource: countBy(metas.map((meta) => meta.source ?? "unknown")),
    byIntent: countBy(metas.map((meta) => meta.intent ?? "unknown")),
    byStage: countBy(metas.map((meta) => meta.stage ?? "unknown")),
    compareLinkCopies,
    compareCtaClicks
  };
}
