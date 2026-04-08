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
    label: '个人成长',
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
    label: '企业长青',
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
          发现你的
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            信仰力
          </span>
        </h1>

        <p className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
          每个人内心都有一座精神的祖庭。通过五维评估，发现你的觉察力、定力、格局力、连接力和传承力分布，找到最适合你的成长路径。
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
            <p className="text-gray-400 text-sm">
              这是你最突出的内在力量。{strongest.desc}已经成为你的核心优势，继续发挥它来带动其他维度的成长。
            </p>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
            <div className="text-amber-400 font-bold mb-2">
              🌱 成长空间: {weakest.label}
            </div>
            <p className="text-gray-400 text-sm">
              {weakest.desc}是你目前最大的成长机会。我们为你推荐了针对性的修炼主题，帮你突破这个瓶颈。
            </p>
          </div>
        </div>

        {/* Recommended themes CTA */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 mb-8 text-center">
          <h3 className="text-xl font-bold text-white mb-3">为你推荐的修炼主题</h3>
          <p className="text-gray-400 mb-6">
            根据你的评估结果，以下主题最能帮助你突破{weakest.label}的瓶颈
          </p>
          <Link
            href={`${modeObj.href}/themes`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: modeObj.color }}
          >
            探索{modeObj.label}主题 →
          </Link>
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
              ✨ 恭喜获得 {result.pointsEarned} 信仰积分
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
