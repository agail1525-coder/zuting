import { useState, useCallback, useMemo } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { Collection, fetchCollections, createCollection, deleteCollection } from '../../lib/api'
import { getAccessToken } from '../../lib/auth'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function CollectionsPage() {
  const { t } = useTranslation()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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
      setError(t('collections.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [])

  useDidShow(() => {
    loadCollections()
  })

  // G4: Stats computed from data
  const stats = useMemo(() => {
    const totalCollections = collections.length
    const totalItems = collections.reduce((sum, c) => sum + (c.itemCount ?? 0), 0)
    return { totalCollections, totalItems }
  }, [collections])

  // G4: Client-side search filtering
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections
    const q = searchQuery.trim().toLowerCase()
    return collections.filter(
      c => c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q)
    )
  }, [collections, searchQuery])

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) {
      Taro.showToast({ title: t('collections.nameRequired'), icon: 'none' })
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
      Taro.showToast({ title: t('collections.createSuccess'), icon: 'success' })
    } catch {
      Taro.showToast({ title: t('collections.createFailed'), icon: 'none' })
    } finally {
      setCreating(false)
    }
  }, [newName, newDesc])

  const handleDelete = useCallback((id: string, name: string) => {
    Taro.showModal({
      title: t('collections.deleteTitle'),
      content: t('collections.deleteConfirm', { name }),
      confirmText: t('collections.delete'),
      confirmColor: '#EF4444',
    }).then(res => {
      if (!res.confirm) return
      deleteCollection(id)
        .then(() => {
          setCollections(prev => prev.filter(c => c.id !== id))
          Taro.showToast({ title: t('collections.deleted'), icon: 'success' })
        })
        .catch(() => {
          Taro.showToast({ title: t('collections.deleteFailed'), icon: 'none' })
        })
    }).catch(() => { Taro.showToast({ title: t('collections.deleteFailed'), icon: 'none' }) })
  }, [])

  if (!getAccessToken()) {
    return (
      <View className='collections-page'>
        <View className='empty-state'>
          <Text className='empty-state__icon'>&#x1F512;</Text>
          <Text className='empty-state__title'>{t('collections.loginRequired')}</Text>
          <Text className='empty-state__desc'>{t('collections.loginDesc')}</Text>
          <View
            className='empty-state__btn'
            onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}
          >
            <Text className='empty-state__btn-text'>{t('collections.goLogin')}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className='collections-page'>
      {/* Header */}
      <View className='page-header'>
        <Text className='page-header__title'>{t('collections.myCollections')}</Text>
        <View
          className='page-header__btn'
          onClick={() => setShowCreateModal(true)}
        >
          <Text className='page-header__btn-text'>{t('collections.newBtn')}</Text>
        </View>
      </View>

      {/* G4: Stats Row */}
      {!loading && !error && collections.length > 0 && (
        <View className='stats-row'>
          <View className='stats-row__item'>
            <Text className='stats-row__value'>{stats.totalCollections}</Text>
            <Text className='stats-row__label'>{t('collections.collections')}</Text>
          </View>
          <View className='stats-row__divider' />
          <View className='stats-row__item'>
            <Text className='stats-row__value'>{stats.totalItems}</Text>
            <Text className='stats-row__label'>{t('collections.totalItems')}</Text>
          </View>
        </View>
      )}

      {/* G4: Search Input */}
      {!loading && !error && collections.length > 0 && (
        <View className='search-bar'>
          <Text className='search-bar__icon'>&#x1F50D;</Text>
          <Input
            className='search-bar__input'
            placeholder={t('collections.searchPlaceholder')}
            placeholderClass='search-bar__placeholder'
            value={searchQuery}
            onInput={e => setSearchQuery(e.detail.value)}
          />
          {searchQuery.length > 0 && (
            <Text className='search-bar__clear' onClick={() => setSearchQuery('')}>&#x2715;</Text>
          )}
        </View>
      )}

      {loading && (
        <View className='loading-wrap'>
          <Text className='loading-wrap__text'>{t('common.loading')}</Text>
        </View>
      )}

      {!loading && error && (
        <View className='loading-wrap'>
          <Text className='loading-wrap__text loading-wrap__text--error'>{error}</Text>
          <Text className='loading-wrap__retry' onClick={loadCollections}>{t('common.retry')}</Text>
        </View>
      )}

      {!loading && !error && (
        <ScrollView className='collections-list' scrollY>
          {collections.length === 0 ? (
            /* G4: Data-empty state */
            <View className='empty-state'>
              <Text className='empty-state__icon'>&#x2665;</Text>
              <Text className='empty-state__title'>{t('collections.emptyTitle')}</Text>
              <Text className='empty-state__desc'>{t('collections.emptyDesc')}</Text>
              <View
                className='empty-state__btn'
                onClick={() => setShowCreateModal(true)}
              >
                <Text className='empty-state__btn-text'>{t('collections.newCollection')}</Text>
              </View>
            </View>
          ) : filteredCollections.length === 0 ? (
            /* G4: Search-empty state */
            <View className='empty-state'>
              <Text className='empty-state__icon'>&#x1F50D;</Text>
              <Text className='empty-state__title'>{t('collections.noMatch')}</Text>
              <Text className='empty-state__desc'>{t('collections.noMatchHint')}</Text>
              <View
                className='empty-state__btn'
                onClick={() => setSearchQuery('')}
              >
                <Text className='empty-state__btn-text'>{t('collections.clearSearch')}</Text>
              </View>
            </View>
          ) : (
            <>
              {filteredCollections.map(col => (
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
                    <Text className='collection-card__count'>{t('collections.itemCount', { count: col.itemCount ?? 0 })}</Text>
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

              {/* G4: Bottom CTA */}
              <View className='bottom-cta'>
                <Text className='bottom-cta__text'>{t('collections.ctaText')}</Text>
                <View
                  className='bottom-cta__btn'
                  onClick={() => Taro.switchTab({ url: '/pages/holy-sites/index' })}
                >
                  <Text className='bottom-cta__btn-text'>{t('collections.exploreSites')}</Text>
                </View>
              </View>

              <View style={{ height: '80rpx' }} />
            </>
          )}
        </ScrollView>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <View className='modal-overlay' onClick={() => setShowCreateModal(false)}>
          <View className='modal' onClick={e => e.stopPropagation()}>
            <Text className='modal__title'>{t('collections.newCollection')}</Text>
            <Input
              className='modal__input'
              placeholder={t('collections.namePlaceholder')}
              placeholderClass='modal__placeholder'
              value={newName}
              onInput={e => setNewName(e.detail.value)}
              maxlength={50}
            />
            <Input
              className='modal__input'
              placeholder={t('collections.descPlaceholder')}
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
                <Text className='modal__btn-text--cancel'>{t('common.cancel')}</Text>
              </View>
              <View
                className={`modal__btn modal__btn--confirm ${creating ? 'modal__btn--disabled' : ''}`}
                onClick={creating ? undefined : handleCreate}
              >
                <Text className='modal__btn-text--confirm'>{creating ? t('collections.creating') : t('collections.create')}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
