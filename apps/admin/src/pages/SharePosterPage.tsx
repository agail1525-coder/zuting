import { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tag, Space, Typography, message, Button, Row, Col, Statistic,
} from 'antd';
import { ReloadOutlined, ShareAltOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getShareStats, getPopularShares } from '../lib/m40';

const { Title, Paragraph } = Typography;

export default function SharePosterPage() {
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([getShareStats({}), getPopularShares(20)]);
      setStats(s);
      const arr = Array.isArray(p) ? p : (p?.items ?? []);
      setItems(arr);
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cols: ColumnsType<Record<string, unknown>> = [
    { title: '排名', key: 'rank', width: 70, render: (_, __, i) => <Tag color="gold">#{i + 1}</Tag> },
    { title: '实体', dataIndex: 'entityType', width: 120, render: (v) => <Tag>{String(v ?? '-')}</Tag> },
    { title: 'ID', dataIndex: 'entityId', width: 200, render: (v) => <code>{String(v ?? '-')}</code> },
    { title: '分享次数', dataIndex: 'shareCount', width: 120, render: (v) => (Number(v) || 0).toLocaleString() },
    { title: '渠道', dataIndex: 'channel', render: (v) => v ?? '-' },
  ];

  return (
    <div>
      <Title level={4} style={{  }}>分享 & 海报</Title>
      <Paragraph type="secondary">社交分享数据中心，追踪传播效果。</Paragraph>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="总分享数" value={Number(stats.totalShares ?? 0)} prefix={<ShareAltOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="今日" value={Number(stats.todayShares ?? 0)} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="本周" value={Number(stats.weekShares ?? 0)} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="独立用户" value={Number(stats.uniqueUsers ?? 0)} /></Card></Col>
      </Row>

      <Card
        title="热门分享 TOP 20"
        extra={<Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>}
      >
        <Table rowKey={(r) => `${r.entityType}-${r.entityId}`} columns={cols} dataSource={items} loading={loading} pagination={false} />
      </Card>
    </div>
  );
}
