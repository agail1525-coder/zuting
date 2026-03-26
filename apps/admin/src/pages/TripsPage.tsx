import { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Button, Space, Tabs, Drawer, Descriptions, message, Popconfirm, Input, Modal } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, PlayCircleOutlined, StopOutlined, DollarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getTrips, transitionTrip } from '../lib/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  DRAFT: { color: 'default', label: '草稿' },
  PLANNING: { color: 'cyan', label: '规划中' },
  SUBMITTED: { color: 'processing', label: '已提交' },
  CONFIRMED: { color: 'blue', label: '已确认' },
  PAID: { color: 'gold', label: '已支付' },
  PREPARING: { color: 'geekblue', label: '准备中' },
  IN_PROGRESS: { color: 'orange', label: '进行中' },
  COMPLETED: { color: 'success', label: '已完成' },
  REVIEWING: { color: 'purple', label: '评价中' },
  CANCELLED: { color: 'error', label: '已取消' },
  REFUNDING: { color: 'warning', label: '退款中' },
  REFUNDED: { color: 'default', label: '已退款' },
};

// Admin actions based on current status
const ADMIN_ACTIONS: Record<string, { action: string; label: string; icon: React.ReactNode; needReason?: boolean }[]> = {
  SUBMITTED: [
    { action: 'admin_confirm', label: '确认', icon: <CheckCircleOutlined /> },
    { action: 'admin_reject', label: '拒绝', icon: <CloseCircleOutlined />, needReason: true },
  ],
  CONFIRMED: [
    { action: 'mark_paid', label: '标记已支付', icon: <DollarOutlined /> },
  ],
  PAID: [
    { action: 'start_preparing', label: '开始准备', icon: <PlayCircleOutlined /> },
  ],
  PREPARING: [
    { action: 'start_trip', label: '开始行程', icon: <PlayCircleOutlined /> },
  ],
  IN_PROGRESS: [
    { action: 'complete_trip', label: '完成', icon: <CheckCircleOutlined /> },
  ],
  COMPLETED: [
    { action: 'open_review', label: '开放评价', icon: <CheckCircleOutlined /> },
  ],
};

export default function TripsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [rejectModal, setRejectModal] = useState<{ id: string; action: string } | null>(null);
  const [reason, setReason] = useState('');

  const load = () => {
    setLoading(true);
    getTrips()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filteredData = activeTab === 'all' ? data : data.filter((t) => t.status === activeTab);

  const handleTransition = async (id: string, action: string, transitionReason?: string) => {
    try {
      await transitionTrip(id, action, transitionReason);
      message.success('状态转换成功');
      load();
    } catch {
      message.error('状态转换失败');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await transitionTrip(id, 'cancel');
      message.success('已取消行程');
      load();
    } catch {
      message.error('取消失败');
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: '行程名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text || '-'}</span>,
    },
    {
      title: '目的地',
      dataIndex: 'destination',
      key: 'destination',
    },
    {
      title: '出发日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-',
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-',
    },
    {
      title: '人数',
      dataIndex: 'participants',
      key: 'participants',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const s = STATUS_MAP[status] || { color: 'default', label: status };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 280,
      render: (_: any, record: any) => {
        const actions = ADMIN_ACTIONS[record.status] || [];
        return (
          <Space wrap>
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetail(record)}>
              查看
            </Button>
            {actions.map((act) =>
              act.needReason ? (
                <Button
                  key={act.action}
                  type="link"
                  size="small"
                  icon={act.icon}
                  danger
                  onClick={() => { setRejectModal({ id: record.id, action: act.action }); setReason(''); }}
                >
                  {act.label}
                </Button>
              ) : (
                <Popconfirm
                  key={act.action}
                  title={`确认${act.label}?`}
                  onConfirm={() => handleTransition(record.id, act.action)}
                  okText="确认"
                  cancelText="取消"
                >
                  <Button type="link" size="small" icon={act.icon}>
                    {act.label}
                  </Button>
                </Popconfirm>
              )
            )}
            {!['COMPLETED', 'CANCELLED', 'REFUNDED', 'REVIEWING'].includes(record.status) && (
              <Popconfirm title="确认取消此行程?" onConfirm={() => handleCancel(record.id)} okText="确认" cancelText="取消">
                <Button type="link" size="small" danger icon={<StopOutlined />}>
                  取消
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  const tabItems = [
    { key: 'all', label: `全部 (${data.length})` },
    ...Object.entries(STATUS_MAP).map(([key, val]) => {
      const count = data.filter((t) => t.status === key).length;
      return count > 0 ? { key, label: `${val.label} (${count})` } : null;
    }).filter(Boolean) as any[],
  ];

  return (
    <>
      <Title level={4} style={{ color: '#D4A855', marginBottom: 16 }}>
        行程管理
      </Title>
      <Card>
        <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }} />
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          size="middle"
        />
      </Card>

      <Drawer
        title="行程详情"
        open={!!detail}
        onClose={() => setDetail(null)}
        width={520}
      >
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="行程名称">{detail.title}</Descriptions.Item>
            <Descriptions.Item label="目的地">{detail.destination}</Descriptions.Item>
            <Descriptions.Item label="出发日期">{detail.startDate ? dayjs(detail.startDate).format('YYYY-MM-DD') : '-'}</Descriptions.Item>
            <Descriptions.Item label="结束日期">{detail.endDate ? dayjs(detail.endDate).format('YYYY-MM-DD') : '-'}</Descriptions.Item>
            <Descriptions.Item label="参与人数">{detail.participants}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={STATUS_MAP[detail.status]?.color}>{STATUS_MAP[detail.status]?.label || detail.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="描述">{detail.description || '-'}</Descriptions.Item>
            {detail.createdAt && (
              <Descriptions.Item label="创建时间">{dayjs(detail.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
            )}
            {detail.updatedAt && (
              <Descriptions.Item label="更新时间">{dayjs(detail.updatedAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>

      {/* Reason modal for reject actions */}
      <Modal
        title="请输入原因"
        open={!!rejectModal}
        onCancel={() => setRejectModal(null)}
        onOk={() => {
          if (rejectModal) {
            handleTransition(rejectModal.id, rejectModal.action, reason);
            setRejectModal(null);
          }
        }}
        okText="确认"
        cancelText="取消"
      >
        <Input.TextArea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="请输入拒绝/取消原因"
        />
      </Modal>
    </>
  );
}
