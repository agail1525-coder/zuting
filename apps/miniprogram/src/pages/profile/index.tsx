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
import './index.scss'

const APP_VERSION = '0.2.0'

const MENU_ITEMS = [
  { icon: '\u{1F4AC}', label: '消息', desc: '私信 · 商家咨询', action: 'messages', url: '/pages/messages/index' },
  { icon: '\u{1F9ED}', label: '我的行程', desc: '管理朝圣行程', action: 'trips', url: '/pages/trips/index' },
  { icon: '\u{1F4D6}', label: '朝圣日记', desc: '记录修行感悟', action: 'journals', url: '/pages/journals/index' },
  { icon: '\u2665', label: '我的收藏', desc: '收藏的圣地与祖庭', action: 'collections', url: '/pages/collections/index' },
  { icon: '\u{1F5FA}', label: '圣地地图', desc: '全球圣地分布', action: 'map', url: '/pages/map/index' },
  { icon: '\u{1F30F}', label: '语言设置', desc: '简体中文', action: 'language' },
  { icon: '\u{1F514}', label: '通知设置', desc: '管理推送通知', action: 'notifications' },
  { icon: '\u{2139}\u{FE0F}', label: '关于我们', desc: '了解祖庭之旅', action: 'about', url: '/pages/about/index' },
  { icon: '\u{1F4AC}', label: '意见反馈', desc: '帮助我们改进', action: 'feedback' },
  { icon: '\u{2B50}', label: '给我们评分', desc: '支持我们的工作', action: 'rate' },
]

export default function ProfilePage() {
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
      Taro.showToast({ title: '登录成功', icon: 'success' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '微信登录失败'
      Taro.showToast({ title: message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Taro.showToast({ title: '请输入手机号和密码', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const u = await login(phone.trim(), password)
      setUser(u)
      setShowLoginForm(false)
      setPhone('')
      setPassword('')
      Taro.showToast({ title: '登录成功', icon: 'success' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '登录失败'
      Taro.showToast({ title: message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!phone.trim() || !nickname.trim() || !password.trim()) {
      Taro.showToast({ title: '请填写所有必填项', icon: 'none' })
      return
    }
    if (password !== confirmPassword) {
      Taro.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }
    if (password.length < 6) {
      Taro.showToast({ title: '密码至少6位', icon: 'none' })
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
      Taro.showToast({ title: '注册成功', icon: 'success' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '注册失败'
      Taro.showToast({ title: message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
    Taro.showToast({ title: '已退出登录', icon: 'none' })
  }

  const handleMenuTap = (item: typeof MENU_ITEMS[0]) => {
    if (item.url) {
      Taro.navigateTo({ url: item.url })
      return
    }
    switch (item.action) {
      case 'feedback':
        Taro.showModal({
          title: '意见反馈',
          content: '感谢您的宝贵意见！\n\n请发送反馈至:\nfeedback@zuting.travel\n\n我们会认真阅读每一条反馈。',
          showCancel: false,
          confirmText: '好的'
        })
        break
      case 'language':
        Taro.showActionSheet({
          itemList: ['简体中文', 'English'],
        }).then((res) => {
          const lang = res.tapIndex === 0 ? '简体中文' : 'English'
          Taro.showToast({ title: `已切换为${lang}`, icon: 'success' })
        }).catch(() => { /* user cancelled */ })
        break
      case 'notifications':
        Taro.openSetting()
        break
      case 'rate':
        Taro.showModal({
          title: '感谢支持',
          content: '您的支持是我们前进的动力！\n\n请在微信「发现 → 小程序」中找到「祖庭之旅」，长按即可进行评分。',
          showCancel: false,
          confirmText: '知道了'
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
              placeholder='手机号'
              placeholderClass='auth-form__placeholder'
              type='number'
              maxlength={11}
              value={phone}
              onInput={(e) => setPhone(e.detail.value)}
            />
            <Input
              className='auth-form__input'
              placeholder='密码'
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
                {loading ? '登录中...' : '登录'}
              </Text>
            </View>
            <Text
              className='auth-form__switch'
              onClick={() => { setShowLoginForm(false); setShowRegisterForm(true) }}
            >
              没有账号？立即注册
            </Text>
            <Text
              className='auth-form__switch'
              onClick={() => setShowLoginForm(false)}
            >
              取消
            </Text>
          </View>
        ) : showRegisterForm ? (
          <View className='auth-form'>
            <Input
              className='auth-form__input'
              placeholder='手机号'
              placeholderClass='auth-form__placeholder'
              type='number'
              maxlength={11}
              value={phone}
              onInput={(e) => setPhone(e.detail.value)}
            />
            <Input
              className='auth-form__input'
              placeholder='昵称'
              placeholderClass='auth-form__placeholder'
              maxlength={32}
              value={nickname}
              onInput={(e) => setNickname(e.detail.value)}
            />
            <Input
              className='auth-form__input'
              placeholder='密码 (至少6位)'
              placeholderClass='auth-form__placeholder'
              password
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
            />
            <Input
              className='auth-form__input'
              placeholder='确认密码'
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
                {loading ? '注册中...' : '注册'}
              </Text>
            </View>
            <Text
              className='auth-form__switch'
              onClick={() => { setShowRegisterForm(false); setShowLoginForm(true) }}
            >
              已有账号？返回登录
            </Text>
            <Text
              className='auth-form__switch'
              onClick={() => setShowRegisterForm(false)}
            >
              取消
            </Text>
          </View>
        ) : (
          <>
            <Text className='profile-card__name'>祖庭行者</Text>
            <Text className='profile-card__desc'>开始你的祖庭之旅</Text>
            <View
              className='profile-card__login-btn profile-card__login-btn--wechat'
              onClick={loading ? undefined : handleWechatLogin}
            >
              <Text className='profile-card__login-text'>
                {loading ? '登录中...' : '微信一键登录'}
              </Text>
            </View>
            <View
              className='profile-card__alt-login'
              onClick={() => setShowLoginForm(true)}
            >
              <Text className='profile-card__alt-login-text'>手机号登录 / 注册</Text>
            </View>
          </>
        )}
      </View>

      {/* Journey Stats */}
      <View className='journey-stats'>
        <View className='journey-stats__item'>
          <Text className='journey-stats__number'>{user?._count?.journals ?? 0}</Text>
          <Text className='journey-stats__label'>朝圣日志</Text>
        </View>
        <View className='journey-stats__divider' />
        <View className='journey-stats__item'>
          <Text className='journey-stats__number'>{user?._count?.practices ?? 0}</Text>
          <Text className='journey-stats__label'>已集印章</Text>
        </View>
        <View className='journey-stats__divider' />
        <View className='journey-stats__item'>
          <Text className='journey-stats__number'>{user?._count?.trips ?? 0}</Text>
          <Text className='journey-stats__label'>行程数</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View className='menu-list'>
        {MENU_ITEMS.map((item) => (
          <View
            key={item.action}
            className='menu-item'
            hoverClass='menu-item--hover'
            onClick={() => handleMenuTap(item)}
          >
            <Text className='menu-item__icon'>{item.icon}</Text>
            <View className='menu-item__content'>
              <Text className='menu-item__label'>{item.label}</Text>
              <Text className='menu-item__desc'>{item.desc}</Text>
            </View>
            <Text className='menu-item__arrow'>&gt;</Text>
          </View>
        ))}
      </View>

      {/* Logout Button */}
      {user && (
        <View className='logout-section'>
          <View className='logout-btn' hoverClass='logout-btn--hover' onClick={handleLogout}>
            <Text className='logout-btn__text'>退出登录</Text>
          </View>
        </View>
      )}

      {/* Version */}
      <View className='version'>
        <Text className='version__text'>祖庭之旅 v{APP_VERSION}</Text>
        <Text className='version__copyright'>Global Ancestral Temple Travel Platform</Text>
      </View>
    </View>
  )
}
