"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vital] ${metric.name}:`, metric.value.toFixed(2), metric.rating ?? "");
    }
  });
  return null;
}
