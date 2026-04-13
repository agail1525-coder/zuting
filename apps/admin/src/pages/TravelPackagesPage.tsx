import { useEffect, useState } from 'react';
import { Card, Tabs, Table, Tag, Typography, Button, Space, message, Popconfirm, Select, Input } from 'antd';
import { ReloadOutlined, PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getToken } from '../lib/auth';

const { Title } = Typography;
const BASE = import.meta.env.VITE_API_URL || '/api';

async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

interface Pkg {
  id: string; tier: string; category: string; title: string; priceMin: number; priceMax: number;
  currency: string; priceUnit: string; holySiteId: string; enabled: boolean;
}
interface Source {
  id: string; name: string; baseUrl: string; type: string; schedule: string; rateLimitMs: number;
  enabled: boolean; lastRunAt?: string | null; lastStatus?: string | null;
}
interface Alert {
  id: string; packageId: string; alertType: string; oldValue?: string | null; newValue?: string | null;
  detectedAt: string; acknowledged: boolean; note?: string | null;
}

const TIER_COLOR: Record<string, string> = {
  LUXURY: 'gold', BUSINESS: 'blue', STANDARD: 'green', BUDGET: 'orange',
};
const CAT_LABEL: Record<string, string> = {
  HOTEL: '住', RESTAURANT: '食', TRANSPORT: '行', EXPERIENCE: '游',
  SHOPPING: '购', GUIDE: '向导', GROUND_TEAM: '地接',
};

function PackagesTab() {
  const [items, setItems] = useState<Pkg[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tier, setTier] = useState<string>();
  const [category, setCategory] = useState<string>();
  const [keyword, setKeyword] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: String(page), limit: '20' });
      if (tier) q.set('tier', tier);
      if (category) q.set('category', category);
      const data = await api<{ items: Pkg[]; total: number }>(`/destination-packages/admin/list?${q}`);
      const filtered = keyword ? data.items.filter((p) => p.title.includes(keyword)) : data.items;
      setItems(filtered);
      setTotal(data.total);
    } catch (e) { message.error(String(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, tier, category]);

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="标题关键字" value={keyword} onChange={(e) => setKeyword(e.target.value)} onPressEnter={load} allowClear style={{ width: 180 }} />
        <Select placeholder="档次" value={tier} onChange={setTier} allowClear style={{ width: 120 }} options={['LUXURY','BUSINESS','STANDARD','BUDGET'].map(v => ({ value: v, label: v }))} />
        <Select placeholder="类别" value={category} onChange={setCategory} allowClear style={{ width: 120 }} options={Object.entries(CAT_LABEL).map(([v,l]) => ({ value: v, label: l }))} />
        <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
      </Space>
      <Table<Pkg>
        rowKey="id" loading={loading} dataSource={items}
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
        columns={[
          { title: '档次', dataIndex: 'tier', width: 90, render: (v) => <Tag color={TIER_COLOR[v]}>{v}</Tag> },
          { title: '类别', dataIndex: 'category', width: 80, render: (v) => CAT_LABEL[v] || v },
          { title: '标题', dataIndex: 'title', ellipsis: true },
          { title: '价格', width: 180, render: (_, r) => r.priceMin === 0 && r.priceMax === 0 ? '—' : `${r.currency} ${(r.priceMin/100).toLocaleString()}-${(r.priceMax/100).toLocaleString()} / ${r.priceUnit}` },
          { title: '状态', dataIndex: 'enabled', width: 80, render: (v) => v ? <Tag color="green">启用</Tag> : <Tag>停用</Tag> },
        ]}
      />
    </>
  );
}

function CrawlersTab() {
  const [items, setItems] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api<{ items: Source[] }>('/crawler/sources?page=1&limit=50');
      setItems(data.items);
    } catch (e) { message.error(String(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const run = async (id: string) => {
    try { await api(`/crawler/sources/${id}/run`, { method: 'POST' }); message.success('已触发'); load(); }
    catch (e) { message.error(String(e)); }
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
      </Space>
      <Table<Source>
        rowKey="id" loading={loading} dataSource={items}
        columns={[
          { title: '名称', dataIndex: 'name' },
          { title: 'URL', dataIndex: 'baseUrl', ellipsis: true },
          { title: '类型', dataIndex: 'type', width: 100 },
          { title: '调度', dataIndex: 'schedule', width: 120 },
          { title: '限速ms', dataIndex: 'rateLimitMs', width: 90 },
          { title: '启用', dataIndex: 'enabled', width: 80, render: (v) => v ? <Tag color="green">✓</Tag> : <Tag>✗</Tag> },
          { title: '上次', dataIndex: 'lastRunAt', width: 160, render: (v) => v ? new Date(v).toLocaleString() : '—' },
          { title: '状态', dataIndex: 'lastStatus', width: 100 },
          { title: '操作', width: 100, render: (_, r) => (
            <Popconfirm title="立即触发抓取?" onConfirm={() => run(r.id)}>
              <Button size="small" icon={<PlayCircleOutlined />}>运行</Button>
            </Popconfirm>
          )},
        ]}
      />
    </>
  );
}

function AlertsTab() {
  const [items, setItems] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api<{ items: Alert[] }>('/crawler/alerts?page=1&limit=50');
      setItems(data.items);
    } catch (e) { message.error(String(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const ack = async (id: string) => {
    try { await api(`/crawler/alerts/${id}/acknowledge`, { method: 'POST', body: JSON.stringify({}) }); message.success('已确认'); load(); }
    catch (e) { message.error(String(e)); }
  };

  return (
    <Table<Alert>
      rowKey="id" loading={loading} dataSource={items}
      columns={[
        { title: '类型', dataIndex: 'alertType', width: 120, render: (v) => <Tag color="red">{v}</Tag> },
        { title: '旧值', dataIndex: 'oldValue', ellipsis: true },
        { title: '新值', dataIndex: 'newValue', ellipsis: true },
        { title: '时间', dataIndex: 'detectedAt', width: 160, render: (v) => new Date(v).toLocaleString() },
        { title: '状态', dataIndex: 'acknowledged', width: 90, render: (v) => v ? <Tag color="green">已确认</Tag> : <Tag color="orange">待处理</Tag> },
        { title: '操作', width: 120, render: (_, r) => r.acknowledged ? '—' : (
          <Button size="small" icon={<CheckCircleOutlined />} onClick={() => ack(r.id)}>确认</Button>
        )},
      ]}
    />
  );
}

export default function TravelPackagesPage() {
  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>🏨 旅游配套管理 (TP++)</Title>
      <Card>
        <Tabs items={[
          { key: 'packages', label: '配套套餐', children: <PackagesTab /> },
          { key: 'crawlers', label: '爬虫源', children: <CrawlersTab /> },
          { key: 'alerts', label: '价格变动告警', children: <AlertsTab /> },
        ]} />
      </Card>
    </div>
  );
}
