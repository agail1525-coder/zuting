import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Result, Tag, List } from 'antd';
import {
  GlobalOutlined,
  EnvironmentOutlined,
  BankOutlined,
  CarOutlined,
  UserOutlined,
  BookOutlined,
  SearchOutlined,
  FireOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDashboardStats } from '../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface HotKeyword { keyword: string; count: number; }

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

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setLoading(false));
    fetchHotKeywords().then((kws) => setHotKeywords(kws.slice(0, 5)));
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
          </Row>
        </Col>
      </Row>
    </div>
  );
}
