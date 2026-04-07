import { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { PhotoItem, fetchPhotoWall } from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

const PAGE_SIZE = 18

export default function PhotosPage() {
  const { t } = useTranslation()
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadPage(1)
  }, [])

  const loadPage = async (p: number) => {
    try {
      if (p === 1) setLoading(true)
      const res = await fetchPhotoWall({ page: p, limit: PAGE_SIZE })
      const items = Array.isArray(res.items) ? res.items : []
      if (p === 1) {
        setPhotos(items)
      } else {
        setPhotos(prev => [...prev, ...items])
      }
      setHasMore(items.length >= PAGE_SIZE)
      setPage(p)
    } catch (err) {
      console.error('Failed to load photos:', err)
      Taro.showToast({ title: t('photos.loadFailed'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = (url: string) => {
    Taro.previewImage({
      current: url,
      urls: photos.map(p => p.url),
    })
  }

  const handleLoadMore = () => {
    if (hasMore && !loading) loadPage(page + 1)
  }

  return (
    <View className='photos-page'>
      <View className='page-header'>
        <Text className='page-header__title'>{t('photos.title')}</Text>
      </View>

      <ScrollView
        className='photos-grid'
        scrollY
        onScrollToLower={handleLoadMore}
      >
        {loading && photos.length === 0 ? (
          <Text className='loading-text'>{t('common.loading')}</Text>
        ) : photos.length === 0 ? (
          <Text className='empty-text'>{t('photos.empty')}</Text>
        ) : (
          <View className='grid'>
            {photos.map(photo => (
              <View
                key={photo.id}
                className='photo-tile'
                onClick={() => handlePreview(photo.url)}
              >
                <Image
                  className='photo-tile__image'
                  src={photo.url}
                  mode='aspectFill'
                  lazyLoad
                />
                <View className='photo-tile__overlay'>
                  <Text className='photo-tile__user'>{photo.userName}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        {hasMore && photos.length > 0 && (
          <Text className='load-more'>{t('photos.loadMore')}</Text>
        )}
        <View style={{ height: '120rpx' }} />
      </ScrollView>
    </View>
  )
}
