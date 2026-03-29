import { useEffect, useState } from 'react';
import { Table, Card, Typography, Select, Space, Tag, Button, Modal, Form, Input, InputNumber, Popconfirm, message, Alert, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, SoundOutlined, GlobalOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getMediaList, getHolySites, getTemples, createMedia, updateMedia, deleteMedia } from '../lib/api';
import type { CreateMediaDto } from '../lib/api';
import type { MediaContent, HolySite, Temple } from '../types';

const { Title } = Typography;

const MEDIA_TYPE_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  VIDEO: { label: '视频', color: 'blue', icon: <PlayCircleOutlined /> },
  PANORAMA: { label: '全景', color: 'cyan', icon: <GlobalOutlined /> },
  AUDIO: { label: '音频', color: 'purple', icon: <SoundOutlined /> },
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  HOLY_SITE: '圣地',
  TEMPLE: '祖庭',
};

export default function MediaPage() {
  const [data, setData] = useState<MediaContent[]>([]);
  const [holySites, setHolySites] = useState<HolySite[]>([]);
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string | undefined>();
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MediaContent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const formEntityType = Form.useWatch('entityType', form);

  useEffect(() => {
    Promise.all([
      getHolySites().catch(() => []),
      getTemples().catch(() => []),
    ]).then(([hs, t]) => {
      setHolySites(hs);
      setTemples(t);
    });
  }, []);

  const load = () => {
    setLoading(true);
    setError(null);
    getMediaList(entityTypeFilter, undefined, mediaTypeFilter)
      .then((res) => setData(res.data))
      .catch((e: Error) => { setError(e.message || '加载失败'); message.error('数据加载失败'); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [entityTypeFilter, mediaTypeFilter]);

  const entityMap: Record<string, string> = {};
  holySites.forEach((s) => { entityMap[s.id] = s.name; });
  temples.forEach((t) => { entityMap[t.id] = t.name; });

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: MediaContent) => {
    setEditing(record);
    form.setFieldsValue({
      entityType: record.entityType,
      entityId: record.entityId,
      mediaType: record.mediaType,
      title: record.title,
      url: record.url,
      description: record.description || '',
      thumbnailUrl: record.thumbnailUrl || '',
      duration: record.duration,
      sortOrder: record.sortOrder,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const dto: CreateMediaDto = {
        entityType: values.entityType,
        entityId: values.entityId,
        mediaType: values.mediaType,
        title: values.title,
        url: values.url,
        description: values.description || undefined,
        thumbnailUrl: values.thumbnailUrl || undefined,
        duration: values.duration ?? undefined,
        sortOrder: values.sortOrder ?? 0,
      };
      if (editing) {
        await updateMedia(editing.id, dto);
        message.success('更新成功');
      } else {
        await createMedia(dto);
        message.success('创建成功');
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(editing ? '更新失败' : '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedia(id);
      message.success('删除成功');
      load();
    } catch {
      message.error('删除失败');
    }
  };

  const entityOptions = formEntityType === 'TEMPLE'
    ? temples.map((t) => ({ value: t.id, label: t.name }))
    : holySites.map((s) => ({ value: s.id, label: s.name }));

  const columns: ColumnsType<MediaContent> = [
    {
      title: '缩略图',
      dataIndex: 'thumbnailUrl',
      key: 'thumbnailUrl',
      width: 80,
      render: (url: string | null, record) => url ? (
        <img src={url} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} />
      ) : (
        <div style={{ width: 60, height: 40, background: '#f0f5ff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {MEDIA_TYPE_LABELS[record.mediaType]?.icon || '🎬'}
        </div>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <span style={{ fontWeight: 600 }}>{title}</span>,
    },
    {
      title: '媒体类型',
      dataIndex: 'mediaType',
      key: 'mediaType',
      width: 100,
      render: (type: string) => {
        const info = MEDIA_TYPE_LABELS[type];
        return info ? <Tag color={info.color} icon={info.icon}>{info.label}</Tag> : type;
      },
    },
    {
      title: '关联类型',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 80,
      render: (type: string) => <Tag>{ENTITY_TYPE_LABELS[type] || type}</Tag>,
    },
    {
      title: '关联实体',
      dataIndex: 'entityId',
      key: 'entityId',
      ellipsis: true,
      render: (id: string) => entityMap[id] || id,
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (d: number | null) => d != null ? `${Math.floor(d / 60)}:${String(d % 60).padStart(2, '0')}` : '-',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 70,
      render: (active: boolean) => <Tag color={active ? 'green' : 'default'}>{active ? '启用' : '停用'}</Tag>,
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: MediaContent) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)} okText="确认" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ color: '#D4A855', margin: 0 }}>
          多媒体管理
        </Title>
        <Space>
          <span style={{ color: '#999' }}>实体类型:</span>
          <Select
            allowClear
            placeholder="全部"
            style={{ width: 120 }}
            onChange={(v) => setEntityTypeFilter(v)}
            options={[
              { value: 'HOLY_SITE', label: '圣地' },
              { value: 'TEMPLE', label: '祖庭' },
            ]}
          />
          <span style={{ color: '#999' }}>媒体类型:</span>
          <Select
            allowClear
            placeholder="全部"
            style={{ width: 120 }}
            onChange={(v) => setMediaTypeFilter(v)}
            options={[
              { value: 'VIDEO', label: '视频' },
              { value: 'PANORAMA', label: '全景' },
              { value: 'AUDIO', label: '音频' },
            ]}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增
          </Button>
        </Space>
      </div>
      {error && <Alert type="error" message={error} closable onClose={() => setError(null)} style={{ marginBottom: 16 }} />}
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          size="middle"
        />
      </Card>

      <Modal
        title={editing ? '编辑多媒体' : '新增多媒体'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText={editing ? '保存' : '创建'}
        cancelText="取消"
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="entityType" label="关联类型" rules={[{ required: true, message: '请选择' }]} style={{ flex: 1 }}>
              <Select
                placeholder="选择类型"
                options={[
                  { value: 'HOLY_SITE', label: '圣地' },
                  { value: 'TEMPLE', label: '祖庭' },
                ]}
                onChange={() => form.setFieldValue('entityId', undefined)}
              />
            </Form.Item>
            <Form.Item name="entityId" label="关联实体" rules={[{ required: true, message: '请选择实体' }]} style={{ flex: 2 }}>
              <Select
                placeholder="选择圣地或祖庭"
                showSearch
                optionFilterProp="label"
                options={entityOptions}
              />
            </Form.Item>
          </Space>
          <Form.Item name="mediaType" label="媒体类型" rules={[{ required: true, message: '请选择媒体类型' }]}>
            <Select
              placeholder="选择类型"
              options={[
                { value: 'VIDEO', label: '视频' },
                { value: 'PANORAMA', label: '360度全景' },
                { value: 'AUDIO', label: '音频讲解' },
              ]}
            />
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="例: 菩提伽耶航拍导览" />
          </Form.Item>
          <Form.Item name="url" label="媒体URL" rules={[{ required: true, message: '请输入URL' }, { type: 'url', message: '请输入有效的URL' }]}>
            <Input placeholder="https://cdn.zuting.org/media/..." />
          </Form.Item>
          <Form.Item name="thumbnailUrl" label="缩略图URL" rules={[{ type: 'url', message: '请输入有效的URL' }]}>
            <Input placeholder="https://cdn.zuting.org/media/...-thumb.jpg" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="媒体内容简介" />
          </Form.Item>
          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="duration" label="时长(秒)" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} min={0} placeholder="例: 180" />
            </Form.Item>
            <Form.Item name="sortOrder" label="排序权重" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
}
