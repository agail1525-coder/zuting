'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  getQuestions,
  submitAssessment,
  FaithQuestion,
  FaithAssessmentResult,
} from '@/lib/api/faith-assessment';

/* ═══════════════ Constants ═══════════════ */

const MODES = [
  {
    key: 'PERSONAL',
    label: '个人圆满',
    sub: '适合创业者与管理者',
    icon: '🧘',
    color: '#D4A855',
    bg: 'from-amber-900/40 to-yellow-900/30',
    border: 'border-amber-700/40',
    href: '/personal-growth',
  },
  {
    key: 'FAMILY',
    label: '家庭幸福',
    sub: '适合家庭成员共同参与',
    icon: '🏠',
    color: '#2D8B6F',
    bg: 'from-emerald-900/40 to-green-900/30',
    border: 'border-emerald-700/40',
    href: '/family-harmony',
  },
  {
    key: 'ENTERPRISE',
    label: '企业兴旺',
    sub: '适合企业团队与领导层',
    icon: '🏢',
    color: '#3264ff',
    bg: 'from-blue-900/40 to-indigo-900/30',
    border: 'border-blue-700/40',
    href: '/team-culture',
  },
] as const;

const DIMENSIONS: Record<string, { label: string; icon: string; desc: string }> = {
  AWARENESS: { label: '觉察力', icon: '👁', desc: '自我觉知与当下感知能力' },
  RESILIENCE: { label: '定力', icon: '🪨', desc: '情绪稳定与抗压韧性' },
  VISION: { label: '格局力', icon: '🔭', desc: '全局思维与战略远见' },
  CONNECTION: { label: '连接力', icon: '🤝', desc: '关系质量与共情深度' },
  LEGACY: { label: '传承力', icon: '🌱', desc: '使命感与长期影响力' },
};

const LEVELS = [
  { code: 'CHUJUE', name: '初觉', color: '#0EA5E9', desc: '开始觉醒内在力量' },
  { code: 'MINGXIN', name: '明心', color: '#6366F1', desc: '看清内心真实需求' },
  { code: 'JIANXING', name: '见性', color: '#A855F7', desc: '认识并接纳真实本性' },
  { code: 'ZHENGDAO', name: '证道', color: '#EF4444', desc: '知行合一的实践者' },
  { code: 'YUANRONG', name: '圆融', color: '#F59E0B', desc: '内外圆满的生命状态' },
];

/* ═══════════ 维度深度解读 (按分数段) ═══════════ */

const DIMENSION_INSIGHTS: Record<string, { high: string; mid: string; low: string }> = {
  AWARENESS: {
    high: '你具备极强的自我觉知能力，能在压力下保持清醒的内观。这种觉察力是所有成长的起点——你已经掌握了"停下来看见自己"的能力。建议：尝试将觉察延伸到身体感受层面，通过正念行走或禅坐加深与当下的连接。',
    mid: '你有一定的自我觉知基础，但在高压情境下可能会失去觉察。你的"自动驾驶模式"偶尔会接管你的反应。建议：每天设置3个"觉察闹钟"，在提醒时暂停30秒，感受当下的身体状态和情绪。',
    low: '你可能长期处于忙碌中，很少有机会停下来审视自己的内心状态。情绪和反应模式在不知不觉中主导着你的决策。建议：从每天5分钟的静坐冥想开始，不需要任何技巧，只是安静地坐着，观察呼吸。',
  },
  RESILIENCE: {
    high: '你拥有坚韧的内在力量，逆境对你来说是锤炼而非打击。你能在风暴中保持内心的平静，这种定力是领袖最稀缺的品质。建议：将这种定力传递给身边的人，成为团队和家庭的"定海神针"。',
    mid: '你有应对挫折的基本能力，但在连续打击下可能会动摇。你的恢复力还有提升空间，尤其在情绪持久战中。建议：建立"韧性仪式"——一个你在低谷时必做的行为（散步、写日记、冥想），让它成为你的心理锚点。',
    low: '面对压力和挫折时，你容易感到被淹没。情绪波动影响着你的判断力和行动力。这不是弱点，而是一个巨大的成长机会。建议：从培养"微定力"开始——遇到情绪冲击时，先做3次深呼吸再回应。',
  },
  VISION: {
    high: '你能站在很高的维度看问题，不被眼前的得失困住。你的战略思维和长线布局能力是企业家最珍贵的资产。建议：定期与不同领域的思想者交流，保持视野的广度和新鲜度。',
    mid: '你有一定的格局意识，但可能在执行压力下回到短期思维。大方向清楚，但中长期规划还不够坚定。建议：每月留出半天"战略静思时间"，远离日常事务，专注思考3-5年的愿景。',
    low: '你可能过于聚焦在眼前事务，缺少抬头看路的习惯。当下的忙碌遮蔽了长远的方向感。建议：每周阅读一篇跨行业趋势文章，逐步培养"跳出棋盘看棋"的思维习惯。',
  },
  CONNECTION: {
    high: '你是天生的关系构建者，能与人建立深度的信任和共鸣。你的共情能力让周围的人感到被理解和支持。建议：有意识地扩大你的关系网络半径，与更多元背景的人建立连接。',
    mid: '你能维护现有关系，但在建立深度信任方面还有空间。你可能更擅长工作关系，而非心灵层面的连接。建议：在重要关系中练习"深度聆听"——完全放下自己的判断和回应欲，只是全身心地听。',
    low: '你可能在关系中偏向独立和效率导向，深度连接是你的成长盲区。信任的建立需要你主动展示更多的开放和脆弱。建议：选择一个你信任的人，尝试分享一件你从未说过的心里话。',
  },
  LEGACY: {
    high: '你已经超越了个人成功的追求，开始思考"我能为这个世界留下什么"。使命感驱动着你的行动，这种力量将成倍放大你的影响力。建议：将你的智慧和经验系统化，开始有计划地培养接班人或年轻领袖。',
    mid: '你偶尔会思考生命的意义和长期影响，但日常忙碌让这些思考时断时续。你有传承的意识，但还没有形成清晰的使命宣言。建议：尝试写一封"给10年后的自己"的信，通过书写来激活你的使命意识。',
    low: '你目前更聚焦在个人目标的实现上，对"留下什么"的思考还比较模糊。这很正常——当你准备好时，传承力会自然觉醒。建议：找一位你钦佩的导师聊聊，了解他们是如何找到人生使命的。',
  },
};

/* ═══════════ 文化之旅计划模板 ═══════════ */

const PILGRIMAGE_PLANS: Record<string, Record<string, { destination: string; activity: string; duration: string; insight: string }>> = {
  AWARENESS: {
    PERSONAL: { destination: '日本京都·南禅寺', activity: '三日止观禅修 + 枯山水冥想 + 茶道觉察训练', duration: '3-5天', insight: '在禅宗发源地，通过"只管打坐"的文化体验，深度唤醒你的觉察力' },
    FAMILY: { destination: '泰国清迈·松德寺', activity: '家庭正念营 + 亲子冥想 + 感恩仪式', duration: '4-6天', insight: '全家一起学习正念，在安静的寺院中重新"看见"彼此' },
    ENTERPRISE: { destination: '印度瑞诗凯诗', activity: '企业领袖正念闭关 + 瑜伽觉察 + 恒河晨祷', duration: '5-7天', insight: '在瑜伽发源地，提升领导者最核心的能力——深度觉察' },
  },
  RESILIENCE: {
    PERSONAL: { destination: '西藏拉萨·色拉寺', activity: '高原磨炼 + 辩经观摩 + 转山文化之旅', duration: '5-7天', insight: '在世界屋脊，用身体的极限挑战锻造内心的坚韧' },
    FAMILY: { destination: '尼泊尔加德满都', activity: '家庭徒步体验 + 佛塔祈福 + 共渡难关挑战', duration: '5-7天', insight: '通过共同面对自然的挑战，锻造家庭的集体韧性' },
    ENTERPRISE: { destination: '韩国海印寺', activity: '团队寺院生活体验 + 108拜体验 + 领导力定力训练', duration: '3-5天', insight: '在千年古刹中，团队一起经历严格的文化体验，磨炼组织定力' },
  },
  VISION: {
    PERSONAL: { destination: '以色列耶路撒冷', activity: '三教圣城深度研学 + 历史智慧对话 + 领袖格局工作坊', duration: '6-8天', insight: '站在三大文明的交汇点，用千年文化智慧打开你的格局视野' },
    FAMILY: { destination: '意大利梵蒂冈+佛罗伦萨', activity: '文艺复兴人文探索 + 家庭愿景工作坊 + 教堂冥思', duration: '5-7天', insight: '在西方文明的精神高地，与家人一起探讨"我们要去哪里"' },
    ENTERPRISE: { destination: '希腊雅典·德尔菲', activity: '哲学溯源之旅 + 战略思维训练 + "认识你自己"工作坊', duration: '5-7天', insight: '在西方哲学的发源地，提升企业战略的纵深与格局' },
  },
  CONNECTION: {
    PERSONAL: { destination: '印度菩提伽耶', activity: '慈悲禅修 + 布施体验 + 社区服务 + 深度对话', duration: '5-7天', insight: '在佛陀悟道之地，体验从"我"到"我们"的连接力转化' },
    FAMILY: { destination: '巴厘岛乌布', activity: '家庭净化仪式 + 水神庙共祈 + 感恩家书 + 亲密关系重建', duration: '5-7天', insight: '在"神之岛"的灵性氛围中，重新编织家庭的情感纽带' },
    ENTERPRISE: { destination: '不丹廷布', activity: '幸福国度团建 + GNH幸福理念学习 + 团队信任重建', duration: '5-7天', insight: '在全球最幸福的国度，重新定义团队的"连接"方式' },
  },
  LEGACY: {
    PERSONAL: { destination: '中国曲阜·孔庙', activity: '儒家传承研修 + 家训撰写 + 立志仪式 + 导师精神工作坊', duration: '3-5天', insight: '在至圣先师的故里，找到"为天地立心"的传承使命' },
    FAMILY: { destination: '中国嵩山·少林寺', activity: '家族传承之旅 + 禅武体验 + 家训刻碑 + 三代共修', duration: '4-6天', insight: '在千年祖庭，让家风家训从口号变成可传承的精神DNA' },
    ENTERPRISE: { destination: '日本高野山', activity: '百年企业文化探访 + 真言密教智慧 + 企业精神宪章制定', duration: '5-7天', insight: '在空海大师的道场，探索日本百年企业基业长青的精神密码' },
  },
};

/* ═══════════ 推荐成长主题名称映射 ═══════════ */

const THEME_NAME_MAP: Record<string, string> = {
  'pg-awakening': '觉醒之旅', 'pg-fortitude': '定力之旅', 'pg-vision': '格局之旅',
  'pg-rebirth': '重生之旅', 'pg-compassion': '慈悲之旅', 'pg-legacy': '传灯之旅',
  'fh-unity': '同心之旅', 'fh-heritage': '传家之旅', 'fh-reconciliation': '和解之旅',
  'fh-gratitude': '感恩之旅', 'fh-guardian': '守护之旅', 'fh-roots': '归根之旅',
  'tc-zen-retreat': '企业禅修营', 'tc-leadership-dao': '领导力道场', 'tc-warrior-spirit': '战士精神',
  'tc-resilient-culture': '韧性文化', 'tc-gratitude-economy': '感恩经济', 'tc-legacy-building': '传承基业',
};

type Step = 'landing' | 'mode' | 'quiz' | 'calculating' | 'result';

/* ═══════════════ Main Component ═══════════════ */

export default function FaithAssessmentClient() {
  const [step, setStep] = useState<Step>('landing');
  const [mode, setMode] = useState('');
  const [questions, setQuestions] = useState<FaithQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<FaithAssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);

  const modeObj = MODES.find((m) => m.key === mode);

  /* 选择模式 */
  const handleSelectMode = useCallback(async (m: string) => {
    setMode(m);
    setLoading(true);
    try {
      const data = await getQuestions(m);
      setQuestions(data.items);
      setCurrentQ(0);
      setAnswers({});
      setStep('quiz');
    } catch {
      alert('加载题目失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  }, []);

  /* 选择答案 */
  const handleAnswer = useCallback(
    (questionId: string, option: string) => {
      const newAnswers = { ...answers, [questionId]: option };
      setAnswers(newAnswers);

      if (currentQ < questions.length - 1) {
        setTimeout(() => setCurrentQ((q) => q + 1), 300);
      }
    },
    [answers, currentQ, questions.length],
  );

  /* 提交 */
  const handleSubmit = useCallback(async () => {
    setStep('calculating');
    try {
      const answerList = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      }));
      const res = await submitAssessment(mode, answerList);
      setResult(res);
      setTimeout(() => setStep('result'), 1500);
    } catch {
      alert('提交失败，请重试');
      setStep('quiz');
    }
  }, [answers, mode]);

  /* 重新开始 */
  const handleRetake = () => {
    setStep('mode');
    setResult(null);
    setAnswers({});
    setCurrentQ(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {step === 'landing' && <LandingSection onStart={() => setStep('mode')} />}
      {step === 'mode' && (
        <ModeSelector onSelect={handleSelectMode} loading={loading} />
      )}
      {step === 'quiz' && questions.length > 0 && (
        <QuizSection
          questions={questions}
          currentQ={currentQ}
          answers={answers}
          modeColor={modeObj?.color || '#8B5CF6'}
          onAnswer={handleAnswer}
          onBack={() => setCurrentQ((q) => Math.max(0, q - 1))}
          onNext={() => setCurrentQ((q) => Math.min(questions.length - 1, q + 1))}
          onSubmit={handleSubmit}
        />
      )}
      {step === 'calculating' && <CalculatingAnimation />}
      {step === 'result' && result && (
        <ResultSection result={result} modeObj={modeObj!} onRetake={handleRetake} />
      )}
    </div>
  );
}

/* ═══════════════ Landing Section ═══════════════ */

function LandingSection({ onStart }: { onStart: () => void }) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full bg-violet-500/10 blur-3xl top-20 -left-48" />
        <div className="absolute w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl bottom-20 right-[-10rem]" />
      </div>

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-8">
          <span>🔮</span>
          <span>五维信仰力评估</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
          让信仰成为
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            你的力量
          </span>
        </h1>

        <p className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
          每个人内心都有一座精神的祖庭。通过五维信仰力评估，发现你的觉察力、定力、格局力、连接力和传承力分布，找到最适合你的成长路径。
        </p>

        <p className="text-gray-500 mb-12">
          约5分钟 · 20道精选题目 · 即时生成专属报告
        </p>

        <button
          onClick={onStart}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-lg font-bold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5"
        >
          开始评估
        </button>

        {/* Level preview */}
        <div className="mt-16 flex justify-center gap-3 flex-wrap">
          {LEVELS.map((l) => (
            <div
              key={l.code}
              className="px-4 py-2 rounded-full border text-sm"
              style={{ borderColor: l.color + '40', color: l.color }}
            >
              {l.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ Mode Selector ═══════════════ */

function ModeSelector({
  onSelect,
  loading,
}: {
  onSelect: (mode: string) => void;
  loading: boolean;
}) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6">
      <h2 className="text-3xl md:text-4xl font-black text-white mb-4 text-center">
        选择评估模式
      </h2>
      <p className="text-gray-400 mb-12 text-center max-w-lg">
        同样的五维力量，不同的场景视角。选择最贴近你当前需求的模式。
      </p>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => !loading && onSelect(m.key)}
            disabled={loading}
            className={`group p-8 rounded-3xl border ${m.border} bg-gradient-to-br ${m.bg} text-left hover:scale-[1.03] transition-all disabled:opacity-50`}
          >
            <div className="text-5xl mb-4">{m.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-2">{m.label}</h3>
            <p className="text-gray-400 text-sm">{m.sub}</p>
            <div
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: m.color }}
            >
              {loading ? '加载中...' : '开始评估 →'}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => window.history.back()}
        className="mt-8 text-gray-500 hover:text-gray-300 text-sm"
      >
        ← 返回
      </button>
    </section>
  );
}

/* ═══════════════ Quiz Section ═══════════════ */

function QuizSection({
  questions,
  currentQ,
  answers,
  modeColor,
  onAnswer,
  onBack,
  onNext,
  onSubmit,
}: {
  questions: FaithQuestion[];
  currentQ: number;
  answers: Record<string, string>;
  modeColor: string;
  onAnswer: (qId: string, opt: string) => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  const q = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;
  const allAnswered = questions.every((qq) => answers[qq.id]);
  const isLast = currentQ === questions.length - 1;
  const dim = DIMENSIONS[q.dimension];

  return (
    <section className="min-h-screen flex flex-col px-6 py-8 max-w-3xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>
            {dim?.icon} {dim?.label}
          </span>
          <span>
            {currentQ + 1} / {questions.length}
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: modeColor }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-relaxed">
          {q.questionText}
        </h2>

        <div className="space-y-4">
          {(q.options as any[]).map((opt) => {
            const selected = answers[q.id] === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => onAnswer(q.id, opt.key)}
                className={`w-full text-left p-5 rounded-2xl border transition-all ${
                  selected
                    ? 'border-white/40 bg-white/10 text-white'
                    : 'border-gray-700/50 bg-gray-800/30 text-gray-300 hover:border-gray-600 hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      selected ? 'text-white' : 'bg-gray-700/50 text-gray-400'
                    }`}
                    style={selected ? { backgroundColor: modeColor } : {}}
                  >
                    {opt.key}
                  </span>
                  <span className="text-lg">{opt.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-800">
        <button
          onClick={onBack}
          disabled={currentQ === 0}
          className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← 上一题
        </button>

        {isLast && allAnswered ? (
          <button
            onClick={onSubmit}
            className="px-8 py-3 rounded-xl text-white font-bold transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: modeColor }}
          >
            查看结果
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={!answers[q.id]}
            className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            下一题 →
          </button>
        )}
      </div>
    </section>
  );
}

/* ═══════════════ Calculating Animation ═══════════════ */

function CalculatingAnimation() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-violet-500/20 animate-ping" />
        <div className="absolute inset-4 rounded-full border-4 border-indigo-500/30 animate-pulse" />
        <div className="absolute inset-8 rounded-full bg-violet-500/20 animate-pulse flex items-center justify-center">
          <span className="text-3xl">🔮</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">正在分析你的信仰力...</h2>
      <p className="text-gray-400">五维评估计算中</p>
    </section>
  );
}

/* ═══════════════ Insight Helper ═══════════════ */

function getInsight(dimension: string, score: number): string {
  const d = DIMENSION_INSIGHTS[dimension];
  if (!d) return '';
  if (score >= 70) return d.high;
  if (score >= 40) return d.mid;
  return d.low;
}

/* ═══════════════ Result Section ═══════════════ */

function ResultSection({
  result,
  modeObj,
  onRetake,
}: {
  result: FaithAssessmentResult;
  modeObj: (typeof MODES)[number];
  onRetake: () => void;
}) {
  const level = LEVELS.find((l) => l.code === result.levelCode) || LEVELS[0];
  const scores = result.scores;
  const dims = [
    { key: 'awareness', ...DIMENSIONS.AWARENESS, score: scores.awareness },
    { key: 'resilience', ...DIMENSIONS.RESILIENCE, score: scores.resilience },
    { key: 'vision', ...DIMENSIONS.VISION, score: scores.vision },
    { key: 'connection', ...DIMENSIONS.CONNECTION, score: scores.connection },
    { key: 'legacy', ...DIMENSIONS.LEGACY, score: scores.legacy },
  ];

  const strongest = DIMENSIONS[result.strongestDimension] || DIMENSIONS.AWARENESS;
  const weakest = DIMENSIONS[result.weakestDimension] || DIMENSIONS.LEGACY;

  return (
    <section className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
            style={{
              backgroundColor: level.color + '15',
              color: level.color,
              border: `1px solid ${level.color}30`,
            }}
          >
            {modeObj.icon} {modeObj.label}模式
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            你的信仰力报告
          </h1>
        </div>

        {/* Score + Level */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Total Score */}
          <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-3xl p-8 text-center">
            <div
              className="text-7xl font-black mb-2"
              style={{ color: level.color }}
            >
              {result.totalScore}
            </div>
            <div className="text-gray-400 mb-4">/ 500</div>
            <div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold"
              style={{
                backgroundColor: level.color + '20',
                color: level.color,
                border: `2px solid ${level.color}40`,
              }}
            >
              {level.name}
            </div>
            <p className="text-gray-400 mt-3 text-sm">{level.desc}</p>
          </div>

          {/* Radar Chart */}
          <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-3xl p-8 flex items-center justify-center">
            <RadarChart scores={dims.map((d) => d.score)} color={modeObj.color} />
          </div>
        </div>

        {/* Dimension Bars */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">五维详解</h3>
          <div className="space-y-5">
            {dims.map((d) => (
              <div key={d.key}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">
                    {d.icon} {d.label}
                    <span className="text-gray-500 text-sm ml-2">{d.desc}</span>
                  </span>
                  <span className="text-white font-bold">{d.score}</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${d.score}%`,
                      backgroundColor: modeObj.color,
                      opacity: 0.6 + (d.score / 100) * 0.4,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strongest / Weakest */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
            <div className="text-emerald-400 font-bold mb-2">
              💪 最强维度: {strongest.label}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {getInsight(result.strongestDimension, scores[result.strongestDimension.toLowerCase() as keyof typeof scores] || 0)}
            </p>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
            <div className="text-amber-400 font-bold mb-2">
              🌱 成长空间: {weakest.label}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {getInsight(result.weakestDimension, scores[result.weakestDimension.toLowerCase() as keyof typeof scores] || 0)}
            </p>
          </div>
        </div>

        {/* 五维深度解读 */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">📖 五维深度解读</h3>
          <div className="space-y-6">
            {dims.map((d) => (
              <div key={d.key} className="border-l-2 pl-5 py-1" style={{ borderColor: d.score >= 70 ? '#10B981' : d.score >= 40 ? '#F59E0B' : '#EF4444' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{d.icon}</span>
                  <span className="font-bold text-white">{d.label}</span>
                  <span className="text-sm px-2 py-0.5 rounded-full" style={{
                    backgroundColor: d.score >= 70 ? '#10B98120' : d.score >= 40 ? '#F59E0B20' : '#EF444420',
                    color: d.score >= 70 ? '#10B981' : d.score >= 40 ? '#F59E0B' : '#EF4444',
                  }}>
                    {d.score >= 70 ? '优秀' : d.score >= 40 ? '中等' : '待提升'}
                  </span>
                  <span className="text-gray-500 text-sm ml-auto">{d.score}/100</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {getInsight(d.key.toUpperCase(), d.score)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 文化之旅计划 */}
        <div className="bg-gradient-to-br from-violet-950/40 to-indigo-950/40 border border-violet-500/20 rounded-3xl p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-2">🗺️ 你的专属文化之旅计划</h3>
          <p className="text-gray-400 text-sm mb-6">
            基于你的{weakest.label}成长需求，我们为你量身定制的文化探访方案
          </p>
          {(() => {
            const plan = PILGRIMAGE_PLANS[result.weakestDimension]?.[modeObj.key] || PILGRIMAGE_PLANS.AWARENESS.PERSONAL;
            return (
              <div className="bg-gray-900/60 rounded-2xl p-6 border border-gray-800">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1">
                    <div className="text-violet-300 text-sm font-medium mb-1">推荐目的地</div>
                    <div className="text-white text-xl font-bold mb-4">{plan.destination}</div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">建议时长</div>
                        <div className="text-white font-medium">{plan.duration}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">提升维度</div>
                        <div className="text-white font-medium">{weakest.icon} {weakest.label}</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-gray-500 text-xs mb-1">体验内容</div>
                      <div className="text-gray-300 text-sm leading-relaxed">{plan.activity}</div>
                    </div>
                    <div className="bg-violet-500/10 rounded-xl p-4 border border-violet-500/20">
                      <div className="text-violet-300 text-xs font-medium mb-1">✨ 文化洞见</div>
                      <p className="text-gray-300 text-sm leading-relaxed">{plan.insight}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/holy-sites"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-500 transition-all hover:-translate-y-0.5"
                  >
                    探索更多圣地 →
                  </Link>
                  <Link
                    href="/trips/create"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-violet-500/30 text-violet-300 font-medium hover:bg-violet-500/10 transition-all"
                  >
                    开始规划行程
                  </Link>
                </div>
              </div>
            );
          })()}
          {/* 次优先文化之旅 */}
          {(() => {
            const secondDim = result.strongestDimension === result.weakestDimension ? 'AWARENESS' : result.strongestDimension;
            const plan2 = PILGRIMAGE_PLANS[secondDim]?.[modeObj.key];
            if (!plan2) return null;
            const dim2 = DIMENSIONS[secondDim] || DIMENSIONS.AWARENESS;
            return (
              <div className="mt-4 bg-gray-900/40 rounded-2xl p-5 border border-gray-800/50">
                <div className="text-gray-400 text-sm mb-2">💪 巩固优势: {dim2.label}深化之旅</div>
                <div className="text-white font-bold mb-1">{plan2.destination}</div>
                <div className="text-gray-400 text-sm">{plan2.activity} · {plan2.duration}</div>
              </div>
            );
          })()}
        </div>

        {/* 推荐成长主题 */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-3">🎯 为你推荐的成长主题</h3>
          <p className="text-gray-400 text-sm mb-6">
            根据你的评估结果，以下主题最能帮助你突破{weakest.label}的瓶颈
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {result.recommendedThemes.map((slug) => (
              <div key={slug} className="p-5 rounded-2xl border border-gray-800 bg-gray-900/40 hover:border-gray-600 transition-all">
                <div className="text-lg font-bold text-white mb-1">{THEME_NAME_MAP[slug] || slug}</div>
                <div className="text-gray-500 text-sm mb-3">主题包 · {modeObj.label}</div>
                <Link
                  href={`${modeObj.href}/themes`}
                  className="text-sm font-medium transition-all hover:opacity-80"
                  style={{ color: modeObj.color }}
                >
                  查看详情 →
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              href={`${modeObj.href}/themes`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: modeObj.color }}
            >
              探索全部{modeObj.label}主题 →
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onRetake}
            className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition-all"
          >
            重新评估
          </button>
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-300 text-sm"
          >
            返回首页
          </Link>
        </div>

        {/* Points earned */}
        {result.pointsEarned > 0 && (
          <div className="text-center mt-8">
            <span className="text-amber-400 text-sm">
              ✨ 恭喜获得 {result.pointsEarned} 佳绩积分
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════ Radar Chart (Pure SVG) ═══════════════ */

function RadarChart({ scores, color }: { scores: number[]; color: string }) {
  const cx = 150;
  const cy = 150;
  const r = 120;
  const labels = ['觉察力', '定力', '格局力', '连接力', '传承力'];
  const n = 5;

  // Generate points for a regular pentagon at a given radius
  const polygon = (radius: number) =>
    Array.from({ length: n }, (_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
    }).join(' ');

  // Data polygon
  const dataPoints = scores.map((s, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const pct = s / 100;
    return { x: cx + r * pct * Math.cos(angle), y: cy + r * pct * Math.sin(angle) };
  });
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox="0 0 300 300" className="w-64 h-64 md:w-72 md:h-72">
      {/* Grid rings */}
      {[0.2, 0.4, 0.6, 0.8, 1.0].map((pct) => (
        <polygon
          key={pct}
          points={polygon(r * pct)}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}

      {/* Axes */}
      {Array.from({ length: n }, (_, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + r * Math.cos(angle)}
            y2={cy + r * Math.sin(angle)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        );
      })}

      {/* Data fill */}
      <polygon
        points={dataPolygon}
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} />
      ))}

      {/* Labels */}
      {labels.map((label, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const lx = cx + (r + 25) * Math.cos(angle);
        const ly = cy + (r + 25) * Math.sin(angle);
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.6)"
            fontSize="12"
            fontWeight="500"
          >
            {label}
          </text>
        );
      })}

      {/* Score labels on data points */}
      {dataPoints.map((p, i) => (
        <text
          key={`s${i}`}
          x={p.x}
          y={p.y - 12}
          textAnchor="middle"
          fill="white"
          fontSize="11"
          fontWeight="700"
        >
          {scores[i]}
        </text>
      ))}
    </svg>
  );
}
