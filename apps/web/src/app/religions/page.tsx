import { fetchReligions, fetchHolySites, fetchTemples, fetchPatriarchs, type Religion, type HolySite, type Temple, type Patriarch } from "@/lib/api";
import ReligionsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "十二大信仰 - 探索全球12大宗教文化",
  description:
    "探索佛教、道教、基督教、伊斯兰教、印度教、犹太教、儒教、锡克教、神道教、藏传佛教、原住民灵性、巴哈伊教等十二大信仰传统。",
  openGraph: {
    title: "十二大信仰 - 全球12大宗教文化 | 祖庭之旅",
    description: "探索佛教、道教、基督教、伊斯兰教等十二大信仰传统，了解各信仰的起源、发展与核心教义。",
    url: "https://zuting.fszyl.top/religions",
  },
  alternates: { canonical: "https://zuting.fszyl.top/religions" },
};

export default async function ReligionsPage() {
  let religions: Religion[] = [];
  let holySites: HolySite[] = [];
  let temples: Temple[] = [];
  let patriarchs: Patriarch[] = [];
  let error = false;
  try {
    const results = await Promise.all([
      fetchReligions(),
      fetchHolySites(),
      fetchTemples(),
      fetchPatriarchs(),
    ]);
    religions = Array.isArray(results[0]) ? results[0] : [];
    holySites = Array.isArray(results[1]) ? results[1] : [];
    temples = Array.isArray(results[2]) ? results[2] : [];
    patriarchs = Array.isArray(results[3]) ? results[3] : [];
  } catch {
    error = true;
  }

  return (
    <ReligionsClient
      religions={religions}
      holySites={holySites}
      temples={temples}
      patriarchs={patriarchs}
      error={error}
    />
  );
}
