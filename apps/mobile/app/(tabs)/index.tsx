import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { api, Religion, Route, HolySite, Temple, Patriarch, RecommendationItem, fetchTrending, fetchGuides, GuideItem, Journal } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

/* ─── Constants ─── */

const SEARCH_TABS = [
  { key: 'sites', label: '圣地', icon: 'location' as const },
  { key: 'routes', label: '路线', icon: 'map' as const },
  { key: 'ai', label: 'AI', icon: 'chatbubble-ellipses' as const },
  { key: 'wiki', label: '百科', icon: 'book' as const },
];

const CATEGORY_ICONS: { value: string; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { value: 'ZEN', icon: 'leaf', label: '禅宗' },
  { value: 'BUDDHIST', icon: 'flower', label: '佛教' },
  { value: 'TAOIST', icon: 'water', label: '道教' },
  { value: 'CHRISTIAN', icon: 'home', label: '基督' },
  { value: 'ISLAMIC', icon: 'moon', label: '丝路' },
  { value: 'CROSS_CULTURAL', icon: 'globe', label: '跨文化' },
  { value: 'HINDU', icon: 'sunny', label: '印度教' },
  { value: 'CULTURAL_HERITAGE', icon: 'library', label: '遗产' },
];

const HOT_TAGS = ['禅宗路线', '耶路撒冷', '丝绸之路', '朝圣之旅', '文化体验'];

const PLATFORM_HIGHLIGHTS = [
  { icon: 'earth' as const, title: '12大信仰', desc: '全球文化传统', route: '/religions/buddhism' },
  { icon: 'location' as const, title: '60+圣地', desc: '精选目的地', route: '/(tabs)/holy-sites' },
  { icon: 'chatbubble-ellipses' as const, title: 'AI规划师', desc: '智能路线定制', route: '/(tabs)/chat' },
  { icon: 'journal' as const, title: '朝圣日志', desc: '记录旅途故事', route: '/journals' },
];


const COMMUNITY_ACTIONS: { key: string; icon: keyof typeof Ionicons.glyphMap; label: string; route: string }[] = [
  { key: 'journals', icon: 'journal', label: '朝圣日志', route: '/journals' },
  { key: 'questions', icon: 'help-circle', label: '问答广场', route: '/community/questions' },
  { key: 'leaderboard', icon: 'trophy', label: '排行榜', route: '/community/leaderboard' },
];


const REC_TABS = [
  { key: 'temples', label: '祖庭' },
  { key: 'patriarchs', label: '祖师' },
  { key: 'sites', label: '圣地' },
];

/* ─── Main Screen ─── */

export default function HomeScreen() {
  const router = useRouter();
  const [featuredRoutes, setFeaturedRoutes] = useState<Route[]>([]);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [holySites, setHolySites] = useState<HolySite[]>([]);
  const [temples, setTemples] = useState<Temple[]>([]);
  const [patriarchs, setPatriarchs] = useState<Patriarch[]>([]);
  const [popularItems, setPopularItems] = useState<RecommendationItem[]>([]);
  const [trendingGuides, setTrendingGuides] = useState<GuideItem[]>([]);
  const [popularGuides, setPopularGuides] = useState<GuideItem[]>([]);
  const [publicJournals, setPublicJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState('sites');
  const [activeRecTab, setActiveRecTab] = useState('temples');

  const fetchData = useCallback(async () => {
    try {
      const [routesData, religionsData, sitesData, templesData, patriarchsData, popularData, trendingData, guidesData, journalsData] = await Promise.all([
        api.getFeaturedRoutes(6),
        api.getReligions(),
        api.getHolySites(),
        api.getTemples(),
        api.getPatriarchs(),
        api.fetchPopularItems(undefined, 10).catch(() => [] as RecommendationItem[]),
        fetchTrending().catch(() => ({ hotGuides: [], hotQuestions: [] })),
        fetchGuides({ sort: 'hot' }).catch(() => ({ items: [], total: 0 })),
        api.getJournals({ isPublic: 'true', limit: '4' }).catch(() => ({ data: [] as Journal[], total: 0 })),
      ]);
      setFeaturedRoutes(routesData);
      setReligions(religionsData);
      setHolySites(sitesData);
      setTemples(templesData);
      setPatriarchs(patriarchsData);
      setPopularItems(popularData);
      setTrendingGuides(Array.isArray(trendingData?.hotGuides) ? trendingData.hotGuides.slice(0, 3) : []);
      setPopularGuides(Array.isArray(guidesData?.items) ? guidesData.items.slice(0, 6) : []);
      setPublicJournals(Array.isArray(journalsData?.data) ? journalsData.data.slice(0, 4) : []);
    } catch (err) {
      console.error('Failed to fetch home data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading && featuredRoutes.length === 0) return <LoadingView />;

  const handleSearchTabPress = (key: string) => {
    setActiveSearchTab(key);
    if (key === 'ai') router.push('/(tabs)/chat');
    else router.push('/search');
  };

  const recData = activeRecTab === 'temples'
    ? temples.slice(0, 6).map(t => ({ id: t.id, name: t.name, sub: t.country, image: t.imageUrl }))
    : activeRecTab === 'patriarchs'
    ? patriarchs.slice(0, 6).map(p => ({ id: p.id, name: p.name, sub: p.dates, image: p.imageUrl }))
    : holySites.slice(0, 6).map(s => ({ id: s.id, name: s.name, sub: s.country, image: s.imageUrl }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
      }
    >
      {/* ── 1. Hero + Tab Search ── */}
      <LinearGradient colors={['#0066FF', '#003D99']} style={styles.hero}>
        <Text style={styles.heroTitle}>帮助100万人走祖庭</Text>
        <Text style={styles.heroSubtitle}>探索全球60+文化圣地 · 深度旅行体验</Text>

        {/* Tab Search Card */}
        <View style={styles.searchCard}>
          <View style={styles.searchTabs}>
            {SEARCH_TABS.map(tab => (
              <Pressable
                key={tab.key}
                style={[styles.searchTab, activeSearchTab === tab.key && styles.searchTabActive]}
                onPress={() => handleSearchTabPress(tab.key)}
              >
                <Ionicons
                  name={tab.icon}
                  size={14}
                  color={activeSearchTab === tab.key ? '#0066FF' : '#9CA3AF'}
                />
                <Text style={[styles.searchTabText, activeSearchTab === tab.key && styles.searchTabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.searchBar} onPress={() => router.push('/search')}>
            <Ionicons name="search" size={16} color="#9CA3AF" />
            <Text style={styles.searchPlaceholder}>搜路线、查目的地...</Text>
          </Pressable>
        </View>

        {/* Hot Tags */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.heroTags}>
          {HOT_TAGS.map(tag => (
            <Pressable key={tag} style={styles.heroTag} onPress={() => router.push('/search')}>
              <Text style={styles.heroTagText}>#{tag}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Trust badge */}
        <Text style={styles.trustText}>12大文化传统 · 60+圣地 · 专业路线规划 · AI旅行顾问</Text>
      </LinearGradient>

      {/* ── 2. Category Icons ── */}
      <View style={styles.categoryCard}>
        {CATEGORY_ICONS.map(cat => (
          <Pressable
            key={cat.value}
            style={styles.categoryItem}
            onPress={() => router.push('/search')}
          >
            <View style={styles.categoryIcon}>
              <Ionicons name={cat.icon} size={22} color="#0066FF" />
            </View>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* ── 3. Platform Highlights ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>为什么选择我们</Text>
      </View>
      <View style={styles.highlightGrid}>
        {PLATFORM_HIGHLIGHTS.map(h => (
          <Pressable
            key={h.title}
            style={styles.highlightCard}
            onPress={() => router.push(h.route as never)}
          >
            <View style={styles.highlightIconBox}>
              <Ionicons name={h.icon} size={20} color="#0066FF" />
            </View>
            <Text style={styles.highlightTitle}>{h.title}</Text>
            <Text style={styles.highlightDesc}>{h.desc}</Text>
            <Text style={styles.highlightCta}>了解更多 &gt;</Text>
          </Pressable>
        ))}
      </View>

      {/* ── 4. Pilgrim Stories (from API: public journals) ── */}
      {publicJournals.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>朝圣故事</Text>
            <Pressable onPress={() => router.push('/journals' as never)}>
              <Text style={styles.sectionMore}>查看全部 &gt;</Text>
            </Pressable>
          </View>
          <FlatList
            data={publicJournals}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storyList}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const firstImage = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null;
              const authorName = item.user?.nickname ?? '匿名';
              return (
                <Pressable style={styles.storyCard} onPress={() => router.push(`/journal/${item.id}` as never)}>
                  {firstImage ? (
                    <Image source={{ uri: firstImage }} style={styles.storyImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.storyImage, styles.storyImagePlaceholder]}>
                      <Ionicons name="image" size={28} color="#CBD5E1" />
                    </View>
                  )}
                  <View style={styles.storyOverlay}>
                    <View style={styles.storyAuthorRow}>
                      <View style={styles.storyAvatar}>
                        <Text style={styles.storyAvatarText}>{authorName[0]}</Text>
                      </View>
                      <Text style={styles.storyAuthorName}>{authorName}</Text>
                    </View>
                    <Text style={styles.storyTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.storyExcerpt} numberOfLines={2}>{item.content}</Text>
                  </View>
                </Pressable>
              );
            }}
          />
        </>
      )}

      {/* ── 5. Featured Routes ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>精选路线</Text>
        <Pressable onPress={() => router.push('/routes' as never)}>
          <Text style={styles.sectionMore}>查看全部 &gt;</Text>
        </Pressable>
      </View>
      <FlatList
        data={featuredRoutes}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.routeList}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <RouteCard route={item} onPress={() => router.push(`/routes/${item.slug}` as never)} />
        )}
      />

      {/* ── 5.5 Community Hub Entry ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>社区入口</Text>
        <Pressable onPress={() => router.push('/community' as never)}>
          <Text style={styles.sectionMore}>进入社区 &gt;</Text>
        </Pressable>
      </View>
      <View style={styles.communityHub}>
        {COMMUNITY_ACTIONS.map(action => (
          <Pressable
            key={action.key}
            style={styles.communityHubItem}
            onPress={() => router.push(action.route as never)}
          >
            <View style={styles.communityHubIcon}>
              <Ionicons name={action.icon} size={22} color="#0066FF" />
            </View>
            <Text style={styles.communityHubLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* ── 5.6 Trending Guides ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>热门攻略</Text>
        <Pressable onPress={() => router.push('/community' as never)}>
          <Text style={styles.sectionMore}>查看更多 &gt;</Text>
        </Pressable>
      </View>
      <FlatList
        data={popularGuides}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.guideList}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={{ color: '#9CA3AF', padding: spacing.md }}>暂无攻略</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.guideCard}
            onPress={() => router.push(`/community/guide/${item.id}` as never)}
          >
            <View style={styles.guideCardCover}>
              {item.coverImage ? (
                <Image source={{ uri: item.coverImage }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFillObject, styles.guideCardPlaceholder]}>
                  <Ionicons name="document-text" size={28} color="#93C5FD" />
                </View>
              )}
            </View>
            <View style={styles.guideCardBody}>
              <Text style={styles.guideCardTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.guideCardMeta}>
                <Text style={styles.guideCardAuthor}>{item.user?.nickname ?? '匿名'}</Text>
                <View style={styles.guideCardViews}>
                  <Ionicons name="eye-outline" size={11} color="#9CA3AF" />
                  <Text style={styles.guideCardViewsText}>{item.viewCount ?? 0}</Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
      />

      {/* ── 6. AI Planner Banner ── */}
      <Pressable onPress={() => router.push('/(tabs)/chat')} style={styles.aiBannerWrap}>
        <LinearGradient colors={['#0066FF', '#0052CC']} style={styles.aiBanner}>
          <View style={styles.aiBannerContent}>
            <Text style={styles.aiBannerTitle}>AI旅行规划师</Text>
            <Text style={styles.aiBannerDesc}>告诉我你想去哪里，我来帮你规划完美的朝圣路线</Text>
            <View style={styles.aiBannerBtn}>
              <Text style={styles.aiBannerBtnText}>开始对话</Text>
              <Ionicons name="arrow-forward" size={14} color="#0066FF" />
            </View>
          </View>
          <View style={styles.aiBannerChat}>
            <View style={styles.chatBubble}>
              <Text style={styles.chatBubbleText}>推荐一条禅宗路线</Text>
            </View>
            <View style={[styles.chatBubble, styles.chatBubbleReply]}>
              <Text style={styles.chatBubbleReplyText}>为您推荐「禅宗祖庭巡礼」5天4晚...</Text>
            </View>
          </View>
        </LinearGradient>
      </Pressable>

      {/* ── 7. Popular Destinations ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>热门目的地</Text>
        <Pressable onPress={() => router.push('/(tabs)/holy-sites' as never)}>
          <Text style={styles.sectionMore}>查看全部 &gt;</Text>
        </Pressable>
      </View>
      <View style={styles.destGrid}>
        {holySites.slice(0, 4).map(site => (
          <Pressable
            key={site.id}
            style={styles.destCard}
            onPress={() => router.push(`/holy-sites/${site.id}` as never)}
          >
            {site.imageUrl ? (
              <Image source={{ uri: site.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            ) : (
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="image" size={24} color="#CBD5E1" />
              </View>
            )}
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.destOverlay}>
              <Text style={styles.destName}>{site.name}</Text>
              <Text style={styles.destCountry}>{site.country}</Text>
            </LinearGradient>
          </Pressable>
        ))}
      </View>

      {/* ── 8. Recommendation Tabs ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>热门推荐</Text>
      </View>
      <View style={styles.recTabs}>
        {REC_TABS.map(tab => (
          <Pressable
            key={tab.key}
            style={[styles.recTab, activeRecTab === tab.key && styles.recTabActive]}
            onPress={() => setActiveRecTab(tab.key)}
          >
            <Text style={[styles.recTabText, activeRecTab === tab.key && styles.recTabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.recGrid}>
        {recData.map(item => (
          <Pressable key={item.id} style={styles.recCard}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.recCardImage} resizeMode="cover" />
            ) : (
              <View style={[styles.recCardImage, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="image" size={20} color="#CBD5E1" />
              </View>
            )}
            <Text style={styles.recCardName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.recCardSub} numberOfLines={1}>{item.sub}</Text>
          </Pressable>
        ))}
      </View>

      {/* ── 9. For You — Popular Recommendations ── */}
      {popularItems.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>为你推荐</Text>
          </View>
          <FlatList
            data={popularItems}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularList}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={({ item }) => (
              <PopularCard item={item} onPress={() => {
                const route = item.type === 'HOLY_SITE'
                  ? `/holy-sites/${item.id}`
                  : item.type === 'TEMPLE'
                  ? `/temples/${item.id}`
                  : item.type === 'PATRIARCH'
                  ? `/patriarchs/${item.id}`
                  : `/routes/${item.id}`;
                router.push(route as never);
              }} />
            )}
          />
        </>
      )}

      {/* ── 10a. Hot Guides ── */}
      {trendingGuides.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>热门游记</Text>
            <Pressable onPress={() => router.push('/community' as never)}>
              <Text style={styles.sectionMore}>查看全部 &gt;</Text>
            </Pressable>
          </View>
          <FlatList
            data={trendingGuides}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.routeList}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.trendingGuideCard}
                onPress={() => router.push(`/community/guide/${item.id}` as never)}
              >
                {item.coverImage ? (
                  <Image source={{ uri: item.coverImage }} style={styles.trendingGuideCover} resizeMode="cover" />
                ) : (
                  <View style={[styles.trendingGuideCover, styles.trendingGuidePlaceholder]}>
                    <Ionicons name="newspaper-outline" size={28} color="#CBD5E1" />
                  </View>
                )}
                <View style={styles.trendingGuideOverlay}>
                  <Text style={styles.trendingGuideTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.trendingGuideMeta}>
                    <Ionicons name="heart" size={11} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.trendingGuideMetaText}>{item.likeCount ?? 0}</Text>
                    <Ionicons name="chatbubble" size={11} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.trendingGuideMetaText}>{item.commentCount ?? 0}</Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        </>
      )}

      {/* ── 10. Stats + CTA ── */}
      <View style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>文化传统</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>60+</Text>
            <Text style={styles.statLabel}>圣地</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>27</Text>
            <Text style={styles.statLabel}>祖庭</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>7</Text>
            <Text style={styles.statLabel}>语言</Text>
          </View>
        </View>
      </View>

      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>开始你的朝圣之旅</Text>
        <Text style={styles.ctaSubtitle}>精选深度路线，探访全球文化圣地</Text>
        <View style={styles.ctaButtons}>
          <Pressable
            style={styles.ctaButton}
            onPress={() => router.push('/routes' as never)}
          >
            <Ionicons name="compass" size={16} color="#FFFFFF" />
            <Text style={styles.ctaButtonText}>浏览路线</Text>
          </Pressable>
          <Pressable
            style={styles.ctaButtonOutline}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <Ionicons name="chatbubble-ellipses" size={16} color="#0066FF" />
            <Text style={styles.ctaButtonOutlineText}>AI帮你规划</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>帮助100万人走祖庭</Text>
      </View>
    </ScrollView>
  );
}

/* ─── Sub-components ─── */

function RouteCard({ route, onPress }: { route: Route; onPress: () => void }) {
  const price = (route.priceFrom / 100).toLocaleString();
  return (
    <Pressable style={styles.routeCard} onPress={onPress}>
      <View style={styles.routeCardImage}>
        {route.coverImage ? (
          <Image source={{ uri: route.coverImage }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="map" size={32} color="#CBD5E1" />
          </View>
        )}
        <View style={styles.routeBadge}>
          <Text style={styles.routeBadgeText}>{route.duration}天{route.nights}晚</Text>
        </View>
        {route.rating && (
          <View style={styles.routeRatingBadge}>
            <Ionicons name="star" size={10} color="#FFFFFF" />
            <Text style={styles.routeRatingText}>{route.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
      <View style={styles.routeCardBody}>
        <Text style={styles.routeCardTitle} numberOfLines={1}>{route.title}</Text>
        <Text style={styles.routeCardSubtitle} numberOfLines={1}>{route.subtitle}</Text>
        <View style={styles.routeCardFooter}>
          <Text style={styles.routeCardPrice}>¥{price}<Text style={styles.routeCardPriceUnit}>/人起</Text></Text>
        </View>
      </View>
    </Pressable>
  );
}

function PopularCard({ item, onPress }: { item: RecommendationItem; onPress: () => void }) {
  return (
    <Pressable style={styles.popularCard} onPress={onPress}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.popularCardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.popularCardImage, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="image" size={22} color="#CBD5E1" />
        </View>
      )}
      <View style={styles.popularCardBody}>
        <View style={[styles.popularBadge, { backgroundColor: item.religionColor ? `${item.religionColor}22` : '#EFF6FF' }]}>
          <Text style={[styles.popularBadgeText, { color: item.religionColor ?? '#0066FF' }]} numberOfLines={1}>
            {item.religionName}
          </Text>
        </View>
        <Text style={styles.popularCardName} numberOfLines={2}>{item.name}</Text>
        {item.country ? <Text style={styles.popularCardSub} numberOfLines={1}>{item.country}</Text> : null}
      </View>
    </Pressable>
  );
}

/* ─── Styles ─── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { paddingBottom: spacing.xxl },

  // Hero
  hero: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: spacing.md, alignItems: 'center' },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 6, textAlign: 'center' },

  // Search Card
  searchCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, marginTop: 20, width: '100%',
    paddingVertical: 12, paddingHorizontal: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  searchTabs: { flexDirection: 'row', gap: 4, marginBottom: 10 },
  searchTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F9FAFB',
  },
  searchTabActive: { backgroundColor: '#EFF6FF' },
  searchTabText: { fontSize: 12, color: '#9CA3AF' },
  searchTabTextActive: { color: '#0066FF', fontWeight: '600' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F9FAFB', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchPlaceholder: { color: '#9CA3AF', fontSize: 13, flex: 1 },

  // Hero Tags
  heroTags: { paddingTop: 14, gap: 8 },
  heroTag: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  heroTagText: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
  trustText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 12, textAlign: 'center' },

  // Category Card
  categoryCard: {
    flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.md, marginTop: -12, borderRadius: 16,
    paddingVertical: 12, paddingHorizontal: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  categoryItem: { width: '25%', alignItems: 'center', paddingVertical: 8 },
  categoryIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center',
  },
  categoryLabel: { color: '#6B7280', fontSize: 11, marginTop: 4 },

  // Section Header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingTop: 24, paddingBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  sectionMore: { fontSize: 12, color: '#0066FF' },

  // Platform Highlights
  highlightGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: spacing.md, gap: 10,
  },
  highlightCard: {
    width: '48%', backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  highlightIconBox: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  highlightTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  highlightDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  highlightCta: { fontSize: 12, color: '#0066FF', marginTop: 8 },

  // Pilgrim Stories
  storyList: { paddingHorizontal: spacing.md, gap: 12 },
  storyCard: {
    width: 260, borderRadius: 12, overflow: 'hidden', backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  storyImage: { width: '100%', height: 130 },
  storyImagePlaceholder: { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  storyOverlay: { padding: 12 },
  storyAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  storyAvatar: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center',
  },
  storyAvatarText: { fontSize: 11, color: '#0066FF', fontWeight: '600' },
  storyAuthorName: { fontSize: 11, color: '#6B7280' },
  storyTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  storyExcerpt: { fontSize: 12, color: '#9CA3AF', marginTop: 4, lineHeight: 18 },

  // Route Cards
  routeList: { paddingHorizontal: spacing.md, gap: 12 },
  routeCard: {
    width: 260, backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  routeCardImage: { height: 130, backgroundColor: '#EFF6FF' },
  routeBadge: {
    position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  routeBadgeText: { color: '#FFFFFF', fontSize: 10 },
  routeRatingBadge: {
    position: 'absolute', top: 8, right: 8, backgroundColor: '#0066FF',
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  routeRatingText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
  routeCardBody: { padding: 12 },
  routeCardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  routeCardSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  routeCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  routeCardPrice: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
  routeCardPriceUnit: { fontSize: 11, fontWeight: '400', color: '#9CA3AF' },

  // AI Banner
  aiBannerWrap: { marginHorizontal: spacing.md, marginTop: 24 },
  aiBanner: { borderRadius: 16, padding: 20, flexDirection: 'row', overflow: 'hidden' },
  aiBannerContent: { flex: 1 },
  aiBannerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  aiBannerDesc: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 6, lineHeight: 18 },
  aiBannerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12,
    backgroundColor: '#FFFFFF', alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999,
  },
  aiBannerBtnText: { fontSize: 12, fontWeight: '600', color: '#0066FF' },
  aiBannerChat: { width: 120, justifyContent: 'center', gap: 6 },
  chatBubble: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5,
    alignSelf: 'flex-end',
  },
  chatBubbleText: { fontSize: 10, color: '#FFFFFF' },
  chatBubbleReply: { backgroundColor: 'rgba(255,255,255,0.9)', alignSelf: 'flex-start' },
  chatBubbleReplyText: { fontSize: 10, color: '#0066FF' },

  // Destinations Grid
  destGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: spacing.md, gap: 10,
  },
  destCard: {
    width: '48%', height: 120, borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#EFF6FF',
  },
  destOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 10, paddingBottom: 8, paddingTop: 30,
  },
  destName: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  destCountry: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },

  // Recommendation Tabs
  recTabs: {
    flexDirection: 'row', paddingHorizontal: spacing.md, gap: 8, marginBottom: 12,
  },
  recTab: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  recTabActive: { backgroundColor: '#0066FF' },
  recTabText: { fontSize: 13, color: '#6B7280' },
  recTabTextActive: { color: '#FFFFFF', fontWeight: '600' },
  recGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: spacing.md, gap: 10,
  },
  recCard: {
    width: '31%', backgroundColor: '#FFFFFF', borderRadius: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  recCardImage: { width: '100%', height: 80 },
  recCardName: { fontSize: 12, fontWeight: '600', color: '#1A1A1A', paddingHorizontal: 6, paddingTop: 6 },
  recCardSub: { fontSize: 10, color: '#9CA3AF', paddingHorizontal: 6, paddingBottom: 6 },

  // Stats
  statsCard: {
    marginHorizontal: spacing.md, marginTop: 24, backgroundColor: '#F8FAFC',
    borderRadius: 16, padding: 20,
  },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#0066FF' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  // CTA
  ctaSection: {
    alignItems: 'center', marginHorizontal: spacing.md, marginTop: 20,
    backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 28, paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  ctaTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  ctaSubtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  ctaButtons: { flexDirection: 'row', gap: 12 },
  ctaButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#0066FF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999,
  },
  ctaButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  ctaButtonOutline: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#0066FF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999,
  },
  ctaButtonOutlineText: { color: '#0066FF', fontSize: 14, fontWeight: '600' },

  // Footer
  footer: { alignItems: 'center', paddingVertical: 24 },
  footerText: { color: '#9CA3AF', fontSize: 13 },

  // Popular Recommendations
  popularList: { paddingHorizontal: spacing.md, gap: 10 },
  popularCard: {
    width: 150, backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  popularCardImage: { width: '100%', height: 100 },
  popularCardBody: { padding: 8, gap: 4 },
  popularBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  popularBadgeText: { fontSize: 10, fontWeight: '600' },
  popularCardName: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', lineHeight: 18 },
  popularCardSub: { fontSize: 11, color: '#9CA3AF' },

  // Trending Guides
  trendingGuideCard: {
    width: 220, borderRadius: 12, overflow: 'hidden', backgroundColor: '#1A1A1A',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  trendingGuideCover: { width: '100%', height: 140 },
  trendingGuidePlaceholder: {
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center',
  },
  trendingGuideOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 10, backgroundColor: 'rgba(0,0,0,0.5)',
  },
  trendingGuideTitle: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', lineHeight: 18, marginBottom: 4 },
  trendingGuideMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendingGuideMetaText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginRight: 8 },

  // Community Hub Entry
  communityHub: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginHorizontal: spacing.md, backgroundColor: '#FFFFFF',
    borderRadius: 12, paddingVertical: 16, paddingHorizontal: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  communityHubItem: { alignItems: 'center', flex: 1 },
  communityHubIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  communityHubLabel: { fontSize: 12, fontWeight: '600', color: '#374151' },

  // Trending Guides (Mock)
  guideList: { paddingHorizontal: spacing.md, gap: 10 },
  guideCard: {
    width: 160, backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  guideCardCover: { height: 90, backgroundColor: '#EFF6FF' },
  guideCardPlaceholder: { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  guideCardBody: { padding: 10, gap: 4 },
  guideCardTitle: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', lineHeight: 18 },
  guideCardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  guideCardAuthor: { fontSize: 11, color: '#6B7280' },
  guideCardViews: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  guideCardViewsText: { fontSize: 10, color: '#9CA3AF' },
});
