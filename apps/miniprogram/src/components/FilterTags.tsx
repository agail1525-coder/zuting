import { View, Text, ScrollView } from '@tarojs/components'
import { Religion } from '../lib/api'
import './FilterTags.scss'

interface Props {
  religions: Religion[]
  activeId: string | null
  onSelect: (id: string | null) => void
}

export default function FilterTags({ religions, activeId, onSelect }: Props) {
  return (
    <ScrollView className='filter-tags' scrollX scrollWithAnimation>
      <View className='filter-tags__inner'>
        <View
          className={`filter-tags__tag ${activeId === null ? 'filter-tags__tag--active' : ''}`}
          onClick={() => onSelect(null)}
        >
          <Text className='filter-tags__tag-text'>全部</Text>
        </View>
        {religions.map(r => (
          <View
            key={r.id}
            className={`filter-tags__tag ${activeId === r.id ? 'filter-tags__tag--active' : ''}`}
            onClick={() => onSelect(r.id)}
          >
            <Text className='filter-tags__tag-emoji'>{r.emoji}</Text>
            <Text className='filter-tags__tag-text'>{r.name}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
