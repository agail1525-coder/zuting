import { useState, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow, useShareAppMessage } from '@tarojs/taro'
import { Collection, CollectionItem, fetchCollectionById, removeFromCollection } from '../../lib/api'
import './index.scss'

function getDetailUrl(item: CollectionItem): string {
  switch (item.entityType) {
    case 'HOLY_SITE':
      return `/pages/holy-site-detail/index?id=${item.entityId}`
    case 'TEMPLE':
      return `/pages/temple-detail/index?id=${item.entityId}`
    case 'PATRIARCH':
      return `/pages/patriarch-detail/index?id=${item.entityId}`
    case 'TEACHING':
      return `/pages/teaching-detail/index?id=${item.entityId}`
    case 'SEAL':
      return `/pages/seal-detail/index?id=${item.entityId}`
    default:
      return ''
  }
}

function getEntityTypeLabel(entityType: string): string {
  switch (entityType) {
    case 'HOLY_SITE': return '圣地'
    case 'TEMPLE': return '祖庭'
    case 'PATRIARCH': return '祖师'
    case 'TEACHING': return '祖训'
    case 'SEAL': return '印'
    default: return entityType
  }
}

export default function CollectionDetailPage() {
  const router = useRouter()
  const { id } = router.params
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useShareAppMessage(() => ({
    title: collection ? `${collection.name} — 我的收藏` : '我的收藏',
    path: `/pages/collection-detail/index?id=${id}`,
  }))

  const loadCollection = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const data = await fetchCollectionById(id)
      setCollection(data)
    } catch {
      setError('加载失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [id])

  useDidShow(() => {
    loadCollection()
  })

  const handleRemoveItem = useCallback((item: CollectionItem) => {
    if (!collection) return
    Taro.showModal({
      title: '移除收藏',
      content: `从收藏夹移除「${item.title}」？`,
      confirmText: '移除',
      confirmColor: '#EF4444',
    }).then(res => {
      if (!res.confirm) return
      removeFromCollection(collection.id, item.id)
        .then(() => {
          setCollection(prev => prev ? {
            ...prev,
            items: prev.items.filter(i => i.id !== item.id),
            itemCount: prev.itemCount - 1,
          } : null)
          Taro.showToast({ title: '已移除', icon: 'success' })
        })
        .catch(() => {
          Taro.showToast({ title: '移除失败', icon: 'none' })
        })
    }).catch(() => {})
  }, [collection])

  const handleShare = useCallback(() => {
    Taro.showShareMenu({ withShareTicket: true })
  }, [])

  if (loading) {
    return (
      <View className='container'>
        <Text className='loading-text'>正在加载...</Text>
      </View>
    )
  }

  if (error || !collection) {
    return (
      <View className='container'>
        <Text className='empty-text'>{error || '收藏夹不存在'}</Text>
        <Text className='retry-btn' onClick={loadCollection}>点击重试</Text>
      </View>
    )
  }

  return (
    <View className='collection-detail-page'>
      {/* Header */}
      <View className='detail-header'>
        <View className='detail-header__meta'>
          <Text className='detail-header__name'>{collection.name}</Text>
          {collection.description && (
            <Text className='detail-header__desc'>{collection.description}</Text>
          )}
          <Text className='detail-header__count'>{collection.itemCount} 个收藏</Text>
        </View>
        <View className='detail-header__share' onClick={handleShare}>
          <Text className='detail-header__share-icon'>&#x1F517;</Text>
          <Text className='detail-header__share-text'>分享</Text>
        </View>
      </View>

      {collection.items.length === 0 ? (
        <View className='empty-state'>
          <Text className='empty-state__icon'>&#x1F4E6;</Text>
          <Text className='empty-state__title'>收藏夹是空的</Text>
          <Text className='empty-state__desc'>在圣地、祖庭等详情页点击收藏即可加入</Text>
          <View
            className='empty-state__btn'
            onClick={() => Taro.switchTab({ url: '/pages/holy-sites/index' })}
          >
            <Text className='empty-state__btn-text'>去探索</Text>
          </View>
        </View>
      ) : (
        <ScrollView className='items-list' scrollY>
          {collection.items.map(item => (
            <View
              key={item.id}
              className='item-card'
              hoverClass='item-card--hover'
              onClick={() => {
                const url = getDetailUrl(item)
                if (url) Taro.navigateTo({ url })
              }}
            >
              {item.image && (
                <View className='item-card__img' style={{ backgroundImage: `url(${item.image})` }} />
              )}
              {!item.image && (
                <View className='item-card__img item-card__img--placeholder'>
                  <Text className='item-card__img-icon'>&#x1F3EF;</Text>
                </View>
              )}
              <View className='item-card__info'>
                <View className='item-card__type-badge'>
                  <Text className='item-card__type-text'>{getEntityTypeLabel(item.entityType)}</Text>
                </View>
                <Text className='item-card__title'>{item.title}</Text>
                {item.subtitle && (
                  <Text className='item-card__subtitle'>{item.subtitle}</Text>
                )}
                <Text className='item-card__date'>收藏于 {item.createdAt.slice(0, 10)}</Text>
              </View>
              <View
                className='item-card__remove'
                onClick={e => {
                  e.stopPropagation()
                  handleRemoveItem(item)
                }}
              >
                <Text className='item-card__remove-icon'>&#x2715;</Text>
              </View>
            </View>
          ))}
          <View style={{ height: '80rpx' }} />
        </ScrollView>
      )}
    </View>
  )
}
