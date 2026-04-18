import { useState, useEffect } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  getAccessToken,
  getCachedUser,
  login,
  register,
  logout,
  fetchMe,
  wechatLogin,
  type User,
} from '../../lib/auth'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

const APP_VERSION = '0.2.0'

const MENU_KEYS = [
  { icon: '\u{1F4AC}', labelKey: 'profile.menuMessages', descKey: 'profile.menuMessagesDesc', action: 'messages', url: '/pages/messages/index' },
  { icon: '\u{1F9ED}', labelKey: 'profile.menuTrips', descKey: 'profile.menuTripsDesc', action: 'trips', url: '/pages/trips/index' },
  { icon: '\u{1F4D6}', labelKey: 'profile.menuJournals', descKey: 'profile.menuJournalsDesc', action: 'journals', url: '/pages/journals/index' },
  { icon: '\u2665', labelKey: 'profile.menuCollections', descKey: 'profile.menuCollectionsDesc', action: 'collections', url: '/pages/collections/index' },
  { icon: '\u{1F5FA}', labelKey: 'profile.menuMap', descKey: 'profile.menuMapDesc', action: 'map', url: '/pages/map/index' },
  { icon: '\u{1F514}', labelKey: 'profile.menuNotifications', descKey: 'profile.menuNotificationsDesc', action: 'notifications' },
  { icon: '\u{2139}\u{FE0F}', labelKey: 'profile.menuAbout', descKey: 'profile.menuAboutDesc', action: 'about', url: '/pages/about/index' },
  { icon: '\u{1F4AC}', labelKey: 'profile.menuFeedback', descKey: 'profile.menuFeedbackDesc', action: 'feedback' },
  { icon: '\u{2B50}', labelKey: 'profile.menuRate', descKey: 'profile.menuRateDesc', action: 'rate' },
]

const TRILOGY_MENU = [
  { icon: '\u{1F3F3}\u{FE0F}', labelKey: 'profile.trilogyCultureLife', descKey: 'profile.trilogyCultureLifeDesc', url: '/pages/culture-life/index' },
  { icon: '\u{1F9ED}', labelKey: 'profile.trilogyFaithAssessment', descKey: 'profile.trilogyFaithAssessmentDesc', url: '/pages/faith-assessment/index' },
  { icon: '\u{1F331}', labelKey: 'profile.trilogyPersonalGrowth', descKey: 'profile.trilogyPersonalGrowthDesc', url: '/pages/personal-growth/index' },
  { icon: '\u{1F3E1}', labelKey: 'profile.trilogyFamilyHarmony', descKey: 'profile.trilogyFamilyHarmonyDesc', url: '/pages/family-harmony/index' },
  { icon: '\u{1F465}', labelKey: 'profile.trilogyTeamCulture', descKey: 'profile.trilogyTeamCultureDesc', url: '/pages/team-culture/index' },
  { icon: '\u{1F3C6}', labelKey: 'profile.trilogyRankings', descKey: 'profile.trilogyRankingsDesc', url: '/pages/rankings/index' },
]

export default function ProfilePage() {
  const { t } = useTranslation()
  const [user, setUser] = useState<User | null>(null)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Try to restore user session
    const token = getAccessToken()
    if (token) {
      const cached = getCachedUser()
      if (cached) {
        setUser(cached)
      }
      // Also refresh from server
      fetchMe()
        .then(setUser)
        .catch(() => setUser(null))
    }
  }, [])

  const handleWechatLogin = async () => {
    setLoading(true)
    try {
      const u = await wechatLogin()
      setUser(u)
      Taro.showToast({ title: t('profile.loginSuccess'), icon: 'success' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('profile.wechatLoginFailed')
      Taro.showToast({ title: message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Taro.showToast({ title: t('profile.enterPhoneAndPassword'), icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const u = await login(phone.trim(), password)
      setUser(u)
      setShowLoginForm(false)
      setPhone('')
      setPassword('')
      Taro.showToast({ title: t('profile.loginSuccess'), icon: 'success' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('profile.loginFailed')
      Taro.showToast({ title: message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!phone.trim() || !nickname.trim() || !password.trim()) {
      Taro.showToast({ title: t('profile.fillAllRequired'), icon: 'none' })
      return
    }
    if (password !== confirmPassword) {
      Taro.showToast({ title: t('profile.passwordMismatch'), icon: 'none' })
      return
    }
    if (password.length < 6) {
      Taro.showToast({ title: t('profile.passwordMinLength'), icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const u = await register({ phone: phone.trim(), nickname: nickname.trim(), password })
      setUser(u)
      setShowRegisterForm(false)
      setPhone('')
      setPassword('')
      setNickname('')
      setConfirmPassword('')
      Taro.showToast({ title: t('profile.registerSuccess'), icon: 'success' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('profile.registerFailed')
      Taro.showToast({ title: message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
    Taro.showToast({ title: t('profile.loggedOut'), icon: 'none' })
  }

  const handleMenuTap = (item: typeof MENU_KEYS[0]) => {
    if (item.url) {
      Taro.navigateTo({ url: item.url })
      return
    }
    switch (item.action) {
      case 'feedback':
        Taro.showModal({
          title: t('profile.feedbackTitle'),
          content: t('profile.feedbackContent'),
          showCancel: false,
          confirmText: t('profile.feedbackOk')
        })
        break
      case 'notifications':
        Taro.openSetting()
        break
      case 'rate':
        Taro.showModal({
          title: t('profile.rateTitle'),
          content: t('profile.rateContent'),
          showCancel: false,
          confirmText: t('profile.rateOk')
        })
        break
      default:
        break
    }
  }

  return (
    <View className='profile-page'>
      {/* Avatar Section */}
      <View className='profile-card'>
        <View className='profile-card__avatar'>
          <Text className='profile-card__avatar-text'>{'\u{1F3EF}'}</Text>
        </View>

        {user ? (
          <>
            <Text className='profile-card__name'>{user.nickname}</Text>
            {user.phone && (
              <Text className='profile-card__desc'>{user.phone}</Text>
            )}
          </>
        ) : showLoginForm ? (
          <View className='auth-form'>
            <Input
              className='auth-form__input'
              placeholder={t('profile.phonePlaceholder')}
              placeholderClass='auth-form__placeholder'
              type='number'
              maxlength={11}
              value={phone}
              onInput={(e) => setPhone(e.detail.value)}
            />
            <Input
              className='auth-form__input'
              placeholder={t('profile.passwordPlaceholder')}
              placeholderClass='auth-form__placeholder'
              password
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
            />
            <View
              className='profile-card__login-btn'
              onClick={loading ? undefined : handleLogin}
            >
              <Text className='profile-card__login-text'>
                {loading ? t('profile.loggingIn') : t('profile.loginBtn')}
              </Text>
            </View>
            <Text
              className='auth-form__switch'
              onClick={() => { setShowLoginForm(false); setShowRegisterForm(true) }}
            >
              {t('profile.noAccountRegister')}
            </Text>
            <Text
              className='auth-form__switch'
              onClick={() => setShowLoginForm(false)}
            >
              {t('common.cancel')}
            </Text>
          </View>
        ) : showRegisterForm ? (
          <View className='auth-form'>
            <Input
              className='auth-form__input'
              placeholder={t('profile.phonePlaceholder')}
              placeholderClass='auth-form__placeholder'
              type='number'
              maxlength={11}
              value={phone}
              onInput={(e) => setPhone(e.detail.value)}
            />
            <Input
              className='auth-form__input'
              placeholder={t('profile.nicknamePlaceholder')}
              placeholderClass='auth-form__placeholder'
              maxlength={32}
              value={nickname}
              onInput={(e) => setNickname(e.detail.value)}
            />
            <Input
              className='auth-form__input'
              placeholder={t('profile.passwordMinLengthPlaceholder')}
              placeholderClass='auth-form__placeholder'
              password
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
            />
            <Input
              className='auth-form__input'
              placeholder={t('profile.confirmPasswordPlaceholder')}
              placeholderClass='auth-form__placeholder'
              password
              value={confirmPassword}
              onInput={(e) => setConfirmPassword(e.detail.value)}
            />
            <View
              className='profile-card__login-btn'
              onClick={loading ? undefined : handleRegister}
            >
              <Text className='profile-card__login-text'>
                {loading ? t('profile.registering') : t('profile.registerBtn')}
              </Text>
            </View>
            <Text
              className='auth-form__switch'
              onClick={() => { setShowRegisterForm(false); setShowLoginForm(true) }}
            >
              {t('profile.hasAccountLogin')}
            </Text>
            <Text
              className='auth-form__switch'
              onClick={() => setShowRegisterForm(false)}
            >
              {t('common.cancel')}
            </Text>
          </View>
        ) : (
          <>
            <Text className='profile-card__name'>{t('profile.guestName')}</Text>
            <Text className='profile-card__desc'>{t('profile.guestDesc')}</Text>
            <View
              className='profile-card__login-btn profile-card__login-btn--wechat'
              onClick={loading ? undefined : handleWechatLogin}
            >
              <Text className='profile-card__login-text'>
                {loading ? t('profile.loggingIn') : t('profile.wechatLogin')}
              </Text>
            </View>
            <View
              className='profile-card__alt-login'
              onClick={() => setShowLoginForm(true)}
            >
              <Text className='profile-card__alt-login-text'>{t('profile.phoneLoginRegister')}</Text>
            </View>
          </>
        )}
      </View>

      {/* Journey Stats */}
      <View className='journey-stats'>
        <View className='journey-stats__item'>
          <Text className='journey-stats__number'>{user?._count?.journals ?? 0}</Text>
          <Text className='journey-stats__label'>{t('profile.statJournals')}</Text>
        </View>
        <View className='journey-stats__divider' />
        <View className='journey-stats__item'>
          <Text className='journey-stats__number'>{user?._count?.practices ?? 0}</Text>
          <Text className='journey-stats__label'>{t('profile.statSeals')}</Text>
        </View>
        <View className='journey-stats__divider' />
        <View className='journey-stats__item'>
          <Text className='journey-stats__number'>{user?._count?.trips ?? 0}</Text>
          <Text className='journey-stats__label'>{t('profile.statTrips')}</Text>
        </View>
      </View>

      {/* Trilogy (四部曲) */}
      <View className='menu-group'>
        <Text className='menu-group__title'>{t('profile.trilogyGroupTitle')}</Text>
        <View className='menu-list'>
          {TRILOGY_MENU.map((item) => (
            <View
              key={item.url}
              className='menu-item'
              hoverClass='menu-item--hover'
              onClick={() => Taro.navigateTo({ url: item.url })}
            >
              <Text className='menu-item__icon'>{item.icon}</Text>
              <View className='menu-item__content'>
                <Text className='menu-item__label'>{t(item.labelKey)}</Text>
                <Text className='menu-item__desc'>{t(item.descKey)}</Text>
              </View>
              <Text className='menu-item__arrow'>&gt;</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Menu Items */}
      <View className='menu-list'>
        {MENU_KEYS.map((item) => (
          <View
            key={item.action}
            className='menu-item'
            hoverClass='menu-item--hover'
            onClick={() => handleMenuTap(item)}
          >
            <Text className='menu-item__icon'>{item.icon}</Text>
            <View className='menu-item__content'>
              <Text className='menu-item__label'>{t(item.labelKey)}</Text>
              <Text className='menu-item__desc'>{t(item.descKey)}</Text>
            </View>
            <Text className='menu-item__arrow'>&gt;</Text>
          </View>
        ))}
      </View>

      {/* Logout Button */}
      {user && (
        <View className='logout-section'>
          <View className='logout-btn' hoverClass='logout-btn--hover' onClick={handleLogout}>
            <Text className='logout-btn__text'>{t('profile.logout')}</Text>
          </View>
        </View>
      )}

      {/* Version */}
      <View className='version'>
        <Text className='version__text'>{t('profile.appName')} v{APP_VERSION}</Text>
        <Text className='version__copyright'>Global Ancestral Temple Travel Platform</Text>
      </View>
    </View>
  )
}
