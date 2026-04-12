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
  getPatriarchDetail, patchPatriarch, type GalleryItem,
} from '../lib/m40';
import { getReligions } from '../lib/api';
import type { Religion } from '../types';
import GalleryEditor from '../components/media/GalleryEditor';
import MediaPicker from '../components/media/MediaPicker';
import AuditTimeline from '../components/audit/AuditTimeline';
import AiAssistantDrawer from '../components/ai/AiAssistantDrawer';

const { Title, Text } = Typography;

interface WorkItem { title: string; description?: string }
interface KoanItem { title: string; content?: string; source?: string }

export default function PatriarchStudioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [koans, setKoans] = useState<KoanItem[]>([]);
  const [auditOpen, setAuditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiField, setAiField] = useState<string>('biography');
  const [raw, setRaw] = useState<Record<string, unknown>>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [data, rels] = await Promise.all([getPatriarchDetail(id), getReligions()]);
      setRaw(data);
      setReligions(rels);
      form.setFieldsValue({
        name: data.name, nameEn: data.nameEn, dates: data.dates,
        title: data.title, school: data.school, generation: data.generation,
        biography: data.biography, coreTeaching: data.coreTeaching,
        achievements: data.achievements, imageUrl: data.imageUrl,
        religionId: data.religionId,
      });
      setGallery(Array.isArray(data.gallery) ? data.gallery as GalleryItem[] : []);
      setWorks(Array.isArray(data.works) ? data.works as WorkItem[] : []);
      setKoans(Array.isArray(data.koans) ? data.koans as KoanItem[] : []);
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
      await patchPatriarch(id, { ...values, gallery, works, koans });
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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/patriarchs')}>返回列表</Button>
        <Title level={4} style={{ margin: 0, color: '#D4A855' }}>
          祖师 Studio — {String(raw.name ?? '')}
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
                        <Col span={8}>
                          <Form.Item name="name" label="法名" rules={[{ required: true }]}><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="nameEn" label="英文名"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="dates" label="年代"><Input placeholder="如: 638-713" /></Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={6}>
                          <Form.Item name="title" label="称号"><Input placeholder="如: 六祖" /></Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item name="school" label="流派"><Input placeholder="如: 曹洞宗" /></Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item name="generation" label="传承世次"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item name="religionId" label="文化传统" rules={[{ required: true }]}>
                            <Select showSearch optionFilterProp="label"
                              options={religions.map((r) => ({ value: r.id, label: r.name || r.slug }))} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  ),
                },
                {
                  key: 'content', label: '传记 & 教义',
                  children: (
                    <>
                      <Form.Item
                        name="biography"
                        label={<Space>传记<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => openAi('biography')}>AI 生成</Button></Space>}
                        rules={[{ required: true }]}
                      >
                        <Input.TextArea rows={6} />
                      </Form.Item>
                      <Form.Item
                        name="coreTeaching"
                        label={<Space>核心教义<Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => openAi('coreTeaching')}>AI 生成</Button></Space>}
                        rules={[{ required: true }]}
                      >
                        <Input.TextArea rows={4} />
                      </Form.Item>
                      <Form.Item name="achievements" label="主要成就">
                        <Input.TextArea rows={3} />
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: 'media', label: '媒体',
                  children: (
                    <>
                      <Form.Item name="imageUrl" label="头像/画像"><MediaPicker /></Form.Item>
                      <Divider>画廊 ({gallery.length} 张)</Divider>
                      <GalleryEditor value={gallery} onChange={setGallery} />
                    </>
                  ),
                },
                {
                  key: 'works', label: '著作 & 公案',
                  children: (
                    <>
                      <Divider>著作 ({works.length})</Divider>
                      {works.map((w, i) => (
                        <Card key={i} size="small" style={{ marginBottom: 8 }}>
                          <Row gutter={12}>
                            <Col span={8}>
                              <Input placeholder="书名" value={w.title}
                                onChange={(e) => { const n = [...works]; n[i] = { ...n[i], title: e.target.value }; setWorks(n); }} />
                            </Col>
                            <Col span={14}>
                              <Input placeholder="简介" value={w.description}
                                onChange={(e) => { const n = [...works]; n[i] = { ...n[i], description: e.target.value }; setWorks(n); }} />
                            </Col>
                            <Col span={2}>
                              <Button danger size="small" onClick={() => setWorks(works.filter((_, j) => j !== i))}>删</Button>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      <Button type="dashed" block onClick={() => setWorks([...works, { title: '' }])}>+ 添加著作</Button>

                      <Divider style={{ marginTop: 24 }}>公案 ({koans.length})</Divider>
                      {koans.map((k, i) => (
                        <Card key={i} size="small" style={{ marginBottom: 8 }}>
                          <Row gutter={12}>
                            <Col span={6}>
                              <Input placeholder="标题" value={k.title}
                                onChange={(e) => { const n = [...koans]; n[i] = { ...n[i], title: e.target.value }; setKoans(n); }} />
                            </Col>
                            <Col span={12}>
                              <Input.TextArea placeholder="内容" rows={1} value={k.content}
                                onChange={(e) => { const n = [...koans]; n[i] = { ...n[i], content: e.target.value }; setKoans(n); }} />
                            </Col>
                            <Col span={4}>
                              <Input placeholder="出处" value={k.source}
                                onChange={(e) => { const n = [...koans]; n[i] = { ...n[i], source: e.target.value }; setKoans(n); }} />
                            </Col>
                            <Col span={2}>
                              <Button danger size="small" onClick={() => setKoans(koans.filter((_, j) => j !== i))}>删</Button>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      <Button type="dashed" block onClick={() => setKoans([...koans, { title: '' }])}>+ 添加公案</Button>
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
              <Button icon={<ThunderboltOutlined />} block onClick={() => openAi('biography')}>AI 生成传记</Button>
              <Button icon={<ThunderboltOutlined />} block onClick={() => openAi('coreTeaching')}>AI 生成教义</Button>
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
        {id && <AuditTimeline resource="patriarch" resourceId={id} />}
      </Drawer>

      <AiAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} resource="patriarch"
        resourceId={id ?? ''} fieldName={aiField} initialText={String(form.getFieldValue(aiField) ?? '')}
        onApplyText={(text) => { form.setFieldsValue({ [aiField]: text }); setAiOpen(false); message.success('已应用 AI 文本'); }} />
    </div>
  );
}
