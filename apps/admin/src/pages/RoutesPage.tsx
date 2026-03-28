import { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Button, Space, message, Popconfirm, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getRoutes, deleteRoute } from '../lib/api';
import type { AdminRoute } from '../types';

const { Title } = Typography;

const CATEGORY_MAP: Record<string, { color: string; label: string }> = {
  ZEN: { color: 'gold', label: '禅宗' },
  BUDDHIST: { color: 'orange', label: '佛教' },
  TAOIST: { color: 'green', label: '道教' },
  CHRISTIAN: { color: 'red', label: '基督' },
  ISLAMIC: { color: 'lime', label: '伊斯兰' },
  CROSS_CULTURAL: { color: 'purple', label: '跨文化' },
  HINDU: { color: 'volcano', label: '印度教' },
  JEWISH: { color: 'blue', label: '犹太教' },
  CULTURAL_HERITAGE: { color: 'cyan', label: '文化遗产' },
};

const DIFFICULTY_MAP: Record<string, { color: string; label: string }> = {
  EASY: { color: 'success', label: '轻松' },
  MODERATE: { color: 'warning', label: '适中' },
  CHALLENGING: { color: 'error', label: '挑战' },
};

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  DRAFT: { color: 'default', label: '草稿' },
  PUBLISHED: { color: 'success', label: '已发布' },
  ARCHIVED: { color: 'default', label: '已归档' },
};

export default function RoutesPage() {
  const [data, setData] = useState<AdminRoute[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | undefined>();

  const load = (p = page, ps = pageSize, cat = category) => {
    setLoading(true);
    getRoutes(p, ps, cat)
      .then((res) => {
        setData(res.items);
        setTotal(res.total);
      })
      .catch(() => message.error('加载路线失败'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = (id: string) => {
    deleteRoute(id)
      .then(() => {
        message.success('删除成功');
        load();
      })
      .catch(() => message.error('删除失败'));
  };

  const columns: ColumnsType<AdminRoute> = [
    {
      title: '路线名称',
      dataIndex: 'title',
      width: 200,
      render: (title: string, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.titleEn}</div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 100,
      render: (cat: string) => {
        const m = CATEGORY_MAP[cat];
        return m ? <Tag color={m.color}>{m.label}</Tag> : cat;
      },
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      width: 80,
      render: (diff: string) => {
        const m = DIFFICULTY_MAP[diff];
        return m ? <Tag color={m.color}>{m.label}</Tag> : diff;
      },
    },
    {
      title: '行程',
      width: 90,
      render: (_: unknown, record) => `${record.duration}天${record.nights}晚`,
    },
    {
      title: '起价(分)',
      dataIndex: 'priceFrom',
      width: 100,
      render: (v: number) => `¥${(v / 100).toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: string) => {
        const m = STATUS_MAP[status];
        return m ? <Tag color={m.color}>{m.label}</Tag> : status;
      },
    },
    {
      title: '评分',
      dataIndex: 'rating',
      width: 80,
      render: (v: number | null, record) =>
        v ? `${v.toFixed(1)} (${record.reviewCount})` : '-',
    },
    {
      title: '预订数',
      dataIndex: 'bookCount',
      width: 80,
    },
    {
      title: '操作',
      width: 80,
      render: (_: unknown, record) => (
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Title level={4} style={{ margin: 0 }}>路线管理</Title>
          <Space>
            <Select
              placeholder="按分类筛选"
              allowClear
              style={{ width: 140 }}
              value={category}
              onChange={(v) => { setCategory(v); load(1, pageSize, v); }}
              options={Object.entries(CATEGORY_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
            />
            <Button icon={<ReloadOutlined />} onClick={() => load()}>刷新</Button>
          </Space>
        </Space>
        <Table<AdminRoute>
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); load(p, ps); },
          }}
          scroll={{ x: 900 }}
          size="middle"
        />
      </Space>
    </Card>
  );
}
