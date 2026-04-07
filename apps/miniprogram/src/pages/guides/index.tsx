import { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { GuideItem, fetchGuides } from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function GuidesPage() {
  const { t } = useTranslation()
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
      Taro.showToast({ title: t('guides.loadFailed'), icon: 'none' })
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
        <Text className='page-header__title'>{t('guides.title')}</Text>
      </View>

      <ScrollView
        className='guides-list'
        scrollY
        onScrollToLower={handleLoadMore}
      >
        {loading && guides.length === 0 ? (
          <Text className='loading-text'>{t('common.loading')}</Text>
        ) : guides.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-state__text'>{t('guides.empty')}</Text>
            <Text className='empty-state__sub'>{t('guides.emptyHint')}</Text>
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
                    <Text className='guide-card__stat'>{guide.viewCount} {t('guides.reads')}</Text>
                    <Text className='guide-card__stat'>{guide.likeCount} {t('guides.likes')}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
        {hasMore && guides.length > 0 && (
          <Text className='load-more'>{t('guides.loadMore')}</Text>
        )}
        <View style={{ height: '120rpx' }} />
      </ScrollView>
    </View>
  )
}
