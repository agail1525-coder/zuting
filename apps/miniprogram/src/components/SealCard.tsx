import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Seal } from '../lib/api'
import './SealCard.scss'

interface Props {
  seal: Seal
}

const SERIES_COLORS: Record<string, string> = {
  '初印系': '#60a5fa',
  '中印系': '#a78bfa',
  '印果印': '#f472b6',
  '成道印': '#f59e0b',
  '归源印': '#34d399',
}

export default function SealCard({ seal }: Props) {
  const handleTap = () => {
    Taro.navigateTo({
      url: `/pages/seal-detail/index?id=${seal.id}`
    })
  }

  const seriesColor = SERIES_COLORS[seal.series] || '#0066FF'

  return (
    <View className='seal-card' hoverClass='seal-card--hover' onClick={handleTap}>
      <View className='seal-card__number' style={{ borderColor: seriesColor }}>
        <Text className='seal-card__number-text' style={{ color: seriesColor }}>
          {seal.id}
        </Text>
      </View>
      <View className='seal-card__content'>
        <View className='seal-card__title-row'>
          <Text className='seal-card__name'>{seal.name}</Text>
          <Text className='seal-card__series' style={{ color: seriesColor, borderColor: seriesColor }}>
            {seal.series}
          </Text>
        </View>
        {seal.poem && (
          <Text className='seal-card__verse'>
            {seal.poem.slice(0, 60)}{seal.poem.length > 60 ? '...' : ''}
          </Text>
        )}
      </View>
    </View>
  )
}
