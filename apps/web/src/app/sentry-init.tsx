"use client";

import { useEffect } from "react";
import { initSentry } from "@/lib/sentry";

/**
 * Client component that initializes Sentry on mount.
 * Add this to your providers or layout.
 */
export function SentryInit() {
  useEffect(() => {
    initSentry();
  }, []);

  return null;
}
