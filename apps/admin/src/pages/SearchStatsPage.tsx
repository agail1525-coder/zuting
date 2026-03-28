import { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Spin, Result, Row, Col, Statistic } from 'antd';
import { SearchOutlined, FireOutlined, RiseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const BASE = import.meta.env.VITE_API_URL || '/api';

interface HotKeyword {
  keyword: string;
  count: number;
}

const MEDAL_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: '#FFD700', border: '#B8860B', text: '#5c3a00' },  // gold
  2: { bg: '#C0C0C0', border: '#8a8a8a', text: '#2a2a2a' },  // silver
  3: { bg: '#CD7F32', border: '#8B5A00', text: '#fff' },     // bronze
};

async function fetchHotKeywords(): Promise<HotKeyword[]> {
  const res = await fetch(`${BASE}/search/hot`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  // handle both { items: [...] } and plain array
  return Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
}

export default function SearchStatsPage() {
  const [keywords, setKeywords] = useState<HotKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHotKeywords()
      .then(setKeywords)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setLoading(false));
  }, []);

  const totalSearches = keywords.reduce((sum, k) => sum + (k.count ?? 0), 0);
  const topKeyword = keywords[0]?.keyword ?? '—';

  const columns: ColumnsType<HotKeyword & { rank: number }> = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      align: 'center',
      render: (rank: number) => {
        if (rank <= 3) {
          const medal = MEDAL_COLORS[rank];
          return (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: medal.bg,
                border: `2px solid ${medal.border}`,
                color: medal.text,
                fontWeight: 700,
                fontSize: 13,
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
      title: '关键词 / Keyword',
      dataIndex: 'keyword',
      key: 'keyword',
      render: (kw: string, record) => {
        if (record.rank <= 3) {
          const colors: Record<number, string> = { 1: 'gold', 2: 'default', 3: 'orange' };
          return (
            <Tag
              color={colors[record.rank]}
              style={{ fontSize: 14, padding: '2px 12px', fontWeight: 600 }}
            >
              {kw}
            </Tag>
          );
        }
        return <span style={{ color: '#d4d4d4' }}>{kw}</span>;
      },
    },
    {
      title: '搜索次数 / Search Count',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      sorter: (a, b) => (a.count ?? 0) - (b.count ?? 0),
      render: (count: number) => (
        <span style={{ color: '#D4A855', fontWeight: 600 }}>{(count ?? 0).toLocaleString()}</span>
      ),
    },
  ];

  const tableData = keywords.map((k, i) => ({ ...k, rank: i + 1, key: k.keyword }));

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

  return (
    <div>
      <Title level={3} style={{ color: '#D4A855', marginBottom: 24 }}>
        搜索统计 / Search Statistics
      </Title>

      {/* Summary KPI cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Statistic
                title={<span style={{ color: '#999' }}>热词总数</span>}
                value={keywords.length}
                valueStyle={{ color: '#D4A855', fontSize: 36, fontWeight: 700 }}
              />
              <SearchOutlined style={{ fontSize: 28, color: '#D4A855' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Statistic
                title={<span style={{ color: '#999' }}>总搜索次数</span>}
                value={totalSearches}
                valueStyle={{ color: '#52C41A', fontSize: 36, fontWeight: 700 }}
              />
              <RiseOutlined style={{ fontSize: 28, color: '#52C41A' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Statistic
                title={<span style={{ color: '#999' }}>最热关键词</span>}
                value={topKeyword}
                valueStyle={{ color: '#FF4D4F', fontSize: 24, fontWeight: 700 }}
              />
              <FireOutlined style={{ fontSize: 28, color: '#FF4D4F' }} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Hot keywords table */}
      <Card
        title={
          <span>
            <SearchOutlined style={{ marginRight: 8, color: '#D4A855' }} />
            热门搜索关键词
          </span>
        }
        styles={{ header: { borderBottom: '1px solid #2a2a2a' } }}
      >
        {tableData.length === 0 ? (
          <Result
            icon={<SearchOutlined style={{ color: '#D4A855' }} />}
            title="暂无搜索数据"
            subTitle="用户尚未产生搜索记录，或搜索统计功能尚未启用。"
          />
        ) : (
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={tableData.length > 20 ? { pageSize: 20 } : false}
            rowKey="keyword"
            size="middle"
          />
        )}
      </Card>
    </div>
  );
}
