import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { fetchLeaderboard, LeaderboardEntry } from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

const MEDAL_COLORS = ['#D4A855', '#C0C0C0', '#CD7F32']

export default function LeaderboardPage() {
  const { t } = useTranslation()

  const TYPES = [
    { key: 'guide', label: t('leaderboard.typeGuide'), icon: '\u{1F4D6}', unit: t('leaderboard.unitArticles') },
    { key: 'review', label: t('leaderboard.typeReview'), icon: '\u2B50', unit: t('leaderboard.unitReviews') },
    { key: 'pilgrim', label: t('leaderboard.typePilgrim'), icon: '\u{1F54C}', unit: t('leaderboard.unitSites') },
  ]

  const PERIODS = [
    { key: 'week', label: t('leaderboard.periodWeek') },
    { key: 'month', label: t('leaderboard.periodMonth') },
    { key: 'all', label: t('leaderboard.periodAll') },
  ]

  const [type, setType] = useState('guide')
  const [period, setPeriod] = useState('month')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchLeaderboard(type, period)
      .then(setEntries)
      .catch(err => console.error('Failed to load leaderboard:', err))
      .finally(() => setLoading(false))
  }, [type, period])

  const currentType = TYPES.find(tp => tp.key === type) || TYPES[0]

  return (
    <View className='leaderboard'>
      {/* Type tabs */}
      <View className='leaderboard__tabs'>
        {TYPES.map(tp => (
          <View
            key={tp.key}
            className={`leaderboard__tab ${type === tp.key ? 'leaderboard__tab--active' : ''}`}
            onClick={() => setType(tp.key)}
          >
            <Text className='leaderboard__tab-icon'>{tp.icon}</Text>
            <Text className='leaderboard__tab-label'>{tp.label}</Text>
          </View>
        ))}
      </View>

      {/* Period pills */}
      <View className='leaderboard__periods'>
        {PERIODS.map(p => (
          <Text
            key={p.key}
            className={`leaderboard__period ${period === p.key ? 'leaderboard__period--active' : ''}`}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </Text>
        ))}
      </View>

      <ScrollView className='leaderboard__list' scrollY>
        {loading ? (
          <Text className='loading-text'>{t('common.loading')}</Text>
        ) : entries.length === 0 ? (
          <Text className='empty-text'>{t('leaderboard.empty')}</Text>
        ) : (
          entries.map((entry, index) => (
            <View key={entry.userId} className='leaderboard__row'>
              <View className='leaderboard__rank-col'>
                {index < 3 ? (
                  <View
                    className='leaderboard__medal'
                    style={{ backgroundColor: MEDAL_COLORS[index] }}
                  >
                    <Text className='leaderboard__medal-text'>{index + 1}</Text>
                  </View>
                ) : (
                  <Text className='leaderboard__rank-num'>{entry.rank || index + 1}</Text>
                )}
              </View>
              <View className='leaderboard__avatar'>
                <Text className='leaderboard__avatar-initial'>
                  {(entry.nickname || '?')[0]}
                </Text>
              </View>
              <View className='leaderboard__info'>
                <Text className='leaderboard__nickname'>{entry.nickname}</Text>
              </View>
              <View className='leaderboard__count-col'>
                <Text className='leaderboard__count-value'>{entry.count}</Text>
                <Text className='leaderboard__count-unit'>{currentType.unit}</Text>
              </View>
            </View>
          ))
        )}
        <View style={{ height: '120rpx' }} />
      </ScrollView>
    </View>
  )
}
