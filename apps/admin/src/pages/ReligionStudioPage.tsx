import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, Button, Space, Typography,
  Tabs, Spin, message, Row, Col, Drawer, Tag,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, ThunderboltOutlined, HistoryOutlined,
} from '@ant-design/icons';
import { getReligionDetail, patchReligion } from '../lib/m40';
import MediaPicker from '../components/media/MediaPicker';
import AuditTimeline from '../components/audit/AuditTimeline';
import AiAssistantDrawer from '../components/ai/AiAssistantDrawer';
import { useUnsavedGuard } from '../hooks/useUnsavedGuard';

const { Title, Text } = Typography;

export default function ReligionStudioPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiField, setAiField] = useState('summary');
  const [raw, setRaw] = useState<Record<string, unknown>>({});
  const [dirty, setDirty] = useState(false);
  useUnsavedGuard(dirty);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const data = await getReligionDetail(slug);
      setRaw(data);
      form.setFieldsValue({
        name: data.name, nameEn: data.nameEn, slug: data.slug,
        symbol: data.symbol ?? '', color: data.color ?? '',
        heroImage: data.heroImage ?? '', tagline: data.tagline ?? '',
        summary: data.summary ?? '', foundedYear: data.foundedYear ?? '',
        founder: data.founder ?? '', followers: data.followers ?? '',
        origin: data.origin ?? '', development: data.development ?? '',
        contributions: data.contributions ?? '', controversies: data.controversies ?? '',
        businessPhilosophy: data.businessPhilosophy ?? '',
        businessInsight: data.businessInsight ?? '',
      });
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [slug, form]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const id = String(raw.id ?? '');
    if (!id) { message.error('缺少 ID'); return; }
    try {
      const v = await form.validateFields();
      setSaving(true);
      await patchReligion(id, {
        name: v.name, nameEn: v.nameEn,
        symbol: v.symbol || null, color: v.color || null,
        heroImage: v.heroImage || null, tagline: v.tagline || null,
        summary: v.summary || null, foundedYear: v.foundedYear || null,
        founder: v.founder || null, followers: v.followers || null,
        origin: v.origin || null, development: v.development || null,
        contributions: v.contributions || null, controversies: v.controversies || null,
        businessPhilosophy: v.businessPhilosophy || null,
        businessInsight: v.businessInsight || null,
      });
      message.success('保存成功');
      setDirty(false);
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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/religions')}>返回列表</Button>
        <Title level={4} style={{ margin: 0, color: '#D4A855' }}>
          文化传统 Studio — {String(raw.name ?? '')}
        </Title>
        <Tag color={String(raw.color ?? 'default')}>{String(raw.symbol ?? '')}</Tag>
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
            <Form form={form} layout="vertical" onValuesChange={() => setDirty(true)}>
              <Tabs items={[
                {
                  key: 'basic', label: '基础 · 双语',
                  children: (
                    <>
                      <Row gutter={16}>
                        <Col span={8}><Form.Item name="name" label="中文名" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="nameEn" label="English Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="slug" label="Slug"><Input disabled /></Form.Item></Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={8}><Form.Item name="symbol" label="符号"><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="color" label="主题色"><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="foundedYear" label="创立年代"><Input /></Form.Item></Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}><Form.Item name="founder" label="创始人"><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="followers" label="信众规模"><Input placeholder="约18亿" /></Form.Item></Col>
                      </Row>
                      <Form.Item name="tagline" label="恢弘标语"><Input /></Form.Item>
                    </>
                  ),
                },
                {
                  key: 'summary', label: '百科概要',
                  children: (
                    <>
                      <Form.Item
                        name="summary"
                        label={<Space>总览摘要<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => openAi('summary')}>AI 生成</Button></Space>}
                      >
                        <Input.TextArea rows={4} />
                      </Form.Item>
                      <Form.Item
                        name="origin"
                        label={<Space>起源故事<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => openAi('origin')}>AI 续写</Button></Space>}
                      >
                        <Input.TextArea rows={6} />
                      </Form.Item>
                      <Form.Item
                        name="development"
                        label={<Space>发展历程<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => openAi('development')}>AI 续写</Button></Space>}
                      >
                        <Input.TextArea rows={6} />
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: 'impact', label: '贡献与争议',
                  children: (
                    <>
                      <Form.Item name="contributions" label="对人类文明的贡献">
                        <Input.TextArea rows={6} />
                      </Form.Item>
                      <Form.Item name="controversies" label="争议与反思">
                        <Input.TextArea rows={6} />
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: 'business', label: '商业实践',
                  children: (
                    <>
                      <Form.Item
                        name="businessPhilosophy"
                        label={<Space>核心商业哲学<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => openAi('businessPhilosophy')}>AI</Button></Space>}
                      >
                        <Input.TextArea rows={4} />
                      </Form.Item>
                      <Form.Item name="businessInsight" label="如何助力企业">
                        <Input.TextArea rows={4} />
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: 'media', label: '媒体',
                  children: <Form.Item name="heroImage" label="Hero 背景图"><MediaPicker /></Form.Item>,
                },
              ]} />
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="关联资源" size="small" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size={4}>
              <Text type="secondary">圣地: {Array.isArray(raw.holySites) ? (raw.holySites as unknown[]).length : 0}</Text>
              <Text type="secondary">祖庭: {Array.isArray(raw.temples) ? (raw.temples as unknown[]).length : 0}</Text>
              <Text type="secondary">祖师: {Array.isArray(raw.patriarchs) ? (raw.patriarchs as unknown[]).length : 0}</Text>
              <Text type="secondary">祖训: {Array.isArray(raw.teachings) ? (raw.teachings as unknown[]).length : 0}</Text>
            </Space>
          </Card>
          <Card title="元数据" size="small">
            <Space direction="vertical" size={4}>
              <Text type="secondary">ID: <Text code>{String(raw.id ?? '-')}</Text></Text>
              <Text type="secondary">Slug: <Text code>{slug}</Text></Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Drawer open={auditOpen} title="变更历史" width={560} onClose={() => setAuditOpen(false)} destroyOnClose>
        {raw.id && <AuditTimeline resource="religion" resourceId={String(raw.id)} />}
      </Drawer>

      <AiAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} resource="religion"
        resourceId={String(raw.id ?? '')} fieldName={aiField}
        initialText={String(form.getFieldValue(aiField) ?? '')}
        onApplyText={(text) => { form.setFieldsValue({ [aiField]: text }); setAiOpen(false); message.success('已应用 AI 文本'); }} />
    </div>
  );
}
