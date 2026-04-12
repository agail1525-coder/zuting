"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import ToastContainer from "@/components/Toast";
import { WebVitals } from "./web-vitals";
import { SentryInit } from "./sentry-init";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AuthProvider>
        <SentryInit />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-temple-900 focus:text-gold focus:border focus:border-gold/30 focus:rounded-lg focus:top-2 focus:left-2">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="min-h-screen pt-16 pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileNav />
        <ToastContainer />
        <WebVitals />
      </AuthProvider>
    </I18nProvider>
    </QueryClientProvider>
  );
}
