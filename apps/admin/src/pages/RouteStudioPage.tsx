import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, InputNumber, Switch, Button, Space, Typography,
  Tabs, Spin, message, Row, Col, Drawer, Tag, Select,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, ThunderboltOutlined, HistoryOutlined,
} from '@ant-design/icons';
import { getRouteDetail, patchRoute } from '../lib/m40';
import GalleryEditor from '../components/media/GalleryEditor';
import MediaPicker from '../components/media/MediaPicker';
import AuditTimeline from '../components/audit/AuditTimeline';
import AiAssistantDrawer from '../components/ai/AiAssistantDrawer';

const { Title, Text } = Typography;

const CATEGORY_OPTIONS = [
  { value: 'ZEN', label: '禅宗' },
  { value: 'BUDDHIST', label: '佛教' },
  { value: 'TAOIST', label: '道教' },
  { value: 'CHRISTIAN', label: '基督' },
  { value: 'ISLAMIC', label: '伊斯兰' },
  { value: 'CROSS_CULTURAL', label: '跨文化' },
  { value: 'HINDU', label: '印度教' },
  { value: 'JEWISH', label: '犹太教' },
  { value: 'CULTURAL_HERITAGE', label: '文化遗产' },
];
const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: '轻松' },
  { value: 'MODERATE', label: '适中' },
  { value: 'CHALLENGING', label: '挑战' },
];
const STATUS_OPTIONS = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'PUBLISHED', label: '已发布' },
  { value: 'ARCHIVED', label: '已归档' },
];

export default function RouteStudioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiField, setAiField] = useState<string>('description');
  const [raw, setRaw] = useState<Record<string, unknown>>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getRouteDetail(id);
      setRaw(data);
      const hl = Array.isArray(data.highlights) ? (data.highlights as string[]).join(',') : '';
      form.setFieldsValue({
        slug: data.slug, title: data.title, titleEn: data.titleEn,
        subtitle: data.subtitle, category: data.category, difficulty: data.difficulty,
        duration: data.duration, nights: data.nights, priceFrom: data.priceFrom,
        coverImage: data.coverImage, description: data.description,
        season: data.season, groupSize: data.groupSize, status: data.status,
        highlights: hl,
        coverGallery: data.coverGallery ?? [],
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
      const highlights = typeof v.highlights === 'string'
        ? v.highlights.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      await patchRoute(id, { ...v, highlights });
      message.success('保存成功');
      load();
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const openAi = (field: string) => { setAiField(field); setAiOpen(true); };

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/routes')}>返回列表</Button>
        <Title level={4} style={{ margin: 0, color: '#D4A855' }}>
          路线 Studio — {String(raw.title ?? '')}
        </Title>
        <Tag color={raw.status === 'PUBLISHED' ? 'green' : 'orange'}>{String(raw.status ?? '-')}</Tag>
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
                        <Col span={12}><Form.Item name="titleEn" label="英文标题"><Input /></Form.Item></Col>
                      </Row>
                      <Form.Item name="subtitle" label="副标题"><Input /></Form.Item>
                      <Row gutter={16}>
                        <Col span={8}><Form.Item name="slug" label="Slug"><Input disabled /></Form.Item></Col>
                        <Col span={8}>
                          <Form.Item name="category" label="类别" rules={[{ required: true }]}>
                            <Select options={CATEGORY_OPTIONS} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="difficulty" label="难度" rules={[{ required: true }]}>
                            <Select options={DIFFICULTY_OPTIONS} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={6}><Form.Item name="duration" label="天数"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={6}><Form.Item name="nights" label="住宿晚数"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={6}><Form.Item name="priceFrom" label="起价(分)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={6}>
                          <Form.Item name="status" label="状态"><Select options={STATUS_OPTIONS} /></Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}><Form.Item name="season" label="最佳季节"><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="groupSize" label="建议人数"><Input /></Form.Item></Col>
                      </Row>
                      <Form.Item name="highlights" label="亮点标签 (逗号分隔)"><Input /></Form.Item>
                    </>
                  ),
                },
                {
                  key: 'content', label: '内容',
                  children: (
                    <Form.Item
                      name="description"
                      label={<Space>详细介绍<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => openAi('description')}>AI 起草</Button></Space>}
                      rules={[{ required: true }]}
                    >
                      <Input.TextArea rows={10} />
                    </Form.Item>
                  ),
                },
                {
                  key: 'media', label: '媒体',
                  children: (
                    <>
                      <Form.Item name="coverImage" label="封面图"><MediaPicker /></Form.Item>
                      <Form.Item name="coverGallery" label="封面画廊 (Gallery)"><GalleryEditor /></Form.Item>
                    </>
                  ),
                },
              ]} />
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="快捷操作" size="small" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button icon={<ThunderboltOutlined />} block onClick={() => openAi('description')}>AI 生成介绍</Button>
              <Button icon={<ThunderboltOutlined />} block onClick={() => openAi('subtitle')}>AI 生成副标题</Button>
              <Button icon={<HistoryOutlined />} block onClick={() => setAuditOpen(true)}>变更时间线</Button>
            </Space>
          </Card>
          <Card title="元数据" size="small">
            <Space direction="vertical" size={4}>
              <Text type="secondary">ID: <Text code>{id}</Text></Text>
              <Text type="secondary">评分: {String(raw.rating ?? '-')}</Text>
              <Text type="secondary">预订: {String(raw.bookCount ?? 0)}</Text>
              <Text type="secondary">版本: v{String(raw.version ?? 1)}</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Drawer open={auditOpen} title="变更历史" width={560} onClose={() => setAuditOpen(false)} destroyOnClose>
        {id && <AuditTimeline resource="route" resourceId={id} />}
      </Drawer>

      <AiAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} resource="route"
        resourceId={id ?? ''} fieldName={aiField} initialText={String(form.getFieldValue(aiField) ?? '')}
        onApplyText={(text) => { form.setFieldsValue({ [aiField]: text }); setAiOpen(false); message.success('已应用 AI 文本'); }} />
    </div>
  );
}
