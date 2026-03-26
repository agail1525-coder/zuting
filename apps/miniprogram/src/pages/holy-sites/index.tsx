import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Religion, HolySite, fetchReligions, fetchHolySites } from '../../lib/api'
import HolySiteCard from '../../components/HolySiteCard'
import FilterTags from '../../components/FilterTags'
import './index.scss'

export default function HolySitesPage() {
  const [religions, setReligions] = useState<Religion[]>([])
  const [sites, setSites] = useState<HolySite[]>([])
  const [activeReligionId, setActiveReligionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReligions()
  }, [])

  useEffect(() => {
    loadSites()
  }, [activeReligionId])

  const loadReligions = async () => {
    try {
      const list = await fetchReligions()
      setReligions(list)
    } catch (err) {
      console.error('Failed to load religions:', err)
    }
  }

  const loadSites = async () => {
    try {
      setLoading(true)
      const list = await fetchHolySites(activeReligionId || undefined)
      setSites(list)
    } catch (err) {
      console.error('Failed to load sites:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='holy-sites-page'>
      {/* Header */}
      <View className='page-header'>
        <Text className='page-header__title'>全球圣地</Text>
        <Text className='page-header__count'>{sites.length} 处圣地</Text>
      </View>

      {/* Filter Tags */}
      <FilterTags
        religions={religions}
        activeId={activeReligionId}
        onSelect={setActiveReligionId}
      />

      {/* Site List */}
      <ScrollView className='site-list' scrollY>
        {loading ? (
          <Text className='loading-text'>正在加载...</Text>
        ) : sites.length === 0 ? (
          <Text className='empty-text'>暂无圣地数据</Text>
        ) : (
          sites.map(site => (
            <HolySiteCard key={site.id} site={site} showReligion />
          ))
        )}
        <View style={{ height: '120rpx' }} />
      </ScrollView>
    </View>
  )
}
