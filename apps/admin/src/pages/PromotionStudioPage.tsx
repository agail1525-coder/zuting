import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, InputNumber, Switch, Button, Space, Typography,
  Tabs, Spin, message, Row, Col, Drawer, Tag, Select, DatePicker,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, ThunderboltOutlined, HistoryOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getPromotionDetail, patchPromotion } from '../lib/m40';
import MediaPicker from '../components/media/MediaPicker';
import AuditTimeline from '../components/audit/AuditTimeline';
import AiAssistantDrawer from '../components/ai/AiAssistantDrawer';

const { Title, Text } = Typography;

const TYPE_OPTIONS = [
  { value: 'TIME_LIMITED', label: '限时折扣' },
  { value: 'EARLY_BIRD', label: '早鸟价' },
  { value: 'FLASH_SALE', label: '闪购' },
];
const DISCOUNT_OPTIONS = [
  { value: 'FIXED', label: '固定金额(分)' },
  { value: 'PERCENT', label: '百分比 (1-100)' },
];
const ENTITY_OPTIONS = [
  { value: 'ALL', label: '全平台' },
  { value: 'TRIP', label: '行程' },
  { value: 'ROUTE', label: '路线' },
];

export default function PromotionStudioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [raw, setRaw] = useState<Record<string, unknown>>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getPromotionDetail(id);
      setRaw(data);
      form.setFieldsValue({
        name: data.name, description: data.description,
        type: data.type, discountType: data.discountType, discountValue: data.discountValue,
        minAmount: data.minAmount, maxDiscount: data.maxDiscount,
        entityType: data.entityType || 'ALL',
        entityIds: Array.isArray(data.entityIds) ? (data.entityIds as string[]).join(',') : '',
        totalQuota: data.totalQuota, coverImage: data.coverImage,
        isActive: data.isActive,
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
      const entityIds = typeof v.entityIds === 'string'
        ? v.entityIds.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      await patchPromotion(id, {
        name: v.name, description: v.description ?? null,
        type: v.type, discountType: v.discountType, discountValue: v.discountValue,
        minAmount: v.minAmount ?? null, maxDiscount: v.maxDiscount ?? null,
        entityType: v.entityType, entityIds, totalQuota: v.totalQuota,
        coverImage: v.coverImage ?? null, isActive: v.isActive,
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

  const used = Number(raw.usedQuota ?? 0);
  const total = Number(raw.totalQuota ?? 0);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/promotions')}>返回列表</Button>
        <Title level={4} style={{ margin: 0, color: '#D4A855' }}>
          促销活动 Studio — {String(raw.name ?? '')}
        </Title>
        <Tag color={raw.isActive ? 'green' : 'default'}>{raw.isActive ? '进行中' : '已停用'}</Tag>
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
                      <Form.Item name="name" label="活动名称" rules={[{ required: true }]}><Input /></Form.Item>
                      <Form.Item
                        name="description"
                        label={<Space>描述<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => setAiOpen(true)}>AI 起草</Button></Space>}
                      >
                        <Input.TextArea rows={4} />
                      </Form.Item>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
                            <Select options={TYPE_OPTIONS} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="discountType" label="折扣类型" rules={[{ required: true }]}>
                            <Select options={DISCOUNT_OPTIONS} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="discountValue" label="折扣值" rules={[{ required: true }]}>
                            <InputNumber min={1} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="isActive" label="启用" valuePropName="checked">
                        <Switch checkedChildren="启用" unCheckedChildren="停用" />
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: 'rules', label: '适用与配额',
                  children: (
                    <>
                      <Row gutter={16}>
                        <Col span={12}><Form.Item name="minAmount" label="最低消费(分)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="maxDiscount" label="最大折扣(分)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item name="entityType" label="适用范围"><Select options={ENTITY_OPTIONS} /></Form.Item>
                        </Col>
                        <Col span={16}>
                          <Form.Item name="entityIds" label="实体 ID (逗号分隔, 空=全部)"><Input /></Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="totalQuota" label="总配额 (0=无限)">
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item name="range" label="活动期" rules={[{ required: true }]}>
                        <DatePicker.RangePicker showTime style={{ width: '100%' }} />
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: 'media', label: '媒体',
                  children: <Form.Item name="coverImage" label="活动封面图"><MediaPicker /></Form.Item>,
                },
              ]} />
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="配额统计" size="small" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size={4}>
              <Text>已使用: <Text strong>{used}</Text></Text>
              <Text>总配额: <Text strong>{total === 0 ? '无限' : total}</Text></Text>
              <Text type="secondary">
                使用率: {total === 0 ? '-' : `${Math.round((used / total) * 100)}%`}
              </Text>
            </Space>
          </Card>
          <Card title="元数据" size="small">
            <Space direction="vertical" size={4}>
              <Text type="secondary">ID: <Text code>{id}</Text></Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Drawer open={auditOpen} title="变更历史" width={560} onClose={() => setAuditOpen(false)} destroyOnClose>
        {id && <AuditTimeline resource="promotion" resourceId={id} />}
      </Drawer>

      <AiAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} resource="promotion"
        resourceId={id ?? ''} fieldName="description" initialText={String(form.getFieldValue('description') ?? '')}
        onApplyText={(text) => { form.setFieldsValue({ description: text }); setAiOpen(false); message.success('已应用 AI 文本'); }} />
    </div>
  );
}
