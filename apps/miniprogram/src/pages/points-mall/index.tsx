import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  PointsProductItem, MembershipData,
  fetchPointsProducts, exchangeProduct, fetchMyMembership,
} from '../../lib/api'
import './index.scss'

const CATEGORIES = [
  { value: '', label: '全部' },
  { value: 'COUPON', label: '优惠券' },
  { value: 'GIFT', label: '实物礼品' },
  { value: 'SERVICE', label: '增值服务' },
  { value: 'EXPERIENCE', label: '体验特权' },
]

export default function PointsMallPage() {
  const [products, setProducts] = useState<PointsProductItem[]>([])
  const [membership, setMembership] = useState<MembershipData | null>(null)
  const [activeCategory, setActiveCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [exchanging, setExchanging] = useState<string | null>(null)

  useEffect(() => { loadData('') }, [])

  const loadData = async (category: string) => {
    setLoading(true)
    try {
      const [productsRes, memberRes] = await Promise.all([
        fetchPointsProducts(category || undefined),
        fetchMyMembership().catch(() => null),
      ])
      setProducts(Array.isArray(productsRes) ? productsRes : [])
      setMembership(memberRes)
    } catch {
      Taro.showToast({ title: '加载失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat)
    loadData(cat)
  }

  const handleExchange = (product: PointsProductItem) => {
    if (exchanging) return
    const myPoints = membership?.points ?? 0
    if (myPoints < product.pointsCost) {
      Taro.showToast({ title: `积分不足，还差 ${product.pointsCost - myPoints} 积分`, icon: 'none' })
      return
    }
    Taro.showModal({
      title: '确认兑换',
      content: `确认用 ${product.pointsCost} 积分兑换「${product.name}」？\n\n兑换后剩余积分: ${myPoints - product.pointsCost}`,
      confirmText: '确认兑换',
      cancelText: '取消',
      success: async (res) => {
        if (!res.confirm) return
        setExchanging(product.id)
        try {
          await exchangeProduct(product.id)
          Taro.showToast({ title: '兑换成功！', icon: 'success' })
          await loadData(activeCategory)
        } catch {
          Taro.showToast({ title: '兑换失败，请重试', icon: 'none' })
        } finally {
          setExchanging(null)
        }
      },
    })
  }

  return (
    <View className='points-mall-page'>
      {/* Points Header */}
      <View className='points-header'>
        <Text className='points-header__label'>我的积分</Text>
        <Text className='points-header__num'>{(membership?.points ?? 0).toLocaleString()}</Text>
      </View>

      {/* Category Tabs */}
      <ScrollView className='category-tabs' scrollX>
        {CATEGORIES.map(cat => (
          <Text
            key={cat.value}
            className={`category-tab ${activeCategory === cat.value ? 'category-tab--active' : ''}`}
            onClick={() => handleCategoryChange(cat.value)}
          >
            {cat.label}
          </Text>
        ))}
      </ScrollView>

      {/* Product Grid */}
      <ScrollView className='product-scroll' scrollY>
        {loading ? (
          <View className='empty'>
            <Text className='empty__text'>加载中...</Text>
          </View>
        ) : products.length === 0 ? (
          <View className='empty'>
            <Text className='empty__icon'>🎁</Text>
            <Text className='empty__text'>暂无可兑换商品</Text>
          </View>
        ) : (
          <View className='product-grid'>
            {products.map(product => {
              const canAfford = (membership?.points ?? 0) >= product.pointsCost
              return (
                <View key={product.id} className='product-card'>
                  {product.imageUrl ? (
                    <Image className='product-card__image' src={product.imageUrl} mode='aspectFill' lazyLoad />
                  ) : (
                    <View className='product-card__image product-card__image--placeholder'>
                      <Text className='product-card__placeholder-icon'>🎁</Text>
                    </View>
                  )}
                  <View className='product-card__body'>
                    <Text className='product-card__name'>{product.name}</Text>
                    <Text className='product-card__desc' numberOfLines={2}>{product.description}</Text>
                    <View className='product-card__footer'>
                      <View className='product-card__cost'>
                        <Text className='product-card__cost-num'>{product.pointsCost}</Text>
                        <Text className='product-card__cost-label'>积分</Text>
                      </View>
                      <View
                        className={`product-card__btn ${!canAfford || product.stock === 0 ? 'product-card__btn--disabled' : ''} ${exchanging === product.id ? 'product-card__btn--loading' : ''}`}
                        onClick={() => canAfford && product.stock > 0 && handleExchange(product)}
                      >
                        <Text className='product-card__btn-text'>
                          {exchanging === product.id ? '兑换中' : product.stock === 0 ? '已售罄' : !canAfford ? '积分不足' : '立即兑换'}
                        </Text>
                      </View>
                    </View>
                    {product.stock > 0 && product.stock <= 10 && (
                      <Text className='product-card__stock'>仅剩 {product.stock} 件</Text>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        )}
        <View style={{ height: '60rpx' }} />
      </ScrollView>
    </View>
  )
}
