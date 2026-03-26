import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface Journal {
  id: string
  title: string
  excerpt: string
  mood: string
  moodEmoji: string
  date: string
  site: string
}

const MOCK_JOURNALS: Journal[] = [
  {
    id: 'j1',
    title: '菩提树下的觉悟',
    excerpt: '站在菩提伽耶的菩提树下，千年的枝叶沙沙作响，仿佛在诉说着佛陀成道时的那个清晨。我闭上眼，感受到一种深深的平静...',
    mood: '平静',
    moodEmoji: '\u{1F54A}',
    date: '2026-04-16',
    site: '菩提伽耶',
  },
  {
    id: 'j2',
    title: '鹿野苑的晨光',
    excerpt: '清晨的鹿野苑，薄雾笼罩着古老的达摩克塔。在这里，佛陀第一次转动法轮。我在晨光中绕塔而行，心中充满感恩...',
    mood: '感恩',
    moodEmoji: '\u{1F64F}',
    date: '2026-04-18',
    site: '鹿野苑',
  },
  {
    id: 'j3',
    title: '武当山的云海',
    excerpt: '登上武当山金顶，云海翻涌如仙境。道教真武大帝的传说在耳边回响，那一刻我理解了"道法自然"的深意...',
    mood: '震撼',
    moodEmoji: '\u{26F0}',
    date: '2026-01-15',
    site: '武当山',
  },
  {
    id: 'j4',
    title: '龙虎山的清修',
    excerpt: '在龙虎山天师府旁的小道观中静坐了一个下午。道长说，修行不在于形式，而在于心。这句话让我久久回味...',
    mood: '宁静',
    moodEmoji: '\u{1F343}',
    date: '2026-01-18',
    site: '龙虎山',
  },
]

export default function JournalsPage() {
  const [journals] = useState<Journal[]>(MOCK_JOURNALS)

  const handleJournalTap = (id: string) => {
    Taro.showToast({ title: '日记详情即将开放', icon: 'none' })
  }

  const handleCreate = () => {
    Taro.showToast({ title: '写日记功能即将开放', icon: 'none' })
  }

  return (
    <View className='journals-page'>
      <ScrollView className='journal-list' scrollY>
        {journals.map(journal => (
          <View
            key={journal.id}
            className='journal-card'
            hoverClass='journal-card--hover'
            onClick={() => handleJournalTap(journal.id)}
          >
            {/* Image Placeholder */}
            <View className='journal-card__image'>
              <Text className='journal-card__image-emoji'>{journal.moodEmoji}</Text>
            </View>

            <View className='journal-card__body'>
              <View className='journal-card__header'>
                <Text className='journal-card__title'>{journal.title}</Text>
                <View className='journal-card__mood'>
                  <Text className='journal-card__mood-text'>{journal.moodEmoji} {journal.mood}</Text>
                </View>
              </View>

              <Text className='journal-card__excerpt'>{journal.excerpt}</Text>

              <View className='journal-card__footer'>
                <Text className='journal-card__site'>{'\u{1F4CD}'} {journal.site}</Text>
                <Text className='journal-card__date'>{journal.date}</Text>
              </View>
            </View>
          </View>
        ))}
        <View style={{ height: '160rpx' }} />
      </ScrollView>

      {/* Floating Create Button */}
      <View className='fab' onClick={handleCreate}>
        <Text className='fab__icon'>{'\u{270F}'}</Text>
        <Text className='fab__text'>写日记</Text>
      </View>
    </View>
  )
}

definePageConfig({
  navigationBarTitleText: '朝圣日记',
})
