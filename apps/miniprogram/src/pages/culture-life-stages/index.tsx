import { useEffect, useMemo, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { fetchLifeStages, LIFE_STAGE_META, type LifeStageGuide, type LifeStage } from '../../lib/api'
import './index.scss'

export default function CultureLifeStagesPage() {
  const [items, setItems] = useState<LifeStageGuide[]>([])
  const [stage, setStage] = useState<LifeStage>('GROWTH')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLifeStages()
      .then((r) => setItems(r?.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => items.filter((it) => it.stage === stage), [items, stage])

  return (
    <ScrollView scrollY className='cls-page'>
      <View className='cls-hero'>
        <Text className='cls-kicker'>CULTURE · LIFE STAGES</Text>
        <Text className='cls-title'>人生七境 · 十二文化</Text>
        <Text className='cls-sub'>诞生 · 成长 · 成家 · 立业 · 中年 · 老年 · 临终</Text>
      </View>

      <View className='cls-tabs'>
        <ScrollView scrollX className='cls-tabs-scroll'>
          {(Object.keys(LIFE_STAGE_META) as LifeStage[]).map((k) => {
            const meta = LIFE_STAGE_META[k]
            const active = k === stage
            return (
              <View
                key={k}
                className={`cls-tab${active ? ' cls-tab-active' : ''}`}
                onClick={() => setStage(k)}
              >
                <Text className='cls-tab-text'>{meta.emoji} {meta.title} · {meta.age}</Text>
              </View>
            )
          })}
        </ScrollView>
      </View>

      <View className='cls-list'>
        {loading ? (
          <View className='cls-empty'><Text>加载中…</Text></View>
        ) : filtered.length === 0 ? (
          <View className='cls-empty'><Text>该阶段暂无内容</Text></View>
        ) : (
          filtered.map((it) => {
            const color = it.religion?.color || '#3264ff'
            return (
              <View key={it.id} className='cls-card' style={{ borderLeftColor: color }}>
                <View className='cls-card-head'>
                  <Text className='cls-card-sym'>{it.religion?.symbol ?? '✨'}</Text>
                  <Text className='cls-card-name' style={{ color }}>{it.religion?.name ?? '—'}</Text>
                </View>
                <Text className='cls-card-title'>{it.title}</Text>
                <Text className='cls-card-wisdom'>{it.keyWisdom}</Text>

                {it.rituals && it.rituals.length > 0 && (
                  <View className='cls-block'>
                    <Text className='cls-block-title'>🕯️ 仪式</Text>
                    {it.rituals.map((r, i) => (
                      <Text key={i} className='cls-block-line'>
                        · <Text className='cls-bold'>{r.name}</Text>{r.purpose ? ` — ${r.purpose}` : ''}
                      </Text>
                    ))}
                  </View>
                )}

                {it.challenges && it.challenges.length > 0 && (
                  <View className='cls-block'>
                    <Text className='cls-block-title'>⚠️ 挑战与指引</Text>
                    {it.challenges.map((c, i) => (
                      <View key={i} className='cls-ch'>
                        <Text className='cls-ch-q'>{c.challenge}</Text>
                        <Text className='cls-ch-a'>↳ {c.guidance}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {it.scriptureRef && (
                  <Text className='cls-scripture'>📜 {it.scriptureRef}</Text>
                )}
              </View>
            )
          })
        )}
      </View>
    </ScrollView>
  )
}
