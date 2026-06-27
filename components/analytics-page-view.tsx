"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";

type Props = {
  compareIds?: string[];
  intent?: string;
  page: string;
  racketId?: string;
  source?: string;
  stage?: string;
  type?: string;
};

export function AnalyticsPageView({
  compareIds = [],
  intent,
  page,
  racketId,
  source,
  stage,
  type = "page_view"
}: Props) {
  useEffect(() => {
    void trackEvent({
      type,
      page,
      racketId,
      compareIds,
      intent,
      source,
      stage
    });
  }, [compareIds, intent, page, racketId, source, stage, type]);

  return null;
}
