import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchJournals, Journal } from '../../lib/api'
import { isLoggedIn, getCachedUser } from '../../lib/auth'
import './index.scss'

const MOOD_EMOJI: Record<string, string> = {
  '\u611F\u609F': '\u{1F54A}',
  '\u559C\u60A6': '\u{1F60A}',
  '\u5E73\u9759': '\u{1F54A}',
  '\u9707\u64BC': '\u26F0',
  '\u611F\u6069': '\u{1F64F}',
  '\u5B81\u9759': '\u{1F343}',
}

type TabKey = 'mine' | 'community'

export default function JournalsPage() {
  const [authed, setAuthed] = useState(isLoggedIn())
  const [tab, setTab] = useState<TabKey>(isLoggedIn() ? 'mine' : 'community')
  const [journals, setJournals] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Re-check auth on page show (e.g. returning from login)
  Taro.useDidShow(() => {
    const nowLoggedIn = isLoggedIn()
    setAuthed(nowLoggedIn)
    if (!nowLoggedIn && tab === 'mine') {
      setTab('community')
    }
  })

  const loadJournals = useCallback((activeTab: TabKey) => {
    setLoading(true)
    setError(null)
    const params: Record<string, string> = { limit: '50' }
    if (activeTab === 'mine') {
      const user = getCachedUser()
      if (user) {
        params.userId = user.id
      }
    } else {
      params.isPublic = 'true'
    }
    fetchJournals(params)
      .then(res => {
        setJournals(res.items)
        setLoading(false)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : String(err))
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadJournals(tab)
  }, [tab, loadJournals])

  const handleTabChange = (newTab: TabKey) => {
    if (newTab === tab) return
    setTab(newTab)
  }

  const handleJournalTap = (id: string) => {
    Taro.navigateTo({ url: `/pages/journal-detail/index?id=${id}` })
  }

  if (loading) {
    return (
      <View className='journals-page'>
        <View className='empty'>
          <Text className='empty__text'>加载中...</Text>
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View className='journals-page'>
        <View className='empty'>
          <Text className='empty__icon'>{'\u274C'}</Text>
          <Text className='empty__text'>加载失败: {error}</Text>
        </View>
      </View>
    )
  }

  const handleCreateJournal = () => {
    if (!authed) {
      Taro.showToast({ title: '请先登录', icon: 'none', duration: 2000 })
      Taro.switchTab({ url: '/pages/profile/index' })
      return
    }
    Taro.navigateTo({ url: '/pages/journal-create/index' })
  }

  const tabBar = authed ? (
    <View className='journal-tabs'>
      <View
        className={`journal-tabs__item${tab === 'mine' ? ' journal-tabs__item--active' : ''}`}
        onClick={() => handleTabChange('mine')}
      >
        <Text className='journal-tabs__text'>我的日记</Text>
      </View>
      <View
        className={`journal-tabs__item${tab === 'community' ? ' journal-tabs__item--active' : ''}`}
        onClick={() => handleTabChange('community')}
      >
        <Text className='journal-tabs__text'>社区日记</Text>
      </View>
    </View>
  ) : null

  if (journals.length === 0) {
    return (
      <View className='journals-page'>
        {tabBar}
        <View className='empty'>
          <Text className='empty__icon'>{'\u{1F4DD}'}</Text>
          <Text className='empty__text'>
            {tab === 'mine' ? '你还没有写过日记' : '暂无朝圣日记'}
          </Text>
          <Text className='empty__sub'>记录你的第一次朝圣之旅吧</Text>
        </View>
        <View className='fab' onClick={handleCreateJournal}>
          <Text className='fab__icon'>{'\u270F\uFE0F'}</Text>
          <Text className='fab__text'>写日记</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='journals-page'>
      {tabBar}
      <ScrollView className='journal-list' scrollY>
        {journals.map(journal => (
          <View
            key={journal.id}
            className='journal-card'
            hoverClass='journal-card--hover'
            onClick={() => handleJournalTap(journal.id)}
          >
            <View className='journal-card__image'>
              <Text className='journal-card__image-emoji'>
                {MOOD_EMOJI[journal.mood ?? ''] ?? '\u{1F4D6}'}
              </Text>
            </View>

            <View className='journal-card__body'>
              <View className='journal-card__header'>
                <Text className='journal-card__title'>{journal.title}</Text>
                {journal.mood && (
                  <View className='journal-card__mood'>
                    <Text className='journal-card__mood-text'>
                      {MOOD_EMOJI[journal.mood] ?? ''} {journal.mood}
                    </Text>
                  </View>
                )}
              </View>

              <Text className='journal-card__excerpt'>
                {journal.content.length > 80
                  ? journal.content.slice(0, 80) + '...'
                  : journal.content}
              </Text>

              <View className='journal-card__footer'>
                {journal.trip && (
                  <Text className='journal-card__site'>{'\u{1F4CD}'} {journal.trip.title}</Text>
                )}
                <Text className='journal-card__date'>
                  {journal.createdAt.slice(0, 10)}
                </Text>
              </View>
            </View>
          </View>
        ))}
        <View style={{ height: '160rpx' }} />
      </ScrollView>
      <View className='fab' onClick={handleCreateJournal}>
        <Text className='fab__icon'>{'\u270F\uFE0F'}</Text>
        <Text className='fab__text'>写日记</Text>
      </View>
    </View>
  )
}

definePageConfig({
  navigationBarTitleText: '朝圣日记',
})
