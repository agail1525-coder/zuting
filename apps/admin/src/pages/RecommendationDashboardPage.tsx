import { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tag, Select, Space, Typography, message, Button,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { listPopularRecommendations } from '../lib/m40';

const { Title, Paragraph } = Typography;

const ENTITY_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'holy-site', label: '文化圣地' },
  { value: 'temple', label: '祖庭' },
  { value: 'route', label: '路线' },
  { value: 'patriarch', label: '祖师' },
];

export default function RecommendationDashboardPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [entityType, setEntityType] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPopularRecommendations({ entityType: entityType || undefined, limit: 50 });
      const arr = Array.isArray(res) ? res : (res?.items ?? []);
      setItems(arr);
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [entityType]);

  useEffect(() => { load(); }, [load]);

  const cols: ColumnsType<Record<string, unknown>> = [
    { title: '排名', key: 'rank', width: 70, render: (_, __, i) => <Tag color="gold">#{i + 1}</Tag> },
    { title: 'ID', dataIndex: 'id', width: 180, render: (v) => <code>{String(v ?? '-')}</code> },
    { title: '名称/标题', key: 'name', render: (_, r) => String(r.name ?? r.title ?? '-') },
    { title: '类型', dataIndex: 'entityType', width: 120, render: (v) => v ? <Tag>{String(v)}</Tag> : '-' },
    { title: '浏览', dataIndex: 'viewCount', width: 100, render: (v) => (Number(v) || 0).toLocaleString() },
    { title: '评分', dataIndex: 'rating', width: 90, render: (v) => v ? Number(v).toFixed(1) : '-' },
  ];

  return (
    <div>
      <Title level={4} style={{ color: '#D4A855' }}>推荐看板</Title>
      <Paragraph type="secondary">基于浏览/评分/收藏的热门内容排行，辅助运营决策。</Paragraph>

      <Card
        extra={
          <Space>
            <Select value={entityType} onChange={setEntityType} options={ENTITY_OPTIONS} style={{ width: 160 }} />
            <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
          </Space>
        }
      >
        <Table rowKey={(r) => String(r.id)} columns={cols} dataSource={items} loading={loading} pagination={false} />
      </Card>
    </div>
  );
}
