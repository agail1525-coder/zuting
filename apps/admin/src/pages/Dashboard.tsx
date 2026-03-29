import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Result, Tag, List, Rate, Avatar, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  GlobalOutlined,
  EnvironmentOutlined,
  BankOutlined,
  CarOutlined,
  UserOutlined,
  BookOutlined,
  SearchOutlined,
  FireOutlined,
  StarOutlined,
  ReadOutlined,
  QuestionCircleOutlined,
  GiftOutlined,
  ShoppingCartOutlined,
  CrownOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDashboardStats, getReviews } from '../lib/api';
import type { Review } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface HotKeyword { keyword: string; count: number; }

interface TopGuide { id: string; title: string; viewCount: number; likeCount: number; }

interface CommunityStats {
  guideTotal: number;
  questionTotal: number;
  guidesToday: number;
  questionsToday: number;
  topGuides: TopGuide[];
}

async function fetchCommunityStats(): Promise<CommunityStats> {
  const base = import.meta.env.VITE_API_URL || '/api';
  const token = localStorage.getItem('token');
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const [guidesRes, questionsRes] = await Promise.all([
      fetch(`${base}/guides?limit=5&sortBy=viewCount&order=desc`, { headers }),
      fetch(`${base}/questions?limit=1`, { headers }),
    ]);
    const guidesData = guidesRes.ok ? await guidesRes.json() : null;
    const questionsData = questionsRes.ok ? await questionsRes.json() : null;
    const guideItems: TopGuide[] = Array.isArray(guidesData?.items) ? guidesData.items : [];
    return {
      guideTotal: guidesData?.total ?? 0,
      questionTotal: questionsData?.total ?? 0,
      guidesToday: 0,
      questionsToday: 0,
      topGuides: guideItems.slice(0, 5),
    };
  } catch {
    return { guideTotal: 0, questionTotal: 0, guidesToday: 0, questionsToday: 0, topGuides: [] };
  }
}

interface MembershipOverview {
  totalMembers: number;
  premiumMembers: number;
  todayCheckins: number;
  todayRedemptions: number;
}

async function fetchMembershipOverview(): Promise<MembershipOverview> {
  const base = import.meta.env.VITE_API_URL || '/api';
  const token = localStorage.getItem('token');
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const [membersRes, checkinRes, redemptionRes] = await Promise.all([
      fetch(`${base}/members?page=1&limit=1`, { headers }),
      fetch(`${base}/members/checkins/today`, { headers }),
      fetch(`${base}/points-products/redemptions/today`, { headers }),
    ]);
    const membersData = membersRes.ok ? await membersRes.json() : null;
    const checkinData = checkinRes.ok ? await checkinRes.json() : null;
    const redemptionData = redemptionRes.ok ? await redemptionRes.json() : null;
    return {
      totalMembers: membersData?.total ?? 0,
      premiumMembers: membersData?.premiumCount ?? 0,
      todayCheckins: checkinData?.count ?? 0,
      todayRedemptions: redemptionData?.count ?? 0,
    };
  } catch {
    return { totalMembers: 0, premiumMembers: 0, todayCheckins: 0, todayRedemptions: 0 };
  }
}

interface PromotionOverview {
  activePromotions: number;
  totalCoupons: number;
  todayOrders: number;
}

async function fetchPromotionOverview(): Promise<PromotionOverview> {
  const base = import.meta.env.VITE_API_URL || '/api';
  const token = localStorage.getItem('token');
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const [promoRes, couponRes, ordersRes] = await Promise.all([
      fetch(`${base}/promotions?page=1&limit=1&status=ACTIVE`, { headers }),
      fetch(`${base}/coupons?page=1&limit=1`, { headers }),
      fetch(`${base}/orders?page=1&limit=1`, { headers }),
    ]);
    const promoData = promoRes.ok ? await promoRes.json() : null;
    const couponData = couponRes.ok ? await couponRes.json() : null;
    const ordersData = ordersRes.ok ? await ordersRes.json() : null;
    return {
      activePromotions: promoData?.total ?? 0,
      totalCoupons: couponData?.total ?? 0,
      todayOrders: ordersData?.todayCount ?? ordersData?.total ?? 0,
    };
  } catch {
    return { activePromotions: 0, totalCoupons: 0, todayOrders: 0 };
  }
}

interface PriceOverview {
  totalSnapshots: number;
  activeAlerts: number;
}

async function fetchPriceOverview(): Promise<PriceOverview> {
  const base = import.meta.env.VITE_API_URL || '/api';
  const token = localStorage.getItem('token');
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const [snapshotsRes, alertsRes] = await Promise.all([
      fetch(`${base}/price-snapshots?page=1&limit=1`, { headers }),
      fetch(`${base}/price-alerts?page=1&limit=1&status=ACTIVE`, { headers }),
    ]);
    const snapshotsData = snapshotsRes.ok ? await snapshotsRes.json() : null;
    const alertsData = alertsRes.ok ? await alertsRes.json() : null;
    return {
      totalSnapshots: snapshotsData?.total ?? 0,
      activeAlerts: alertsData?.total ?? 0,
    };
  } catch {
    return { totalSnapshots: 0, activeAlerts: 0 };
  }
}

async function fetchHotKeywords(): Promise<HotKeyword[]> {
  try {
    const res = await fetch(`${API_BASE}/search/hot`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
  } catch {
    return [];
  }
}
import { CHART_COLORS, SERIES_COLORS } from '../lib/theme';
import type { Religion, HolySite, Temple, Patriarch, Teaching, Seal } from '../types';

const { Title } = Typography;

interface Stats {
  religions: Religion[];
  holySites: HolySite[];
  temples: Temple[];
  patriarchs: Patriarch[];
  teachings: Teaching[];
  seals: Seal[];
}


export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hotKeywords, setHotKeywords] = useState<HotKeyword[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [communityStats, setCommunityStats] = useState<CommunityStats>({
    guideTotal: 0, questionTotal: 0, guidesToday: 0, questionsToday: 0, topGuides: [],
  });
  const [promotionOverview, setPromotionOverview] = useState<PromotionOverview>({
    activePromotions: 0, totalCoupons: 0, todayOrders: 0,
  });
  const [membershipOverview, setMembershipOverview] = useState<MembershipOverview>({
    totalMembers: 0, premiumMembers: 0, todayCheckins: 0, todayRedemptions: 0,
  });
  const [priceOverview, setPriceOverview] = useState<PriceOverview>({
    totalSnapshots: 0, activeAlerts: 0,
  });

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setLoading(false));
    fetchHotKeywords().then((kws) => setHotKeywords(kws.slice(0, 5)));
    getReviews(1, 5)
      .then((res) => setRecentReviews(res.data))
      .catch(() => setRecentReviews([]));
    fetchCommunityStats().then(setCommunityStats);
    fetchPromotionOverview().then(setPromotionOverview);
    fetchMembershipOverview().then(setMembershipOverview);
    fetchPriceOverview().then(setPriceOverview);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Result status="error" title="数据加载失败" subTitle={error} />;
  }

  if (!stats) {
    return null;
  }

  const s = stats;

  // Overview bar chart data
  const overviewData = [
    { name: '信仰', count: s.religions.length, fill: CHART_COLORS[0] },
    { name: '圣地', count: s.holySites.length, fill: CHART_COLORS[1] },
    { name: '祖庭', count: s.temples.length, fill: CHART_COLORS[2] },
    { name: '祖师', count: s.patriarchs.length, fill: CHART_COLORS[3] },
    { name: '祖训', count: s.teachings.length, fill: CHART_COLORS[4] },
    { name: '印', count: s.seals.length, fill: CHART_COLORS[5] },
  ];

  // Seal series pie chart
  const seriesCounts: Record<string, number> = {};
  s.seals.forEach((seal) => {
    const series = seal.series || '未知';
    seriesCounts[series] = (seriesCounts[series] || 0) + 1;
  });
  const pieData = Object.entries(seriesCounts).map(([name, value]) => ({ name, value }));

  // Religion distribution - sites per religion
  const religionSiteMap: Record<string, { name: string; sites: number; temples: number }> = {};
  s.religions.forEach((r) => {
    religionSiteMap[r.id] = { name: r.name || r.slug, sites: 0, temples: 0 };
  });
  s.holySites.forEach((site) => {
    if (site.religionId && religionSiteMap[site.religionId]) {
      religionSiteMap[site.religionId].sites++;
    }
  });
  s.temples.forEach((t) => {
    if (t.religionId && religionSiteMap[t.religionId]) {
      religionSiteMap[t.religionId].temples++;
    }
  });
  const religionDistData = Object.values(religionSiteMap)
    .sort((a, b) => b.sites - a.sites)
    .slice(0, 12);

  const kpiCards = [
    {
      title: '信仰体系',
      value: s.religions.length,
      icon: <GlobalOutlined style={{ fontSize: 28, color: '#D4A855' }} />,
      color: '#D4A855',
    },
    {
      title: '圣地总数',
      value: s.holySites.length,
      icon: <EnvironmentOutlined style={{ fontSize: 28, color: '#52C41A' }} />,
      color: '#52C41A',
    },
    {
      title: '祖庭总数',
      value: s.temples.length,
      icon: <BankOutlined style={{ fontSize: 28, color: '#1890FF' }} />,
      color: '#1890FF',
    },
    {
      title: '祖师人物',
      value: s.patriarchs.length,
      icon: <UserOutlined style={{ fontSize: 28, color: '#B37FEB' }} />,
      color: '#B37FEB',
    },
  ];

  return (
    <div>
      <Title level={3} style={{ color: '#D4A855', marginBottom: 24 }}>
        仪表盘概览
      </Title>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpiCards.map((kpi) => (
          <Col xs={24} sm={12} lg={6} key={kpi.title}>
            <Card hoverable>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Statistic
                  title={<span style={{ color: '#999' }}>{kpi.title}</span>}
                  value={kpi.value}
                  valueStyle={{ color: kpi.color, fontSize: 36, fontWeight: 700 }}
                />
                {kpi.icon}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts row 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card title="数据总览" styles={{ header: { borderBottom: '1px solid #2a2a2a' } }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={overviewData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                  labelStyle={{ color: '#D4A855' }}
                />
                <Bar dataKey="count" name="数量" radius={[6, 6, 0, 0]}>
                  {overviewData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="三十印系列分布" styles={{ header: { borderBottom: '1px solid #2a2a2a' } }}>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {pieData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={SERIES_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Community Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 社区活跃度 */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <span>
                <ReadOutlined style={{ color: '#52C41A', marginRight: 8 }} />
                社区活跃度
              </span>
            }
            styles={{ header: { borderBottom: '1px solid #2a2a2a' } }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title={<span style={{ color: '#999' }}>游记总数</span>}
                  value={communityStats.guideTotal}
                  prefix={<ReadOutlined />}
                  valueStyle={{ color: '#52C41A' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={<span style={{ color: '#999' }}>问答总数</span>}
                  value={communityStats.questionTotal}
                  prefix={<QuestionCircleOutlined />}
                  valueStyle={{ color: '#1890FF' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={<span style={{ color: '#999' }}>今日新游记</span>}
                  value={communityStats.guidesToday}
                  valueStyle={{ color: '#D4A855' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={<span style={{ color: '#999' }}>今日新问答</span>}
                  value={communityStats.questionsToday}
                  valueStyle={{ color: '#E87040' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 热门游记 Top 5 */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <span>
                <FireOutlined style={{ color: '#FF4D4F', marginRight: 8 }} />
                热门游记 Top 5
              </span>
            }
            extra={
              <a href="/community" style={{ color: '#D4A855', fontSize: 12 }}>
                社区管理
              </a>
            }
            styles={{ header: { borderBottom: '1px solid #2a2a2a' } }}
          >
            {communityStats.topGuides.length === 0 ? (
              <span style={{ color: '#666', fontSize: 13 }}>暂无游记数据</span>
            ) : (
              <Table<TopGuide>
                dataSource={communityStats.topGuides}
                rowKey="id"
                size="small"
                pagination={false}
                columns={[
                  {
                    title: '排名',
                    key: 'rank',
                    width: 50,
                    render: (_: unknown, __: TopGuide, index: number) => (
                      <Tag color={index === 0 ? 'gold' : index === 1 ? 'default' : index === 2 ? 'orange' : undefined}>
                        {index + 1}
                      </Tag>
                    ),
                  },
                  {
                    title: '标题',
                    dataIndex: 'title',
                    key: 'title',
                    ellipsis: true,
                  },
                  {
                    title: '浏览数',
                    dataIndex: 'viewCount',
                    key: 'viewCount',
                    width: 80,
                    render: (v: number) => (
                      <span style={{ color: '#D4A855', fontWeight: 600 }}>
                        {(v ?? 0).toLocaleString()}
                      </span>
                    ),
                  },
                  {
                    title: '点赞数',
                    dataIndex: 'likeCount',
                    key: 'likeCount',
                    width: 80,
                    render: (v: number) => (v ?? 0).toLocaleString(),
                  },
                ] as ColumnsType<TopGuide>}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 促销概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card
            title={
              <span>
                <GiftOutlined style={{ color: '#D4A855', marginRight: 8 }} />
                促销概览
              </span>
            }
            extra={
              <a href="/promotions" style={{ color: '#D4A855', fontSize: 12 }}>
                促销管理
              </a>
            }
            styles={{ header: { borderBottom: '1px solid #2a2a2a' } }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title={<span style={{ color: '#999' }}>进行中促销活动</span>}
                  value={promotionOverview.activePromotions}
                  prefix={<GiftOutlined />}
                  valueStyle={{ color: '#52C41A', fontWeight: 700 }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title={<span style={{ color: '#999' }}>优惠券总数</span>}
                  value={promotionOverview.totalCoupons}
                  prefix={<GiftOutlined />}
                  valueStyle={{ color: '#D4A855', fontWeight: 700 }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title={<span style={{ color: '#999' }}>今日订单数</span>}
                  value={promotionOverview.todayOrders}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#1890FF', fontWeight: 700 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 会员概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card
            title={
              <span>
                <CrownOutlined style={{ color: '#D4A855', marginRight: 8 }} />
                会员概览
              </span>
            }
            extra={
              <a href="/membership" style={{ color: '#D4A855', fontSize: 12 }}>
                会员管理
              </a>
            }
            styles={{ header: { borderBottom: '1px solid #2a2a2a' } }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={6}>
                <Statistic
                  title={<span style={{ color: '#999' }}>总会员数</span>}
                  value={membershipOverview.totalMembers}
                  prefix={<CrownOutlined />}
                  valueStyle={{ color: '#D4A855', fontWeight: 700 }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title={<span style={{ color: '#999' }}>Lv3+ 高级会员</span>}
                  value={membershipOverview.premiumMembers}
                  prefix={<CrownOutlined />}
                  valueStyle={{ color: '#B37FEB', fontWeight: 700 }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title={<span style={{ color: '#999' }}>今日签到数</span>}
                  value={membershipOverview.todayCheckins}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#52C41A', fontWeight: 700 }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title={<span style={{ color: '#999' }}>积分商城兑换数</span>}
                  value={membershipOverview.todayRedemptions}
                  prefix={<GiftOutlined />}
                  valueStyle={{ color: '#1890FF', fontWeight: 700 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 价格概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card
            title={
              <span>
                <DollarOutlined style={{ color: '#52C41A', marginRight: 8 }} />
                价格概览
              </span>
            }
            extra={
              <a href="/prices" style={{ color: '#D4A855', fontSize: 12 }}>
                价格管理
              </a>
            }
            styles={{ header: { borderBottom: '1px solid #2a2a2a' } }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Statistic
                  title={<span style={{ color: '#999' }}>总快照数</span>}
                  value={priceOverview.totalSnapshots}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#52C41A', fontWeight: 700 }}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic
                  title={<span style={{ color: '#999' }}>活跃提醒数</span>}
                  value={priceOverview.activeAlerts}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#E87040', fontWeight: 700 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Charts row 2 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="各信仰圣地与祖庭分布" styles={{ header: { borderBottom: '1px solid #2a2a2a' } }}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={religionDistData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis type="number" stroke="#999" />
                <YAxis type="category" dataKey="name" stroke="#999" width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                />
                <Legend />
                <Bar dataKey="sites" name="圣地" fill="#D4A855" radius={[0, 4, 4, 0]} />
                <Bar dataKey="temples" name="祖庭" fill="#1890FF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Card title="更多统计" styles={{ header: { borderBottom: '1px solid #2a2a2a' } }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title={<span style={{ color: '#999' }}>祖训</span>}
                      value={s.teachings.length}
                      prefix={<BookOutlined />}
                      valueStyle={{ color: '#E87040' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title={<span style={{ color: '#999' }}>三十印</span>}
                      value={s.seals.length}
                      prefix={<CarOutlined />}
                      valueStyle={{ color: '#52C41A' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={24}>
              <Card
                title={
                  <span>
                    <FireOutlined style={{ color: '#FF4D4F', marginRight: 8 }} />
                    热门搜索 Top 5
                  </span>
                }
                extra={
                  <a href="/search-stats" style={{ color: '#D4A855', fontSize: 12 }}>
                    <SearchOutlined style={{ marginRight: 4 }} />
                    查看全部
                  </a>
                }
                styles={{ header: { borderBottom: '1px solid #2a2a2a' } }}
              >
                {hotKeywords.length === 0 ? (
                  <span style={{ color: '#666', fontSize: 13 }}>暂无搜索数据</span>
                ) : (
                  <List
                    size="small"
                    dataSource={hotKeywords}
                    renderItem={(item, index) => {
                      const medalColor = index === 0 ? 'gold' : index === 1 ? 'default' : index === 2 ? 'orange' : undefined;
                      return (
                        <List.Item
                          style={{ padding: '6px 0', borderBottom: '1px solid #1a1a1a' }}
                          extra={
                            <span style={{ color: '#D4A855', fontWeight: 600, fontSize: 13 }}>
                              {(item.count ?? 0).toLocaleString()}
                            </span>
                          }
                        >
                          <span style={{ marginRight: 8, color: '#555', minWidth: 20, display: 'inline-block' }}>
                            {index + 1}.
                          </span>
                          {medalColor ? (
                            <Tag color={medalColor} style={{ fontWeight: 600 }}>{item.keyword}</Tag>
                          ) : (
                            <span style={{ color: '#d4d4d4' }}>{item.keyword}</span>
                          )}
                        </List.Item>
                      );
                    }}
                  />
                )}
              </Card>
            </Col>
            <Col span={24}>
              <Card
                title={
                  <span>
                    <StarOutlined style={{ color: '#D4A855', marginRight: 8 }} />
                    最新评价
                  </span>
                }
                extra={
                  <a href="/reviews" style={{ color: '#D4A855', fontSize: 12 }}>
                    查看全部
                  </a>
                }
                styles={{ header: { borderBottom: '1px solid #2a2a2a' } }}
              >
                {recentReviews.length === 0 ? (
                  <span style={{ color: '#666', fontSize: 13 }}>暂无评价数据</span>
                ) : (
                  <List
                    size="small"
                    dataSource={recentReviews}
                    renderItem={(review) => (
                      <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Avatar
                              size={24}
                              src={review.user?.avatar}
                              icon={<UserOutlined />}
                              style={{ backgroundColor: '#D4A855', flexShrink: 0 }}
                            />
                            <span style={{ color: '#d4d4d4', fontSize: 13, fontWeight: 500 }}>
                              {review.user?.nickname || '匿名用户'}
                            </span>
                            <Rate disabled defaultValue={review.rating} style={{ fontSize: 11 }} />
                            <span style={{ color: '#555', fontSize: 11, marginLeft: 'auto' }}>
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString('zh-CN') : ''}
                            </span>
                          </div>
                          {review.content && (
                            <div style={{ color: '#888', fontSize: 12, paddingLeft: 32, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {review.content}
                            </div>
                          )}
                        </div>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
