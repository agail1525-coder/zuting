import { useState, useMemo } from 'react'
import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import {
  GuideItem, QuestionItem, LeaderboardEntry,
  fetchGuides, fetchQuestions, fetchLeaderboard,
} from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function CommunityPage() {
  const { t, locale } = useTranslation()
  const [activeTab, setActiveTab] = useState('guides')
  const [guides, setGuides] = useState<GuideItem[]>([])
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loadingGuides, setLoadingGuides] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  // G4: Stats computed from data
  const stats = useMemo(() => ({
    totalGuides: guides.length,
    totalQuestions: questions.length,
    totalLeaderboard: leaderboard.length,
  }), [guides, questions, leaderboard])

  // G4: Tab counts
  const TABS = useMemo(() => [
    { key: 'guides', label: t('community.tabGuides'), count: stats.totalGuides },
    { key: 'questions', label: t('community.tabQuestions'), count: stats.totalQuestions },
    { key: 'leaderboard', label: t('community.tabLeaderboard'), count: stats.totalLeaderboard },
  ], [stats, t])

  // G4: Client-side search filtering
  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return guides
    const q = searchQuery.trim().toLowerCase()
    return guides.filter(
      g => g.title.toLowerCase().includes(q) ||
        (g.tags ?? []).some(tag => tag.toLowerCase().includes(q))
    )
  }, [guides, searchQuery])

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions
    const q = searchQuery.trim().toLowerCase()
    return questions.filter(
      item => item.title.toLowerCase().includes(q) ||
        (item.tags ?? []).some(tag => tag.toLowerCase().includes(q))
    )
  }, [questions, searchQuery])

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
      return d.toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : locale, { month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  const isSearchActive = searchQuery.trim().length > 0

  return (
    <ScrollView className='community-page' scrollY>
      {/* G4: Stats Row */}
      <View className='stats-row'>
        <View className='stats-row__item'>
          <Text className='stats-row__value'>{stats.totalGuides}</Text>
          <Text className='stats-row__label'>{t('community.tabGuides')}</Text>
        </View>
        <View className='stats-row__divider' />
        <View className='stats-row__item'>
          <Text className='stats-row__value'>{stats.totalQuestions}</Text>
          <Text className='stats-row__label'>{t('community.tabQuestions')}</Text>
        </View>
        <View className='stats-row__divider' />
        <View className='stats-row__item'>
          <Text className='stats-row__value'>{stats.totalGuides + stats.totalQuestions}</Text>
          <Text className='stats-row__label'>{t('community.totalContent')}</Text>
        </View>
      </View>

      {/* G4: Search Input */}
      <View className='search-bar'>
        <Text className='search-bar__icon'>&#x1F50D;</Text>
        <Input
          className='search-bar__input'
          placeholder={t('community.searchPlaceholder')}
          placeholderClass='search-bar__placeholder'
          value={searchQuery}
          onInput={e => setSearchQuery(e.detail.value)}
        />
        {searchQuery.length > 0 && (
          <Text className='search-bar__clear' onClick={() => setSearchQuery('')}>&#x2715;</Text>
        )}
      </View>

      {/* G4: Tabs with counts */}
      <View className='tabs'>
        {TABS.map(tab => (
          <View
            key={tab.key}
            className='tabs__item'
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={`tabs__text ${activeTab === tab.key ? 'tabs__text--active' : ''}`}>
              {tab.label}
              {tab.count > 0 && (
                <Text className='tabs__count'> {tab.count}</Text>
              )}
            </Text>
            {activeTab === tab.key && <View className='tabs__indicator' />}
          </View>
        ))}
      </View>

      {/* ── Guides Tab ── */}
      {activeTab === 'guides' && (
        <View>
          <View className='section-header'>
            <Text className='section-header__title'>{t('community.hotGuides')}</Text>
          </View>

          {loadingGuides ? (
            <View className='loading'>
              <Text className='loading__text'>{t('common.loading')}</Text>
            </View>
          ) : guides.length === 0 ? (
            /* G4: Data-empty state */
            <View className='empty'>
              <Text className='empty__icon'>📖</Text>
              <Text className='empty__text'>{t('community.emptyGuides')}</Text>
              <View
                className='empty__btn'
                onClick={() => Taro.navigateTo({ url: '/pages/guide-edit/index' })}
              >
                <Text className='empty__btn-text'>{t('community.writeGuide')}</Text>
              </View>
            </View>
          ) : isSearchActive && filteredGuides.length === 0 ? (
            /* G4: Search-empty state */
            <View className='empty'>
              <Text className='empty__icon'>&#x1F50D;</Text>
              <Text className='empty__text'>{t('community.noMatchGuides')}</Text>
              <View
                className='empty__btn'
                onClick={() => setSearchQuery('')}
              >
                <Text className='empty__btn-text'>{t('community.clearSearch')}</Text>
              </View>
            </View>
          ) : (
            (isSearchActive ? filteredGuides : guides).map(guide => (
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
                            {guide.user.nickname ? guide.user.nickname[0] : t('community.userFallback')}
                          </Text>
                        </View>
                      )}
                      <Text className='guide-card__author-name'>{guide.user.nickname || t('community.traveler')}</Text>
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
            <Text className='section-header__title'>{t('community.travelQA')}</Text>
          </View>

          {loadingQuestions ? (
            <View className='loading'>
              <Text className='loading__text'>{t('common.loading')}</Text>
            </View>
          ) : questions.length === 0 ? (
            /* G4: Data-empty state */
            <View className='empty'>
              <Text className='empty__icon'>❓</Text>
              <Text className='empty__text'>{t('community.emptyQuestions')}</Text>
              <View
                className='empty__btn'
                onClick={() => Taro.navigateTo({ url: '/pages/question-create/index' })}
              >
                <Text className='empty__btn-text'>{t('community.askQuestion')}</Text>
              </View>
            </View>
          ) : isSearchActive && filteredQuestions.length === 0 ? (
            /* G4: Search-empty state */
            <View className='empty'>
              <Text className='empty__icon'>&#x1F50D;</Text>
              <Text className='empty__text'>{t('community.noMatchQuestions')}</Text>
              <View
                className='empty__btn'
                onClick={() => setSearchQuery('')}
              >
                <Text className='empty__btn-text'>{t('community.clearSearch')}</Text>
              </View>
            </View>
          ) : (
            (isSearchActive ? filteredQuestions : questions).map(q => (
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
                  <Text className='question-card__answers'>{t('community.answerCount', { count: q.answerCount })}</Text>
                  <Text className='question-card__time'>{formatDate(q.createdAt)}</Text>
                  <Text className={`question-card__status ${q.status === 'SOLVED' ? 'question-card__status--solved' : 'question-card__status--open'}`}>
                    {q.status === 'SOLVED' ? t('community.statusSolved') : t('community.statusOpen')}
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
            <Text className='section-header__title'>{t('community.monthlyRanking')}</Text>
          </View>

          {loadingLeaderboard ? (
            <View className='loading'>
              <Text className='loading__text'>{t('common.loading')}</Text>
            </View>
          ) : leaderboard.length === 0 ? (
            <View className='empty'>
              <Text className='empty__icon'>🏆</Text>
              <Text className='empty__text'>{t('community.emptyLeaderboard')}</Text>
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
                        {entry.nickname ? entry.nickname[0] : t('community.userFallback')}
                      </Text>
                    </View>
                  )}
                  <View className='leaderboard__info'>
                    <Text className='leaderboard__name'>{entry.nickname || t('community.traveler')}</Text>
                    <Text className='leaderboard__count'>{t('community.guideCount', { count: entry.count })}</Text>
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

      {/* G4: Bottom CTA */}
      <View className='bottom-cta'>
        <Text className='bottom-cta__text'>{t('community.ctaText')}</Text>
        <View
          className='bottom-cta__btn'
          onClick={() => Taro.navigateTo({ url: '/pages/guide-edit/index' })}
        >
          <Text className='bottom-cta__btn-text'>{t('community.writeGuide')}</Text>
        </View>
      </View>

      <View style={{ height: '60rpx' }} />
    </ScrollView>
  )
}
