import { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { GuideItem, fetchGuides } from '../../lib/api'
import './index.scss'

export default function GuidesPage() {
  const [guides, setGuides] = useState<GuideItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadData(1)
  }, [])

  const loadData = async (p: number) => {
    try {
      if (p === 1) setLoading(true)
      const res = await fetchGuides({ page: p })
      if (p === 1) {
        setGuides(res.items)
      } else {
        setGuides(prev => [...prev, ...res.items])
      }
      setHasMore(res.items.length >= 20)
      setPage(p)
    } catch (err) {
      console.error('Failed to load guides:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleTap = (id: string) => {
    Taro.navigateTo({ url: `/pages/guide-detail/index?id=${id}` })
  }

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadData(page + 1)
    }
  }

  return (
    <View className='guides-page'>
      <View className='page-header'>
        <Text className='page-header__title'>攻略社区</Text>
      </View>

      <ScrollView
        className='guides-list'
        scrollY
        onScrollToLower={handleLoadMore}
      >
        {loading && guides.length === 0 ? (
          <Text className='loading-text'>正在加载...</Text>
        ) : guides.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-state__text'>暂无攻略</Text>
            <Text className='empty-state__sub'>快来发布第一篇攻略吧</Text>
          </View>
        ) : (
          guides.map(guide => (
            <View
              key={guide.id}
              className='guide-card'
              hoverClass='guide-card--hover'
              onClick={() => handleTap(guide.id)}
            >
              {guide.coverImage && (
                <Image
                  className='guide-card__image'
                  src={guide.coverImage}
                  mode='aspectFill'
                />
              )}
              <View className='guide-card__body'>
                <Text className='guide-card__title'>{guide.title}</Text>
                <View className='guide-card__footer'>
                  {guide.user && (
                    <Text className='guide-card__author'>{guide.user.nickname}</Text>
                  )}
                  <View className='guide-card__stats'>
                    <Text className='guide-card__stat'>{guide.viewCount} 阅读</Text>
                    <Text className='guide-card__stat'>{guide.likeCount} 赞</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
        {hasMore && guides.length > 0 && (
          <Text className='load-more'>加载更多...</Text>
        )}
        <View style={{ height: '120rpx' }} />
      </ScrollView>
    </View>
  )
}
