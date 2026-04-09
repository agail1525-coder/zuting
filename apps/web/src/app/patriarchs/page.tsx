import { fetchReligions, fetchPatriarchs, type Religion, type Patriarch } from "@/lib/api";
import PatriarchsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "28位祖师 - 各大文化传统创始人与传承者",
  description:
    "了解28位祖师的生平与教诲，涵盖佛教文化、道教文化、基督教文化等各文化传统创始人与重要传承者。Learn about 28 patriarchs — founders and key figures across world religions.",
  openGraph: {
    title: "28位祖师 - 文化传承者 | 祖庭之旅",
    description: "了解28位祖师的生平与教诲，涵盖各大文化传统创始人与重要传承者。",
    url: "https://zuting.fszyl.top/patriarchs",
  },
  alternates: {
    canonical: "https://zuting.fszyl.top/patriarchs",
  },
};

export default async function PatriarchsPage() {
  let religions: Religion[] = [];
  let patriarchs: Patriarch[] = [];
  let error = false;
  try {
    [religions, patriarchs] = await Promise.all([
      fetchReligions(),
      fetchPatriarchs(),
    ]);
  } catch {
    error = true;
  }

  return <PatriarchsClient religions={religions} patriarchs={patriarchs} error={error} />;
}
