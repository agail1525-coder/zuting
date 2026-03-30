import { useState, useCallback } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { Collection, fetchCollections, createCollection, deleteCollection } from '../../lib/api'
import { getAccessToken } from '../../lib/auth'
import './index.scss'

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)

  const loadCollections = useCallback(async () => {
    if (!getAccessToken()) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await fetchCollections()
      setCollections(data)
    } catch {
      setError('加载失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useDidShow(() => {
    loadCollections()
  })

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) {
      Taro.showToast({ title: '请输入收藏夹名称', icon: 'none' })
      return
    }
    setCreating(true)
    try {
      const col = await createCollection({
        name: newName.trim(),
        description: newDesc.trim() || undefined,
      })
      setCollections(prev => [col, ...prev])
      setShowCreateModal(false)
      setNewName('')
      setNewDesc('')
      Taro.showToast({ title: '创建成功', icon: 'success' })
    } catch {
      Taro.showToast({ title: '创建失败，请重试', icon: 'none' })
    } finally {
      setCreating(false)
    }
  }, [newName, newDesc])

  const handleDelete = useCallback((id: string, name: string) => {
    Taro.showModal({
      title: '删除收藏夹',
      content: `确定删除「${name}」？其中的收藏将全部清除。`,
      confirmText: '删除',
      confirmColor: '#EF4444',
    }).then(res => {
      if (!res.confirm) return
      deleteCollection(id)
        .then(() => {
          setCollections(prev => prev.filter(c => c.id !== id))
          Taro.showToast({ title: '已删除', icon: 'success' })
        })
        .catch(() => {
          Taro.showToast({ title: '删除失败', icon: 'none' })
        })
    }).catch(() => { Taro.showToast({ title: '删除失败，请重试', icon: 'none' }) })
  }, [])

  if (!getAccessToken()) {
    return (
      <View className='collections-page'>
        <View className='empty-state'>
          <Text className='empty-state__icon'>&#x1F512;</Text>
          <Text className='empty-state__title'>请先登录</Text>
          <Text className='empty-state__desc'>登录后即可查看和管理收藏夹</Text>
          <View
            className='empty-state__btn'
            onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}
          >
            <Text className='empty-state__btn-text'>去登录</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className='collections-page'>
      {/* Header */}
      <View className='page-header'>
        <Text className='page-header__title'>我的收藏夹</Text>
        <View
          className='page-header__btn'
          onClick={() => setShowCreateModal(true)}
        >
          <Text className='page-header__btn-text'>+ 新建</Text>
        </View>
      </View>

      {loading && (
        <View className='loading-wrap'>
          <Text className='loading-wrap__text'>加载中...</Text>
        </View>
      )}

      {!loading && error && (
        <View className='loading-wrap'>
          <Text className='loading-wrap__text loading-wrap__text--error'>{error}</Text>
          <Text className='loading-wrap__retry' onClick={loadCollections}>重试</Text>
        </View>
      )}

      {!loading && !error && (
        <ScrollView className='collections-list' scrollY>
          {collections.length === 0 ? (
            <View className='empty-state'>
              <Text className='empty-state__icon'>&#x2665;</Text>
              <Text className='empty-state__title'>还没有收藏夹</Text>
              <Text className='empty-state__desc'>在圣地、祖庭等详情页点击收藏，或新建收藏夹整理</Text>
              <View
                className='empty-state__btn'
                onClick={() => setShowCreateModal(true)}
              >
                <Text className='empty-state__btn-text'>新建收藏夹</Text>
              </View>
            </View>
          ) : (
            <>
              {collections.map(col => (
                <View
                  key={col.id}
                  className='collection-card'
                  hoverClass='collection-card--hover'
                  onClick={() => Taro.navigateTo({ url: `/pages/collection-detail/index?id=${col.id}` })}
                >
                  <View className='collection-card__cover'>
                    {col.coverImage ? (
                      <View className='collection-card__cover-img' style={{ backgroundImage: `url(${col.coverImage})` }} />
                    ) : (
                      <View className='collection-card__cover-placeholder'>
                        <Text className='collection-card__cover-icon'>&#x1F5C2;</Text>
                      </View>
                    )}
                  </View>
                  <View className='collection-card__info'>
                    <Text className='collection-card__name'>{col.name}</Text>
                    {col.description && (
                      <Text className='collection-card__desc'>{col.description}</Text>
                    )}
                    <Text className='collection-card__count'>{col.itemCount} 个收藏</Text>
                  </View>
                  <View
                    className='collection-card__delete'
                    onClick={e => {
                      e.stopPropagation()
                      handleDelete(col.id, col.name)
                    }}
                  >
                    <Text className='collection-card__delete-icon'>&#x1F5D1;</Text>
                  </View>
                </View>
              ))}
              <View style={{ height: '80rpx' }} />
            </>
          )}
        </ScrollView>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <View className='modal-overlay' onClick={() => setShowCreateModal(false)}>
          <View className='modal' onClick={e => e.stopPropagation()}>
            <Text className='modal__title'>新建收藏夹</Text>
            <Input
              className='modal__input'
              placeholder='收藏夹名称（必填）'
              placeholderClass='modal__placeholder'
              value={newName}
              onInput={e => setNewName(e.detail.value)}
              maxlength={50}
            />
            <Input
              className='modal__input'
              placeholder='描述（选填）'
              placeholderClass='modal__placeholder'
              value={newDesc}
              onInput={e => setNewDesc(e.detail.value)}
              maxlength={200}
            />
            <View className='modal__actions'>
              <View
                className='modal__btn modal__btn--cancel'
                onClick={() => { setShowCreateModal(false); setNewName(''); setNewDesc('') }}
              >
                <Text className='modal__btn-text--cancel'>取消</Text>
              </View>
              <View
                className={`modal__btn modal__btn--confirm ${creating ? 'modal__btn--disabled' : ''}`}
                onClick={creating ? undefined : handleCreate}
              >
                <Text className='modal__btn-text--confirm'>{creating ? '创建中...' : '创建'}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
