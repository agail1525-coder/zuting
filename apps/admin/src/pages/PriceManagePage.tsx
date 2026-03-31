import { useState, useEffect, useCallback } from 'react';
import {
  Tabs,
  Table,
  Select,
  Space,
  Typography,
  Tag,
  message,
  Button,
  Popconfirm,
  Spin,
  Empty,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DollarOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface PriceSnapshot {
  id: string;
  entityType: string;
  entityId: string;
  date: string;
  price: number;
  currency: string;
  createdAt: string;
}

interface PriceAlert {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  entityName: string;
  targetPrice: number;
  currentPrice: number;
  isTriggered: boolean;
  triggeredAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

const ENTITY_TYPES = ['全部', 'ROUTE', 'PACKAGE'];

// ── Snapshots Tab ─────────────────────────────────────────────────────────────

function SnapshotsTab() {
  const [data, setData] = useState<PagedResult<PriceSnapshot>>({ items: [], total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('全部');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (filterType !== '全部') params.set('entityType', filterType);
      const res = await fetch(`${BASE}/prices/snapshots?${params}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: PagedResult<PriceSnapshot> = await res.json();
      setData(json);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '请求失败';
      setError(msg);
      message.error(`加载快照失败: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: ColumnsType<PriceSnapshot> = [
    {
      title: '实体类型', dataIndex: 'entityType', key: 'entityType', width: 100,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    { title: '实体ID', dataIndex: 'entityId', key: 'entityId', ellipsis: true },
    {
      title: '日期', dataIndex: 'date', key: 'date', width: 130,
      render: (v: string) => (v ? new Date(v).toLocaleDateString('zh-CN') : '-'),
    },
    {
      title: '价格 (分)', dataIndex: 'price', key: 'price', width: 120,
      render: (v: number) => (
        <span style={{ color: '#D4A855', fontWeight: 600 }}>{(v ?? 0).toLocaleString()}</span>
      ),
    },
    { title: '货币', dataIndex: 'currency', key: 'currency', width: 80 },
    {
      title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170,
      render: (v: string) => (
        <span style={{ color: '#999', fontSize: 12 }}>{v ? new Date(v).toLocaleString('zh-CN') : '-'}</span>
      ),
    },
  ];

  if (error && data.items.length === 0) {
    return <Empty description={`加载失败: ${error}`}><Button onClick={fetchData}>重试</Button></Empty>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <span style={{ color: '#999' }}>实体类型:</span>
          <Select value={filterType} onChange={(v) => { setFilterType(v); setPage(1); }} style={{ width: 120 }}>
            {ENTITY_TYPES.map((t) => <Option key={t} value={t}>{t}</Option>)}
          </Select>
        </Space>
        <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>刷新</Button>
      </div>
      <Spin spinning={loading}>
        <Table<PriceSnapshot>
          dataSource={data.items}
          columns={columns}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total: data.total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
          size="middle"
          locale={{ emptyText: <Empty description="暂无价格快照数据" /> }}
        />
      </Spin>
    </div>
  );
}

// ── Alerts Tab ────────────────────────────────────────────────────────────────

function AlertsTab() {
  const [data, setData] = useState<PagedResult<PriceAlert>>({ items: [], total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      const res = await fetch(`${BASE}/price-alerts/all?${params}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: PagedResult<PriceAlert> = await res.json();
      setData(json);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '请求失败';
      setError(msg);
      message.error(`加载提醒失败: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${BASE}/price-alerts/admin/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      message.success('提醒已删除');
      fetchData();
    } catch (e) {
      message.error(`删除失败: ${e instanceof Error ? e.message : '未知错误'}`);
    }
  };

  const columns: ColumnsType<PriceAlert> = [
    { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 120, ellipsis: true },
    { title: '实体名称', dataIndex: 'entityName', key: 'entityName', ellipsis: true },
    {
      title: '实体类型', dataIndex: 'entityType', key: 'entityType', width: 100,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '目标价 (分)', dataIndex: 'targetPrice', key: 'targetPrice', width: 120,
      render: (v: number) => <span style={{ color: '#52C41A', fontWeight: 600 }}>{(v ?? 0).toLocaleString()}</span>,
    },
    {
      title: '当前价 (分)', dataIndex: 'currentPrice', key: 'currentPrice', width: 120,
      render: (v: number) => <span style={{ color: '#D4A855', fontWeight: 600 }}>{(v ?? 0).toLocaleString()}</span>,
    },
    {
      title: '状态', dataIndex: 'isTriggered', key: 'isTriggered', width: 90,
      render: (v: boolean, r: PriceAlert) => (
        <Tag color={!r.isActive ? 'default' : v ? 'green' : 'orange'}>
          {!r.isActive ? '已删除' : v ? '已触发' : '等待中'}
        </Tag>
      ),
    },
    {
      title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170,
      render: (v: string) => <span style={{ color: '#999', fontSize: 12 }}>{v ? new Date(v).toLocaleString('zh-CN') : '-'}</span>,
    },
    {
      title: '操作', key: 'actions', width: 80,
      render: (_: unknown, record: PriceAlert) => (
        record.isActive ? (
          <Popconfirm title="确定删除此提醒?" onConfirm={() => handleDelete(record.id)} okText="删除" cancelText="取消">
            <Button type="link" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        ) : <span style={{ color: '#999' }}>-</span>
      ),
    },
  ];

  if (error && data.items.length === 0) {
    return <Empty description={`加载失败: ${error}`}><Button onClick={fetchData}>重试</Button></Empty>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>刷新</Button>
      </div>
      <Spin spinning={loading}>
        <Table<PriceAlert>
          dataSource={data.items}
          columns={columns}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total: data.total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
          size="middle"
          locale={{ emptyText: <Empty description="暂无价格提醒数据" /> }}
        />
      </Spin>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PriceManagePage() {
  const tabItems = [
    {
      key: 'snapshots',
      label: <span><DollarOutlined style={{ marginRight: 6 }} />价格快照</span>,
      children: <SnapshotsTab />,
    },
    {
      key: 'alerts',
      label: '价格提醒',
      children: <AlertsTab />,
    },
  ];

  return (
    <div>
      <Title level={3} style={{ color: '#D4A855', marginBottom: 24 }}>价格管理</Title>
      <Tabs defaultActiveKey="snapshots" items={tabItems} />
    </div>
  );
}
