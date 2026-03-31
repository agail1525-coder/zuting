import { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Button, Space, message, Select, Popconfirm } from 'antd';
import { ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, DollarOutlined, TrophyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getBookings, updateBookingStatus } from '../lib/api';
import type { AdminBooking } from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'processing', label: '待确认' },
  CONFIRMED: { color: 'blue', label: '��确认' },
  PAID: { color: 'gold', label: '已支付' },
  CANCELLED: { color: 'error', label: '已取消' },
  COMPLETED: { color: 'success', label: '已完成' },
};

export default function BookingsPage() {
  const [data, setData] = useState<AdminBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const handleStatusChange = (id: string, newStatus: string) => {
    setActionLoading(id);
    updateBookingStatus(id, newStatus)
      .then(() => {
        message.success('状态更新成功');
        load();
      })
      .catch(() => message.error('状态更新失败'))
      .finally(() => setActionLoading(null));
  };

  const load = (p = page, ps = pageSize, status = statusFilter) => {
    setLoading(true);
    getBookings(p, ps, status)
      .then((res) => {
        setData(res.items);
        setTotal(res.total);
      })
      .catch(() => message.error('加载预订失败'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const columns: ColumnsType<AdminBooking> = [
    {
      title: '路线',
      dataIndex: ['route', 'title'],
      width: 200,
      render: (title: string) => title || '-',
    },
    {
      title: '用户',
      dataIndex: ['user', 'nickname'],
      width: 120,
      render: (name: string) => name || '-',
    },
    {
      title: '出发日期',
      dataIndex: 'startDate',
      width: 120,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-',
    },
    {
      title: '人数',
      dataIndex: 'persons',
      width: 70,
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      width: 100,
      render: (v: number) => `¥${(v / 100).toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const m = STATUS_MAP[status];
        return m ? <Tag color={m.color}>{m.label}</Tag> : status;
      },
    },
    {
      title: '联系人',
      width: 120,
      render: (_: unknown, record) =>
        record.contactName ? `${record.contactName} ${record.contactPhone ?? ''}` : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right' as const,
      render: (_: unknown, record: AdminBooking) => {
        const isLoading = actionLoading === record.id;
        const btns: React.ReactNode[] = [];

        if (record.status === 'PENDING') {
          btns.push(
            <Popconfirm key="confirm" title="确认此预订?" onConfirm={() => handleStatusChange(record.id, 'CONFIRMED')} okText="确认" cancelText="取消">
              <Button type="link" size="small" icon={<CheckCircleOutlined />} loading={isLoading} style={{ color: '#52c41a' }}>确认</Button>
            </Popconfirm>,
          );
        }
        if (record.status === 'CONFIRMED') {
          btns.push(
            <Popconfirm key="paid" title="标记为已支付?" onConfirm={() => handleStatusChange(record.id, 'PAID')} okText="确认" cancelText="取消">
              <Button type="link" size="small" icon={<DollarOutlined />} loading={isLoading} style={{ color: '#1677ff' }}>标记支付</Button>
            </Popconfirm>,
          );
        }
        if (record.status === 'PAID') {
          btns.push(
            <Popconfirm key="complete" title="标记为已完成?" onConfirm={() => handleStatusChange(record.id, 'COMPLETED')} okText="确认" cancelText="取消">
              <Button type="link" size="small" icon={<TrophyOutlined />} loading={isLoading} style={{ color: '#52c41a' }}>完成</Button>
            </Popconfirm>,
          );
        }
        if (record.status !== 'CANCELLED' && record.status !== 'COMPLETED') {
          btns.push(
            <Popconfirm key="cancel" title="确认取消此预订?" okType="danger" onConfirm={() => handleStatusChange(record.id, 'CANCELLED')} okText="确认取消" cancelText="返回">
              <Button type="link" size="small" danger icon={<CloseCircleOutlined />} loading={isLoading}>取消</Button>
            </Popconfirm>,
          );
        }

        return btns.length > 0 ? <Space size={0}>{btns}</Space> : <span style={{ color: '#999' }}>-</span>;
      },
    },
  ];

  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Title level={4} style={{ margin: 0 }}>路线预订管理</Title>
          <Space>
            <Select
              placeholder="按状态筛选"
              allowClear
              style={{ width: 140 }}
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); load(1, pageSize, v); }}
              options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
            />
            <Button icon={<ReloadOutlined />} onClick={() => load()}>刷新</Button>
          </Space>
        </Space>
        <Table<AdminBooking>
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
          scroll={{ x: 1100 }}
          size="middle"
        />
      </Space>
    </Card>
  );
}
