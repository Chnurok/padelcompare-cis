"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";

type Props = {
  compareIds?: string[];
  page: string;
  racketId?: string;
  type?: string;
};

export function AnalyticsPageView({
  compareIds = [],
  page,
  racketId,
  type = "page_view"
}: Props) {
  useEffect(() => {
    void trackEvent({
      type,
      page,
      racketId,
      compareIds
    });
  }, [compareIds, page, racketId, type]);

  return null;
}
