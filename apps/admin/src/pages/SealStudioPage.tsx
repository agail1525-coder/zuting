import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, Button, Space, Typography,
  Tabs, Spin, message, Row, Col, Drawer, Tag, Select,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, ThunderboltOutlined, HistoryOutlined,
} from '@ant-design/icons';
import { getSealDetail, patchSeal } from '../lib/m40';
import AuditTimeline from '../components/audit/AuditTimeline';
import AiAssistantDrawer from '../components/ai/AiAssistantDrawer';
import { useUnsavedGuard } from '../hooks/useUnsavedGuard';

const { Title, Text } = Typography;

const SERIES_OPTIONS = [
  { value: 'CHUYIN', label: '初印系 · 青' },
  { value: 'ZHONGYIN', label: '中印系 · 蓝' },
  { value: 'YINGUOYIN', label: '印果印 · 紫' },
  { value: 'CHENGDAOYIN', label: '成道印 · 红' },
  { value: 'GUIYUANYIN', label: '归源印 · 金' },
];

const SERIES_COLOR: Record<string, string> = {
  CHUYIN: '#1890ff', ZHONGYIN: '#2f54eb', YINGUOYIN: '#722ed1',
  CHENGDAOYIN: '#cf1322', GUIYUANYIN: '#D4A855',
};

export default function SealStudioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiField, setAiField] = useState('poem');
  const [raw, setRaw] = useState<Record<string, unknown>>({});
  const [dirty, setDirty] = useState(false);
  useUnsavedGuard(dirty);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getSealDetail(id);
      setRaw(data);
      form.setFieldsValue({
        name: data.name, series: data.series, color: data.color ?? '',
        poem: data.poem, essence: data.essence, practice: data.practice, vow: data.vow,
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
      await patchSeal(id, {
        name: v.name, series: v.series, color: v.color || null,
        poem: v.poem, essence: v.essence, practice: v.practice, vow: v.vow,
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

  const seriesKey = String(raw.series ?? 'CHUYIN');

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/seals')}>返回列表</Button>
        <Title level={4} style={{ margin: 0, color: SERIES_COLOR[seriesKey] ?? '#D4A855' }}>
          三十印 Studio — #{id} {String(raw.name ?? '')}
        </Title>
        <Tag color={SERIES_COLOR[seriesKey]}>{seriesKey}</Tag>
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
                  key: 'basic', label: '基础',
                  children: (
                    <>
                      <Row gutter={16}>
                        <Col span={10}><Form.Item name="name" label="印名" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="series" label="系别" rules={[{ required: true }]}><Select options={SERIES_OPTIONS} /></Form.Item></Col>
                        <Col span={6}><Form.Item name="color" label="印色"><Input /></Form.Item></Col>
                      </Row>
                    </>
                  ),
                },
                {
                  key: 'poem', label: '印诗',
                  children: (
                    <Form.Item
                      name="poem"
                      label={<Space>印诗正文<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => openAi('poem')}>AI 润色</Button></Space>}
                      rules={[{ required: true }]}
                    >
                      <Input.TextArea rows={6} />
                    </Form.Item>
                  ),
                },
                {
                  key: 'essence', label: '精要',
                  children: (
                    <Form.Item
                      name="essence"
                      label={<Space>精要阐释<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => openAi('essence')}>AI 续写</Button></Space>}
                      rules={[{ required: true }]}
                    >
                      <Input.TextArea rows={10} />
                    </Form.Item>
                  ),
                },
                {
                  key: 'practice', label: '修持',
                  children: (
                    <Form.Item
                      name="practice"
                      label={<Space>修持方法<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => openAi('practice')}>AI 续写</Button></Space>}
                      rules={[{ required: true }]}
                    >
                      <Input.TextArea rows={10} />
                    </Form.Item>
                  ),
                },
                {
                  key: 'vow', label: '愿力',
                  children: (
                    <Form.Item
                      name="vow"
                      label={<Space>愿力发心<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => openAi('vow')}>AI 润色</Button></Space>}
                      rules={[{ required: true }]}
                    >
                      <Input.TextArea rows={8} />
                    </Form.Item>
                  ),
                },
              ]} />
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="元数据" size="small">
            <Space direction="vertical" size={4}>
              <Text type="secondary">印号: #{id}</Text>
              <Text type="secondary">系别: <Tag color={SERIES_COLOR[seriesKey]}>{seriesKey}</Tag></Text>
              <Text type="secondary">名称: {String(raw.name ?? '-')}</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Drawer open={auditOpen} title="变更历史" width={560} onClose={() => setAuditOpen(false)} destroyOnClose>
        {id && <AuditTimeline resource="seal" resourceId={id} />}
      </Drawer>

      <AiAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} resource="seal"
        resourceId={id ?? ''} fieldName={aiField}
        initialText={String(form.getFieldValue(aiField) ?? '')}
        onApplyText={(text) => { form.setFieldsValue({ [aiField]: text }); setAiOpen(false); message.success('已应用 AI 文本'); }} />
    </div>
  );
}
