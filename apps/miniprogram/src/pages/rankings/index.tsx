import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchRankings, RankingEntry } from '../../lib/api'
import './index.scss'

type RankType = 'guide' | 'review' | 'trip' | 'journal'
type RankPeriod = 'week' | 'month' | 'all'

const TYPE_META: Record<RankType, { name: string; icon: string; color: string; unit: string }> = {
  guide:   { name: '攻略', icon: '📖', color: '#3264ff', unit: '篇' },
  review:  { name: '评价', icon: '⭐', color: '#f59e0b', unit: '条' },
  trip:    { name: '足迹', icon: '🕉',  color: '#8B6914', unit: '次' },
  journal: { name: '日志', icon: '📔', color: '#2D8B6F', unit: '篇' },
}

const PERIOD_META: Record<RankPeriod, string> = {
  week:  '本周',
  month: '本月',
  all:   '总榜',
}

const MEDAL_BG = ['#D4A855', '#C0C0C0', '#CD7F32']
const MEDAL_ICON = ['🥇', '🥈', '🥉']

export default function RankingsPage() {
  const [type, setType] = useState<RankType>('guide')
  const [period, setPeriod] = useState<RankPeriod>('month')
  const [entries, setEntries] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchRankings(type, period)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [type, period])

  const meta = TYPE_META[type]
  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <ScrollView scrollY className='rk-page'>
      <View className='rk-hero' style={{ background: `linear-gradient(135deg, ${meta.color} 0%, #0f172a 100%)` }}>
        <Text className='rk-kicker'>COMMUNITY · RANKINGS</Text>
        <Text className='rk-title'>{meta.icon} {meta.name}排行榜</Text>
        <Text className='rk-sub'>{PERIOD_META[period]} · TOP {entries.length || '—'}</Text>
      </View>

      <View className='rk-tabs'>
        {(Object.keys(TYPE_META) as RankType[]).map((k) => (
          <View
            key={k}
            className={`rk-tab ${type === k ? 'rk-tab--active' : ''}`}
            style={type === k ? { backgroundColor: TYPE_META[k].color } : {}}
            onClick={() => setType(k)}
          >
            <Text className='rk-tab-icon'>{TYPE_META[k].icon}</Text>
            <Text className={`rk-tab-label ${type === k ? 'rk-tab-label--active' : ''}`}>
              {TYPE_META[k].name}
            </Text>
          </View>
        ))}
      </View>

      <View className='rk-periods'>
        {(Object.keys(PERIOD_META) as RankPeriod[]).map((k) => (
          <Text
            key={k}
            className={`rk-period ${period === k ? 'rk-period--active' : ''}`}
            onClick={() => setPeriod(k)}
          >
            {PERIOD_META[k]}
          </Text>
        ))}
      </View>

      {loading ? (
        <View className='rk-empty'>
          <Text className='rk-empty-text'>加载中…</Text>
        </View>
      ) : entries.length === 0 ? (
        <View className='rk-empty'>
          <Text className='rk-empty-icon'>📊</Text>
          <Text className='rk-empty-text'>暂无数据</Text>
        </View>
      ) : (
        <>
          {top3.length > 0 && (
            <View className='rk-podium'>
              {top3.map((e, i) => (
                <View
                  key={e.userId}
                  className='rk-podium-card'
                  style={{ background: MEDAL_BG[i] }}
                  onClick={() => Taro.navigateTo({ url: `/pages/user-profile/index?userId=${e.userId}` })}
                >
                  <Text className='rk-podium-medal'>{MEDAL_ICON[i]}</Text>
                  <View className='rk-podium-avatar'>
                    <Text className='rk-podium-init'>{(e.nickname || '?')[0]}</Text>
                  </View>
                  <Text className='rk-podium-name'>{e.nickname}</Text>
                  <Text className='rk-podium-count'>{e.count} {meta.unit}</Text>
                </View>
              ))}
            </View>
          )}

          {rest.length > 0 && (
            <View className='rk-list'>
              {rest.map((e) => (
                <View
                  key={e.userId}
                  className='rk-row'
                  onClick={() => Taro.navigateTo({ url: `/pages/user-profile/index?userId=${e.userId}` })}
                >
                  <Text className='rk-rank'>{e.rank}</Text>
                  <View className='rk-avatar'>
                    <Text className='rk-avatar-init'>{(e.nickname || '?')[0]}</Text>
                  </View>
                  <Text className='rk-name'>{e.nickname}</Text>
                  <View className='rk-count'>
                    <Text className='rk-count-num' style={{ color: meta.color }}>{e.count}</Text>
                    <Text className='rk-count-unit'>{meta.unit}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
