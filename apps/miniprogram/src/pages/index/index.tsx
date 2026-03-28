import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { Religion, HolySite, Temple, Seal, fetchReligions, fetchHolySites, fetchTemples, fetchSeals } from '../../lib/api'
import ReligionCard from '../../components/ReligionCard'
import HolySiteCard from '../../components/HolySiteCard'
import './index.scss'

export default function IndexPage() {
  const [religions, setReligions] = useState<Religion[]>([])
  const [featuredSites, setFeaturedSites] = useState<HolySite[]>([])
  const [holySiteCount, setHolySiteCount] = useState<number | null>(null)
  const [templeCount, setTempleCount] = useState<number | null>(null)
  const [sealCount, setSealCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useShareAppMessage(() => ({
    title: '全球祖庭之旅 — 帮助100万人走祖庭',
    path: '/pages/index/index',
    imageUrl: '/assets/share-default.png',
  }))

  useShareTimeline(() => ({
    title: '全球祖庭之旅 — 十二大信仰 | 六十圣地 | 三十印',
    imageUrl: '/assets/share-default.png',
  }))

  useDidShow(() => {
    loadData()
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [religionList, siteList, templeList, sealList] = await Promise.all([
        fetchReligions(),
        fetchHolySites(),
        fetchTemples(),
        fetchSeals()
      ])
      setReligions(religionList)
      setHolySiteCount(siteList.length)
      setTempleCount(templeList.length)
      setSealCount(sealList.length)
      // Show first 6 sites as featured
      setFeaturedSites(siteList.slice(0, 6))
    } catch (err) {
      console.error('Failed to load data:', err)
      Taro.showToast({ title: '加载失败，请检查网络', icon: 'none', duration: 3000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className='index-page' scrollY>
      {/* Hero Section */}
      <View className='hero'>
        <View className='hero__glow' />
        <Text className='hero__title'>全球祖庭之旅</Text>
        <Text className='hero__subtitle'>Global Ancestral Temple Journey</Text>
        <Text className='hero__desc'>帮助100万人走祖庭，建立全球宗教文化和平使者网络</Text>
      </View>

      {/* Search Entry */}
      <View
        className='search-entry'
        hoverClass='search-entry--hover'
        onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}
      >
        <Text className='search-entry__icon'>&#x1F50D;</Text>
        <Text className='search-entry__text'>搜索圣地、祖庭、祖师...</Text>
      </View>

      {/* Stats Section */}
      <View className='stats'>
        <View className='stats__item'>
          <Text className='stats__number'>{religions.length || '--'}</Text>
          <Text className='stats__label'>大信仰</Text>
        </View>
        <View className='stats__divider' />
        <View className='stats__item'>
          <Text className='stats__number'>{holySiteCount ?? '--'}</Text>
          <Text className='stats__label'>圣地</Text>
        </View>
        <View className='stats__divider' />
        <View className='stats__item'>
          <Text className='stats__number'>{templeCount ?? '--'}</Text>
          <Text className='stats__label'>祖庭</Text>
        </View>
        <View className='stats__divider' />
        <View className='stats__item'>
          <Text className='stats__number'>{sealCount ?? '--'}</Text>
          <Text className='stats__label'>印</Text>
        </View>
      </View>

      {/* Religions Section */}
      <View className='section'>
        <Text className='section-title'>十二大信仰</Text>
        <View className='religion-grid'>
          {religions.map(r => (
            <ReligionCard key={r.id} religion={r} />
          ))}
        </View>
      </View>

      {/* Content Entry Cards */}
      <View className='section'>
        <Text className='section-title'>核心内容</Text>
        <View className='entry-grid'>
          <View
            className='entry-card entry-card--temple'
            hoverClass='entry-card--hover'
            onClick={() => Taro.navigateTo({ url: '/pages/temples/index' })}
          >
            <Text className='entry-card__icon'>{'\u{1F3DB}'}</Text>
            <Text className='entry-card__title'>祖庭</Text>
            <Text className='entry-card__desc'>{templeCount ?? '--'} 座祖庭</Text>
          </View>
          <View
            className='entry-card entry-card--patriarch'
            hoverClass='entry-card--hover'
            onClick={() => Taro.navigateTo({ url: '/pages/patriarchs/index' })}
          >
            <Text className='entry-card__icon'>{'\u{1F9D8}'}</Text>
            <Text className='entry-card__title'>祖师</Text>
            <Text className='entry-card__desc'>历代祖师大德</Text>
          </View>
          <View
            className='entry-card entry-card--teaching'
            hoverClass='entry-card--hover'
            onClick={() => Taro.navigateTo({ url: '/pages/teachings/index' })}
          >
            <Text className='entry-card__icon'>{'\u{1F4DC}'}</Text>
            <Text className='entry-card__title'>祖训</Text>
            <Text className='entry-card__desc'>传世经典语录</Text>
          </View>
        </View>
      </View>

      {/* Quick Entry Cards */}
      <View className='section'>
        <Text className='section-title'>探索功能</Text>
        <View className='entry-grid'>
          <View
            className='entry-card entry-card--ai'
            hoverClass='entry-card--hover'
            onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}
          >
            <Text className='entry-card__icon'>{'\u{1F426}'}</Text>
            <Text className='entry-card__title'>AI智慧助手</Text>
            <Text className='entry-card__desc'>问小鸿任何问题</Text>
          </View>
          <View
            className='entry-card entry-card--map'
            hoverClass='entry-card--hover'
            onClick={() => Taro.navigateTo({ url: '/pages/map/index' })}
          >
            <Text className='entry-card__icon'>{'\u{1F5FA}'}</Text>
            <Text className='entry-card__title'>圣地地图</Text>
            <Text className='entry-card__desc'>全球圣地分布</Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View className='cta-section'>
        <View className='cta-section__glow' />
        <Text className='cta-section__title'>开始朝圣</Text>
        <Text className='cta-section__desc'>规划你的祖庭之旅，探访全球圣地</Text>
        <View
          className='cta-section__btn'
          hoverClass='cta-section__btn--hover'
          onClick={() => Taro.navigateTo({ url: '/pages/trips/index' })}
        >
          <Text className='cta-section__btn-text'>规划行程</Text>
        </View>
      </View>

      {/* Divider */}
      <View className='divider' />

      {/* Featured Holy Sites */}
      <View className='section'>
        <View className='section__header'>
          <Text className='section-title'>精选圣地</Text>
          <Text
            className='section__more'
            onClick={() => Taro.switchTab({ url: '/pages/holy-sites/index' })}
          >
            查看全部 &gt;
          </Text>
        </View>
        {featuredSites.map(site => (
          <HolySiteCard key={site.id} site={site} showReligion />
        ))}
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: '120rpx' }} />
    </ScrollView>
  )
}
