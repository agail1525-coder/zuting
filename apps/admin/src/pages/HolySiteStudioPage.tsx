import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Typography,
  Tabs,
  Divider,
  Spin,
  message,
  Alert,
  Row,
  Col,
  Drawer,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import {
  getHolySiteDetail,
  patchHolySite,
  type GalleryItem,
  type AudioGuide,
} from '../lib/m40';
import { getReligions } from '../lib/api';
import type { Religion } from '../types';
import GalleryEditor from '../components/media/GalleryEditor';
import MediaPicker from '../components/media/MediaPicker';
import MapPicker from '../components/map/MapPicker';
import AuditTimeline from '../components/audit/AuditTimeline';
import AiAssistantDrawer from '../components/ai/AiAssistantDrawer';

const { Title, Text } = Typography;

export default function HolySiteStudioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [audioGuides, setAudioGuides] = useState<AudioGuide[]>([]);
  const [auditOpen, setAuditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiField, setAiField] = useState<string>('description');
  const [raw, setRaw] = useState<Record<string, unknown>>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [data, rels] = await Promise.all([
        getHolySiteDetail(id),
        getReligions(),
      ]);
      setRaw(data);
      setReligions(rels);
      form.setFieldsValue({
        name: data.name,
        nameEn: data.nameEn,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
        utcOffset: data.utcOffset,
        description: data.description,
        imageUrl: data.imageUrl,
        soundEffect: data.soundEffect,
        panoUrl: data.panoUrl,
        religionId: data.religionId,
      });
      setGallery(Array.isArray(data.gallery) ? data.gallery as GalleryItem[] : []);
      setAudioGuides(Array.isArray(data.audioGuides) ? data.audioGuides as AudioGuide[] : []);
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
      await patchHolySite(id, {
        ...values,
        gallery,
        audioGuides,
      });
      message.success('保存成功');
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const openAi = (field: string) => {
    setAiField(field);
    setAiOpen(true);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/holy-sites')}>
          返回列表
        </Button>
        <Title level={4} style={{ margin: 0, color: '#D4A855' }}>
          圣地 Studio — {String(raw.name ?? '')}
        </Title>
        <Text type="secondary">v{String(raw.version ?? 1)}</Text>
      </Space>

      <Row gutter={24}>
        <Col span={16}>
          <Card
            extra={
              <Space>
                <Button icon={<HistoryOutlined />} onClick={() => setAuditOpen(true)}>
                  变更历史
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={save}
                >
                  保存
                </Button>
              </Space>
            }
          >
            <Form form={form} layout="vertical">
              <Tabs
                items={[
                  {
                    key: 'basic',
                    label: '基础信息',
                    children: (
                      <>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item name="name" label="中文名" rules={[{ required: true }]}>
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="nameEn" label="英文名" rules={[{ required: true }]}>
                              <Input />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item name="country" label="国家" rules={[{ required: true }]}>
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="religionId" label="文化传统" rules={[{ required: true }]}>
                              <Select
                                showSearch
                                optionFilterProp="label"
                                options={religions.map((r) => ({ value: r.id, label: r.name || r.slug }))}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="utcOffset" label="UTC偏移" rules={[{ required: true }]}>
                              <InputNumber step={0.5} min={-12} max={14} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item
                          name="description"
                          label={
                            <Space>
                              描述
                              <Button
                                type="link"
                                size="small"
                                icon={<ThunderboltOutlined />}
                                onClick={() => openAi('description')}
                              >
                                AI 生成
                              </Button>
                            </Space>
                          }
                          rules={[{ required: true }]}
                        >
                          <Input.TextArea rows={6} />
                        </Form.Item>
                      </>
                    ),
                  },
                  {
                    key: 'media',
                    label: '媒体 & 画廊',
                    children: (
                      <>
                        <Form.Item name="imageUrl" label="封面图">
                          <MediaPicker />
                        </Form.Item>
                        <Divider>画廊 ({gallery.length} 张)</Divider>
                        <GalleryEditor value={gallery} onChange={setGallery} />
                        <Divider>360° 全景</Divider>
                        <Form.Item name="panoUrl" label="全景 URL">
                          <Input placeholder="https://..." />
                        </Form.Item>
                        <Divider>音效</Divider>
                        <Form.Item name="soundEffect" label="环境音效 URL">
                          <Input placeholder="https://..." />
                        </Form.Item>
                      </>
                    ),
                  },
                  {
                    key: 'audio',
                    label: '音频导览',
                    children: (
                      <>
                        <Alert
                          type="info"
                          showIcon
                          message="管理多语言音频导览，每条包含 URL、语言、标题"
                          style={{ marginBottom: 16 }}
                        />
                        {audioGuides.map((ag, i) => (
                          <Card key={i} size="small" style={{ marginBottom: 8 }}>
                            <Row gutter={12}>
                              <Col span={10}>
                                <Input
                                  placeholder="音频 URL"
                                  value={ag.url}
                                  onChange={(e) => {
                                    const next = [...audioGuides];
                                    next[i] = { ...next[i], url: e.target.value };
                                    setAudioGuides(next);
                                  }}
                                />
                              </Col>
                              <Col span={4}>
                                <Select
                                  value={ag.lang ?? 'zh'}
                                  onChange={(v) => {
                                    const next = [...audioGuides];
                                    next[i] = { ...next[i], lang: v };
                                    setAudioGuides(next);
                                  }}
                                  options={[
                                    { value: 'zh', label: '中文' },
                                    { value: 'en', label: 'EN' },
                                    { value: 'ja', label: '日' },
                                    { value: 'ko', label: '韩' },
                                    { value: 'th', label: 'ไทย' },
                                    { value: 'hi', label: 'हिन्दी' },
                                    { value: 'ar', label: 'ع' },
                                  ]}
                                  style={{ width: '100%' }}
                                />
                              </Col>
                              <Col span={8}>
                                <Input
                                  placeholder="标题"
                                  value={ag.title}
                                  onChange={(e) => {
                                    const next = [...audioGuides];
                                    next[i] = { ...next[i], title: e.target.value };
                                    setAudioGuides(next);
                                  }}
                                />
                              </Col>
                              <Col span={2}>
                                <Button
                                  danger
                                  size="small"
                                  onClick={() => setAudioGuides(audioGuides.filter((_, j) => j !== i))}
                                >
                                  删
                                </Button>
                              </Col>
                            </Row>
                          </Card>
                        ))}
                        <Button
                          type="dashed"
                          block
                          onClick={() =>
                            setAudioGuides([...audioGuides, { url: '', lang: 'zh', title: '' }])
                          }
                        >
                          + 添加音频导览
                        </Button>
                      </>
                    ),
                  },
                  {
                    key: 'map',
                    label: '地理位置',
                    children: (
                      <>
                        <MapPicker
                          latitude={form.getFieldValue('latitude')}
                          longitude={form.getFieldValue('longitude')}
                          onChange={(lat, lng) => {
                            form.setFieldsValue({ latitude: lat, longitude: lng });
                          }}
                        />
                        <Row gutter={16} style={{ marginTop: 16 }}>
                          <Col span={8}>
                            <Form.Item name="latitude" label="纬度">
                              <InputNumber step={0.0001} min={-90} max={90} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="longitude" label="经度">
                              <InputNumber step={0.0001} min={-180} max={180} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </>
                    ),
                  },
                ]}
              />
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="快捷操作" size="small" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                icon={<ThunderboltOutlined />}
                block
                onClick={() => openAi('description')}
              >
                AI 生成描述
              </Button>
              <Button
                icon={<ThunderboltOutlined />}
                block
                onClick={() => openAi('name')}
              >
                AI 优化名称
              </Button>
              <Button icon={<HistoryOutlined />} block onClick={() => setAuditOpen(true)}>
                变更时间线
              </Button>
            </Space>
          </Card>

          <Card title="元数据" size="small">
            <Space direction="vertical" size={4}>
              <Text type="secondary">ID: <Text code>{id}</Text></Text>
              <Text type="secondary">版本: v{String(raw.version ?? 1)}</Text>
              {raw.lastEditedBy && (
                <Text type="secondary">上次编辑: {String(raw.lastEditedBy)}</Text>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      <Drawer
        open={auditOpen}
        title="变更历史"
        width={560}
        onClose={() => setAuditOpen(false)}
        destroyOnClose
      >
        {id && <AuditTimeline resource="holy-site" resourceId={id} />}
      </Drawer>

      <AiAssistantDrawer
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        resource="holy-site"
        resourceId={id ?? ''}
        fieldName={aiField}
        initialText={String(form.getFieldValue(aiField) ?? '')}
        onApplyText={(text) => {
          form.setFieldsValue({ [aiField]: text });
          setAiOpen(false);
          message.success('已应用 AI 文本');
        }}
      />
    </div>
  );
}
