import { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { PackageItem, fetchPackages } from '../../lib/api'
import './index.scss'

const TYPES = [
  { value: '', label: '全部' },
  { value: 'CLASSIC', label: '经典' },
  { value: 'PREMIUM', label: '精品' },
  { value: 'LUXURY', label: '奢华' },
  { value: 'CUSTOM', label: '定制' },
]

const TYPE_LABELS: Record<string, string> = {
  CLASSIC: '经典套餐',
  PREMIUM: '精品套餐',
  LUXURY: '奢华套餐',
  CUSTOM: '定制套餐',
}

const TYPE_COLORS: Record<string, string> = {
  CLASSIC: '#0066FF',
  PREMIUM: '#D4A855',
  LUXURY: '#8B5CF6',
  CUSTOM: '#10B981',
}

const TRUST_BADGES = [
  { icon: '🛡️', label: '品质保障' },
  { icon: '💰', label: '最优价格' },
  { icon: '🔄', label: '免费退改' },
  { icon: '📞', label: '24h客服' },
]

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [total, setTotal] = useState(0)
  const [activeType, setActiveType] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')

  useEffect(() => { loadData('') }, [])

  const loadData = async (type: string) => {
    setLoading(true)
    try {
      const res = await fetchPackages({ type: type || undefined, pageSize: '20' })
      setPackages(Array.isArray(res.items) ? res.items : [])
      setTotal(res.total ?? 0)
    } catch {
      Taro.showToast({ title: '加载失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (type: string) => {
    setActiveType(type)
    setSearchText('')
    loadData(type)
  }

  // --- G4: Client-side search filtering ---
  const filteredPackages = useMemo(() => {
    if (!searchText.trim()) return packages
    const q = searchText.toLowerCase()
    return packages.filter(pkg =>
      pkg.title.toLowerCase().includes(q) ||
      (pkg.subtitle && pkg.subtitle.toLowerCase().includes(q)) ||
      (pkg.description && pkg.description.toLowerCase().includes(q))
    )
  }, [packages, searchText])

  const isSearching = searchText.trim().length > 0

  // --- G4: Stats row ---
  const stats = useMemo(() => {
    if (packages.length === 0) return null
    const avgPrice = Math.round(packages.reduce((sum, p) => sum + p.priceFrom, 0) / packages.length)
    const avgDuration = Math.round(packages.reduce((sum, p) => sum + p.duration, 0) / packages.length)
    // Collect unique religions as popular destinations
    const destinations = new Set<string>()
    packages.forEach(p => {
      if (p.religion?.name) destinations.add(p.religion.name)
    })
    return {
      total,
      avgPrice,
      avgDuration,
      destinationCount: destinations.size,
    }
  }, [packages, total])

  return (
    <ScrollView className='packages-page' scrollY>
      {/* G4: Search Input */}
      <View style={{ padding: '20rpx 24rpx 0' }}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: '12rpx', padding: '0 20rpx', height: '72rpx' }}>
          <Text style={{ fontSize: '28rpx', marginRight: '12rpx' }}>🔍</Text>
          <Input
            type='text'
            placeholder='搜索套餐名称或目的地'
            placeholderStyle='color: #64748B'
            value={searchText}
            onInput={e => setSearchText(e.detail.value)}
            style={{ flex: 1, fontSize: '26rpx', color: '#F8FAFC', backgroundColor: 'transparent' }}
          />
          {searchText && (
            <Text
              style={{ fontSize: '24rpx', color: '#94A3B8', padding: '8rpx' }}
              onClick={() => setSearchText('')}
            >
              清除
            </Text>
          )}
        </View>
      </View>

      {/* G4: Stats Row */}
      {!loading && stats && (
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', padding: '24rpx 20rpx', margin: '16rpx 24rpx 0', backgroundColor: '#1E293B', borderRadius: '16rpx' }}>
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text style={{ fontSize: '32rpx', fontWeight: '700', color: '#D4A855' }}>{stats.total}</Text>
            <Text style={{ fontSize: '22rpx', color: '#94A3B8' }}>套餐总数</Text>
          </View>
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text style={{ fontSize: '32rpx', fontWeight: '700', color: '#F8FAFC' }}>¥{stats.avgPrice.toLocaleString()}</Text>
            <Text style={{ fontSize: '22rpx', color: '#94A3B8' }}>均价起</Text>
          </View>
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text style={{ fontSize: '32rpx', fontWeight: '700', color: '#F8FAFC' }}>{stats.avgDuration}天</Text>
            <Text style={{ fontSize: '22rpx', color: '#94A3B8' }}>平均时长</Text>
          </View>
        </View>
      )}

      {/* G4: Trust Badges */}
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', padding: '16rpx 24rpx', margin: '12rpx 24rpx 0', backgroundColor: '#0F172A', borderRadius: '12rpx', border: '1rpx solid #334155' }}>
        {TRUST_BADGES.map(badge => (
          <View key={badge.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4rpx' }}>
            <Text style={{ fontSize: '28rpx' }}>{badge.icon}</Text>
            <Text style={{ fontSize: '20rpx', color: '#94A3B8' }}>{badge.label}</Text>
          </View>
        ))}
      </View>

      {/* Type Filter */}
      <ScrollView className='filter-bar' scrollX>
        {TYPES.map(t => (
          <Text
            key={t.value}
            className={`filter-chip ${activeType === t.value ? 'filter-chip--active' : ''}`}
            onClick={() => handleTypeChange(t.value)}
          >
            {t.label}
          </Text>
        ))}
      </ScrollView>

      {/* Count */}
      {!loading && (
        <View className='result-count'>
          <Text className='result-count__text'>
            {isSearching ? `搜索到 ${filteredPackages.length} 个套餐` : `共 ${total} 个套餐`}
          </Text>
        </View>
      )}

      {/* Package Cards */}
      {loading ? (
        <View className='loading'>
          <Text className='loading__text'>加载中...</Text>
        </View>
      ) : filteredPackages.length === 0 ? (
        <View className='empty'>
          <Text className='empty__icon'>{isSearching ? '🔍' : '📦'}</Text>
          <Text className='empty__text'>{isSearching ? '未找到匹配的套餐' : '暂无相关套餐'}</Text>
          {isSearching && (
            <Text
              style={{ fontSize: '24rpx', color: '#0066FF', marginTop: '12rpx' }}
              onClick={() => setSearchText('')}
            >
              清除搜索条件
            </Text>
          )}
        </View>
      ) : (
        <View className='packages-list'>
          {filteredPackages.map(pkg => {
            const typeColor = TYPE_COLORS[pkg.type] || '#0066FF'
            const typeLabel = TYPE_LABELS[pkg.type] || pkg.type
            return (
              <View
                key={pkg.id}
                className='package-card'
                hoverClass='package-card--hover'
                onClick={() => Taro.navigateTo({ url: `/pages/package-detail/index?id=${pkg.id}` })}
              >
                {/* Cover */}
                {pkg.coverImage ? (
                  <Image className='package-card__cover' src={pkg.coverImage} mode='aspectFill' lazyLoad />
                ) : (
                  <View className='package-card__cover package-card__cover--placeholder'>
                    <Text className='package-card__placeholder-icon'>🏯</Text>
                  </View>
                )}

                {/* Type Badge */}
                <View className='package-card__badge' style={{ backgroundColor: typeColor }}>
                  <Text className='package-card__badge-text'>{typeLabel}</Text>
                </View>

                {/* Body */}
                <View className='package-card__body'>
                  <Text className='package-card__title'>{pkg.title}</Text>
                  {pkg.subtitle && (
                    <Text className='package-card__subtitle'>{pkg.subtitle}</Text>
                  )}

                  {/* Meta row */}
                  <View className='package-card__meta'>
                    <Text className='package-card__meta-item'>⏱ {pkg.duration}天{pkg.nights}晚</Text>
                    {pkg.groupSize && (
                      <Text className='package-card__meta-item'>👥 {pkg.groupSize}</Text>
                    )}
                    {pkg.rating != null && (
                      <Text className='package-card__meta-item'>⭐ {(pkg.rating ?? 0).toFixed(1)}</Text>
                    )}
                  </View>

                  {/* Highlights */}
                  {pkg.highlights.length > 0 && (
                    <View className='package-card__highlights'>
                      {pkg.highlights.slice(0, 3).map((h, i) => (
                        <Text key={i} className='package-card__highlight'>✓ {h}</Text>
                      ))}
                    </View>
                  )}

                  {/* Price */}
                  <View className='package-card__footer'>
                    <View className='package-card__price'>
                      <Text className='package-card__price-from'>¥</Text>
                      <Text className='package-card__price-num'>{pkg.priceFrom.toLocaleString()}</Text>
                      <Text className='package-card__price-unit'>起/人</Text>
                    </View>
                    <View className='package-card__cta'>
                      <Text className='package-card__cta-text'>查看详情</Text>
                    </View>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      )}

      {/* G4: Bottom CTA */}
      {!loading && (
        <View
          style={{ margin: '32rpx 24rpx', padding: '24rpx', backgroundColor: '#D4A855', borderRadius: '16rpx', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '12rpx' }}
          onClick={() => Taro.navigateTo({ url: '/pages/routes/index' })}
        >
          <Text style={{ fontSize: '28rpx', fontWeight: '700', color: '#0F172A' }}>🗺️ 查看精品路线</Text>
        </View>
      )}

      <View style={{ height: '60rpx' }} />
    </ScrollView>
  )
}
