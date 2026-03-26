import { useEffect, useState, useCallback } from 'react';
import {
  Table, Card, Typography, Tag, Button, Space, Modal, Form,
  Input, InputNumber, Select, DatePicker, Popconfirm, message, Switch,
} from 'antd';
import { PlusOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getCoupons, createCoupon, updateCoupon, deactivateCoupon } from '../lib/api';
import type { Coupon, CreateCouponDto } from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function CouponsPage() {
  const [data, setData] = useState<Coupon[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback((p = page) => {
    setLoading(true);
    getCoupons(p)
      .then((res) => {
        setData(Array.isArray(res.data) ? res.data : []);
        setTotal(res.total ?? 0);
      })
      .catch((err: unknown) => {
        message.error('加载优惠券失败: ' + (err instanceof Error ? err.message : '网络错误'));
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(page); }, [page, load]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Coupon) => {
    setEditing(record);
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      type: record.type,
      value: record.value,
      minAmount: record.minAmount ?? undefined,
      maxDiscount: record.maxDiscount ?? undefined,
      totalCount: record.totalCount,
      dateRange: [dayjs(record.startAt), dayjs(record.endAt)],
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const [startAt, endAt] = values.dateRange;
      const dto: CreateCouponDto = {
        code: values.code,
        name: values.name,
        type: values.type,
        value: values.value,
        minAmount: values.minAmount ?? undefined,
        maxDiscount: values.maxDiscount ?? undefined,
        totalCount: values.totalCount ?? 0,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      };

      if (editing) {
        await updateCoupon(editing.id, dto);
        message.success('优惠券已更新');
      } else {
        await createCoupon(dto);
        message.success('优惠券已创建');
      }

      setModalOpen(false);
      form.resetFields();
      load(page);
    } catch (err: unknown) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateCoupon(id);
      message.success('优惠券已停用');
      load(page);
    } catch {
      message.error('停用失败');
    }
  };

  const columns: ColumnsType<Coupon> = [
    {
      title: '优惠券码',
      dataIndex: 'code',
      key: 'code',
      render: (v: string) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{v}</span>,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (v: string) => (
        <Tag color={v === 'PERCENT' ? 'blue' : 'green'}>
          {v === 'PERCENT' ? '百分比' : '固定金额'}
        </Tag>
      ),
    },
    {
      title: '折扣值',
      dataIndex: 'value',
      key: 'value',
      width: 100,
      render: (v: number, r: Coupon) =>
        r.type === 'PERCENT'
          ? <span style={{ color: '#D4A855', fontWeight: 600 }}>{v}%</span>
          : <span style={{ color: '#D4A855', fontWeight: 600 }}>¥{(v / 100).toFixed(2)}</span>,
    },
    {
      title: '最低消费',
      dataIndex: 'minAmount',
      key: 'minAmount',
      width: 100,
      render: (v: number | null) => v != null ? `¥${(v / 100).toFixed(2)}` : '-',
    },
    {
      title: '使用量/上限',
      key: 'usage',
      width: 110,
      render: (_: unknown, r: Coupon) => {
        const used = r._count?.usages ?? r.usedCount ?? 0;
        const limit = r.totalCount || '∞';
        return `${used} / ${limit}`;
      },
    },
    {
      title: '有效期',
      key: 'period',
      width: 200,
      render: (_: unknown, r: Coupon) =>
        `${dayjs(r.startAt).format('MM-DD')} ~ ${dayjs(r.endAt).format('MM-DD')}`,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (v: boolean) => (
        <Tag color={v ? 'success' : 'default'}>{v ? '启用' : '停用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: Coupon) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          {record.isActive && (
            <Popconfirm
              title="确认停用此优惠券?"
              description="停用后用户将无法使用此优惠券"
              onConfirm={() => handleDeactivate(record.id)}
              okText="确认停用"
              cancelText="取消"
              okButtonProps={{ danger: true }}
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

  const typeValue = Form.useWatch('type', form);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ color: '#D4A855', margin: 0 }}>
          优惠券管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增优惠券
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: '暂无优惠券' }}
          pagination={{
            current: page,
            total,
            pageSize: 20,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p) => setPage(p),
          }}
          size="middle"
        />
      </Card>

      <Modal
        title={editing ? '编辑优惠券' : '新增优惠券'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText={editing ? '保存' : '创建'}
        cancelText="取消"
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="code" label="优惠券码" rules={[{ required: true, message: '请输入优惠券码' }]}>
            <Input placeholder="如: SPRING2026" style={{ textTransform: 'uppercase' }} disabled={!!editing} />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如: 春季朝圣优惠" />
          </Form.Item>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]} initialValue="FIXED">
              <Select style={{ width: 140 }}>
                <Select.Option value="FIXED">固定金额</Select.Option>
                <Select.Option value="PERCENT">百分比</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="value"
              label={typeValue === 'PERCENT' ? '折扣百分比 (1-100)' : '折扣金额 (分)'}
              rules={[{ required: true, message: '请输入折扣值' }]}
            >
              <InputNumber
                min={1}
                max={typeValue === 'PERCENT' ? 100 : undefined}
                style={{ width: 160 }}
                placeholder={typeValue === 'PERCENT' ? '如: 15' : '如: 1000'}
              />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="minAmount" label="最低消费 (分)">
              <InputNumber min={0} style={{ width: 160 }} placeholder="如: 10000" />
            </Form.Item>
            {typeValue === 'PERCENT' && (
              <Form.Item name="maxDiscount" label="最大折扣 (分)">
                <InputNumber min={0} style={{ width: 160 }} placeholder="如: 5000" />
              </Form.Item>
            )}
          </Space>
          <Form.Item name="totalCount" label="发行总量 (0=无限)" initialValue={0}>
            <InputNumber min={0} style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="dateRange" label="有效期" rules={[{ required: true, message: '请选择有效期' }]}>
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
