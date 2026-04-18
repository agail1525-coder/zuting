import { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { fetchTpPackages, TP_TIER_META, TpPackageItem, TpTier } from '../../lib/api'
import './index.scss'

interface TpPackagesProps {
  holySiteId: string
  title?: string
}

const TIERS: TpTier[] = ['LUXURY', 'BUSINESS', 'STANDARD', 'BUDGET']

export default function TpPackages({ holySiteId, title = '配套服务' }: TpPackagesProps) {
  const [tier, setTier] = useState<TpTier>('STANDARD')
  const [items, setItems] = useState<TpPackageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchTpPackages(holySiteId, tier)
      .then((data) => {
        if (!cancelled) {
          setItems(data)
          setLoaded(true)
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [holySiteId, tier])

  if (!loaded && !loading) return null

  const currentMeta = TP_TIER_META[tier]

  return (
    <View className='tp-pkgs'>
      <View className='tp-pkgs__head'>
        <Text className='tp-pkgs__title'>🎒 {title}</Text>
        <Text className='tp-pkgs__hint'>4 档可选</Text>
      </View>

      <ScrollView scrollX className='tp-pkgs__tabs-scroll' showScrollbar={false}>
        <View className='tp-pkgs__tabs'>
          {TIERS.map((t) => {
            const meta = TP_TIER_META[t]
            const active = t === tier
            return (
              <View
                key={t}
                className={`tp-pkgs__tab ${active ? 'tp-pkgs__tab--active' : ''}`}
                style={active ? { backgroundColor: meta.color, borderColor: meta.color } : {}}
                onClick={() => setTier(t)}
              >
                <Text className='tp-pkgs__tab-icon'>{meta.icon}</Text>
                <Text className={`tp-pkgs__tab-text ${active ? 'tp-pkgs__tab-text--active' : ''}`}>
                  {meta.name}
                </Text>
              </View>
            )
          })}
        </View>
      </ScrollView>

      <View className='tp-pkgs__tier-desc' style={{ borderLeftColor: currentMeta.color }}>
        <Text className='tp-pkgs__tier-desc-text'>
          {currentMeta.icon} {currentMeta.name}档 · 为您精选{currentMeta.name === '尊贵' ? '五星级顶配' : currentMeta.name === '商务' ? '四星级品质' : currentMeta.name === '标准' ? '三星级舒适' : '性价比'}体验
        </Text>
      </View>

      {loading && items.length === 0 ? (
        <View className='tp-pkgs__empty'>
          <Text className='tp-pkgs__empty-text'>加载中…</Text>
        </View>
      ) : items.length === 0 ? (
        <View className='tp-pkgs__empty'>
          <Text className='tp-pkgs__empty-text'>暂无{currentMeta.name}档配套</Text>
        </View>
      ) : (
        <View className='tp-pkgs__list'>
          {items.map((item) => (
            <View key={item.id} className='tp-pkgs__card'>
              {item.coverImage ? (
                <Image className='tp-pkgs__cover' src={item.coverImage} mode='aspectFill' lazyLoad />
              ) : (
                <View className='tp-pkgs__cover tp-pkgs__cover--fallback'>
                  <Text className='tp-pkgs__cover-icon'>{currentMeta.icon}</Text>
                </View>
              )}
              <View className='tp-pkgs__card-body'>
                <View className='tp-pkgs__card-row'>
                  <View className='tp-pkgs__badge' style={{ backgroundColor: currentMeta.color }}>
                    <Text className='tp-pkgs__badge-text'>{item.category}</Text>
                  </View>
                  {item.rating != null && item.rating > 0 && (
                    <Text className='tp-pkgs__rating'>⭐ {item.rating.toFixed(1)}</Text>
                  )}
                </View>
                <Text className='tp-pkgs__name'>{item.name}</Text>
                {item.description && (
                  <Text className='tp-pkgs__desc'>{item.description}</Text>
                )}
                <View className='tp-pkgs__price-row'>
                  <Text className='tp-pkgs__price-label'>{item.currency} ¥ 起</Text>
                  <Text className='tp-pkgs__price' style={{ color: currentMeta.color }}>
                    {(item.priceFrom / 100).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
