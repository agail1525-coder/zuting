import { useState, useEffect, useCallback } from 'react'
import { View, Text, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  fetchPkbOverview,
  updatePkbVows,
  submitPkbStruggle,
  fetchPkbEntriesMini,
  type PkbOverviewMini,
  type PkbEntryMini,
  type PkbCategoryMini,
} from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'

type Tab = 'vows' | 'struggle' | 'journal'

const gold = '#D4A855'
const g = (o: number) => `rgba(212,168,85,${o})`

const CATEGORY_LABEL: Record<PkbCategoryMini, string> = {
  PERSONAL: '个人',
  FAMILY: '家庭',
  CAREER: '事业',
  DAILY_STRUGGLE: '当下烦恼',
  GENERAL: '通用',
}

export default function PkbPage() {
  const [tab, setTab] = useState<Tab>('vows')
  const [overview, setOverview] = useState<PkbOverviewMini | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await fetchPkbOverview()
      setOverview(data)
    } catch (e) {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn()) {
      Taro.redirectTo({ url: '/pages/login/index' })
      return
    }
    refresh()
  }, [refresh])

  if (loading || !overview) {
    return (
      <View style={{ padding: 40, textAlign: 'center', color: gold, background: '#0f0a06', minHeight: '100vh' }}>
        <Text>加载修行库中…</Text>
      </View>
    )
  }

  return (
    <ScrollView scrollY style={{ background: '#0f0a06', minHeight: '100vh', padding: '24px 16px' }}>
      <Text style={{ color: gold, fontSize: 26, fontWeight: 'bold', display: 'block' }}>修行库</Text>
      <Text style={{ color: g(0.6), fontSize: 13, display: 'block', marginTop: 4 }}>三生愿景 · 小鸿引经据典 · 修行日志</Text>

      <View style={{ display: 'flex', flexDirection: 'row', gap: 8, marginTop: 16 }}>
        <StatCell label="条目" value={overview.pkb.entryCount} />
        <StatCell label="洞见" value={overview.pkb.insightCount} />
        <StatCell label="十牛图" value={`${overview.pkb.currentOxStage}/10`} />
      </View>

      <View style={{ display: 'flex', flexDirection: 'row', marginTop: 20, borderBottom: `1px solid ${g(0.2)}` }}>
        {([['vows', '愿景'], ['struggle', '当下烦恼'], ['journal', '日志']] as const).map(([k, label]) => (
          <View
            key={k}
            onClick={() => setTab(k)}
            style={{
              padding: '10px 16px',
              color: tab === k ? gold : g(0.5),
              fontWeight: tab === k ? 'bold' : 'normal',
              borderBottom: tab === k ? `2px solid ${gold}` : 'none',
            }}
          >
            <Text>{label}</Text>
          </View>
        ))}
      </View>

      {tab === 'vows' && <VowsSection overview={overview} onSaved={refresh} />}
      {tab === 'struggle' && <StruggleSection onSubmitted={refresh} />}
      {tab === 'journal' && <JournalSection />}
    </ScrollView>
  )
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={{ flex: 1, background: g(0.08), borderRadius: 10, padding: 12, border: `1px solid ${g(0.2)}` }}>
      <Text style={{ color: g(0.5), fontSize: 11, display: 'block' }}>{label}</Text>
      <Text style={{ color: gold, fontSize: 18, fontWeight: 'bold', display: 'block', marginTop: 2 }}>{value}</Text>
    </View>
  )
}

function VowsSection({ overview, onSaved }: { overview: PkbOverviewMini; onSaved: () => void }) {
  const [personal, setPersonal] = useState(overview.pkb.personalVow || '')
  const [family, setFamily] = useState(overview.pkb.familyVow || '')
  const [career, setCareer] = useState(overview.pkb.careerVow || '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await updatePkbVows({ personalVow: personal, familyVow: family, careerVow: career })
      Taro.showToast({ title: '已保存', icon: 'success' })
      onSaved()
    } catch (e: any) {
      Taro.showToast({ title: e?.message || '保存失败', icon: 'none' })
    } finally {
      setSaving(false)
    }
  }

  const fields: Array<[string, string, (v: string) => void, string]> = [
    ['🧘 个人圆满', personal, setPersonal, '我想成为怎样的人？'],
    ['👨‍👩‍👧 家庭幸福', family, setFamily, '我想给家人怎样的生活？'],
    ['🏢 事业兴旺', career, setCareer, '我想为众生创造什么价值？'],
  ]

  return (
    <View style={{ marginTop: 16 }}>
      {fields.map(([label, value, setter, placeholder]) => (
        <View key={label} style={cardStyle}>
          <Text style={{ color: gold, fontSize: 15, fontWeight: 'bold', display: 'block' }}>{label}</Text>
          <Textarea
            value={value}
            onInput={(e) => setter((e.detail as any).value)}
            placeholder={placeholder}
            placeholderStyle={`color: ${g(0.3)}`}
            maxlength={2000}
            style={{ width: '100%', minHeight: 80, marginTop: 8, color: '#fff8e1', background: g(0.05), borderRadius: 8, padding: 8, fontSize: 13 }}
          />
        </View>
      ))}
      <View
        onClick={saving ? undefined : save}
        style={{
          marginTop: 12,
          padding: '12px 0',
          background: gold,
          borderRadius: 10,
          textAlign: 'center',
          opacity: saving ? 0.6 : 1,
        }}
      >
        <Text style={{ color: '#1a1208', fontWeight: 'bold' }}>{saving ? '保存中…' : '保存三生愿景'}</Text>
      </View>

      {overview.activeRecs.length > 0 && (
        <View style={{ ...cardStyle, marginTop: 16 }}>
          <Text style={{ color: gold, fontSize: 14, fontWeight: 'bold', display: 'block' }}>小鸿为你挑选的经论</Text>
          {overview.activeRecs.slice(0, 5).map((r) => (
            <View key={r.id} style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${g(0.15)}` }}>
              <Text style={{ color: g(0.5), fontSize: 11, display: 'block' }}>{CATEGORY_LABEL[r.category]}</Text>
              <Text style={{ color: gold, fontSize: 13, display: 'block', marginTop: 2 }}>{r.title}</Text>
              <Text style={{ color: g(0.7), fontSize: 12, display: 'block', marginTop: 2 }}>{r.reason}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

function StruggleSection({ onSubmitted }: { onSubmitted: () => void }) {
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState<PkbCategoryMini>('DAILY_STRUGGLE')
  const [sending, setSending] = useState(false)
  const [reply, setReply] = useState<{ text: string; dailyPractice: string; cited: Array<{ title: string }> } | null>(null)

  const send = async () => {
    if (message.trim().length < 5) {
      Taro.showToast({ title: '请详细描述', icon: 'none' })
      return
    }
    setSending(true)
    try {
      const res = await submitPkbStruggle({ message, category })
      setReply({ text: res.reply, dailyPractice: res.dailyPractice, cited: res.citedScriptures.map((c) => ({ title: c.title })) })
      onSubmitted()
    } catch (e: any) {
      Taro.showToast({ title: e?.message || '发送失败', icon: 'none' })
    } finally {
      setSending(false)
    }
  }

  return (
    <View style={{ marginTop: 16 }}>
      <View style={cardStyle}>
        <Text style={{ color: gold, fontSize: 14, fontWeight: 'bold', display: 'block' }}>告诉小鸿你的困惑</Text>
        <Textarea
          value={message}
          onInput={(e) => setMessage((e.detail as any).value)}
          placeholder="最近困扰你的事情…"
          placeholderStyle={`color: ${g(0.3)}`}
          maxlength={2000}
          style={{ width: '100%', minHeight: 100, marginTop: 8, color: '#fff8e1', background: g(0.05), borderRadius: 8, padding: 8, fontSize: 13 }}
        />
        <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {(['DAILY_STRUGGLE', 'PERSONAL', 'FAMILY', 'CAREER'] as PkbCategoryMini[]).map((c) => (
            <View
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: '4px 10px',
                borderRadius: 999,
                border: `1px solid ${category === c ? gold : g(0.3)}`,
                background: category === c ? g(0.2) : 'transparent',
              }}
            >
              <Text style={{ color: category === c ? gold : g(0.6), fontSize: 11 }}>{CATEGORY_LABEL[c]}</Text>
            </View>
          ))}
        </View>
        <View
          onClick={sending ? undefined : send}
          style={{
            marginTop: 12,
            padding: '10px 0',
            background: gold,
            borderRadius: 10,
            textAlign: 'center',
            opacity: sending ? 0.6 : 1,
          }}
        >
          <Text style={{ color: '#1a1208', fontWeight: 'bold' }}>{sending ? '小鸿思考中…' : '送给小鸿 · 引经据典'}</Text>
        </View>
      </View>

      {reply && (
        <View style={{ ...cardStyle, marginTop: 16, borderColor: gold }}>
          <Text style={{ color: gold, fontSize: 13, fontWeight: 'bold', display: 'block' }}>🙏 小鸿的回应</Text>
          <Text style={{ color: '#fff8e1', fontSize: 13, display: 'block', marginTop: 8, lineHeight: '22px' }}>{reply.text}</Text>
          {reply.dailyPractice && (
            <View style={{ marginTop: 10, padding: 10, background: g(0.1), borderRadius: 8, border: `1px solid ${g(0.3)}` }}>
              <Text style={{ color: gold, fontSize: 11, display: 'block' }}>📿 今日功课</Text>
              <Text style={{ color: '#fff8e1', fontSize: 13, display: 'block', marginTop: 4 }}>{reply.dailyPractice}</Text>
            </View>
          )}
          {reply.cited.map((c, i) => (
            <Text key={i} style={{ color: g(0.7), fontSize: 11, display: 'block', marginTop: 6 }}>
              📖 《{c.title}》
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}

function JournalSection() {
  const [items, setItems] = useState<PkbEntryMini[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPkbEntriesMini()
      .then((res) => setItems(res.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <Text style={{ color: g(0.5), display: 'block', textAlign: 'center', marginTop: 40 }}>加载中…</Text>
  }
  if (items.length === 0) {
    return <Text style={{ color: g(0.5), display: 'block', textAlign: 'center', marginTop: 40 }}>暂无条目，去「当下烦恼」开始第一次对话</Text>
  }

  return (
    <View style={{ marginTop: 16 }}>
      {items.map((e) => (
        <View key={e.id} style={cardStyle}>
          <Text style={{ color: gold, fontSize: 11, display: 'block' }}>{CATEGORY_LABEL[e.category]}</Text>
          <Text style={{ color: '#fff8e1', fontSize: 14, fontWeight: 'bold', display: 'block', marginTop: 2 }}>{e.title}</Text>
          <Text style={{ color: g(0.7), fontSize: 12, display: 'block', marginTop: 6 }}>{e.content.slice(0, 120)}{e.content.length > 120 ? '…' : ''}</Text>
          {e.mood && <Text style={{ color: gold, fontSize: 11, display: 'block', marginTop: 6 }}>心境: {e.mood}</Text>}
          <Text style={{ color: g(0.4), fontSize: 10, display: 'block', marginTop: 6, textAlign: 'right' }}>{new Date(e.createdAt).toLocaleDateString()}</Text>
        </View>
      ))}
    </View>
  )
}

const cardStyle = {
  background: g(0.08),
  borderRadius: 12,
  padding: 14,
  border: `1px solid ${g(0.2)}`,
  marginBottom: 12,
} as const
