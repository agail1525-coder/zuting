import { useState, useEffect, useCallback } from 'react';
import {
  Tabs,
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  Tag,
  Typography,
  message,
  Popconfirm,
  Row,
  Col,
  Checkbox,
  Divider,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  CrownOutlined,
  GiftOutlined,
  TeamOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('zuting_admin_token');
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface MemberUser {
  id: string;
  nickname: string;
  email: string;
  memberLevel: string;
  totalPoints: number;
  availablePoints: number;
  createdAt: string;
}

interface PointsProduct {
  id: string;
  name: string;
  category: string;
  pointsPrice: number;
  stock: number;
  soldCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

interface Distributor {
  id: string;
  userId: string;
  nickname: string;
  inviteCode: string;
  totalInvites: number;
  totalEarnings: number;
}

interface Package {
  id: string;
  name: string;
  type: string;
  basePrice: number;
  memberPrice: number;
  duration: number;
  maxPeople: number;
  status: 'ACTIVE' | 'INACTIVE';
  includes: string[];
}

const LEVEL_COLORS: Record<string, string> = {
  LV1: 'default',
  LV2: 'blue',
  LV3: 'purple',
  LV4: 'gold',
  LV5: 'red',
};

const INCLUDES_OPTIONS = [
  { label: '住宿', value: 'accommodation' },
  { label: '交通', value: 'transport' },
  { label: '导游', value: 'guide' },
  { label: '餐饮', value: 'meals' },
];

// ─── Tab 1: 会员管理 ──────────────────────────────────────────────────────────

function MembersTab() {
  const [data, setData] = useState<MemberUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [adjustTarget, setAdjustTarget] = useState<MemberUser | null>(null);
  const [adjustForm] = Form.useForm<{ delta: number; reason: string }>();

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/members?page=${p}&limit=20`);
      setData(Array.isArray(res?.items) ? res.items : []);
      setTotal(res?.total ?? 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [load, page]);

  async function handleAdjust(values: { delta: number; reason: string }) {
    if (!adjustTarget) return;
    try {
      await apiFetch(`/members/${adjustTarget.id}/points`, {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      message.success('积分调整成功');
      setAdjustTarget(null);
      adjustForm.resetFields();
      load(page);
    } catch {
      message.error('积分调整失败');
    }
  }

  const columns: ColumnsType<MemberUser> = [
    {
      title: '用户',
      key: 'user',
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{r.nickname || '—'}</span>
          <span style={{ color: '#888', fontSize: 12 }}>{r.email}</span>
        </Space>
      ),
    },
    {
      title: '等级',
      dataIndex: 'memberLevel',
      key: 'memberLevel',
      render: (v: string) => (
        <Tag color={LEVEL_COLORS[v] || 'default'}>{v || 'LV1'}</Tag>
      ),
    },
    {
      title: '总积分',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      render: (v: number) => (v ?? 0).toLocaleString(),
      sorter: (a, b) => (a.totalPoints ?? 0) - (b.totalPoints ?? 0),
    },
    {
      title: '可用积分',
      dataIndex: 'availablePoints',
      key: 'availablePoints',
      render: (v: number) => (
        <span style={{ fontWeight: 600 }}>
          {(v ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => v ? new Date(v).toLocaleDateString('zh-CN') : '—',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, r) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => { setAdjustTarget(r); adjustForm.resetFields(); }}
        >
          调整积分
        </Button>
      ),
    },
  ];

  return (
    <>
      <Table<MemberUser>
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: (p) => setPage(p),
          showTotal: (t) => `共 ${t} 条`,
        }}
      />

      <Modal
        title={`调整积分 — ${adjustTarget?.nickname ?? ''}`}
        open={!!adjustTarget}
        onCancel={() => setAdjustTarget(null)}
        onOk={() => adjustForm.submit()}
        okText="确认调整"
      >
        <Form form={adjustForm} layout="vertical" onFinish={handleAdjust}>
          <Form.Item
            label="调整数量（正数增加，负数扣除）"
            name="delta"
            rules={[{ required: true, message: '请输入调整数量' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="调整原因"
            name="reason"
            rules={[{ required: true, message: '请填写原因' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

// ─── Tab 2: 积分商城 ──────────────────────────────────────────────────────────

function PointsShopTab() {
  const [data, setData] = useState<PointsProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PointsProduct | null>(null);
  const [form] = Form.useForm<Omit<PointsProduct, 'id' | 'soldCount'>>();

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/points-products?page=${p}&limit=20`);
      setData(Array.isArray(res?.items) ? res.items : []);
      setTotal(res?.total ?? 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [load, page]);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  }

  function openEdit(r: PointsProduct) {
    setEditing(r);
    form.setFieldsValue(r);
    setModalOpen(true);
  }

  async function handleSubmit(values: Omit<PointsProduct, 'id' | 'soldCount'>) {
    try {
      if (editing) {
        await apiFetch(`/points-products/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(values),
        });
        message.success('更新成功');
      } else {
        await apiFetch('/points-products', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        message.success('创建成功');
      }
      setModalOpen(false);
      load(page);
    } catch {
      message.error(editing ? '更新失败' : '创建失败');
    }
  }

  async function toggleStatus(r: PointsProduct) {
    const newStatus = r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiFetch(`/points-products/${r.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      message.success(newStatus === 'ACTIVE' ? '已上架' : '已下架');
      load(page);
    } catch {
      message.error('操作失败');
    }
  }

  const columns: ColumnsType<PointsProduct> = [
    { title: '商品名', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    {
      title: '积分价',
      dataIndex: 'pointsPrice',
      key: 'pointsPrice',
      render: (v: number) => (
        <span style={{ fontWeight: 600 }}>{(v ?? 0).toLocaleString()} 积分</span>
      ),
    },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
    {
      title: '已售',
      dataIndex: 'soldCount',
      key: 'soldCount',
      render: (v: number) => (v ?? 0).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => (
        <Tag color={v === 'ACTIVE' ? 'green' : 'default'}>
          {v === 'ACTIVE' ? '上架中' : '已下架'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
          <Button
            size="small"
            type={r.status === 'ACTIVE' ? 'default' : 'primary'}
            onClick={() => toggleStatus(r)}
          >
            {r.status === 'ACTIVE' ? '下架' : '上架'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建商品
        </Button>
      </div>
      <Table<PointsProduct>
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: (p) => setPage(p),
          showTotal: (t) => `共 ${t} 条`,
        }}
      />

      <Modal
        title={editing ? '编辑商品' : '新建商品'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editing ? '保存' : '创建'}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="商品名" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="分类" name="category" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: '实物', label: '实物' },
                    { value: '虚拟', label: '虚拟' },
                    { value: '服务', label: '服务' },
                    { value: '优惠券', label: '优惠券' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="积分价" name="pointsPrice" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="库存" name="stock" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="状态" name="status" initialValue="ACTIVE">
                <Select
                  options={[
                    { value: 'ACTIVE', label: '上架' },
                    { value: 'INACTIVE', label: '下架' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}

// ─── Tab 3: 分销管理 ──────────────────────────────────────────────────────────

interface TeamMember {
  id: string;
  nickname: string;
  joinedAt: string;
}

function DistributionTab() {
  const [data, setData] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [teamTarget, setTeamTarget] = useState<Distributor | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/referral/admin/distributors?page=${p}&limit=20`);
      setData(Array.isArray(res?.items) ? res.items : []);
      setTotal(res?.total ?? 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [load, page]);

  async function openTeam(r: Distributor) {
    setTeamTarget(r);
    setTeamLoading(true);
    try {
      const res = await apiFetch(`/referral/admin/distributors/${r.userId}/team`);
      setTeamMembers(Array.isArray(res?.items) ? res.items : []);
    } catch {
      setTeamMembers([]);
    } finally {
      setTeamLoading(false);
    }
  }

  const columns: ColumnsType<Distributor> = [
    {
      title: '用户',
      key: 'user',
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{r.nickname || r.userId}</span>
        </Space>
      ),
    },
    {
      title: '邀请码',
      dataIndex: 'inviteCode',
      key: 'inviteCode',
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '总邀请人数',
      dataIndex: 'totalInvites',
      key: 'totalInvites',
      render: (v: number) => (v ?? 0).toLocaleString(),
      sorter: (a, b) => (a.totalInvites ?? 0) - (b.totalInvites ?? 0),
    },
    {
      title: '总收益（元）',
      dataIndex: 'totalEarnings',
      key: 'totalEarnings',
      render: (v: number) => (
        <span style={{ color: '#52C41A', fontWeight: 600 }}>
          ¥{((v ?? 0) / 100).toFixed(2)}
        </span>
      ),
      sorter: (a, b) => (a.totalEarnings ?? 0) - (b.totalEarnings ?? 0),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => openTeam(r)}>
          查看团队
        </Button>
      ),
    },
  ];

  const teamColumns: ColumnsType<TeamMember> = [
    { title: '成员', dataIndex: 'nickname', key: 'nickname' },
    {
      title: '加入时间',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (v: string) => v ? new Date(v).toLocaleDateString('zh-CN') : '—',
    },
  ];

  return (
    <>
      <Table<Distributor>
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: (p) => setPage(p),
          showTotal: (t) => `共 ${t} 条`,
        }}
      />

      <Modal
        title={`${teamTarget?.nickname ?? ''} 的邀请团队`}
        open={!!teamTarget}
        onCancel={() => setTeamTarget(null)}
        footer={null}
        width={560}
      >
        <Table<TeamMember>
          dataSource={teamMembers}
          columns={teamColumns}
          rowKey="id"
          loading={teamLoading}
          size="small"
          pagination={false}
          locale={{ emptyText: '暂无团队成员' }}
        />
      </Modal>
    </>
  );
}

// ─── Tab 4: 套餐管理 ──────────────────────────────────────────────────────────

function PackagesTab() {
  const [data, setData] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [form] = Form.useForm<Omit<Package, 'id'>>();

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/packages?page=${p}&limit=20`);
      setData(Array.isArray(res?.items) ? res.items : []);
      setTotal(res?.total ?? 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [load, page]);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  }

  function openEdit(r: Package) {
    setEditing(r);
    form.setFieldsValue({ ...r });
    setModalOpen(true);
  }

  async function handleSubmit(values: Omit<Package, 'id'>) {
    try {
      if (editing) {
        await apiFetch(`/packages/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(values),
        });
        message.success('更新成功');
      } else {
        await apiFetch('/packages', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        message.success('创建成功');
      }
      setModalOpen(false);
      load(page);
    } catch {
      message.error(editing ? '更新失败' : '创建失败');
    }
  }

  async function handleToggle(r: Package) {
    const newStatus = r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiFetch(`/packages/${r.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      message.success(newStatus === 'ACTIVE' ? '已上架' : '已下架');
      load(page);
    } catch {
      message.error('操作失败');
    }
  }

  const columns: ColumnsType<Package> = [
    { title: '名称', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type' },
    {
      title: '基础价',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (v: number) => `¥${((v ?? 0) / 100).toFixed(0)}`,
    },
    {
      title: '会员价',
      dataIndex: 'memberPrice',
      key: 'memberPrice',
      render: (v: number) => (
        <span style={{ fontWeight: 600 }}>
          ¥{((v ?? 0) / 100).toFixed(0)}
        </span>
      ),
    },
    {
      title: '时长(天)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: '人数上限',
      dataIndex: 'maxPeople',
      key: 'maxPeople',
    },
    {
      title: '含项',
      dataIndex: 'includes',
      key: 'includes',
      render: (v: string[]) =>
        Array.isArray(v)
          ? v.map((inc) => (
              <Tag key={inc} color="cyan" style={{ marginBottom: 2 }}>
                {INCLUDES_OPTIONS.find((o) => o.value === inc)?.label ?? inc}
              </Tag>
            ))
          : '—',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => (
        <Tag color={v === 'ACTIVE' ? 'green' : 'default'}>
          {v === 'ACTIVE' ? '上架中' : '已下架'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
          <Popconfirm
            title={r.status === 'ACTIVE' ? '确认下架？' : '确认上架？'}
            onConfirm={() => handleToggle(r)}
          >
            <Button size="small" type={r.status === 'ACTIVE' ? 'default' : 'primary'}>
              {r.status === 'ACTIVE' ? '下架' : '上架'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建套餐
        </Button>
      </div>
      <Table<Package>
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: (p) => setPage(p),
          showTotal: (t) => `共 ${t} 条`,
        }}
      />

      <Modal
        title={editing ? '编辑套餐' : '新建套餐'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editing ? '保存' : '创建'}
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={12}>
            <Col span={16}>
              <Form.Item label="套餐名称" name="name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="类型" name="type" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: '文化之旅', label: '文化之旅' },
                    { value: '文化探索', label: '文化探索' },
                    { value: '家庭套餐', label: '家庭套餐' },
                    { value: '定制团', label: '定制团' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="基础价（分）" name="basePrice" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="会员价（分）" name="memberPrice" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="时长（天）" name="duration" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="人数上限" name="maxPeople" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="包含项目" name="includes" initialValue={[]}>
            <Checkbox.Group options={INCLUDES_OPTIONS} />
          </Form.Item>
          <Divider style={{ margin: '8px 0 16px' }} />
          <Form.Item label="状态" name="status" initialValue="ACTIVE">
            <Switch
              checkedChildren="上架"
              unCheckedChildren="下架"
              defaultChecked
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const { Title } = Typography;

const TAB_ITEMS = [
  {
    key: 'members',
    label: (
      <span>
        <CrownOutlined />
        会员管理
      </span>
    ),
    children: <MembersTab />,
  },
  {
    key: 'points-shop',
    label: (
      <span>
        <GiftOutlined />
        积分商城
      </span>
    ),
    children: <PointsShopTab />,
  },
  {
    key: 'distribution',
    label: (
      <span>
        <TeamOutlined />
        分销管理
      </span>
    ),
    children: <DistributionTab />,
  },
  {
    key: 'packages',
    label: (
      <span>
        <ShoppingOutlined />
        套餐管理
      </span>
    ),
    children: <PackagesTab />,
  },
];

export default function MembershipManagePage() {
  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        <CrownOutlined style={{ marginRight: 8 }} />
        会员管理
      </Title>
      <Card styles={{ body: { padding: 0 } }}>
        <Tabs
          defaultActiveKey="members"
          items={TAB_ITEMS}
          style={{ padding: '0 16px' }}
          tabBarStyle={{ marginBottom: 16 }}
        />
      </Card>
    </div>
  );
}
