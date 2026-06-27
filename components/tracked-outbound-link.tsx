"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";

import { trackEvent } from "@/lib/analytics";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  compareIds?: string[];
  eventType?: string;
  intent?: string;
  meta?: Record<string, string | number | boolean | null | undefined>;
  page: string;
  racketId?: string;
  source?: string;
  stage?: string;
};

export function TrackedOutboundLink({
  children,
  compareIds = [],
  eventType = "offer_click",
  intent,
  meta,
  page,
  racketId,
  source,
  stage,
  onClick,
  ...props
}: Props) {
  return (
    <a
      {...props}
      onClick={(event) => {
        onClick?.(event);
        void trackEvent({
          type: eventType,
          page,
          racketId,
          compareIds,
          intent,
          meta,
          source,
          stage
        });
      }}
    >
      {children}
    </a>
  );
}
