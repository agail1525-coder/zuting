import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { EntityType, RecommendedItem, fetchRelatedItems } from '../../lib/api'
import './index.scss'

interface RelatedEntitiesProps {
  entityType: EntityType
  entityId: string
  title?: string
}

const detailPageMap: Record<EntityType, string> = {
  HOLY_SITE: '/pages/holy-site-detail/index',
  TEMPLE: '/pages/temple-detail/index',
  PATRIARCH: '/pages/patriarch-detail/index',
  ROUTE: '/pages/route-detail/index',
}

function navigateToDetail(item: RecommendedItem) {
  const page = detailPageMap[item.entityType]
  if (!page) return
  const param = item.entityType === 'ROUTE' ? 'slug' : 'id'
  Taro.navigateTo({ url: `${page}?${param}=${item.id}` })
}

export default function RelatedEntities({ entityType, entityId, title = '相关推荐' }: RelatedEntitiesProps) {
  const [items, setItems] = useState<RecommendedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!entityId) return
    setLoading(true)
    fetchRelatedItems(entityType, entityId, 8)
      .then(data => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [entityType, entityId])

  if (loading || items.length === 0) return null

  return (
    <View className='related-entities'>
      <Text className='related-entities__title'>{title}</Text>
      <ScrollView className='related-entities__scroll' scrollX>
        {items.map(item => (
          <View
            key={item.id}
            className='related-card'
            onClick={() => navigateToDetail(item)}
          >
            <View className='related-card__image-wrap'>
              {item.imageUrl ? (
                <Image
                  className='related-card__image'
                  src={item.imageUrl}
                  mode='aspectFill'
                  lazyLoad
                />
              ) : (
                <View className='related-card__image related-card__image--placeholder'>
                  <Text className='related-card__placeholder-icon'>🏛</Text>
                </View>
              )}
              {item.religion && (
                <View className='related-card__badge'>
                  <Text className='related-card__badge-text'>{item.religion}</Text>
                </View>
              )}
            </View>
            <Text className='related-card__name'>{item.title}</Text>
            {item.subtitle && (
              <Text className='related-card__sub'>{item.subtitle}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
