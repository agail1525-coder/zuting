import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tabs, Table, Button, Modal, Form, Input, InputNumber, Select,
  DatePicker, Tag, Space, message, Popconfirm, Typography, Card,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, StopOutlined, DeleteOutlined, ExperimentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PromotionType = 'TIME_LIMITED' | 'EARLY_BIRD' | 'FLASH_SALE';
type DiscountType = 'FIXED' | 'PERCENT';
type PromotionStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

type CouponType = 'FIXED' | 'PERCENT' | 'SHIPPING';
type CouponStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

interface Promotion {
  id: string;
  name: string;
  description?: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  startAt: string;
  endAt: string;
  usedQuota: number;
  totalQuota: number;
  status: PromotionStatus;
  coverImage?: string;
}

interface Coupon {
  id: string;
  code: string;
  name: string;
  type: CouponType;
  discountValue: number;
  minAmount?: number;
  usedCount: number;
  totalCount: number;
  startAt: string;
  endAt: string;
  status: CouponStatus;
}

interface PromotionFormValues {
  name: string;
  description?: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
  totalQuota: number;
  coverImage?: string;
}

interface CouponFormValues {
  code: string;
  name: string;
  type: CouponType;
  discountValue: number;
  minAmount?: number;
  totalCount: number;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PROMOTION_TYPE_COLOR: Record<PromotionType, string> = {
  TIME_LIMITED: 'blue',
  EARLY_BIRD: 'green',
  FLASH_SALE: 'red',
};

const PROMOTION_TYPE_LABEL: Record<PromotionType, string> = {
  TIME_LIMITED: '限时优惠',
  EARLY_BIRD: '早鸟价',
  FLASH_SALE: '闪购',
};

const PROMOTION_STATUS_COLOR: Record<PromotionStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'default',
  EXPIRED: 'red',
};

const PROMOTION_STATUS_LABEL: Record<PromotionStatus, string> = {
  ACTIVE: '进行中',
  INACTIVE: '已停用',
  EXPIRED: '已过期',
};

const COUPON_TYPE_LABEL: Record<CouponType, string> = {
  FIXED: '满减券',
  PERCENT: '折扣券',
  SHIPPING: '免运费',
};

const COUPON_STATUS_COLOR: Record<CouponStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'default',
  EXPIRED: 'red',
};

const COUPON_STATUS_LABEL: Record<CouponStatus, string> = {
  ACTIVE: '有效',
  INACTIVE: '已停用',
  EXPIRED: '已过期',
};

// ─── Promotions Tab ───────────────────────────────────────────────────────────

function PromotionsTab() {
  const navigate = useNavigate();
  const [data, setData] = useState<Promotion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Promotion | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<PromotionFormValues>();

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE}/promotions?page=${p}&limit=20`,
        { headers: getAuthHeaders() },
      );
      if (!res.ok) throw new Error('加载失败');
      const json = await res.json();
      setData(Array.isArray(json?.items) ? json.items : []);
      setTotal(json?.total ?? 0);
    } catch {
      message.error('加载促销活动失败');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchData(page); }, [fetchData, page]);

  function openCreate() {
    setEditRecord(null);
    form.resetFields();
    setModalOpen(true);
  }

  function openEdit(record: Promotion) {
    setEditRecord(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      type: record.type,
      discountType: record.discountType,
      discountValue: record.discountValue,
      minAmount: record.minAmount,
      maxDiscount: record.maxDiscount,
      dateRange: [dayjs(record.startAt), dayjs(record.endAt)],
      totalQuota: record.totalQuota,
      coverImage: record.coverImage,
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    let values: PromotionFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const [startAt, endAt] = values.dateRange;
    const body = {
      name: values.name,
      description: values.description,
      type: values.type,
      discountType: values.discountType,
      discountValue: values.discountValue,
      minAmount: values.minAmount,
      maxDiscount: values.maxDiscount,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      totalQuota: values.totalQuota,
      coverImage: values.coverImage,
    };
    try {
      const url = editRecord
        ? `${BASE}/promotions/${editRecord.id}`
        : `${BASE}/promotions`;
      const method = editRecord ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('操作失败');
      message.success(editRecord ? '更新成功' : '创建成功');
      setModalOpen(false);
      void fetchData(page);
    } catch {
      message.error('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(id: string) {
    try {
      const res = await fetch(`${BASE}/promotions/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'INACTIVE' }),
      });
      if (!res.ok) throw new Error();
      message.success('已停用');
      void fetchData(page);
    } catch {
      message.error('停用失败');
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`${BASE}/promotions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      message.success('删除成功');
      void fetchData(page);
    } catch {
      message.error('删除失败');
    }
  }

  const columns: ColumnsType<Promotion> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: PromotionType) => (
        <Tag color={PROMOTION_TYPE_COLOR[type]}>{PROMOTION_TYPE_LABEL[type] ?? type}</Tag>
      ),
    },
    {
      title: '折扣',
      key: 'discount',
      width: 100,
      render: (_: unknown, record: Promotion) =>
        record.discountType === 'PERCENT'
          ? `${record.discountValue}折`
          : `¥${record.discountValue}`,
    },
    {
      title: '开始时间',
      dataIndex: 'startAt',
      key: 'startAt',
      width: 120,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-',
    },
    {
      title: '结束时间',
      dataIndex: 'endAt',
      key: 'endAt',
      width: 120,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-',
    },
    {
      title: '配额',
      key: 'quota',
      width: 100,
      render: (_: unknown, record: Promotion) => (
        <span>
          <span style={{ color: '#D4A855', fontWeight: 600 }}>{record.usedQuota ?? 0}</span>
          <span style={{ color: '#555' }}> / {record.totalQuota ?? 0}</span>
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: PromotionStatus) => (
        <Tag color={PROMOTION_STATUS_COLOR[status]}>{PROMOTION_STATUS_LABEL[status] ?? status}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: Promotion) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<ExperimentOutlined />}
            onClick={() => navigate(`/promotions/${record.id}`)}
          >
            Studio
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            快编
          </Button>
          {record.status === 'ACTIVE' && (
            <Popconfirm
              title="确认停用此促销活动？"
              onConfirm={() => handleDeactivate(record.id)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<StopOutlined />}>
                停用
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="确认删除此促销活动？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建促销
        </Button>
      </div>

      <Table<Promotion>
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: 20,
          total,
          showSizeChanger: false,
          onChange: (p) => setPage(p),
        }}
        scroll={{ x: 900 }}
      />

      <Modal
        title={editRecord ? '编辑促销活动' : '新建促销活动'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        width={620}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="活动名称" rules={[{ required: true, message: '请输入活动名称' }]}>
            <Input placeholder="例: 春节限时特惠" maxLength={100} />
          </Form.Item>
          <Form.Item name="description" label="活动描述">
            <Input.TextArea rows={2} placeholder="活动描述（选填）" maxLength={500} />
          </Form.Item>
          <Form.Item name="type" label="活动类型" rules={[{ required: true, message: '请选择活动类型' }]}>
            <Select placeholder="选择活动类型">
              <Option value="TIME_LIMITED">限时优惠</Option>
              <Option value="EARLY_BIRD">早鸟价</Option>
              <Option value="FLASH_SALE">闪购</Option>
            </Select>
          </Form.Item>
          <Form.Item name="discountType" label="折扣类型" rules={[{ required: true, message: '请选择折扣类型' }]}>
            <Select placeholder="选择折扣类型">
              <Option value="FIXED">固定金额(满减)</Option>
              <Option value="PERCENT">折扣比例</Option>
            </Select>
          </Form.Item>
          <Form.Item name="discountValue" label="折扣值" rules={[{ required: true, message: '请输入折扣值' }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="金额(元) 或 折扣(如8.5=85折)" />
          </Form.Item>
          <Form.Item name="minAmount" label="最低消费金额(元)">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="不填则无门槛" />
          </Form.Item>
          <Form.Item name="maxDiscount" label="最高折扣金额(元)">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="仅折扣类型有效，不填则无上限" />
          </Form.Item>
          <Form.Item name="dateRange" label="活动时间" rules={[{ required: true, message: '请选择活动时间段' }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} showTime />
          </Form.Item>
          <Form.Item name="totalQuota" label="总配额(件)" rules={[{ required: true, message: '请输入总配额' }]}>
            <InputNumber min={1} precision={0} style={{ width: '100%' }} placeholder="0 = 不限制" />
          </Form.Item>
          <Form.Item name="coverImage" label="封面图URL">
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

// ─── Coupons Tab ──────────────────────────────────────────────────────────────

function CouponsTab() {
  const [data, setData] = useState<Coupon[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<CouponFormValues>();

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE}/coupons?page=${p}&limit=20`,
        { headers: getAuthHeaders() },
      );
      if (!res.ok) throw new Error('加载失败');
      const json = await res.json();
      setData(Array.isArray(json?.items) ? json.items : []);
      setTotal(json?.total ?? 0);
    } catch {
      message.error('加载优惠券失败');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchData(page); }, [fetchData, page]);

  function openCreate() {
    setEditRecord(null);
    form.resetFields();
    setModalOpen(true);
  }

  function openEdit(record: Coupon) {
    setEditRecord(record);
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      type: record.type,
      discountValue: record.discountValue,
      minAmount: record.minAmount,
      totalCount: record.totalCount,
      dateRange: [dayjs(record.startAt), dayjs(record.endAt)],
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    let values: CouponFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const [startAt, endAt] = values.dateRange;
    const body = {
      code: values.code,
      name: values.name,
      type: values.type,
      discountValue: values.discountValue,
      minAmount: values.minAmount,
      totalCount: values.totalCount,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    };
    try {
      const url = editRecord
        ? `${BASE}/coupons/${editRecord.id}`
        : `${BASE}/coupons`;
      const method = editRecord ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('操作失败');
      message.success(editRecord ? '更新成功' : '创建成功');
      setModalOpen(false);
      void fetchData(page);
    } catch {
      message.error('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(id: string) {
    try {
      const res = await fetch(`${BASE}/coupons/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'INACTIVE' }),
      });
      if (!res.ok) throw new Error();
      message.success('已停用');
      void fetchData(page);
    } catch {
      message.error('停用失败');
    }
  }

  const columns: ColumnsType<Coupon> = [
    {
      title: '券码',
      dataIndex: 'code',
      key: 'code',
      width: 130,
      render: (code: string) => (
        <span style={{ fontFamily: 'monospace', color: '#D4A855', fontWeight: 600 }}>{code}</span>
      ),
    },
    { title: '名称', dataIndex: 'name', key: 'name', ellipsis: true },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (type: CouponType) => COUPON_TYPE_LABEL[type] ?? type,
    },
    {
      title: '面值',
      key: 'value',
      width: 90,
      render: (_: unknown, record: Coupon) =>
        record.type === 'PERCENT'
          ? `${record.discountValue}折`
          : record.type === 'SHIPPING'
          ? '免运费'
          : `¥${record.discountValue}`,
    },
    {
      title: '最低消费',
      dataIndex: 'minAmount',
      key: 'minAmount',
      width: 100,
      render: (v?: number) => v != null ? `¥${v}` : '无门槛',
    },
    {
      title: '已用/总量',
      key: 'quota',
      width: 100,
      render: (_: unknown, record: Coupon) => (
        <span>
          <span style={{ color: '#D4A855', fontWeight: 600 }}>{record.usedCount ?? 0}</span>
          <span style={{ color: '#555' }}> / {record.totalCount ?? 0}</span>
        </span>
      ),
    },
    {
      title: '有效期',
      key: 'validity',
      width: 200,
      render: (_: unknown, record: Coupon) =>
        `${dayjs(record.startAt).format('MM-DD')} ~ ${dayjs(record.endAt).format('MM-DD')}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: CouponStatus) => (
        <Tag color={COUPON_STATUS_COLOR[status]}>{COUPON_STATUS_LABEL[status] ?? status}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Coupon) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            编辑
          </Button>
          {record.status === 'ACTIVE' && (
            <Popconfirm
              title="确认停用此优惠券？"
              onConfirm={() => handleDeactivate(record.id)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<StopOutlined />}>
                停用
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建优惠券
        </Button>
      </div>

      <Table<Coupon>
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: 20,
          total,
          showSizeChanger: false,
          onChange: (p) => setPage(p),
        }}
        scroll={{ x: 980 }}
      />

      <Modal
        title={editRecord ? '编辑优惠券' : '新建优惠券'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="code" label="券码" rules={[{ required: true, message: '请输入券码' }]}>
            <Input placeholder="例: SPRING2026" maxLength={32} style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item name="name" label="优惠券名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="例: 春节专属满减券" maxLength={100} />
          </Form.Item>
          <Form.Item name="type" label="券类型" rules={[{ required: true, message: '请选择券类型' }]}>
            <Select placeholder="选择类型">
              <Option value="FIXED">满减券</Option>
              <Option value="PERCENT">折扣券</Option>
              <Option value="SHIPPING">免运费券</Option>
            </Select>
          </Form.Item>
          <Form.Item name="discountValue" label="面值" rules={[{ required: true, message: '请输入面值' }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="金额(元) 或 折扣值(如8.5)" />
          </Form.Item>
          <Form.Item name="minAmount" label="最低消费(元)">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="不填则无门槛" />
          </Form.Item>
          <Form.Item name="totalCount" label="发放总量" rules={[{ required: true, message: '请输入发放总量' }]}>
            <InputNumber min={1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="dateRange" label="有效期" rules={[{ required: true, message: '请选择有效期' }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PromotionManagePage() {
  return (
    <div>
      <Title level={3} style={{ color: '#D4A855', marginBottom: 24 }}>
        促销管理
      </Title>
      <Card styles={{ body: { padding: 0 } }}>
        <Tabs
          defaultActiveKey="promotions"
          style={{ padding: '0 16px' }}
          items={[
            {
              key: 'promotions',
              label: '促销活动',
              children: (
                <div style={{ padding: '16px 0' }}>
                  <PromotionsTab />
                </div>
              ),
            },
            {
              key: 'coupons',
              label: '优惠券',
              children: (
                <div style={{ padding: '16px 0' }}>
                  <CouponsTab />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
