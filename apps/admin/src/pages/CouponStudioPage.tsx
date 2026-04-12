import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, InputNumber, Switch, Button, Space, Typography,
  Tabs, Spin, message, Row, Col, Drawer, Tag, Select, DatePicker,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, HistoryOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getCouponDetail, patchCoupon } from '../lib/m40';
import AuditTimeline from '../components/audit/AuditTimeline';

const { Title, Text } = Typography;

const TYPE_OPTIONS = [
  { value: 'FIXED', label: '固定金额' },
  { value: 'PERCENT', label: '百分比折扣' },
];

export default function CouponStudioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [raw, setRaw] = useState<Record<string, unknown>>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getCouponDetail(id);
      setRaw(data);
      form.setFieldsValue({
        code: data.code, name: data.name, type: data.type,
        value: data.value, minAmount: data.minAmount, maxDiscount: data.maxDiscount,
        totalCount: data.totalCount, isActive: data.isActive,
        range: data.startAt && data.endAt
          ? [dayjs(data.startAt as string), dayjs(data.endAt as string)]
          : undefined,
      });
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [id, form]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!id) return;
    try {
      const v = await form.validateFields();
      setSaving(true);
      const [startAt, endAt] = v.range ?? [];
      await patchCoupon(id, {
        code: v.code, name: v.name, type: v.type, value: v.value,
        minAmount: v.minAmount ?? null, maxDiscount: v.maxDiscount ?? null,
        totalCount: v.totalCount, isActive: v.isActive,
        startAt: startAt?.toISOString(), endAt: endAt?.toISOString(),
      });
      message.success('保存成功');
      load();
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  const usedCount = Number(raw.usedCount ?? 0);
  const totalCount = Number(raw.totalCount ?? 0);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/coupons')}>返回列表</Button>
        <Title level={4} style={{ margin: 0 }}>
          优惠券 Studio — {String(raw.name ?? '')}
        </Title>
        <Tag color={raw.isActive ? 'green' : 'default'}>{raw.isActive ? '生效中' : '已停用'}</Tag>
      </Space>

      <Row gutter={24}>
        <Col span={16}>
          <Card
            extra={
              <Space>
                <Button icon={<HistoryOutlined />} onClick={() => setAuditOpen(true)}>变更历史</Button>
                <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={save}>保存</Button>
              </Space>
            }
          >
            <Form form={form} layout="vertical">
              <Tabs items={[
                {
                  key: 'basic', label: '基础',
                  children: (
                    <>
                      <Row gutter={16}>
                        <Col span={12}><Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="code" label="代码" rules={[{ required: true }]}><Input /></Form.Item></Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
                            <Select options={TYPE_OPTIONS} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="value" label="值 (固定:分 / 百分比:1-100)" rules={[{ required: true }]}>
                            <InputNumber min={1} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="isActive" label="是否启用" valuePropName="checked">
                            <Switch checkedChildren="启用" unCheckedChildren="停用" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  ),
                },
                {
                  key: 'rules', label: '使用规则',
                  children: (
                    <>
                      <Row gutter={16}>
                        <Col span={12}><Form.Item name="minAmount" label="最低消费(分)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="maxDiscount" label="最大折扣(分, 仅百分比券)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                      </Row>
                      <Form.Item name="totalCount" label="发行总量 (0=无限)">
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item name="range" label="有效期" rules={[{ required: true }]}>
                        <DatePicker.RangePicker showTime style={{ width: '100%' }} />
                      </Form.Item>
                    </>
                  ),
                },
              ]} />
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="使用统计" size="small" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size={4}>
              <Text>已使用: <Text strong>{usedCount}</Text></Text>
              <Text>总量: <Text strong>{totalCount === 0 ? '无限' : totalCount}</Text></Text>
              <Text type="secondary">
                使用率: {totalCount === 0 ? '-' : `${Math.round((usedCount / totalCount) * 100)}%`}
              </Text>
            </Space>
          </Card>
          <Card title="元数据" size="small">
            <Space direction="vertical" size={4}>
              <Text type="secondary">ID: <Text code>{id}</Text></Text>
              <Text type="secondary">代码: <Text code>{String(raw.code ?? '')}</Text></Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Drawer open={auditOpen} title="变更历史" width={560} onClose={() => setAuditOpen(false)} destroyOnClose>
        {id && <AuditTimeline resource="coupon" resourceId={id} />}
      </Drawer>
    </div>
  );
}
