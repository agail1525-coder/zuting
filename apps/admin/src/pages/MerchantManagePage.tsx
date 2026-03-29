import { useState, useEffect, useCallback } from 'react';
import {
  Table, Tabs, Button, Tag, Modal, Input, Space, Typography, message, Card,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, StopOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getToken } from '../lib/auth';

const { Title } = Typography;
const { TextArea } = Input;

interface MerchantItem {
  id: string;
  userId: string;
  type: string;
  name: string;
  description: string | null;
  logo: string | null;
  status: string;
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  rating: number;
  totalOrders: number;
  createdAt: string;
}

const BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchMerchants(params?: { status?: string; page?: number; pageSize?: number }): Promise<{ items: MerchantItem[]; total: number }> {
  const token = getToken();
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.page) qs.set('page', String(params.page));
  qs.set('pageSize', String(params?.pageSize ?? 50));
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/merchants?${qs}`, { headers });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

async function approveMerchant(id: string): Promise<void> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/merchants/${id}/approve`, { method: 'POST', headers });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
}

async function rejectMerchant(id: string, reason: string): Promise<void> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/merchants/${id}/reject`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
}

async function suspendMerchant(id: string): Promise<void> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/merchants/${id}/suspend`, { method: 'POST', headers });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  TEMPLE: { label: '寺庙', color: 'gold' },
  GUIDE: { label: '导游', color: 'blue' },
  HOTEL: { label: '住宿', color: 'green' },
  TRANSPORT: { label: '交通', color: 'purple' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待审核', color: 'orange' },
  ACTIVE: { label: '已上线', color: 'green' },
  SUSPENDED: { label: '已暂停', color: 'red' },
  REJECTED: { label: '已拒绝', color: 'default' },
};

export default function MerchantManagePage() {
  const [activeTab, setActiveTab] = useState('all');
  const [data, setData] = useState<MerchantItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [detailModal, setDetailModal] = useState<{ open: boolean; merchant: MerchantItem | null }>({ open: false, merchant: null });

  const loadData = useCallback(async (p: number, status?: string) => {
    try {
      setLoading(true);
      const res = await fetchMerchants({ status, page: p, pageSize: 50 });
      setData(res.items);
      setTotal(res.total);
    } catch (err) {
      message.error('加载商家数据失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const status = activeTab === 'pending' ? 'PENDING' : undefined;
    setPage(1);
    loadData(1, status);
  }, [activeTab, loadData]);

  const handleApprove = async (id: string) => {
    try {
      await approveMerchant(id);
      message.success('已通过审核');
      loadData(page, activeTab === 'pending' ? 'PENDING' : undefined);
    } catch {
      message.error('操作失败');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning('请填写拒绝原因');
      return;
    }
    try {
      await rejectMerchant(rejectModal.id, rejectReason);
      message.success('已拒绝');
      setRejectModal({ open: false, id: '' });
      setRejectReason('');
      loadData(page, activeTab === 'pending' ? 'PENDING' : undefined);
    } catch {
      message.error('操作失败');
    }
  };

  const handleSuspend = async (id: string) => {
    Modal.confirm({
      title: '确认暂停该商家?',
      content: '暂停后商家将无法在前台展示',
      onOk: async () => {
        try {
          await suspendMerchant(id);
          message.success('已暂停');
          loadData(page, activeTab === 'pending' ? 'PENDING' : undefined);
        } catch {
          message.error('操作失败');
        }
      },
    });
  };

  const columns: ColumnsType<MerchantItem> = [
    {
      title: '商家名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const cfg = TYPE_LABELS[type];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{type}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const cfg = STATUS_MAP[status];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <Tag>{status}</Tag>;
      },
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      render: (v: number) => v.toFixed(1),
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: '订单数',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      width: 90,
      sorter: (a, b) => a.totalOrders - b.totalOrders,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (v: string) => v?.slice(0, 10) ?? '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setDetailModal({ open: true, merchant: record })}
          >
            详情
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                通过
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setRejectModal({ open: true, id: record.id })}
              >
                拒绝
              </Button>
            </>
          )}
          {record.status === 'ACTIVE' && (
            <Button
              size="small"
              danger
              icon={<StopOutlined />}
              onClick={() => handleSuspend(record.id)}
            >
              暂停
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>商家管理</Title>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'all', label: '商家列表' },
          { key: 'pending', label: '商家审核' },
        ]}
      />
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            total,
            pageSize: 50,
            onChange: (p) => {
              setPage(p);
              loadData(p, activeTab === 'pending' ? 'PENDING' : undefined);
            },
          }}
          scroll={{ x: 900 }}
          size="middle"
        />
      </Card>

      {/* Reject Modal */}
      <Modal
        title="拒绝商家"
        open={rejectModal.open}
        onOk={handleReject}
        onCancel={() => { setRejectModal({ open: false, id: '' }); setRejectReason(''); }}
        okText="确认拒绝"
        okButtonProps={{ danger: true }}
      >
        <TextArea
          rows={3}
          placeholder="请填写拒绝原因..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="商家详情"
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, merchant: null })}
        footer={null}
        width={600}
      >
        {detailModal.merchant && (
          <div>
            <p><strong>名称:</strong> {detailModal.merchant.name}</p>
            <p><strong>类型:</strong> {TYPE_LABELS[detailModal.merchant.type]?.label ?? detailModal.merchant.type}</p>
            <p><strong>状态:</strong> {STATUS_MAP[detailModal.merchant.status]?.label ?? detailModal.merchant.status}</p>
            <p><strong>评分:</strong> {detailModal.merchant.rating.toFixed(1)}</p>
            <p><strong>订单数:</strong> {detailModal.merchant.totalOrders}</p>
            <p><strong>描述:</strong> {detailModal.merchant.description ?? '无'}</p>
            <p><strong>联系电话:</strong> {detailModal.merchant.contactPhone ?? '无'}</p>
            <p><strong>联系邮箱:</strong> {detailModal.merchant.contactEmail ?? '无'}</p>
            <p><strong>地址:</strong> {detailModal.merchant.address ?? '无'}</p>
            <p><strong>创建时间:</strong> {detailModal.merchant.createdAt?.slice(0, 19).replace('T', ' ')}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
