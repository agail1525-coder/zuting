import { fetchSeals, type Seal } from "@/lib/api";
import SealsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "曹溪愿命三十印 - 五系修行之路",
  description:
    "曹溪愿命三十印 — 五系三十印，从初印系、中印系、印果印、成道印到归源印的完整修行之路。The 30 Seals of Caoxi — a spiritual journey through five seal series.",
  openGraph: {
    title: "曹溪愿命三十印 - 五系修行之路 | 祖庭之旅",
    description:
      "五系三十印完整修行指南：初印系(青)、中印系(蓝)、印果印(紫)、成道印(红)、归源印(金)。",
    url: "https://zuting.fszyl.top/seals",
  },
  alternates: {
    canonical: "https://zuting.fszyl.top/seals",
  },
};

export default async function SealsPage() {
  let seals: Seal[] = [];
  let error = false;
  try {
    seals = await fetchSeals();
  } catch {
    error = true;
  }

  return <SealsClient seals={seals} error={error} />;
}
