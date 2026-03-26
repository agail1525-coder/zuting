import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import {
  Religion, HolySite, Temple, Patriarch, Teaching,
  fetchReligionBySlug, fetchHolySites, fetchTemples, fetchPatriarchs, fetchTeachings
} from '../../lib/api'
import HolySiteCard from '../../components/HolySiteCard'
import './index.scss'

export default function ReligionDetailPage() {
  const router = useRouter()
  const { id, slug } = router.params
  const [religion, setReligion] = useState<Religion | null>(null)
  const [holySites, setHolySites] = useState<HolySite[]>([])
  const [temples, setTemples] = useState<Temple[]>([])
  const [patriarchs, setPatriarchs] = useState<Patriarch[]>([])
  const [teachings, setTeachings] = useState<Teaching[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!slug && !id) return
    try {
      setLoading(true)
      const rel = slug ? await fetchReligionBySlug(slug) : null
      setReligion(rel)
      const religionId = id || rel?.id
      if (religionId) {
        const [sites, tmps, pats, tchs] = await Promise.all([
          fetchHolySites(religionId),
          fetchTemples(religionId),
          fetchPatriarchs(religionId),
          fetchTeachings(religionId)
        ])
        setHolySites(sites)
        setTemples(tmps)
        setPatriarchs(pats)
        setTeachings(tchs)
      }
    } catch (err) {
      console.error('Failed to load religion detail:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View className='container'>
        <Text className='loading-text'>正在加载...</Text>
      </View>
    )
  }

  return (
    <ScrollView className='religion-detail' scrollY>
      {/* Header */}
      {religion && (
        <View className='detail-header'>
          <Text className='detail-header__emoji'>{religion.emoji}</Text>
          <Text className='detail-header__name'>{religion.name}</Text>
          <Text className='detail-header__name-en'>{religion.nameEn}</Text>
          <Text className='detail-header__desc'>{religion.description}</Text>
          <View className='detail-header__meta'>
            {religion.foundedYear && (
              <View className='detail-header__tag'>
                <Text className='detail-header__tag-text'>创立: {religion.foundedYear}</Text>
              </View>
            )}
            {religion.origin && (
              <View className='detail-header__tag'>
                <Text className='detail-header__tag-text'>起源: {religion.origin}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Holy Sites */}
      {holySites.length > 0 && (
        <View className='detail-section'>
          <Text className='section-title'>圣地 ({holySites.length})</Text>
          {holySites.map(site => (
            <HolySiteCard key={site.id} site={site} />
          ))}
        </View>
      )}

      {/* Temples */}
      {temples.length > 0 && (
        <View className='detail-section'>
          <Text className='section-title'>祖庭 ({temples.length})</Text>
          {temples.map(temple => (
            <View
              key={temple.id}
              className='card'
              hoverClass='card-hover'
              onClick={() => Taro.navigateTo({ url: `/pages/temple-detail/index?id=${temple.id}` })}
            >
              <Text className='card__name'>{temple.name}</Text>
              <Text className='card__name-en'>{temple.nameEn}</Text>
              <View className='card__location'>
                <Text className='card__location-text'>{temple.city}, {temple.country}</Text>
              </View>
              {temple.description && (
                <Text className='card__desc'>
                  {temple.description.slice(0, 80)}{temple.description.length > 80 ? '...' : ''}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Patriarchs */}
      {patriarchs.length > 0 && (
        <View className='detail-section'>
          <Text className='section-title'>祖师 ({patriarchs.length})</Text>
          {patriarchs.map(p => (
            <View
              key={p.id}
              className='card'
              hoverClass='card-hover'
              onClick={() => Taro.navigateTo({ url: `/pages/patriarch-detail/index?id=${p.id}` })}
            >
              <Text className='card__name'>{p.name}</Text>
              <Text className='card__name-en'>{p.nameEn}</Text>
              {p.title && <Text className='card__subtitle'>{p.title}</Text>}
              {p.era && <Text className='card__era'>{p.era}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Teachings */}
      {teachings.length > 0 && (
        <View className='detail-section'>
          <Text className='section-title'>祖训 ({teachings.length})</Text>
          {teachings.map(t => (
            <View key={t.id} className='teaching-card'>
              <Text className='teaching-card__quote'>&ldquo;</Text>
              <Text className='teaching-card__content'>{t.content}</Text>
              <Text className='teaching-card__source'>-- {t.source}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
