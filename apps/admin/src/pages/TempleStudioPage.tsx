import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, InputNumber, Select, Button, Space, Typography,
  Tabs, Divider, Spin, message, Row, Col, Drawer,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, ThunderboltOutlined, HistoryOutlined,
} from '@ant-design/icons';
import {
  getTempleDetail, patchTemple, type GalleryItem,
} from '../lib/m40';
import { getReligions } from '../lib/api';
import type { Religion } from '../types';
import GalleryEditor from '../components/media/GalleryEditor';
import MediaPicker from '../components/media/MediaPicker';
import MapPicker from '../components/map/MapPicker';
import AuditTimeline from '../components/audit/AuditTimeline';
import AiAssistantDrawer from '../components/ai/AiAssistantDrawer';

const { Title, Text } = Typography;

interface HistoricalAbbot {
  name: string;
  period?: string;
  notes?: string;
}

export default function TempleStudioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [abbots, setAbbots] = useState<HistoricalAbbot[]>([]);
  const [auditOpen, setAuditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiField, setAiField] = useState<string>('description');
  const [raw, setRaw] = useState<Record<string, unknown>>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [data, rels] = await Promise.all([getTempleDetail(id), getReligions()]);
      setRaw(data);
      setReligions(rels);
      form.setFieldsValue({
        name: data.name, nameEn: data.nameEn, country: data.country,
        foundingDate: data.foundingDate, description: data.description,
        imageUrl: data.imageUrl, religionId: data.religionId,
        latitude: data.latitude, longitude: data.longitude,
      });
      setGallery(Array.isArray(data.gallery) ? data.gallery as GalleryItem[] : []);
      setAbbots(Array.isArray(data.historicalAbbots) ? data.historicalAbbots as HistoricalAbbot[] : []);
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
      await patchTemple(id, { ...values, gallery, historicalAbbots: abbots });
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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/temples')}>返回列表</Button>
        <Title level={4} style={{ margin: 0, color: '#D4A855' }}>
          祖庭 Studio — {String(raw.name ?? '')}
        </Title>
        <Text type="secondary">v{String(raw.version ?? 1)}</Text>
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
                          <Form.Item name="name" label="中文名" rules={[{ required: true }]}><Input /></Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="nameEn" label="英文名"><Input /></Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item name="country" label="国家" rules={[{ required: true }]}><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="religionId" label="文化传统" rules={[{ required: true }]}>
                            <Select showSearch optionFilterProp="label"
                              options={religions.map((r) => ({ value: r.id, label: r.name || r.slug }))} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="foundingDate" label="建立日期"><Input placeholder="如: 公元495年" /></Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        name="description"
                        label={<Space>描述<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => openAi('description')}>AI 生成</Button></Space>}
                        rules={[{ required: true }]}
                      >
                        <Input.TextArea rows={6} />
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: 'media', label: '媒体 & 画廊',
                  children: (
                    <>
                      <Form.Item name="imageUrl" label="封面图"><MediaPicker /></Form.Item>
                      <Divider>画廊 ({gallery.length} 张)</Divider>
                      <GalleryEditor value={gallery} onChange={setGallery} />
                    </>
                  ),
                },
                {
                  key: 'abbots', label: '历代住持',
                  children: (
                    <>
                      {abbots.map((ab, i) => (
                        <Card key={i} size="small" style={{ marginBottom: 8 }}>
                          <Row gutter={12}>
                            <Col span={8}>
                              <Input placeholder="法名" value={ab.name}
                                onChange={(e) => { const n = [...abbots]; n[i] = { ...n[i], name: e.target.value }; setAbbots(n); }} />
                            </Col>
                            <Col span={6}>
                              <Input placeholder="年代" value={ab.period}
                                onChange={(e) => { const n = [...abbots]; n[i] = { ...n[i], period: e.target.value }; setAbbots(n); }} />
                            </Col>
                            <Col span={8}>
                              <Input placeholder="备注" value={ab.notes}
                                onChange={(e) => { const n = [...abbots]; n[i] = { ...n[i], notes: e.target.value }; setAbbots(n); }} />
                            </Col>
                            <Col span={2}>
                              <Button danger size="small" onClick={() => setAbbots(abbots.filter((_, j) => j !== i))}>删</Button>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      <Button type="dashed" block onClick={() => setAbbots([...abbots, { name: '', period: '', notes: '' }])}>
                        + 添加住持
                      </Button>
                    </>
                  ),
                },
                {
                  key: 'map', label: '地理位置',
                  children: (
                    <>
                      <MapPicker latitude={form.getFieldValue('latitude')} longitude={form.getFieldValue('longitude')}
                        onChange={(lat, lng) => form.setFieldsValue({ latitude: lat, longitude: lng })} />
                      <Row gutter={16} style={{ marginTop: 16 }}>
                        <Col span={8}>
                          <Form.Item name="latitude" label="纬度"><InputNumber step={0.0001} min={-90} max={90} style={{ width: '100%' }} /></Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="longitude" label="经度"><InputNumber step={0.0001} min={-180} max={180} style={{ width: '100%' }} /></Form.Item>
                        </Col>
                      </Row>
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
              <Button icon={<ThunderboltOutlined />} block onClick={() => openAi('description')}>AI 生成描述</Button>
              <Button icon={<HistoryOutlined />} block onClick={() => setAuditOpen(true)}>变更时间线</Button>
            </Space>
          </Card>
          <Card title="元数据" size="small">
            <Space direction="vertical" size={4}>
              <Text type="secondary">ID: <Text code>{id}</Text></Text>
              <Text type="secondary">版本: v{String(raw.version ?? 1)}</Text>
              {!!raw.lastEditedBy && <Text type="secondary">上次编辑: {String(raw.lastEditedBy)}</Text>}
            </Space>
          </Card>
        </Col>
      </Row>

      <Drawer open={auditOpen} title="变更历史" width={560} onClose={() => setAuditOpen(false)} destroyOnClose>
        {id && <AuditTimeline resource="temple" resourceId={id} />}
      </Drawer>

      <AiAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} resource="temple"
        resourceId={id ?? ''} fieldName={aiField} initialText={String(form.getFieldValue(aiField) ?? '')}
        onApplyText={(text) => { form.setFieldsValue({ [aiField]: text }); setAiOpen(false); message.success('已应用 AI 文本'); }} />
    </div>
  );
}
