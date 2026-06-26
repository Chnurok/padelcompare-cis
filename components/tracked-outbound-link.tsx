"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";

import { trackEvent } from "@/lib/analytics";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  compareIds?: string[];
  eventType?: string;
  page: string;
  racketId?: string;
};

export function TrackedOutboundLink({
  children,
  compareIds = [],
  eventType = "offer_click",
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
          compareIds
        });
      }}
    >
      {children}
    </a>
  );
}
