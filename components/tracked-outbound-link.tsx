"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";

import { trackEvent } from "@/lib/analytics";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  compareIds?: string[];
  eventType?: string;
  meta?: Record<string, string | number | boolean | null | undefined>;
  page: string;
  racketId?: string;
};

export function TrackedOutboundLink({
  children,
  compareIds = [],
  eventType = "offer_click",
  meta,
  page,
  racketId,
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
          meta
        });
      }}
    >
      {children}
    </a>
  );
}
