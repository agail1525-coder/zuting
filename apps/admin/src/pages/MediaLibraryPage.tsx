import { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Space,
  Button,
  Input,
  Select,
  Tag,
  Modal,
  Form,
  message,
  Image,
  Popconfirm,
  Empty,
} from 'antd';
import { ThunderboltOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  listMedia,
  createMediaAsset,
  updateMediaAsset,
  deleteMediaAsset,
  aiGenerateImage,
  type MediaAsset,
  type MediaType,
} from '../lib/m40';

const { Title, Text } = Typography;

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [type, setType] = useState<MediaType | undefined>();
  const [folder, setFolder] = useState<string | undefined>();
  const [editing, setEditing] = useState<MediaAsset | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const r = await listMedia({ q, type, folder, pageSize: 60 });
      setItems(r.items);
      setTotal(r.total);
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async () => {
    const v = await form.validateFields();
    const payload = {
      ...v,
      tags:
        typeof v.tags === 'string'
          ? v.tags.split(',').map((s: string) => s.trim()).filter(Boolean)
          : v.tags,
    };
    try {
      if (editing && editing.id) {
        await updateMediaAsset(editing.id, payload);
        message.success('已更新');
      } else {
        await createMediaAsset(payload);
        message.success('已创建');
      }
      setEditing(null);
      form.resetFields();
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败');
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteMediaAsset(id);
      message.success('已删除');
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  const onAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      message.warning('请输入提示词');
      return;
    }
    setAiLoading(true);
    try {
      const r = await aiGenerateImage({ prompt: aiPrompt.trim() });
      message.success(`已生成: ${r.id.slice(0, 8)}`);
      setAiPrompt('');
      setAiOpen(false);
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '生成失败');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Card
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            媒体库
          </Title>
          <Tag color="gold">{total}</Tag>
        </Space>
      }
      extra={
        <Space>
          <Input.Search
            placeholder="搜索标题/描述/标签"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onSearch={load}
            style={{ width: 220 }}
            allowClear
          />
          <Select
            placeholder="类型"
            value={type}
            onChange={(v) => setType(v)}
            allowClear
            style={{ width: 120 }}
            options={[
              { value: 'IMAGE', label: '图片' },
              { value: 'VIDEO', label: '视频' },
              { value: 'AUDIO', label: '音频' },
              { value: 'PANO360', label: '全景' },
            ]}
          />
          <Input
            placeholder="目录"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            style={{ width: 140 }}
            allowClear
          />
          <Button onClick={load}>刷新</Button>
          <Button icon={<ThunderboltOutlined />} onClick={() => setAiOpen(true)}>
            AI 文生图
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing({ id: '', url: '', type: 'IMAGE' } as MediaAsset);
              form.setFieldsValue({ url: '', type: 'IMAGE', folder: 'default' });
            }}
          >
            新增
          </Button>
        </Space>
      }
    >
      {items.length === 0 && !loading ? (
        <Empty description="暂无媒体资源" />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          {items.map((m) => (
            <Card
              key={m.id}
              size="small"
              styles={{ body: { padding: 8 } }}
              hoverable
              cover={
                m.type === 'IMAGE' ? (
                  <Image src={m.url} height={140} style={{ objectFit: 'cover' }} />
                ) : (
                  <div
                    style={{
                      height: 140,
                      background: '#1f1f1f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                    }}
                  >
                    {m.type}
                  </div>
                )
              }
              actions={[
                <EditOutlined
                  key="edit"
                  onClick={() => {
                    setEditing(m);
                    form.setFieldsValue({
                      url: m.url,
                      type: m.type,
                      altText: m.altText,
                      description: m.description,
                      folder: m.folder,
                      tags: (m.tags ?? []).join(','),
                    });
                  }}
                />,
                <Popconfirm
                  key="del"
                  title="确定删除？"
                  onConfirm={() => onDelete(m.id)}
                >
                  <DeleteOutlined />
                </Popconfirm>,
              ]}
            >
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Text ellipsis style={{ fontSize: 12 }}>
                  {m.altText || m.url.split('/').pop()}
                </Text>
                <Space size={4} wrap>
                  {m.aiGenerated && <Tag color="gold">AI</Tag>}
                  <Tag>{m.type}</Tag>
                  {m.folder && <Tag>{m.folder}</Tag>}
                </Space>
              </Space>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        title={editing?.id ? '编辑媒体' : '新增媒体'}
        onCancel={() => {
          setEditing(null);
          form.resetFields();
        }}
        onOk={onSave}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="url" label="URL" rules={[{ required: true }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="type" label="类型" initialValue="IMAGE">
            <Select
              options={[
                { value: 'IMAGE', label: '图片' },
                { value: 'VIDEO', label: '视频' },
                { value: 'AUDIO', label: '音频' },
                { value: 'PANO360', label: '全景' },
              ]}
            />
          </Form.Item>
          <Form.Item name="altText" label="Alt 文本">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="folder" label="目录" initialValue="default">
            <Input />
          </Form.Item>
          <Form.Item name="tags" label="标签 (逗号分隔)">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={aiOpen}
        title="AI 文生图 (placeholder)"
        onCancel={() => setAiOpen(false)}
        onOk={onAiGenerate}
        confirmLoading={aiLoading}
        destroyOnClose
      >
        <Input.TextArea
          rows={4}
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="描述你想要的图片，例如：广州六榕寺水墨风格插画，淡雅禅意"
        />
        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
          W1 阶段为占位实现，生成 placehold.co 图并写入媒体库和 AI 追踪表。W5 接入真实模型。
        </Text>
      </Modal>
    </Card>
  );
}
