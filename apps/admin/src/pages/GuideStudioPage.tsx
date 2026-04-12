import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, Button, Space, Typography,
  Tabs, Spin, message, Row, Col, Drawer, Tag, Select,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, ThunderboltOutlined, HistoryOutlined,
} from '@ant-design/icons';
import { getGuideDetail, patchGuide } from '../lib/m40';
import MediaPicker from '../components/media/MediaPicker';
import AuditTimeline from '../components/audit/AuditTimeline';
import AiAssistantDrawer from '../components/ai/AiAssistantDrawer';

const { Title, Text } = Typography;

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'PUBLISHED', label: '已发布' },
  { value: 'HIDDEN', label: '隐藏' },
];
const ENTITY_OPTIONS = [
  { value: '', label: '无关联' },
  { value: 'HOLY_SITE', label: '圣地' },
  { value: 'TEMPLE', label: '祖庭' },
];

export default function GuideStudioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiField, setAiField] = useState<string>('content');
  const [raw, setRaw] = useState<Record<string, unknown>>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getGuideDetail(id);
      setRaw(data);
      form.setFieldsValue({
        title: data.title, coverImage: data.coverImage, content: data.content,
        entityType: data.entityType ?? '', entityId: data.entityId ?? '',
        tags: Array.isArray(data.tags) ? (data.tags as string[]).join(',') : '',
        status: data.status,
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
      const tags = typeof v.tags === 'string'
        ? v.tags.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      await patchGuide(id, {
        title: v.title, coverImage: v.coverImage ?? null, content: v.content,
        entityType: v.entityType || null, entityId: v.entityId || null,
        tags, status: v.status,
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

  const openAi = (field: string) => { setAiField(field); setAiOpen(true); };

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/community')}>返回社区</Button>
        <Title level={4} style={{ margin: 0, color: '#D4A855' }}>
          攻略 Studio — {String(raw.title ?? '')}
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
                      <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
                      <Row gutter={16}>
                        <Col span={8}><Form.Item name="status" label="状态"><Select options={STATUS_OPTIONS} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="entityType" label="关联类型"><Select options={ENTITY_OPTIONS} allowClear /></Form.Item></Col>
                        <Col span={8}><Form.Item name="entityId" label="关联实体 ID"><Input /></Form.Item></Col>
                      </Row>
                      <Form.Item name="tags" label="标签 (逗号分隔)"><Input /></Form.Item>
                    </>
                  ),
                },
                {
                  key: 'content', label: '内容',
                  children: (
                    <Form.Item
                      name="content"
                      label={<Space>正文<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => openAi('content')}>AI 续写</Button></Space>}
                      rules={[{ required: true }]}
                    >
                      <Input.TextArea rows={14} />
                    </Form.Item>
                  ),
                },
                {
                  key: 'media', label: '媒体',
                  children: <Form.Item name="coverImage" label="封面图"><MediaPicker /></Form.Item>,
                },
              ]} />
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="数据" size="small" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size={4}>
              <Text type="secondary">浏览: {String(raw.viewCount ?? 0)}</Text>
              <Text type="secondary">点赞: {String(raw.likeCount ?? 0)}</Text>
              <Text type="secondary">评论: {String(raw.commentCount ?? 0)}</Text>
            </Space>
          </Card>
          <Card title="元数据" size="small">
            <Space direction="vertical" size={4}>
              <Text type="secondary">ID: <Text code>{id}</Text></Text>
              <Text type="secondary">作者: {String(raw.userId ?? '-')}</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Drawer open={auditOpen} title="变更历史" width={560} onClose={() => setAuditOpen(false)} destroyOnClose>
        {id && <AuditTimeline resource="guide" resourceId={id} />}
      </Drawer>

      <AiAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} resource="guide"
        resourceId={id ?? ''} fieldName={aiField} initialText={String(form.getFieldValue(aiField) ?? '')}
        onApplyText={(text) => { form.setFieldsValue({ [aiField]: text }); setAiOpen(false); message.success('已应用 AI 文本'); }} />
    </div>
  );
}
