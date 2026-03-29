import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const APP_VERSION = '0.2.0'

const STATS = [
  { number: '12', label: '大信仰体系' },
  { number: '60+', label: '全球圣地' },
  { number: '27', label: '历史祖庭' },
  { number: '7', label: '支持语言' },
]

export default function AboutPage() {
  return (
    <View className='about-page'>
      {/* Hero */}
      <View className='about-hero'>
        <Text className='about-hero__icon'>{'\u{1F3EF}'}</Text>
        <Text className='about-hero__title'>JOINUS.COM</Text>
        <Text className='about-hero__subtitle'>全球祖庭之旅 Global Ancestral Temple Travel</Text>
      </View>

      {/* Mission */}
      <View className='about-card'>
        <Text className='about-card__title'>我们的使命</Text>
        <Text className='about-card__text'>
          帮助100万人走祖庭，建立全球宗教文化和平使者网络。
        </Text>
        <Text className='about-card__text'>
          祖庭之旅致力于连接世界各地的宗教文化圣地，让每一位旅行者都能深入了解人类文明的精神源头，在朝圣之路上获得心灵的成长与升华。
        </Text>
      </View>

      {/* Stats */}
      <View className='stats-grid'>
        {STATS.map((s) => (
          <View key={s.label} className='stat-item'>
            <Text className='stat-item__number'>{s.number}</Text>
            <Text className='stat-item__label'>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Platform Features */}
      <View className='about-card'>
        <Text className='about-card__title'>平台特色</Text>
        <Text className='about-card__text'>
          {'\u{1F30D}'} 覆盖佛教、道教、基督教、伊斯兰教等12大信仰体系
        </Text>
        <Text className='about-card__text'>
          {'\u{1F9ED}'} 智能行程规划，AI助手小鸿为您推荐最佳朝圣路线
        </Text>
        <Text className='about-card__text'>
          {'\u{1F4D6}'} 朝圣日志记录修行感悟，与全球行者分享心得
        </Text>
        <Text className='about-card__text'>
          {'\u{1F3C6}'} 曹溪愿命三十印集印体系，记录修行足迹
        </Text>
      </View>

      {/* Links */}
      <View className='about-links'>
        <View
          className='about-link'
          hoverClass='about-link--hover'
          onClick={() => Taro.navigateTo({ url: '/pages/privacy/index' })}
        >
          <Text className='about-link__text'>隐私政策</Text>
          <Text className='about-link__arrow'>&gt;</Text>
        </View>
        <View
          className='about-link'
          hoverClass='about-link--hover'
          onClick={() => Taro.navigateTo({ url: '/pages/terms/index' })}
        >
          <Text className='about-link__text'>服务条款</Text>
          <Text className='about-link__arrow'>&gt;</Text>
        </View>
      </View>

      {/* Footer */}
      <View className='about-footer'>
        <Text className='about-footer__version'>v{APP_VERSION}</Text>
        <Text className='about-footer__copyright'>
          JOINUS.COM Global Ancestral Temple Travel Platform
        </Text>
      </View>
    </View>
  )
}
