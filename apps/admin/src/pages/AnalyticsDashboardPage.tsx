import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Table,
  Typography,
  Spin,
  Result,
  Row,
  Col,
  Statistic,
  Space,
  Button,
  Alert,
  message,
} from 'antd';
import {
  BarChartOutlined,
  UserOutlined,
  CarOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  StarOutlined,
  TeamOutlined,
  ShopOutlined,
  ShareAltOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

const { Title, Text } = Typography;

const BASE = import.meta.env.VITE_API_URL || '/api';

// --------------- Interfaces ---------------

interface OverviewData {
  users: number;
  trips: number;
  orders: number;
  revenue: number;
  reviews: number;
  guides: number;
  merchants: number;
  shares: number;
}

interface TrendPoint {
  date: string;
  orders: number;
  trips: number;
  newUsers: number;
}

interface FunnelStage {
  stage: string;
  count: number;
  rate?: number;
}

interface TopContentItem {
  rank: number;
  entityType: string;
  entityId: string;
  count: number;
}

// --------------- API helpers ---------------

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('zuting_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// --------------- Empty defaults (used when API fails) ---------------

const EMPTY_OVERVIEW: OverviewData = {
  users: 0,
  trips: 0,
  orders: 0,
  revenue: 0,
  reviews: 0,
  guides: 0,
  merchants: 0,
  shares: 0,
};

// --------------- KPI card config ---------------

interface KpiConfig {
  key: keyof OverviewData;
  title: string;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
  suffix?: string;
}

const KPI_CARDS: KpiConfig[] = [
  { key: 'users', title: '用户总数', icon: <UserOutlined />, color: '#1890FF' },
  { key: 'trips', title: '行程总数', icon: <CarOutlined />, color: '#52C41A' },
  { key: 'orders', title: '订单总数', icon: <ShoppingCartOutlined />, color: '#FAAD14' },
  { key: 'revenue', title: '总收入 (CNY)', icon: <DollarOutlined />, prefix: '¥', color: '#3264ff' },
  { key: 'reviews', title: '评价总数', icon: <StarOutlined />, color: '#FF4D4F' },
  { key: 'guides', title: '导游数', icon: <TeamOutlined />, color: '#722ED1' },
  { key: 'merchants', title: '商家数', icon: <ShopOutlined />, color: '#13C2C2' },
  { key: 'shares', title: '分享次数', icon: <ShareAltOutlined />, color: '#EB2F96' },
];

// --------------- Funnel colors ---------------

const FUNNEL_COLORS = ['#1890FF', '#52C41A', '#FAAD14', '#D4A855'];

// --------------- Component ---------------

export default function AnalyticsDashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [topContent, setTopContent] = useState<TopContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partialErrors, setPartialErrors] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPartialErrors([]);
    try {
      const [ov, tr, fu, tc] = await Promise.allSettled([
        fetchJSON<OverviewData>('/analytics/overview'),
        fetchJSON<TrendPoint[]>('/analytics/trends'),
        fetchJSON<FunnelStage[]>('/analytics/funnel'),
        fetchJSON<TopContentItem[]>('/analytics/top-content'),
      ]);

      const errors: string[] = [];

      if (ov.status === 'fulfilled') {
        setOverview(ov.value);
      } else {
        setOverview(EMPTY_OVERVIEW);
        errors.push('概览数据加载失败');
      }

      if (tr.status === 'fulfilled') {
        setTrends(Array.isArray(tr.value) ? tr.value : []);
      } else {
        setTrends([]);
        errors.push('趋势数据加载失败');
      }

      if (fu.status === 'fulfilled') {
        setFunnel(Array.isArray(fu.value) ? fu.value : []);
      } else {
        setFunnel([]);
        errors.push('漏斗数据加载失败');
      }

      if (tc.status === 'fulfilled') {
        setTopContent(Array.isArray(tc.value) ? tc.value : []);
      } else {
        setTopContent([]);
        errors.push('热门内容加载失败');
      }

      if (errors.length > 0) {
        setPartialErrors(errors);
        void message.warning(`部分数据加载失败: ${errors.join(', ')}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '加载失败';
      setError(msg);
      setOverview(null);
      setTrends([]);
      setFunnel([]);
      setTopContent([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // --------------- Top Content columns ---------------

  const topColumns: ColumnsType<TopContentItem> = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      align: 'center',
      render: (rank: number) => {
        const medals: Record<number, string> = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
        if (rank <= 3) {
          return (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: medals[rank],
                fontWeight: 700,
                fontSize: 13,
                color: rank === 3 ? '#fff' : '#333',
              }}
            >
              {rank}
            </span>
          );
        }
        return <span style={{ color: '#666' }}>{rank}</span>;
      },
    },
    {
      title: '类型',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 120,
    },
    {
      title: '实体ID',
      dataIndex: 'entityId',
      key: 'entityId',
      width: 160,
    },
    {
      title: '浏览/分享次数',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      sorter: (a, b) => a.count - b.count,
      render: (v: number) => (
        <span style={{ fontWeight: 600 }}>{(v ?? 0).toLocaleString()}</span>
      ),
    },
  ];

  // --------------- Render ---------------

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error && !overview) {
    return <Result status="error" title="数据加载失败" subTitle={error} />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <BarChartOutlined style={{ marginRight: 8 }} />
          数据分析 / Analytics Dashboard
        </Title>
        <Button icon={<ReloadOutlined />} onClick={() => void loadData()}>
          刷新
        </Button>
      </div>

      {/* Partial failure warning */}
      {partialErrors.length > 0 && (
        <Alert
          message="部分数据不可用"
          description={`以下接口加载失败，对应数据显示为零: ${partialErrors.join(', ')}。请点击刷新重试。`}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Section 1: Overview KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {KPI_CARDS.map((kpi) => (
          <Col xs={24} sm={12} md={6} key={kpi.key}>
            <Card hoverable>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Statistic
                  title={<span style={{ color: '#999' }}>{kpi.title}</span>}
                  value={overview?.[kpi.key] ?? 0}
                  prefix={kpi.prefix}
                  suffix={kpi.suffix}
                  valueStyle={{ color: kpi.color, fontSize: 28, fontWeight: 700 }}
                />
                <span style={{ fontSize: 28, color: kpi.color }}>{kpi.icon}</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Section 2: Trends Chart */}
      <Card
        title={
          <Space>
            <BarChartOutlined style={{  }} />
            <Text strong>30天趋势 / 30-Day Trends</Text>
          </Space>
        }
        
        style={{ marginBottom: 24 }}
      >
        {trends.length === 0 ? (
          <Result title="暂无趋势数据" />
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={trends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#999" fontSize={12} />
              <YAxis stroke="#999" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: 8 }}
                labelStyle={{  }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="orders"
                name="订单"
                stroke="#1890FF"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="trips"
                name="行程"
                stroke="#52C41A"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="newUsers"
                name="新用户"
                stroke="#FAAD14"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Section 3: Conversion Funnel */}
      <Card
        title={
          <Space>
            <BarChartOutlined style={{  }} />
            <Text strong>转化漏斗 / Conversion Funnel</Text>
          </Space>
        }
        
        style={{ marginBottom: 24 }}
      >
        {funnel.length === 0 ? (
          <Result title="暂无漏斗数据" />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={funnel}
                layout="vertical"
                margin={{ top: 5, right: 60, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#999" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="stage"
                  stroke="#999"
                  fontSize={13}
                  width={80}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: 8 }}
                  labelStyle={{  }}
                  formatter={(value: number) => [value.toLocaleString(), '人数']}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={36}>
                  {funnel.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Conversion rate annotations */}
            <Row gutter={16} style={{ marginTop: 16 }}>
              {funnel.map((stage, i) => (
                <Col xs={24} sm={6} key={stage.stage}>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ color: FUNNEL_COLORS[i % FUNNEL_COLORS.length], fontSize: 20, fontWeight: 700 }}>
                      {(stage.rate ?? 0).toFixed(1)}%
                    </Text>
                    <br />
                    <Text style={{ color: '#999', fontSize: 12 }}>{stage.stage}</Text>
                    <br />
                    <Text style={{ color: '#666', fontSize: 12 }}>
                      {(stage.count ?? 0).toLocaleString()} 人
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Card>

      {/* Section 4: Top Content */}
      <Card
        title={
          <Space>
            <StarOutlined style={{  }} />
            <Text strong>热门内容 TOP 10 / Top Content</Text>
          </Space>
        }
        
      >
        {topContent.length === 0 ? (
          <Result title="暂无内容数据" />
        ) : (
          <Table
            columns={topColumns}
            dataSource={topContent}
            pagination={false}
            rowKey={(r) => `${r.entityType}-${r.entityId}`}
            size="middle"
          />
        )}
      </Card>
    </div>
  );
}
