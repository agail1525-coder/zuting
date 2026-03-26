import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Seal, fetchSeals } from '../../lib/api'
import SealCard from '../../components/SealCard'
import './index.scss'

const SERIES_LIST = ['初印系', '中印系', '印果印', '成道印', '归源印']

const SERIES_INFO: Record<string, { desc: string; color: string }> = {
  '初印系': { desc: '修行的起步与发心', color: '#60a5fa' },
  '中印系': { desc: '修行的深入与精进', color: '#a78bfa' },
  '印果印': { desc: '修行的成果与印证', color: '#f472b6' },
  '成道印': { desc: '觉悟与证道', color: '#D4A855' },
  '归源印': { desc: '回归本源、圆满归一', color: '#34d399' },
}

export default function SealsPage() {
  const [seals, setSeals] = useState<Seal[]>([])
  const [activeSeries, setActiveSeries] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // Group seals by series
  const groupedSeals = SERIES_LIST.reduce((acc, series) => {
    acc[series] = seals.filter(s => s.series === series)
    return acc
  }, {} as Record<string, Seal[]>)

  return (
    <View className='seals-page'>
      {/* Header */}
      <View className='seals-header'>
        <Text className='seals-header__title'>曹溪愿命三十印</Text>
        <Text className='seals-header__subtitle'>修行证悟 . 印心传法</Text>
      </View>

      {/* Series Filter */}
      <ScrollView className='series-filter' scrollX scrollWithAnimation>
        <View className='series-filter__inner'>
          <View
            className={`series-filter__tag ${activeSeries === null ? 'series-filter__tag--active' : ''}`}
            onClick={() => setActiveSeries(null)}
          >
            <Text className='series-filter__tag-text'>全部 30印</Text>
          </View>
          {SERIES_LIST.map(series => (
            <View
              key={series}
              className={`series-filter__tag ${activeSeries === series ? 'series-filter__tag--active' : ''}`}
              style={activeSeries === series ? { borderColor: SERIES_INFO[series].color } : {}}
              onClick={() => setActiveSeries(series)}
            >
              <Text
                className='series-filter__tag-text'
                style={activeSeries === series ? { color: SERIES_INFO[series].color } : {}}
              >
                {series}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Seals List */}
      <ScrollView className='seals-list' scrollY>
        {loading ? (
          <Text className='loading-text'>正在加载...</Text>
        ) : activeSeries ? (
          // Single series view
          <View className='series-group'>
            <View className='series-group__header'>
              <View
                className='series-group__dot'
                style={{ backgroundColor: SERIES_INFO[activeSeries]?.color }}
              />
              <Text className='series-group__name'>{activeSeries}</Text>
              <Text className='series-group__desc'>{SERIES_INFO[activeSeries]?.desc}</Text>
            </View>
            {seals.map(seal => (
              <SealCard key={seal.id} seal={seal} />
            ))}
          </View>
        ) : (
          // All series grouped
          SERIES_LIST.map(series => {
            const seriesSeals = groupedSeals[series]
            if (!seriesSeals || seriesSeals.length === 0) return null
            return (
              <View key={series} className='series-group'>
                <View className='series-group__header'>
                  <View
                    className='series-group__dot'
                    style={{ backgroundColor: SERIES_INFO[series]?.color }}
                  />
                  <Text className='series-group__name'>{series}</Text>
                  <Text className='series-group__desc'>{SERIES_INFO[series]?.desc}</Text>
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
