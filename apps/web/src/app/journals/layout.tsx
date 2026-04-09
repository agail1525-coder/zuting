import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "旅行日志",
  description: "记录你的文化之旅，分享旅途感悟，回顾探访足迹。",
};

export default function JournalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
