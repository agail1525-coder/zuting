import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Religion } from '../lib/api'
import './ReligionCard.scss'

interface Props {
  religion: Religion
}

export default function ReligionCard({ religion }: Props) {
  const handleTap = () => {
    Taro.navigateTo({
      url: `/pages/religion-detail/index?id=${religion.id}&slug=${religion.slug}`
    })
  }

  return (
    <View className='religion-card' hoverClass='religion-card--hover' onClick={handleTap}>
      <View className='religion-card__emoji'>
        <Text>{religion.emoji}</Text>
      </View>
      <View className='religion-card__info'>
        <Text className='religion-card__name'>{religion.name}</Text>
        <Text className='religion-card__name-en'>{religion.nameEn}</Text>
      </View>
      {religion._count && (
        <View className='religion-card__stats'>
          <Text className='religion-card__stat'>{religion._count.holySites} 圣地</Text>
        </View>
      )}
    </View>
  )
}
