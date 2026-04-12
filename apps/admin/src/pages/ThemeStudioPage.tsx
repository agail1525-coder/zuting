import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, InputNumber, Button, Space, Typography,
  Tabs, Spin, message, Row, Col, Drawer, Tag, Switch,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, ThunderboltOutlined, HistoryOutlined,
} from '@ant-design/icons';
import {
  teamCultureTheme, personalGrowthTheme, familyHarmonyTheme, type ThemeRecord,
} from '../lib/m40';
import MediaPicker from '../components/media/MediaPicker';
import AuditTimeline from '../components/audit/AuditTimeline';
import AiAssistantDrawer from '../components/ai/AiAssistantDrawer';

const { Title, Text } = Typography;

type ThemeKind = 'team-culture' | 'personal-growth' | 'family-harmony';

const CONFIG: Record<ThemeKind, { label: string; backTo: string; api: typeof teamCultureTheme; color: string }> = {
  'team-culture': { label: '团队文化', backTo: '/team-culture', api: teamCultureTheme, color: '#3264ff' },
  'personal-growth': { label: '个人圆满', backTo: '/cultivation', api: personalGrowthTheme, color: '#8B6914' },
  'family-harmony': { label: '家庭幸福', backTo: '/cultivation', api: familyHarmonyTheme, color: '#2D8B6F' },
};

export default function ThemeStudioPage({ kind }: { kind: ThemeKind }) {
  const cfg = CONFIG[kind];
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [raw, setRaw] = useState<ThemeRecord | null>(null);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const data = await cfg.api.get(slug);
      setRaw(data);
      form.setFieldsValue({
        slug: data.slug, title: data.title, subtitle: data.subtitle ?? '',
        description: data.description, color: data.color, icon: data.icon ?? '',
        coverUrl: data.coverUrl ?? '',
        keywords: Array.isArray(data.keywords) ? data.keywords.join(',') : '',
        holySites: Array.isArray(data.holySites) ? data.holySites.join(',') : '',
        routes: Array.isArray(data.routes) ? data.routes.join(',') : '',
        priceFrom: data.priceFrom ?? undefined,
        durationDays: data.durationDays ?? undefined,
        sortOrder: data.sortOrder ?? 0,
        isPublished: data.isPublished ?? true,
      });
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [slug, form, cfg]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!slug) return;
    try {
      const v = await form.validateFields();
      setSaving(true);
      const toArr = (s: unknown): string[] =>
        typeof s === 'string' ? s.split(',').map((x) => x.trim()).filter(Boolean) : [];
      await cfg.api.upsert({
        slug: v.slug, title: v.title, subtitle: v.subtitle || undefined,
        description: v.description, color: v.color, icon: v.icon || undefined,
        coverUrl: v.coverUrl || undefined,
        keywords: toArr(v.keywords), holySites: toArr(v.holySites), routes: toArr(v.routes),
        priceFrom: v.priceFrom, durationDays: v.durationDays,
        sortOrder: v.sortOrder ?? 0, isPublished: v.isPublished ?? true,
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

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(cfg.backTo)}>返回</Button>
        <Title level={4} style={{ margin: 0, color: cfg.color }}>
          {cfg.label} Studio — {String(raw?.title ?? '')}
        </Title>
        <Tag color={raw?.isPublished ? 'green' : 'default'}>{raw?.isPublished ? '已发布' : '草稿'}</Tag>
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
                        <Col span={12}><Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="slug" label="Slug" rules={[{ required: true }]}><Input disabled /></Form.Item></Col>
                      </Row>
                      <Form.Item name="subtitle" label="副标题"><Input /></Form.Item>
                      <Row gutter={16}>
                        <Col span={6}><Form.Item name="color" label="主题色" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={6}><Form.Item name="icon" label="图标"><Input /></Form.Item></Col>
                        <Col span={6}><Form.Item name="priceFrom" label="起价"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={6}><Form.Item name="durationDays" label="天数"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}><Form.Item name="sortOrder" label="排序"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="isPublished" label="发布" valuePropName="checked"><Switch /></Form.Item></Col>
                      </Row>
                    </>
                  ),
                },
                {
                  key: 'desc', label: '描述',
                  children: (
                    <Form.Item
                      name="description"
                      label={<Space>主题描述<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => setAiOpen(true)}>AI 生成</Button></Space>}
                      rules={[{ required: true }]}
                    >
                      <Input.TextArea rows={12} />
                    </Form.Item>
                  ),
                },
                {
                  key: 'links', label: '关联',
                  children: (
                    <>
                      <Form.Item name="keywords" label="关键词 (逗号分隔)"><Input /></Form.Item>
                      <Form.Item name="holySites" label="关联圣地 Slug (逗号分隔)"><Input /></Form.Item>
                      <Form.Item name="routes" label="关联路线 Slug (逗号分隔)"><Input /></Form.Item>
                    </>
                  ),
                },
                {
                  key: 'media', label: '媒体',
                  children: <Form.Item name="coverUrl" label="封面图"><MediaPicker /></Form.Item>,
                },
              ]} />
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="元数据" size="small">
            <Space direction="vertical" size={4}>
              <Text type="secondary">ID: <Text code>{raw?.id ?? '-'}</Text></Text>
              <Text type="secondary">Slug: <Text code>{slug}</Text></Text>
              <Text type="secondary">类型: {cfg.label}</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Drawer open={auditOpen} title="变更历史" width={560} onClose={() => setAuditOpen(false)} destroyOnClose>
        {raw?.id && <AuditTimeline resource={`${kind}-theme`} resourceId={raw.id} />}
      </Drawer>

      <AiAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} resource={`${kind}-theme`}
        resourceId={raw?.id ?? ''} fieldName="description" initialText={String(form.getFieldValue('description') ?? '')}
        onApplyText={(text) => { form.setFieldsValue({ description: text }); setAiOpen(false); message.success('已应用 AI 文本'); }} />
    </div>
  );
}
