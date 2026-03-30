import { useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import {
  GuideItem, QuestionItem, LeaderboardEntry,
  fetchGuides, fetchQuestions, fetchLeaderboard,
} from '../../lib/api'
import './index.scss'

const TABS = [
  { key: 'guides', label: '游记' },
  { key: 'questions', label: '问答' },
  { key: 'leaderboard', label: '排行' },
]

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('guides')
  const [guides, setGuides] = useState<GuideItem[]>([])
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loadingGuides, setLoadingGuides] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)

  useDidShow(() => {
    loadGuides()
    loadQuestions()
    loadLeaderboard()
  })

  const loadGuides = async () => {
    try {
      setLoadingGuides(true)
      const res = await fetchGuides({ sort: 'hot', page: 1 })
      setGuides(Array.isArray(res?.items) ? res.items : [])
    } catch (err) {
      console.error('Load community data failed:', err)
      setGuides([])
    } finally {
      setLoadingGuides(false)
    }
  }

  const loadQuestions = async () => {
    try {
      setLoadingQuestions(true)
      const res = await fetchQuestions({ sort: 'latest', page: 1 })
      setQuestions(Array.isArray(res?.items) ? res.items : [])
    } catch (err) {
      console.error('Load community data failed:', err)
      setQuestions([])
    } finally {
      setLoadingQuestions(false)
    }
  }

  const loadLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true)
      const data = await fetchLeaderboard('guides', 'month')
      setLeaderboard(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Load community data failed:', err)
      setLeaderboard([])
    } finally {
      setLoadingLeaderboard(false)
    }
  }

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'leaderboard__rank--gold'
    if (rank === 2) return 'leaderboard__rank--silver'
    if (rank === 3) return 'leaderboard__rank--bronze'
    return 'leaderboard__rank--normal'
  }

  const getRankTextClass = (rank: number) => {
    if (rank <= 3) return 'leaderboard__rank-text'
    return 'leaderboard__rank-text leaderboard__rank-text--normal'
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return `${d.getMonth() + 1}月${d.getDate()}日`
    } catch {
      return ''
    }
  }

  return (
    <ScrollView className='community-page' scrollY>
      {/* ── Tabs ── */}
      <View className='tabs'>
        {TABS.map(tab => (
          <View
            key={tab.key}
            className='tabs__item'
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={`tabs__text ${activeTab === tab.key ? 'tabs__text--active' : ''}`}>
              {tab.label}
            </Text>
            {activeTab === tab.key && <View className='tabs__indicator' />}
          </View>
        ))}
      </View>

      {/* ── Guides Tab ── */}
      {activeTab === 'guides' && (
        <View>
          <View className='section-header'>
            <Text className='section-header__title'>热门游记</Text>
          </View>

          {loadingGuides ? (
            <View className='loading'>
              <Text className='loading__text'>加载中...</Text>
            </View>
          ) : guides.length === 0 ? (
            <View className='empty'>
              <Text className='empty__icon'>📖</Text>
              <Text className='empty__text'>暂无游记，快来分享你的旅行故事</Text>
            </View>
          ) : (
            guides.map(guide => (
              <View
                key={guide.id}
                className='guide-card'
                onClick={() => Taro.navigateTo({ url: `/pages/guide-detail/index?id=${guide.id}` })}
              >
                {guide.coverImage ? (
                  <Image className='guide-card__cover' src={guide.coverImage} mode='aspectFill' lazyLoad />
                ) : (
                  <View className='guide-card__cover--placeholder'>
                    <Text className='guide-card__placeholder-icon'>🏔</Text>
                  </View>
                )}
                <View className='guide-card__body'>
                  {guide.tags.length > 0 && (
                    <View className='guide-card__tags'>
                      {guide.tags.slice(0, 3).map(tag => (
                        <Text key={tag} className='guide-card__tag'>#{tag}</Text>
                      ))}
                    </View>
                  )}
                  <Text className='guide-card__title'>{guide.title}</Text>
                  <View className='guide-card__meta'>
                    <View className='guide-card__author'>
                      {guide.user.avatar ? (
                        <Image className='guide-card__avatar-img' src={guide.user.avatar} mode='aspectFill' />
                      ) : (
                        <View className='guide-card__avatar'>
                          <Text className='guide-card__avatar-text'>
                            {guide.user.nickname ? guide.user.nickname[0] : '用'}
                          </Text>
                        </View>
                      )}
                      <Text className='guide-card__author-name'>{guide.user.nickname || '旅行者'}</Text>
                    </View>
                    <View className='guide-card__stats'>
                      <Text className='guide-card__stat'>👁 {guide.viewCount}</Text>
                      <Text className='guide-card__stat'>❤️ {guide.likeCount}</Text>
                      <Text className='guide-card__stat'>💬 {guide.commentCount}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* ── Questions Tab ── */}
      {activeTab === 'questions' && (
        <View>
          <View className='section-header'>
            <Text className='section-header__title'>旅行问答</Text>
          </View>

          {loadingQuestions ? (
            <View className='loading'>
              <Text className='loading__text'>加载中...</Text>
            </View>
          ) : questions.length === 0 ? (
            <View className='empty'>
              <Text className='empty__icon'>❓</Text>
              <Text className='empty__text'>暂无问题，欢迎提出你的疑惑</Text>
            </View>
          ) : (
            questions.map(q => (
              <View
                key={q.id}
                className='question-card'
                onClick={() => Taro.navigateTo({ url: `/pages/question-detail/index?id=${q.id}` })}
              >
                <Text className='question-card__title'>{q.title}</Text>
                {q.tags.length > 0 && (
                  <View className='question-card__tags'>
                    {q.tags.slice(0, 3).map(tag => (
                      <Text key={tag} className='question-card__tag'>#{tag}</Text>
                    ))}
                  </View>
                )}
                <View className='question-card__footer'>
                  <Text className='question-card__answers'>{q.answerCount} 个回答</Text>
                  <Text className='question-card__time'>{formatDate(q.createdAt)}</Text>
                  <Text className={`question-card__status ${q.status === 'SOLVED' ? 'question-card__status--solved' : 'question-card__status--open'}`}>
                    {q.status === 'SOLVED' ? '已解决' : '待回答'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* ── Leaderboard Tab ── */}
      {activeTab === 'leaderboard' && (
        <View>
          <View className='section-header'>
            <Text className='section-header__title'>本月排行榜</Text>
          </View>

          {loadingLeaderboard ? (
            <View className='loading'>
              <Text className='loading__text'>加载中...</Text>
            </View>
          ) : leaderboard.length === 0 ? (
            <View className='empty'>
              <Text className='empty__icon'>🏆</Text>
              <Text className='empty__text'>排行榜数据暂未生成</Text>
            </View>
          ) : (
            <View className='leaderboard'>
              {leaderboard.map(entry => (
                <View key={entry.userId} className='leaderboard__item'>
                  <View className={`leaderboard__rank ${getRankClass(entry.rank)}`}>
                    <Text className={getRankTextClass(entry.rank)}>{entry.rank}</Text>
                  </View>
                  {entry.avatar ? (
                    <Image className='leaderboard__avatar-img' src={entry.avatar} mode='aspectFill' />
                  ) : (
                    <View className='leaderboard__avatar'>
                      <Text className='leaderboard__avatar-text'>
                        {entry.nickname ? entry.nickname[0] : '用'}
                      </Text>
                    </View>
                  )}
                  <View className='leaderboard__info'>
                    <Text className='leaderboard__name'>{entry.nickname || '旅行者'}</Text>
                    <Text className='leaderboard__count'>发布游记 {entry.count} 篇</Text>
                  </View>
                  {entry.rank <= 3 && (
                    <Text className='leaderboard__trophy'>
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={{ height: '60rpx' }} />
    </ScrollView>
  )
}
