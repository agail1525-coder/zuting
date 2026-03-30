import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Table, Card, Typography, Tag, Button, Space, Popconfirm, Drawer, Descriptions, message, Input, Select, Row, Col } from 'antd';
import { EyeOutlined, RollbackOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getOrders, getOrder, refundOrder } from '../lib/api';
import type { Order } from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'processing', label: '待支付' },
  PAID: { color: 'success', label: '已支付' },
  REFUNDING: { color: 'warning', label: '退款中' },
  REFUNDED: { color: 'orange', label: '已退款' },
  CANCELLED: { color: 'error', label: '已取消' },
  COMPLETED: { color: 'default', label: '已完成' },
};

type StatusFilter = 'ALL' | 'PENDING' | 'PAID' | 'REFUNDING' | 'REFUNDED' | 'CANCELLED' | 'COMPLETED';

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Search & filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  };

  const load = useCallback((p = page, ps = pageSize, status?: string) => {
    setLoading(true);
    const apiStatus = status !== undefined ? status : (statusFilter === 'ALL' ? undefined : statusFilter);
    getOrders(p, ps, apiStatus)
      .then((res) => { setData(res.data); setTotal(res.total); })
      .catch((err: unknown) => { message.error('加载数据失败: ' + (err instanceof Error ? err.message : '网络错误')); setData([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [page, pageSize, statusFilter]);

  useEffect(() => { load(page, pageSize); }, [page, pageSize, statusFilter, load]);

  // Client-side text search on loaded data
  const filteredData = useMemo(() => {
    if (!debouncedSearch) return data;
    const q = debouncedSearch.toLowerCase();
    return data.filter((item) => {
      const orderNo = (item.orderNo || item.id || '').toLowerCase();
      const userName = (item.user?.name || item.userName || '').toLowerCase();
      const tripTitle = (item.trip?.title || item.tripTitle || '').toLowerCase();
      return orderNo.includes(q) || userName.includes(q) || tripTitle.includes(q);
    });
  }, [data, debouncedSearch]);

  const handleRefund = async (id: string) => {
    try {
      await refundOrder(id);
      message.success('退款操作成功');
      load(page, pageSize);
    } catch {
      message.error('退款操作失败');
    }
  };

  const showDetail = async (record: Order) => {
    setDetail(record);
    setDetailLoading(true);
    try {
      const full = await getOrder(record.id);
      setDetail(full);
    } catch {
      message.warning('订单详情加载不完整');
    } finally {
      setDetailLoading(false);
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (v: string, r: Order) => <span style={{ fontWeight: 600 }}>{v || r.id?.slice(0, 8) || '-'}</span>,
    },
    {
      title: '行程',
      dataIndex: 'tripTitle',
      key: 'tripTitle',
      render: (_: unknown, r: Order) => r.trip?.title || r.tripTitle || '-',
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
      render: (_: unknown, r: Order) => r.user?.name || r.userName || '-',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => v != null ? (
        <span style={{ color: '#D4A855', fontWeight: 600 }}>{`¥ ${Number(v).toLocaleString()}`}</span>
      ) : '-',
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const s = STATUS_MAP[status] || { color: 'default', label: status || '未知' };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: (_: unknown, record: Order) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
            查看
          </Button>
          {record.status === 'PAID' && (
            <Popconfirm title="确认退款?" description="退款后将无法撤回" onConfirm={() => handleRefund(record.id)} okText="确认退款" cancelText="取消" okButtonProps={{ danger: true }}>
              <Button type="link" size="small" danger icon={<RollbackOutlined />}>
                退款
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Title level={4} style={{ color: '#D4A855', marginBottom: 16 }}>
        订单管理
      </Title>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 12]} align="middle">
          <Col flex="auto">
            <Input
              prefix={<SearchOutlined />}
              placeholder="搜索订单号/用户/行程..."
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              allowClear
              style={{ maxWidth: 320 }}
            />
          </Col>
          <Col>
            <Select
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1); }}
              style={{ width: 130 }}
            >
              <Select.Option value="ALL">全部状态</Select.Option>
              <Select.Option value="PENDING">待支付</Select.Option>
              <Select.Option value="PAID">已支付</Select.Option>
              <Select.Option value="REFUNDING">退款中</Select.Option>
              <Select.Option value="REFUNDED">已退款</Select.Option>
              <Select.Option value="CANCELLED">已取消</Select.Option>
              <Select.Option value="COMPLETED">已完成</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: debouncedSearch || statusFilter !== 'ALL' ? '无匹配结果' : '暂无数据' }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
          size="middle"
        />
      </Card>

      <Drawer
        title="订单详情"
        open={!!detail}
        onClose={() => setDetail(null)}
        width={520}
        loading={detailLoading}
      >
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="订单号">{detail.orderNo || detail.id}</Descriptions.Item>
            <Descriptions.Item label="行程">{detail.trip?.title || detail.tripTitle || '-'}</Descriptions.Item>
            <Descriptions.Item label="用户">{detail.user?.name || detail.userName || '-'}</Descriptions.Item>
            <Descriptions.Item label="金额">
              {detail.amount != null ? (
                <span style={{ color: '#D4A855', fontWeight: 600 }}>¥ {Number(detail.amount).toLocaleString()}</span>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="支付方式">{detail.paymentMethod || '-'}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={STATUS_MAP[detail.status]?.color}>{STATUS_MAP[detail.status]?.label || detail.status}</Tag>
            </Descriptions.Item>
            {detail.paidAt && (
              <Descriptions.Item label="支付时间">{dayjs(detail.paidAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            )}
            {detail.refundedAt && (
              <Descriptions.Item label="退款时间">{dayjs(detail.refundedAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            )}
            <Descriptions.Item label="创建时间">{detail.createdAt ? dayjs(detail.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</Descriptions.Item>
            {detail.updatedAt && (
              <Descriptions.Item label="更新时间">{dayjs(detail.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>
    </>
  );
}
