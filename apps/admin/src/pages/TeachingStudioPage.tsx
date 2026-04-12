import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, Select, Button, Space, Typography,
  Tabs, Spin, message, Row, Col, Drawer,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, ThunderboltOutlined, HistoryOutlined,
} from '@ant-design/icons';
import { getTeachingDetail, patchTeaching } from '../lib/m40';
import { getReligions } from '../lib/api';
import type { Religion } from '../types';
import AuditTimeline from '../components/audit/AuditTimeline';
import AiAssistantDrawer from '../components/ai/AiAssistantDrawer';

const { Title, Text } = Typography;

export default function TeachingStudioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [auditOpen, setAuditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiField, setAiField] = useState<string>('translationCn');
  const [raw, setRaw] = useState<Record<string, unknown>>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [data, rels] = await Promise.all([getTeachingDetail(id), getReligions()]);
      setRaw(data);
      setReligions(rels);
      form.setFieldsValue({
        name: data.name, originalText: data.originalText,
        sourceText: data.sourceText, translationCn: data.translationCn,
        religionId: data.religionId,
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
      await patchTeaching(id, values);
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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/teachings')}>返回列表</Button>
        <Title level={4} style={{ margin: 0 }}>
          祖训 Studio — {String(raw.name ?? '')}
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
                          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="religionId" label="文化传统" rules={[{ required: true }]}>
                            <Select showSearch optionFilterProp="label"
                              options={religions.map((r) => ({ value: r.id, label: r.name || r.slug }))} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="sourceText" label="出处"><Input placeholder="如: 《六祖坛经》" /></Form.Item>
                    </>
                  ),
                },
                {
                  key: 'text', label: '原文 & 译文',
                  children: (
                    <>
                      <Form.Item name="originalText" label="原文" rules={[{ required: true }]}>
                        <Input.TextArea rows={6} />
                      </Form.Item>
                      <Form.Item
                        name="translationCn"
                        label={<Space>中文翻译<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => openAi('translationCn')}>AI 翻译</Button></Space>}
                      >
                        <Input.TextArea rows={6} />
                      </Form.Item>
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
              <Button icon={<ThunderboltOutlined />} block onClick={() => openAi('translationCn')}>AI 翻译</Button>
              <Button icon={<ThunderboltOutlined />} block onClick={() => openAi('originalText')}>AI 润色原文</Button>
              <Button icon={<HistoryOutlined />} block onClick={() => setAuditOpen(true)}>变更时间线</Button>
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
        {id && <AuditTimeline resource="teaching" resourceId={id} />}
      </Drawer>

      <AiAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} resource="teaching"
        resourceId={id ?? ''} fieldName={aiField} initialText={String(form.getFieldValue(aiField) ?? '')}
        onApplyText={(text) => { form.setFieldsValue({ [aiField]: text }); setAiOpen(false); message.success('已应用 AI 文本'); }} />
    </div>
  );
}
