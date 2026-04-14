import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, Map } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Religion, HolySite, fetchReligions, fetchHolySites } from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
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
  const { t } = useTranslation()
  const [religions, setReligions] = useState<Religion[]>([])
  const [sites, setSites] = useState<HolySite[]>([])
  const [filteredSites, setFilteredSites] = useState<HolySite[]>([])
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [mapError, setMapError] = useState(false)
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
      Taro.showToast({ title: t('map.loadFailed'), icon: 'none' })
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
      color: '#1A1A1A',
      bgColor: '#FFFFFF',
      borderColor: '#3264ff',
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

  const handleMarkerTap = (e: { detail?: { markerId?: string | number }; markerId?: string | number }) => {
    const markerId = Number(e.detail?.markerId ?? e.markerId)
    if (!isNaN(markerId) && markers[markerId]) {
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
        <Text className='loading-text'>{t('map.loadingMapData')}</Text>
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
          <Text className='filter-chip__text'>{t('map.filterAll')}</Text>
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
        {mapError && (
          <View className='map-error-fallback'>
            <Text className='map-error-fallback__title'>{t('map.mapLoadFailed')}</Text>
            <Text className='map-error-fallback__desc'>{t('map.fallbackList')}</Text>
            <ScrollView className='map-error-fallback__list' scrollY>
              {filteredSites.map(site => (
                <View
                  key={site.id}
                  className='map-error-fallback__item'
                  onClick={() => Taro.navigateTo({ url: `/pages/holy-site-detail/index?id=${site.id}` })}
                >
                  <Text className='map-error-fallback__name'>{site.name}</Text>
                  <Text className='map-error-fallback__location'>{site.city}, {site.country}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        {!mapError && <Map
          className='map'
          latitude={center.latitude}
          longitude={center.longitude}
          scale={3}
          markers={markers}
          onMarkerTap={handleMarkerTap}
          onError={(e) => {
            console.error('Map error:', e)
            setMapError(true)
            Taro.showToast({
              title: t('map.mapLoadFailedCheckNetwork'),
              icon: 'none',
              duration: 3000,
            })
          }}
          showLocation={false}
          enableScroll
          enableZoom
          style='width: 100%; height: 100%;'
        />}
      </View>

      {/* Sites Count */}
      <View className='sites-count'>
        <Text className='sites-count__text'>
          {'\u{1F4CD}'} {t('map.showingSites', { count: filteredSites.length })}
        </Text>
      </View>
    </View>
  )
}

definePageConfig({
  navigationBarTitleText: '',
})
