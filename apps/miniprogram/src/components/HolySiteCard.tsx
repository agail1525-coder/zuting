import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { HolySite } from '../lib/api'
import './HolySiteCard.scss'

interface Props {
  site: HolySite
  showReligion?: boolean
}

export default function HolySiteCard({ site, showReligion = false }: Props) {
  const handleTap = () => {
    Taro.navigateTo({
      url: `/pages/holy-site-detail/index?id=${site.id}`
    })
  }

  return (
    <View className='site-card' hoverClass='site-card--hover' onClick={handleTap}>
      <View className='site-card__header'>
        <View className='site-card__title-row'>
          <Text className='site-card__name'>{site.name}</Text>
          {showReligion && site.religion && (
            <Text className='site-card__badge'>{site.religion.emoji} {site.religion.name}</Text>
          )}
        </View>
        <Text className='site-card__name-en'>{site.nameEn}</Text>
      </View>
      <View className='site-card__location'>
        <Text className='site-card__location-icon'>&#x1F4CD;</Text>
        <Text className='site-card__location-text'>{site.city}, {site.country}</Text>
      </View>
      {site.description && (
        <Text className='site-card__desc'>{site.description.slice(0, 80)}{site.description.length > 80 ? '...' : ''}</Text>
      )}
      <View className='site-card__footer'>
        <Text className='site-card__coord'>
          {site.latitude.toFixed(2)}, {site.longitude.toFixed(2)}
        </Text>
        <Text className='site-card__utc'>UTC{site.utcOffset >= 0 ? '+' : ''}{site.utcOffset}</Text>
      </View>
    </View>
  )
}
