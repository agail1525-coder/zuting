import { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Button, Space, Popconfirm, Drawer, Descriptions, message } from 'antd';
import { EyeOutlined, RollbackOutlined } from '@ant-design/icons';
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

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = () => {
    setLoading(true);
    getOrders()
      .then(setData)
      .catch((err: unknown) => { message.error('加载数据失败: ' + (err instanceof Error ? err.message : '网络错误')); setData([]); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRefund = async (id: string) => {
    try {
      await refundOrder(id);
      message.success('退款操作成功');
      load();
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
      // keep partial data
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
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: '暂无数据' }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
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
