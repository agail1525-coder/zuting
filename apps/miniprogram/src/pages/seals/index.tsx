import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Seal, fetchSeals } from '../../lib/api'
import SealCard from '../../components/SealCard'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function SealsPage() {
  const { t } = useTranslation()
  const [seals, setSeals] = useState<Seal[]>([])
  const [activeSeries, setActiveSeries] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const SERIES_LIST = [
    t('seals.seriesInitial'),
    t('seals.seriesMiddle'),
    t('seals.seriesFruit'),
    t('seals.seriesEnlightenment'),
    t('seals.seriesReturn'),
  ]

  const SERIES_INFO: Record<string, { desc: string; color: string }> = {
    [t('seals.seriesInitial')]: { desc: t('seals.seriesInitialDesc'), color: '#60a5fa' },
    [t('seals.seriesMiddle')]: { desc: t('seals.seriesMiddleDesc'), color: '#a78bfa' },
    [t('seals.seriesFruit')]: { desc: t('seals.seriesFruitDesc'), color: '#f472b6' },
    [t('seals.seriesEnlightenment')]: { desc: t('seals.seriesEnlightenmentDesc'), color: '#f59e0b' },
    [t('seals.seriesReturn')]: { desc: t('seals.seriesReturnDesc'), color: '#34d399' },
  }

  // The API returns series names in Chinese, so we need a mapping for filtering
  const SERIES_API_NAMES = ['初印系', '中印系', '印果印', '成道印', '归源印']
  const SERIES_API_INFO: Record<string, { color: string }> = {
    '初印系': { color: '#60a5fa' },
    '中印系': { color: '#a78bfa' },
    '印果印': { color: '#f472b6' },
    '成道印': { color: '#f59e0b' },
    '归源印': { color: '#34d399' },
  }

  useEffect(() => {
    loadSeals()
  }, [activeSeries])

  const loadSeals = async () => {
    try {
      setLoading(true)
      const list = await fetchSeals(activeSeries || undefined)
      setSeals(list)
    } catch (err) {
      console.error('Failed to load seals:', err)
      Taro.showToast({ title: t('seals.loadFailed'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // Group seals by series
  const groupedSeals = SERIES_API_NAMES.reduce((acc, series) => {
    acc[series] = seals.filter(s => s.series === series)
    return acc
  }, {} as Record<string, Seal[]>)

  // Map API series name to display name
  const getDisplayName = (apiName: string) => {
    const idx = SERIES_API_NAMES.indexOf(apiName)
    return idx >= 0 ? SERIES_LIST[idx] : apiName
  }

  return (
    <View className='seals-page'>
      {/* Header */}
      <View className='seals-header'>
        <Text className='seals-header__title'>{t('seals.title')}</Text>
        <Text className='seals-header__subtitle'>{t('seals.subtitle')}</Text>
      </View>

      {/* Series Filter */}
      <ScrollView className='series-filter' scrollX scrollWithAnimation>
        <View className='series-filter__inner'>
          <View
            className={`series-filter__tag ${activeSeries === null ? 'series-filter__tag--active' : ''}`}
            onClick={() => setActiveSeries(null)}
          >
            <Text className='series-filter__tag-text'>{t('seals.allSeals')}</Text>
          </View>
          {SERIES_API_NAMES.map((series, idx) => (
            <View
              key={series}
              className={`series-filter__tag ${activeSeries === series ? 'series-filter__tag--active' : ''}`}
              style={activeSeries === series ? { borderColor: SERIES_API_INFO[series].color } : {}}
              onClick={() => setActiveSeries(series)}
            >
              <Text
                className='series-filter__tag-text'
                style={activeSeries === series ? { color: SERIES_API_INFO[series].color } : {}}
              >
                {SERIES_LIST[idx]}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Seals List */}
      <ScrollView className='seals-list' scrollY>
        {loading ? (
          <Text className='loading-text'>{t('common.loading')}</Text>
        ) : activeSeries ? (
          // Single series view
          <View className='series-group'>
            <View className='series-group__header'>
              <View
                className='series-group__dot'
                style={{ backgroundColor: SERIES_API_INFO[activeSeries]?.color }}
              />
              <Text className='series-group__name'>{getDisplayName(activeSeries)}</Text>
              <Text className='series-group__desc'>{SERIES_INFO[getDisplayName(activeSeries)]?.desc}</Text>
            </View>
            {seals.map(seal => (
              <SealCard key={seal.id} seal={seal} />
            ))}
          </View>
        ) : (
          // All series grouped
          SERIES_API_NAMES.map((series, idx) => {
            const seriesSeals = groupedSeals[series]
            if (!seriesSeals || seriesSeals.length === 0) return null
            return (
              <View key={series} className='series-group'>
                <View className='series-group__header'>
                  <View
                    className='series-group__dot'
                    style={{ backgroundColor: SERIES_API_INFO[series]?.color }}
                  />
                  <Text className='series-group__name'>{SERIES_LIST[idx]}</Text>
                  <Text className='series-group__desc'>{SERIES_INFO[SERIES_LIST[idx]]?.desc}</Text>
                </View>
                {seriesSeals.map(seal => (
                  <SealCard key={seal.id} seal={seal} />
                ))}
              </View>
            )
          })
        )}
        <View style={{ height: '120rpx' }} />
      </ScrollView>
    </View>
  )
}
