export type AnalyticsPayload = {
  type: string;
  page?: string;
  racketId?: string;
  compareIds?: string[];
  meta?: Record<string, string | number | boolean | null | undefined>;
};

export async function trackEvent(payload: AnalyticsPayload) {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload),
      keepalive: true
    });
  } catch {
    // analytics should never block the user flow
  }
}
