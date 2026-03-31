import { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
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

const ALL_MOODS = ['感悟', '喜悦', '平静', '震撼', '感恩', '宁静']

type TabKey = 'mine' | 'community'

export default function JournalsPage() {
  const [authed, setAuthed] = useState(isLoggedIn())
  const [tab, setTab] = useState<TabKey>(isLoggedIn() ? 'mine' : 'community')
  const [journals, setJournals] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedMood, setSelectedMood] = useState<string>('')

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
    setSearch('')
    setSelectedMood('')
  }

  const handleJournalTap = (id: string) => {
    Taro.navigateTo({ url: `/pages/journal-detail/index?id=${id}` })
  }

  // Mood counts
  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    ALL_MOODS.forEach(m => { counts[m] = 0 })
    journals.forEach(j => { if (j.mood && counts[j.mood] !== undefined) counts[j.mood]++ })
    return counts
  }, [journals])

  // Stats
  const stats = useMemo(() => ({
    total: journals.length,
    publicCount: journals.filter(j => (j as any).isPublic).length,
  }), [journals])

  // Filtered journals
  const displayJournals = useMemo(() => {
    let result = journals
    if (selectedMood) {
      result = result.filter(j => j.mood === selectedMood)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(j =>
        j.title.toLowerCase().includes(q) || j.content.toLowerCase().includes(q)
      )
    }
    return result
  }, [journals, search, selectedMood])

  const handleCreateJournal = () => {
    if (!authed) {
      Taro.showToast({ title: '请先登录', icon: 'none', duration: 2000 })
      Taro.switchTab({ url: '/pages/profile/index' })
      return
    }
    Taro.navigateTo({ url: '/pages/journal-create/index' })
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

  const tabBar = authed ? (
    <View className='journal-tabs'>
      <View
        className={`journal-tabs__item${tab === 'mine' ? ' journal-tabs__item--active' : ''}`}
        onClick={() => handleTabChange('mine')}
      >
        <Text className='journal-tabs__text'>我的日记 ({tab === 'mine' ? stats.total : ''})</Text>
      </View>
      <View
        className={`journal-tabs__item${tab === 'community' ? ' journal-tabs__item--active' : ''}`}
        onClick={() => handleTabChange('community')}
      >
        <Text className='journal-tabs__text'>社区日记 ({tab === 'community' ? stats.total : ''})</Text>
      </View>
    </View>
  ) : null

  return (
    <View className='journals-page'>
      {tabBar}

      {/* Stats Row */}
      <View style={{ display: 'flex', flexDirection: 'row', gap: '16rpx', padding: '20rpx 32rpx 0' }}>
        <View style={{ flex: 1, background: 'rgba(212,168,85,0.12)', borderRadius: '14rpx', padding: '16rpx', textAlign: 'center' }}>
          <Text style={{ display: 'block', fontSize: '32rpx', fontWeight: 'bold', color: '#D4A855' }}>{stats.total}</Text>
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#94a3b8', marginTop: '4rpx' }}>篇日记</Text>
        </View>
        <View style={{ flex: 1, background: 'rgba(16,185,129,0.12)', borderRadius: '14rpx', padding: '16rpx', textAlign: 'center' }}>
          <Text style={{ display: 'block', fontSize: '32rpx', fontWeight: 'bold', color: '#10b981' }}>{stats.publicCount}</Text>
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#94a3b8', marginTop: '4rpx' }}>公开分享</Text>
        </View>
        <View style={{ flex: 1, background: 'rgba(139,92,246,0.12)', borderRadius: '14rpx', padding: '16rpx', textAlign: 'center' }}>
          <Text style={{ display: 'block', fontSize: '32rpx', fontWeight: 'bold', color: '#8b5cf6' }}>{Object.keys(moodCounts).filter(m => moodCounts[m] > 0).length}</Text>
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#94a3b8', marginTop: '4rpx' }}>种心情</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={{ padding: '16rpx 32rpx' }}>
        <Input
          placeholder='搜索日记标题或内容...'
          value={search}
          onInput={e => setSearch(e.detail.value)}
          style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12rpx', padding: '16rpx 24rpx', fontSize: '28rpx', color: '#e2e8f0' }}
        />
      </View>

      {/* Mood Filter Chips */}
      <ScrollView scrollX style={{ padding: '0 32rpx 16rpx', whiteSpace: 'nowrap' }}>
        <View style={{ display: 'inline-flex', gap: '16rpx' }}>
          <View
            style={{
              display: 'inline-flex', alignItems: 'center', padding: '10rpx 28rpx',
              background: selectedMood === '' ? '#D4A855' : 'rgba(255,255,255,0.06)',
              borderRadius: '40rpx', fontSize: '26rpx',
              color: selectedMood === '' ? '#0f172a' : '#94a3b8',
            }}
            onClick={() => setSelectedMood('')}
          >
            <Text>全部 ({journals.length})</Text>
          </View>
          {ALL_MOODS.filter(m => moodCounts[m] > 0).map(mood => (
            <View
              key={mood}
              style={{
                display: 'inline-flex', alignItems: 'center', padding: '10rpx 28rpx',
                background: selectedMood === mood ? '#D4A855' : 'rgba(255,255,255,0.06)',
                borderRadius: '40rpx', fontSize: '26rpx',
                color: selectedMood === mood ? '#0f172a' : '#94a3b8',
              }}
              onClick={() => setSelectedMood(selectedMood === mood ? '' : mood)}
            >
              <Text>{MOOD_EMOJI[mood] ?? ''} {mood} ({moodCounts[mood]})</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <ScrollView className='journal-list' scrollY>
        {displayJournals.length === 0 && search.trim() ? (
          <View className='empty'>
            <Text className='empty__icon'>{'\u{1F50D}'}</Text>
            <Text className='empty__text'>未找到含"{search}"的日记</Text>
            <View
              style={{ marginTop: '24rpx', padding: '16rpx 40rpx', background: 'rgba(212,168,85,0.15)', borderRadius: '40rpx' }}
              onClick={() => setSearch('')}
            >
              <Text style={{ color: '#D4A855', fontSize: '28rpx' }}>清除搜索</Text>
            </View>
          </View>
        ) : displayJournals.length === 0 ? (
          <View className='empty'>
            <Text className='empty__icon'>{'\u{1F4DD}'}</Text>
            <Text className='empty__text'>
              {tab === 'mine' ? '你还没有写过日记' : '暂无朝圣日记'}
            </Text>
            <Text className='empty__sub'>记录你的第一次朝圣之旅吧</Text>
          </View>
        ) : (
          displayJournals.map(journal => (
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
          ))
        )}

        {/* Bottom CTA */}
        {!loading && displayJournals.length > 0 && (
          <View
            style={{ margin: '32rpx', padding: '32rpx', background: 'linear-gradient(135deg, rgba(212,168,85,0.15), rgba(139,92,246,0.1))', borderRadius: '20rpx', textAlign: 'center' }}
            onClick={() => Taro.switchTab({ url: '/pages/community/index' })}
          >
            <Text style={{ display: 'block', fontSize: '30rpx', color: '#D4A855', fontWeight: 'bold' }}>探索社区故事</Text>
            <Text style={{ display: 'block', fontSize: '24rpx', color: '#94a3b8', marginTop: '8rpx' }}>看看其他朝圣者的旅程见闻 →</Text>
          </View>
        )}

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
