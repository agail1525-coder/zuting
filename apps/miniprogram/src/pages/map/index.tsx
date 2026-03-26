import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, Map } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Religion, HolySite, fetchReligions, fetchHolySites } from '../../lib/api'
import './index.scss'

interface MapMarker {
  id: number
  latitude: number
  longitude: number
  title: string
  iconPath: string
  width: number
  height: number
  callout: {
    content: string
    color: string
    bgColor: string
    borderColor: string
    borderWidth: number
    borderRadius: number
    padding: number
    fontSize: number
    display: 'BYCLICK' | 'ALWAYS'
    anchorX: number
    anchorY: number
    textAlign: 'left' | 'right' | 'center'
  }
  // Store site id for navigation
  siteId?: string
}

export default function MapPage() {
  const [religions, setReligions] = useState<Religion[]>([])
  const [sites, setSites] = useState<HolySite[]>([])
  const [filteredSites, setFilteredSites] = useState<HolySite[]>([])
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [center, setCenter] = useState({ latitude: 30.0, longitude: 31.0 })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [religionList, siteList] = await Promise.all([
        fetchReligions(),
        fetchHolySites(),
      ])
      setReligions(religionList)
      setSites(siteList)
      setFilteredSites(siteList)
      // Center on first site if available
      if (siteList.length > 0) {
        setCenter({ latitude: siteList[0].latitude, longitude: siteList[0].longitude })
      }
    } catch (err) {
      console.error('Failed to load map data:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = useCallback((religionId: string) => {
    setActiveFilter(religionId)
    if (religionId === 'all') {
      setFilteredSites(sites)
    } else {
      const filtered = sites.filter(s => s.religionId === religionId)
      setFilteredSites(filtered)
      if (filtered.length > 0) {
        setCenter({ latitude: filtered[0].latitude, longitude: filtered[0].longitude })
      }
    }
  }, [sites])

  const markers: MapMarker[] = filteredSites.map((site, idx) => ({
    id: idx,
    latitude: site.latitude,
    longitude: site.longitude,
    title: site.name,
    iconPath: '',
    width: 28,
    height: 28,
    callout: {
      content: `${site.name}\n${site.city}, ${site.country}`,
      color: '#f1f5f9',
      bgColor: '#1e293b',
      borderColor: '#D4A855',
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      fontSize: 12,
      display: 'BYCLICK',
      anchorX: 0,
      anchorY: 0,
      textAlign: 'center',
    },
    siteId: site.id,
  }))

  const handleMarkerTap = (e: any) => {
    const markerId = e.detail?.markerId ?? e.markerId
    if (markerId !== undefined && markers[markerId]) {
      const site = filteredSites[markerId]
      if (site) {
        Taro.navigateTo({
          url: `/pages/holy-site-detail/index?id=${site.id}`,
        })
      }
    }
  }

  if (loading) {
    return (
      <View className='map-page'>
        <Text className='loading-text'>正在加载地图数据...</Text>
      </View>
    )
  }

  return (
    <View className='map-page'>
      {/* Religion Filter */}
      <ScrollView className='filter-bar' scrollX>
        <View
          className={`filter-chip ${activeFilter === 'all' ? 'filter-chip--active' : ''}`}
          onClick={() => handleFilter('all')}
        >
          <Text className='filter-chip__text'>全部</Text>
        </View>
        {religions.map(r => (
          <View
            key={r.id}
            className={`filter-chip ${activeFilter === r.id ? 'filter-chip--active' : ''}`}
            onClick={() => handleFilter(r.id)}
          >
            <Text className='filter-chip__text'>{r.emoji} {r.name}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Map */}
      <View className='map-container'>
        <Map
          className='map'
          latitude={center.latitude}
          longitude={center.longitude}
          scale={3}
          markers={markers}
          onMarkerTap={handleMarkerTap}
          onError={() => {}}
          showLocation={false}
          enableScroll
          enableZoom
          style='width: 100%; height: 100%;'
        />
      </View>

      {/* Sites Count */}
      <View className='sites-count'>
        <Text className='sites-count__text'>
          {'\u{1F4CD}'} 显示 {filteredSites.length} 个圣地
        </Text>
      </View>
    </View>
  )
}

definePageConfig({
  navigationBarTitleText: '圣地地图',
})
