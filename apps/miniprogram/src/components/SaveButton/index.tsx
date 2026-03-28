import { useState, useEffect, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { quickSave, checkSaved, removeFromCollection } from '../../lib/api'
import { getAccessToken } from '../../lib/auth'
import './index.scss'

interface SaveButtonProps {
  entityType: string
  entityId: string
  size?: 'small' | 'normal'
}

export default function SaveButton({ entityType, entityId, size = 'normal' }: SaveButtonProps) {
  const [saved, setSaved] = useState(false)
  const [itemId, setItemId] = useState<string | null>(null)
  const [collectionId, setCollectionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!getAccessToken()) return
    if (!entityId) return
    checkSaved(entityType, entityId)
      .then(status => {
        setSaved(status.saved)
        setItemId(status.itemId)
        setCollectionId(status.collectionId)
      })
      .catch(() => {})
  }, [entityType, entityId])

  const handleToggle = useCallback(async () => {
    if (!getAccessToken()) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    if (loading) return
    setLoading(true)
    try {
      if (saved && collectionId && itemId) {
        await removeFromCollection(collectionId, itemId)
        setSaved(false)
        setItemId(null)
        setCollectionId(null)
        Taro.showToast({ title: '已取消收藏', icon: 'none' })
      } else {
        const result = await quickSave(entityType, entityId)
        setSaved(true)
        setItemId(result.itemId)
        setCollectionId(result.collectionId)
        Taro.showToast({ title: '已收藏', icon: 'success' })
      }
    } catch {
      Taro.showToast({ title: '操作失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }, [saved, collectionId, itemId, entityType, entityId, loading])

  return (
    <View
      className={`save-btn save-btn--${size} ${saved ? 'save-btn--saved' : ''} ${loading ? 'save-btn--loading' : ''}`}
      onClick={handleToggle}
    >
      <Text className='save-btn__icon'>{saved ? '\u2665' : '\u2661'}</Text>
      {size === 'normal' && (
        <Text className='save-btn__label'>{saved ? '已收藏' : '收藏'}</Text>
      )}
    </View>
  )
}
