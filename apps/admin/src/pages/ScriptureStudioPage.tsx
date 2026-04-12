import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, InputNumber, Switch, Button, Space, Typography,
  Tabs, Spin, message, Row, Col, Drawer,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, ThunderboltOutlined, HistoryOutlined,
} from '@ant-design/icons';
import { getScriptureDetail, patchScripture } from '../lib/m40';
import MediaPicker from '../components/media/MediaPicker';
import AuditTimeline from '../components/audit/AuditTimeline';
import AiAssistantDrawer from '../components/ai/AiAssistantDrawer';

const { Title, Text } = Typography;

export default function ScriptureStudioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiField, setAiField] = useState<string>('summary');
  const [raw, setRaw] = useState<Record<string, unknown>>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getScriptureDetail(id);
      setRaw(data as unknown as Record<string, unknown>);
      form.setFieldsValue({
        slug: data.slug,
        title: data.title,
        titleEn: data.titleEn,
        author: data.author,
        era: data.era,
        tradition: data.tradition,
        ring: data.ring,
        summary: data.summary,
        significance: data.significance,
        coverUrl: data.coverUrl,
        chapterCount: data.chapterCount,
        readingMins: data.readingMins,
        difficulty: data.difficulty,
        oxStageMin: data.oxStageMin,
        oxStageMax: data.oxStageMax,
        isPublished: data.isPublished,
        sortOrder: data.sortOrder,
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
      const values = await form.validateFields();
      setSaving(true);
      await patchScripture(id, values);
      message.success('保存成功');
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const openAi = (field: string) => { setAiField(field); setAiOpen(true); };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/teachings')}>返回</Button>
        <Title level={4} style={{ margin: 0 }}>
          经论 Studio — {String(raw.title ?? '')}
        </Title>
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
                  key: 'basic', label: '基础信息',
                  children: (
                    <>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="titleEn" label="英文标题"><Input /></Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="tradition" label="传统" rules={[{ required: true }]}><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="era" label="年代"><Input /></Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="author" label="作者"><Input /></Form.Item>
                    </>
                  ),
                },
                {
                  key: 'content', label: '内容',
                  children: (
                    <>
                      <Form.Item
                        name="summary"
                        label={<Space>简介<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => openAi('summary')}>AI 起草</Button></Space>}
                        rules={[{ required: true }]}
                      >
                        <Input.TextArea rows={4} />
                      </Form.Item>
                      <Form.Item
                        name="significance"
                        label={<Space>重要意义<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => openAi('significance')}>AI 起草</Button></Space>}
                      >
                        <Input.TextArea rows={4} />
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: 'media', label: '媒体',
                  children: (
                    <Form.Item name="coverUrl" label="封面图">
                      <MediaPicker />
                    </Form.Item>
                  ),
                },
                {
                  key: 'meta', label: '元信息',
                  children: (
                    <Row gutter={16}>
                      <Col span={6}><Form.Item name="ring" label="环数"><InputNumber min={0} max={10} style={{ width: '100%' }} /></Form.Item></Col>
                      <Col span={6}><Form.Item name="chapterCount" label="章节数"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                      <Col span={6}><Form.Item name="readingMins" label="阅读分钟"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                      <Col span={6}><Form.Item name="difficulty" label="难度"><InputNumber min={1} max={5} style={{ width: '100%' }} /></Form.Item></Col>
                      <Col span={6}><Form.Item name="oxStageMin" label="十牛起阶"><InputNumber min={1} max={10} style={{ width: '100%' }} /></Form.Item></Col>
                      <Col span={6}><Form.Item name="oxStageMax" label="十牛止阶"><InputNumber min={1} max={10} style={{ width: '100%' }} /></Form.Item></Col>
                      <Col span={6}><Form.Item name="sortOrder" label="排序"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                      <Col span={6}><Form.Item name="isPublished" label="已发布" valuePropName="checked"><Switch /></Form.Item></Col>
                    </Row>
                  ),
                },
              ]} />
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="快捷操作" size="small" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button icon={<ThunderboltOutlined />} block onClick={() => openAi('summary')}>AI 起草简介</Button>
              <Button icon={<ThunderboltOutlined />} block onClick={() => openAi('significance')}>AI 起草意义</Button>
              <Button icon={<HistoryOutlined />} block onClick={() => setAuditOpen(true)}>变更时间线</Button>
            </Space>
          </Card>
          <Card title="元数据" size="small">
            <Space direction="vertical" size={4}>
              <Text type="secondary">ID: <Text code>{id}</Text></Text>
              <Text type="secondary">浏览: {String(raw.viewCount ?? 0)}</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Drawer open={auditOpen} title="变更历史" width={560} onClose={() => setAuditOpen(false)} destroyOnClose>
        {id && <AuditTimeline resource="scripture" resourceId={id} />}
      </Drawer>

      <AiAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} resource="scripture"
        resourceId={id ?? ''} fieldName={aiField} initialText={String(form.getFieldValue(aiField) ?? '')}
        onApplyText={(text) => { form.setFieldsValue({ [aiField]: text }); setAiOpen(false); message.success('已应用 AI 文本'); }} />
    </div>
  );
}
