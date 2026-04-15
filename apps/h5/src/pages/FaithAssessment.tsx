import PageHeader from "@/components/PageHeader";
import { useTranslation } from "@/lib/i18n";

const DIMENSIONS = [
  { key: "awareness", label: "觉察力", icon: "👁️", desc: "对内在与外境的觉知能力" },
  { key: "stability", label: "定力", icon: "🧘", desc: "心志坚定，不为境转" },
  { key: "vision", label: "格局力", icon: "🌏", desc: "视野宽广，胸怀天下" },
  { key: "connection", label: "连接力", icon: "🤝", desc: "与人、自然、道的连接" },
  { key: "legacy", label: "传承力", icon: "🕊️", desc: "承前启后，薪火相传" },
];

const LEVELS = [
  { name: "初觉", color: "#9CA3AF" },
  { name: "明心", color: "#60A5FA" },
  { name: "见性", color: "#A78BFA" },
  { name: "证道", color: "#F59E0B" },
  { name: "圆融", color: "#D4A855" },
];

export default function FaithAssessment() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("page.faithAssessment.title")} subtitle={t("page.faithAssessment.subtitle")} />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="bg-gradient-to-br from-[#3264ff] to-[#2850cc] rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">🔮 开启一次内观</h3>
          <p className="text-white/90 text-sm leading-relaxed mb-4">
            通过 60 道问题，从觉察/定力/格局/连接/传承五维，看见自己当下的信仰力层级。完成评估赠 50 积分。
          </p>
          <a href="https://zuting.fszyl.top/faith-assessment/start" target="_blank" rel="noopener noreferrer"
            className="inline-block px-6 py-2.5 bg-white text-[#3264ff] rounded-full font-semibold text-sm hover:bg-white/90 transition-colors">
            开始评估 →
          </a>
        </div>

        <section className="bg-white rounded-xl p-4">
          <h3 className="font-semibold text-base mb-3">五维度</h3>
          <div className="grid grid-cols-1 gap-2">
            {DIMENSIONS.map((d) => (
              <div key={d.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">{d.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{d.label}</p>
                  <p className="text-xs text-gray-500">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl p-4">
          <h3 className="font-semibold text-base mb-3">五层级</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {LEVELS.map((l, i) => (
              <div key={l.name} className="shrink-0 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: l.color }}>
                  {i + 1}
                </div>
                <span className="text-xs mt-1 text-gray-700">{l.name}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
