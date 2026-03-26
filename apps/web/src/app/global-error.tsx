"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
    // Sentry capture — loaded lazily via lib/sentry
    import("@/lib/sentry")
      .then(({ captureException }) => captureException(error))
      .catch(() => {});
  }, [error]);

  return (
    <html lang="zh">
      <body
        style={{
          backgroundColor: "#0f172a",
          color: "#e2e8f0",
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🙏</div>
          <h2
            style={{
              fontSize: "1.5rem",
              color: "#D4A855",
              marginBottom: "1rem",
            }}
          >
            应用出现严重错误
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
            抱歉，应用遇到了意外错误。请刷新页面重试。
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "rgba(212, 168, 85, 0.2)",
              color: "#D4A855",
              border: "1px solid rgba(212, 168, 85, 0.3)",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            刷新页面
          </button>
        </div>
      </body>
    </html>
  );
}
