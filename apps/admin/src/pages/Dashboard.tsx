import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, List, Tag, Spin } from 'antd';
import {
  GlobalOutlined,
  EnvironmentOutlined,
  BankOutlined,
  CarOutlined,
  UserOutlined,
  BookOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDashboardStats } from '../lib/api';
import { CHART_COLORS, SERIES_COLORS } from '../lib/theme';

const { Title, Text } = Typography;

interface Stats {
  religions: any[];
  holySites: any[];
  temples: any[];
  patriarchs: any[];
  teachings: any[];
  seals: any[];
}

const mockActivities = [
  { time: '10 分钟前', text: '新朝圣行程已创建 — 菩提伽耶', color: 'gold' },
  { time: '30 分钟前', text: '用户发布朝圣日记 — 耶路撒冷之旅', color: 'green' },
  { time: '1 小时前', text: '新订单支付成功 #ORD-20260325', color: 'blue' },
  { time: '2 小时前', text: '小鸿AI回答了 15 个用户问题', color: 'purple' },
  { time: '3 小时前', text: '祖训数据更新 — 新增《论语》选段', color: 'orange' },
  { time: '昨天', text: '系统备份完成', color: 'default' },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  const s = stats!;

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
  s.seals.forEach((seal: any) => {
    const series = seal.series || '未知';
    seriesCounts[series] = (seriesCounts[series] || 0) + 1;
  });
  const pieData = Object.entries(seriesCounts).map(([name, value]) => ({ name, value }));

  // Religion distribution - sites per religion
  const religionSiteMap: Record<string, { name: string; sites: number; temples: number }> = {};
  s.religions.forEach((r: any) => {
    religionSiteMap[r.id] = { name: r.name || r.nameZh || r.slug, sites: 0, temples: 0 };
  });
  s.holySites.forEach((site: any) => {
    if (site.religionId && religionSiteMap[site.religionId]) {
      religionSiteMap[site.religionId].sites++;
    }
  });
  s.temples.forEach((t: any) => {
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
          <Card
            title="最近动态"
            styles={{ header: { borderBottom: '1px solid #2a2a2a' } }}
          >
            <List
              dataSource={mockActivities}
              renderItem={(item) => (
                <List.Item style={{ borderBottom: '1px solid #1f1f1f', padding: '12px 0' }}>
                  <List.Item.Meta
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: '#ccc' }}>{item.text}</Text>
                        <Tag color={item.color}>{item.time}</Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* Extra stats row */}
          <Card style={{ marginTop: 16 }}>
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
      </Row>
    </div>
  );
}
