import Link from "next/link";
import DialogueCouncil from "./DialogueCouncil";

export const metadata = { title: "AI 十二智者圆桌 | 文化与生命" };

export default function DialoguePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <nav className="text-sm text-slate-400 mb-4">
          <Link href="/culture-life" className="hover:text-amber-300">文化与生命</Link> / AI 圆桌
        </nav>
        <h1 className="text-3xl md:text-4xl font-serif mb-4">AI 十二智者圆桌</h1>
        <p className="text-slate-400 leading-relaxed mb-8 max-w-2xl">
          写下你的生命困惑，小鸿 AI 将依次邀请 12 大文化传统的代表发言。
          所有答案同时在场，不评判对错——最终选择权在你。
        </p>
        <DialogueCouncil />
      </div>
    </main>
  );
}
