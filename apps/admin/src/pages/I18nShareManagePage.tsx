import { useEffect, useState } from 'react';
import {
  Card, Row, Col, Statistic, Typography, Spin, Result, Table, Tag, Tabs,
  Badge,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  TranslationOutlined,
  ShareAltOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts';
import { CHART_COLORS } from '../lib/theme';

const { Title } = Typography;

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/* ---------- Types ---------- */

interface PlatformStat {
  platform: string;
  count: number;
}

interface EntityTypeStat {
  entityType: string;
  count: number;
}

interface ShareStats {
  totalShares: number;
  byPlatform: PlatformStat[];
  byEntityType: EntityTypeStat[];
}

interface LanguageRow {
  key: string;
  language: string;
  code: string;
  direction: 'LTR' | 'RTL';
  status: 'Complete' | 'Partial';
}

/* ---------- Static language data ---------- */
// NOTE: The supported language list is static config (7 fixed languages).
// TODO: When a translations stats API is available (e.g. GET /translations/coverage),
// fetch real translation coverage/completeness per language instead of hardcoding "Complete".
// Currently no i18n/translation module exists in services/api/src/modules/.

const LANGUAGES: LanguageRow[] = [
  { key: 'zh', language: '中文', code: 'zh-CN', direction: 'LTR', status: 'Complete' },
  { key: 'en', language: 'English', code: 'en', direction: 'LTR', status: 'Complete' },
  { key: 'ja', language: '日本語', code: 'ja', direction: 'LTR', status: 'Complete' },
  { key: 'ko', language: '한국어', code: 'ko', direction: 'LTR', status: 'Complete' },
  { key: 'th', language: 'ไทย', code: 'th', direction: 'LTR', status: 'Complete' },
  { key: 'hi', language: 'हिन्दी', code: 'hi', direction: 'LTR', status: 'Complete' },
  { key: 'ar', language: 'العربية', code: 'ar', direction: 'RTL', status: 'Complete' },
];

const languageColumns: ColumnsType<LanguageRow> = [
  {
    title: '语言',
    dataIndex: 'language',
    key: 'language',
    render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
  },
  {
    title: '代码',
    dataIndex: 'code',
    key: 'code',
    render: (code: string) => <Tag>{code}</Tag>,
  },
  {
    title: '方向',
    dataIndex: 'direction',
    key: 'direction',
    render: (dir: string) => (
      <Tag color={dir === 'RTL' ? 'orange' : 'blue'}>{dir}</Tag>
    ),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Badge
        status={status === 'Complete' ? 'success' : 'warning'}
        text={<span style={{ color: status === 'Complete' ? '#52C41A' : '#FAAD14' }}>{status}</span>}
      />
    ),
  },
];

/* ---------- API fetch ---------- */

async function fetchShareStats(): Promise<ShareStats> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const res = await fetch(`${API_BASE}/shares/stats`, { headers });
    if (!res.ok) {
      return { totalShares: 0, byPlatform: [], byEntityType: [] };
    }
    const data = await res.json();
    return {
      totalShares: data.totalShares ?? 0,
      byPlatform: Array.isArray(data.byPlatform) ? data.byPlatform : [],
      byEntityType: Array.isArray(data.byEntityType) ? data.byEntityType : [],
    };
  } catch {
    return { totalShares: 0, byPlatform: [], byEntityType: [] };
  }
}

/* ---------- Component ---------- */

export default function I18nShareManagePage() {
  const [shareStats, setShareStats] = useState<ShareStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShareStats()
      .then(setShareStats)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setLoading(false));
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

  const stats = shareStats ?? { totalShares: 0, byPlatform: [], byEntityType: [] };

  const platformData = stats.byPlatform.map((item, i) => ({
    ...item,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const entityData = stats.byEntityType.map((item, i) => ({
    ...item,
    fill: CHART_COLORS[(i + 3) % CHART_COLORS.length],
  }));

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        <TranslationOutlined style={{ marginRight: 8 }} />
        国际化 & 分享管理
      </Title>

      <Tabs
        defaultActiveKey="share"
        items={[
          {
            key: 'share',
            label: (
              <span>
                <ShareAltOutlined style={{ marginRight: 4 }} />
                分享统计
              </span>
            ),
            children: (
              <>
                {/* KPI */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={8}>
                    <Card hoverable>
                      <Statistic
                        title={<span style={{ color: '#999' }}>总分享次数</span>}
                        value={stats.totalShares}
                        prefix={<ShareAltOutlined />}
                        valueStyle={{ fontSize: 36, fontWeight: 700 }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card hoverable>
                      <Statistic
                        title={<span style={{ color: '#999' }}>分享平台数</span>}
                        value={stats.byPlatform.length}
                        prefix={<GlobalOutlined />}
                        valueStyle={{ color: '#1890FF', fontSize: 36, fontWeight: 700 }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card hoverable>
                      <Statistic
                        title={<span style={{ color: '#999' }}>内容类型数</span>}
                        value={stats.byEntityType.length}
                        prefix={<TranslationOutlined />}
                        valueStyle={{ color: '#52C41A', fontSize: 36, fontWeight: 700 }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Charts */}
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card
                      title="按平台分布"
                      
                    >
                      {platformData.length === 0 ? (
                        <span style={{ color: '#666', fontSize: 13 }}>暂无分享数据</span>
                      ) : (
                        <ResponsiveContainer width="100%" height={320}>
                          <BarChart data={platformData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ed" />
                            <XAxis dataKey="platform" stroke="#999" />
                            <YAxis stroke="#999" />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e7ed', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                              labelStyle={{  }}
                            />
                            <Bar dataKey="count" name="分享次数" radius={[6, 6, 0, 0]}>
                              {platformData.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card
                      title="按内容类型分布"
                      
                    >
                      {entityData.length === 0 ? (
                        <span style={{ color: '#666', fontSize: 13 }}>暂无分享数据</span>
                      ) : (
                        <ResponsiveContainer width="100%" height={320}>
                          <BarChart data={entityData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ed" />
                            <XAxis dataKey="entityType" stroke="#999" />
                            <YAxis stroke="#999" />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e7ed', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                              labelStyle={{  }}
                            />
                            <Bar dataKey="count" name="分享次数" radius={[6, 6, 0, 0]}>
                              {entityData.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </Card>
                  </Col>
                </Row>
              </>
            ),
          },
          {
            key: 'i18n',
            label: (
              <span>
                <TranslationOutlined style={{ marginRight: 4 }} />
                语言覆盖
              </span>
            ),
            children: (
              <>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={8}>
                    <Card hoverable>
                      <Statistic
                        title={<span style={{ color: '#999' }}>支持语言数</span>}
                        value={LANGUAGES.length}
                        prefix={<GlobalOutlined />}
                        valueStyle={{ fontSize: 36, fontWeight: 700 }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card hoverable>
                      <Statistic
                        title={<span style={{ color: '#999' }}>RTL 语言</span>}
                        value={LANGUAGES.filter((l) => l.direction === 'RTL').length}
                        prefix={<TranslationOutlined />}
                        valueStyle={{ color: '#E87040', fontSize: 36, fontWeight: 700 }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card hoverable>
                      <Statistic
                        title={<span style={{ color: '#999' }}>翻译完成率</span>}
                        value="100%"
                        prefix={<TranslationOutlined />}
                        valueStyle={{ color: '#52C41A', fontSize: 36, fontWeight: 700 }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Card
                  title="语言支持列表"
                  
                >
                  <Table<LanguageRow>
                    dataSource={LANGUAGES}
                    columns={languageColumns}
                    pagination={false}
                    size="middle"
                  />
                </Card>
              </>
            ),
          },
        ]}
      />
    </div>
  );
}
