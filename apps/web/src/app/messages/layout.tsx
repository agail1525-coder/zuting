import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "消息",
  description: "与其他文化旅行者和商家交流，查看你的私信和咨询。",
};

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
