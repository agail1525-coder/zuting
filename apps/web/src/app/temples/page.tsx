import { fetchReligions, fetchTemples, type Religion, type Temple } from "@/lib/api";
import TemplesClient from "./client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "全球27座祖庭 - 追溯信仰源流",
  description:
    "探索全球27座祖庭，追溯各大信仰的历史源流与文化根脉。Explore 27 ancestral temples worldwide, tracing the origins of world faiths.",
  openGraph: {
    title: "全球27座祖庭 - 信仰源流 | 祖庭之旅",
    description: "探索全球27座祖庭，追溯各大信仰的历史源流与文化根脉。",
    url: "https://zuting.fszyl.top/temples",
  },
  alternates: {
    canonical: "https://zuting.fszyl.top/temples",
  },
};

export default async function TemplesPage() {
  let religions: Religion[] = [];
  let temples: Temple[] = [];
  let error = false;
  try {
    [religions, temples] = await Promise.all([
      fetchReligions(),
      fetchTemples(),
    ]);
  } catch {
    error = true;
  }

  return <TemplesClient religions={religions} temples={temples} error={error} />;
}
