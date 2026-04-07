import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import {
  fetchTeamCultureThemes,
  fetchTeamCases,
  type TeamCultureTheme,
  type TeamCase,
} from '../../lib/api'
import './index.scss'

export default function TeamCulturePage() {
  const [themes, setThemes] = useState<TeamCultureTheme[]>([])
  const [cases, setCases] = useState<TeamCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void load()
  }, [])

  const load = async () => {
    setError(null)
    try {
      const [t, c] = await Promise.allSettled([fetchTeamCultureThemes(), fetchTeamCases()])
      setThemes(t.status === 'fulfilled' ? t.value : [])
      setCases(c.status === 'fulfilled' ? c.value : [])
      if (t.status === 'rejected' && c.status === 'rejected') {
        setError('加载失败,请下拉重试')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View className='tc-loading'>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <ScrollView scrollY className='tc-page'>
      <View className='tc-hero'>
        <Text className='tc-hero-title'>团队文化打造</Text>
        <Text className='tc-hero-sub'>以祖庭文化为载体,深度凝聚团队精神</Text>
        <View className='tc-tags'>
          {['企业', '学校', '宗教组织', 'NGO', '家族', '政府'].map((tag) => (
            <View key={tag} className='tc-tag'>
              <Text className='tc-tag-text'>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {error && (
        <View className='tc-error'>
          <Text className='tc-error-text'>{error}</Text>
        </View>
      )}

      <View className='tc-section'>
        <Text className='tc-section-title'>主题方案 ({themes.length})</Text>
        {themes.length === 0 ? (
          <View className='tc-empty'>
            <Text>暂无主题</Text>
          </View>
        ) : (
          themes.map((theme) => (
            <View key={theme.id} className='tc-theme-card' style={{ borderLeftColor: theme.color || '#D4A855' }}>
              {theme.coverUrl ? (
                <Image src={theme.coverUrl} className='tc-theme-cover' mode='aspectFill' />
              ) : null}
              <View className='tc-theme-body'>
                <Text className='tc-theme-title'>
                  {theme.icon ? `${theme.icon} ` : ''}
                  {theme.title}
                </Text>
                {theme.subtitle && <Text className='tc-theme-sub'>{theme.subtitle}</Text>}
                <Text className='tc-theme-desc'>{theme.description}</Text>
                <View className='tc-keywords'>
                  {(theme.keywords || []).slice(0, 4).map((k) => (
                    <View key={k} className='tc-keyword'>
                      <Text className='tc-keyword-text'>{k}</Text>
                    </View>
                  ))}
                </View>
                <View className='tc-theme-meta'>
                  {theme.priceFrom != null && (
                    <Text className='tc-price'>¥{theme.priceFrom}/人 起</Text>
                  )}
                  {theme.durationDays != null && (
                    <Text className='tc-meta'>{theme.durationDays} 天</Text>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      <View className='tc-section'>
        <Text className='tc-section-title'>案例实拍 ({cases.length})</Text>
        {cases.length === 0 ? (
          <View className='tc-empty'>
            <Text>暂无案例</Text>
          </View>
        ) : (
          cases.map((c) => (
            <View key={c.id} className='tc-case-card'>
              {c.photos?.[0] ? (
                <Image src={c.photos[0]} className='tc-case-cover' mode='aspectFill' />
              ) : null}
              <View className='tc-case-body'>
                <Text className='tc-case-title'>{c.teamName}</Text>
                <Text className='tc-case-meta'>
                  {c.orgType} · {c.headcount}人{c.industry ? ` · ${c.industry}` : ''}
                </Text>
                <Text className='tc-case-story'>{c.story}</Text>
                {c.testimonial && <Text className='tc-testimonial'>"{c.testimonial}"</Text>}
              </View>
            </View>
          ))
        )}
      </View>

      <View className='tc-cta'>
        <Text className='tc-cta-title'>需要定制方案?</Text>
        <Text className='tc-cta-sub'>请前往 PC 端 joinus.com/team-culture 提交咨询</Text>
      </View>
    </ScrollView>
  )
}
