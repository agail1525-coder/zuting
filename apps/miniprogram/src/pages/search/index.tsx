import { useState, useRef, useCallback, useEffect } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  searchAll, SearchResultItem,
  fetchSearchSuggestions, fetchHotKeywords,
  SearchSuggestion, HotKeyword,
} from '../../lib/api'
import './index.scss'

type SearchType = 'all' | 'religion' | 'holy-site' | 'temple' | 'patriarch' | 'teaching' | 'seal'

const TABS: { key: SearchType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'religion', label: '信仰' },
  { key: 'holy-site', label: '圣地' },
  { key: 'temple', label: '祖庭' },
  { key: 'patriarch', label: '祖师' },
  { key: 'teaching', label: '祖训' },
  { key: 'seal', label: '印' },
]

function getDetailUrl(item: SearchResultItem): string {
  switch (item.type) {
    case 'religion':
      return `/pages/religion-detail/index?id=${item.id}`
    case 'holy-site':
      return `/pages/holy-site-detail/index?id=${item.id}`
    case 'temple':
      return `/pages/temple-detail/index?id=${item.id}`
    case 'patriarch':
      return `/pages/patriarch-detail/index?id=${item.id}`
    case 'seal':
      return `/pages/seal-detail/index?id=${item.id}`
    default:
      return ''
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'religion': return '信仰'
    case 'holy-site': return '圣地'
    case 'temple': return '祖庭'
    case 'patriarch': return '祖师'
    case 'teaching': return '祖训'
    case 'seal': return '印'
    default: return type
  }
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [activeType, setActiveType] = useState<SearchType>('all')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [hotKeywords, setHotKeywords] = useState<HotKeyword[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suggestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetchHotKeywords()
      .then(setHotKeywords)
      .catch(() => { Taro.showToast({ title: '搜索失败，请重试', icon: 'none' }) })
  }, [])

  const doSearch = useCallback(async (q: string, type: SearchType) => {
    if (!q.trim()) {
      setResults([])
      setTotal(0)
      setSearched(false)
      return
    }
    setLoading(true)
    setError('')
    setSearched(true)
    setShowSuggestions(false)
    try {
      const res = await searchAll(q.trim(), type)
      setResults(res.results)
      setTotal(res.total)
    } catch {
      setError('搜索失败，请稍后重试')
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSuggestions = useCallback((q: string) => {
    if (!q.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current)
    suggestTimerRef.current = setTimeout(async () => {
      try {
        const list = await fetchSearchSuggestions(q)
        setSuggestions(list)
        setShowSuggestions(list.length > 0)
      } catch {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 200)
  }, [])

  const handleInput = useCallback((e: { detail: { value: string } }) => {
    const val = e.detail.value
    setQuery(val)
    loadSuggestions(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      doSearch(val, activeType)
    }, 500)
  }, [activeType, doSearch, loadSuggestions])

  const handleConfirm = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    doSearch(query, activeType)
  }, [query, activeType, doSearch])

  const handleTabChange = useCallback((type: SearchType) => {
    setActiveType(type)
    if (query.trim()) {
      doSearch(query, type)
    }
  }, [query, doSearch])

  const handleResultClick = useCallback((item: SearchResultItem) => {
    const url = getDetailUrl(item)
    if (url) {
      Taro.navigateTo({ url })
    }
  }, [])

  const handleSuggestionClick = useCallback((text: string) => {
    setQuery(text)
    setSuggestions([])
    setShowSuggestions(false)
    doSearch(text, activeType)
  }, [activeType, doSearch])

  const handleHotKeywordClick = useCallback((keyword: string) => {
    setQuery(keyword)
    doSearch(keyword, activeType)
  }, [activeType, doSearch])

  const handleClear = useCallback(() => {
    setQuery('')
    setResults([])
    setTotal(0)
    setSearched(false)
    setSuggestions([])
    setShowSuggestions(false)
  }, [])

  const showEmpty = !query && !searched

  return (
    <View className='search-page'>
      {/* Search Bar */}
      <View className='search-bar'>
        <View className='search-bar__input-wrap'>
          <Text className='search-bar__icon'>&#x1F50D;</Text>
          <Input
            className='search-bar__input'
            placeholder='搜索圣地、祖庭、祖师...'
            placeholderClass='search-bar__placeholder'
            value={query}
            onInput={handleInput}
            onConfirm={handleConfirm}
            confirmType='search'
            focus
          />
          {query ? (
            <Text className='search-bar__clear' onClick={handleClear}>&#x2715;</Text>
          ) : null}
        </View>
      </View>

      {/* Type Filter Tabs */}
      <ScrollView className='filter-tabs' scrollX>
        {TABS.map(tab => (
          <View
            key={tab.key}
            className={`filter-tabs__item ${activeType === tab.key ? 'filter-tabs__item--active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            <Text className='filter-tabs__text'>{tab.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View className='suggestions'>
          {suggestions.map((s, i) => (
            <View
              key={i}
              className='suggestions__item'
              onClick={() => handleSuggestionClick(s.text)}
            >
              <Text className='suggestions__icon'>&#x1F50D;</Text>
              <Text className='suggestions__text'>{s.text}</Text>
              <Text className='suggestions__type'>{getTypeLabel(s.type)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Results Area */}
      <ScrollView className='search-results' scrollY>
        {/* Hot Keywords — shown when input is empty */}
        {showEmpty && hotKeywords.length > 0 && (
          <View className='hot-section'>
            <Text className='hot-section__title'>&#x1F525; 热门搜索</Text>
            <View className='hot-keywords'>
              {hotKeywords.map((kw, i) => (
                <View
                  key={i}
                  className='hot-keywords__tag'
                  onClick={() => handleHotKeywordClick(kw.keyword)}
                >
                  <Text className='hot-keywords__text'>{kw.keyword}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {loading && (
          <View className='search-status'>
            <Text className='search-status__text'>正在搜索...</Text>
          </View>
        )}

        {!loading && error && (
          <View className='search-status'>
            <Text className='search-status__text search-status__text--error'>{error}</Text>
          </View>
        )}

        {!loading && !error && searched && results.length === 0 && (
          <View className='search-status'>
            <Text className='search-status__icon'>&#x1F50E;</Text>
            <Text className='search-status__text'>未找到相关内容</Text>
            <Text className='search-status__hint'>试试其他关键词或切换分类</Text>
          </View>
        )}

        {!loading && !error && !searched && !showEmpty && (
          <View className='search-status'>
            <Text className='search-status__icon'>&#x1F50D;</Text>
            <Text className='search-status__text'>输入关键词开始搜索</Text>
            <Text className='search-status__hint'>搜索信仰、圣地、祖庭、祖师、祖训、印</Text>
          </View>
        )}

        {!loading && results.length > 0 && (
          <View>
            <Text className='search-results__count'>共 {total} 条结果</Text>
            {results.map(item => (
              <View
                key={`${item.type}-${item.id}`}
                className='result-card'
                hoverClass='result-card--hover'
                onClick={() => handleResultClick(item)}
              >
                <View className='result-card__header'>
                  <View
                    className='result-card__type-badge'
                    style={item.religion?.color ? { borderColor: item.religion.color } : undefined}
                  >
                    <Text className='result-card__type-text'>{getTypeLabel(item.type)}</Text>
                  </View>
                  {item.religion && (
                    <Text className='result-card__religion'>
                      {item.religion.symbol ?? ''} {item.religion.name}
                    </Text>
                  )}
                </View>
                <Text className='result-card__title'>{item.title}</Text>
                {item.subtitle && (
                  <Text className='result-card__subtitle'>{item.subtitle}</Text>
                )}
                {item.descriptionSnippet && (
                  <Text className='result-card__desc'>{item.descriptionSnippet}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: '120rpx' }} />
      </ScrollView>
    </View>
  )
}
