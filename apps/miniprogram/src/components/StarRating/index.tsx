import { View, Text } from '@tarojs/components'
import './index.scss'

interface StarRatingProps {
  value: number
  onChange?: (rating: number) => void
  size?: 'small' | 'medium' | 'large'
  readonly?: boolean
}

export default function StarRating({ value, onChange, size = 'medium', readonly = false }: StarRatingProps) {
  return (
    <View className={`star-rating star-rating--${size}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <Text
          key={star}
          className={`star-rating__star ${star <= Math.round(value) ? 'star-rating__star--filled' : 'star-rating__star--empty'} ${!readonly ? 'star-rating__star--clickable' : ''}`}
          onClick={!readonly && onChange ? () => onChange(star) : undefined}
        >
          {star <= Math.round(value) ? '★' : '☆'}
        </Text>
      ))}
    </View>
  )
}
