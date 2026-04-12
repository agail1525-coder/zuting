import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Typography, Select, Space, Tag, Button, Modal, Form, Input, InputNumber, Popconfirm, message, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExperimentOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getHolySites, getReligions, createHolySite, updateHolySite, deleteHolySite } from '../lib/api';
import type { HolySite, Religion } from '../types';

const { Title } = Typography;

export default function HolySitesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<HolySite[]>([]);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [loading, setLoading] = useState(true);
  const [religionFilter, setReligionFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HolySite | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    getReligions().then(setReligions).catch(() => message.error('文化传统列表加载失败'));
  }, []);

  const load = () => {
    setLoading(true);
    setError(null);
    getHolySites(religionFilter).then(setData).catch((e: Error) => { setError(e.message || '加载失败'); message.error('数据加载失败'); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [religionFilter]);

  const religionMap = Object.fromEntries(religions.map((r) => [r.id, r]));

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: HolySite) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      nameEn: record.nameEn || record.name,
      country: record.country,
      latitude: record.latitude,
      longitude: record.longitude,
      utcOffset: record.utcOffset,
      description: record.description,
      imageUrl: record.imageUrl,
      religionId: record.religionId,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editing) {
        await updateHolySite(editing.id, values);
        message.success('更新成功');
      } else {
        await createHolySite(values);
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
      await deleteHolySite(id);
      message.success('删除成功');
      load();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<HolySite> = [
    {
      title: '图片',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      render: (url: string) => url ? (
        <img src={url} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} />
      ) : (
        <div style={{ width: 60, height: 40, background: '#1a1a2e', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 16, opacity: 0.3 }}>🖼</span>
        </div>
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, r: HolySite) => (
        <span style={{ fontWeight: 600 }}>{r.name || '-'}</span>
      ),
    },
    {
      title: '英文名',
      dataIndex: 'nameEn',
      key: 'nameEn',
      render: (_: string, r: HolySite) => r.nameEn || r.name || '-',
    },
    {
      title: '国家',
      dataIndex: 'country',
      key: 'country',
    },
    {
      title: '纬度',
      dataIndex: 'latitude',
      key: 'latitude',
      render: (v: number) => v?.toFixed(4) ?? '-',
    },
    {
      title: '经度',
      dataIndex: 'longitude',
      key: 'longitude',
      render: (v: number) => v?.toFixed(4) ?? '-',
    },
    {
      title: '所属文化',
      dataIndex: 'religionId',
      key: 'religionId',
      render: (id: string) => {
        const r = religionMap[id];
        return r ? (
          <Tag color={r.color || 'gold'}>{r.name || r.slug}</Tag>
        ) : (
          '-'
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: HolySite) => (
        <Space>
          <Button type="link" size="small" icon={<ExperimentOutlined />} onClick={() => navigate(`/holy-sites/${record.id}`)}>
            Studio
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            快编
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
          圣地管理
        </Title>
        <Space>
          <span style={{ color: '#999' }}>按文化传统筛选:</span>
          <Select
            allowClear
            placeholder="全部文化传统"
            style={{ width: 180 }}
            onChange={(v) => setReligionFilter(v)}
            options={religions.map((r) => ({
              value: r.id,
              label: r.name || r.slug,
            }))}
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
        title={editing ? '编辑圣地' : '新增圣地'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText={editing ? '保存' : '创建'}
        cancelText="取消"
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="例: 菩提伽耶" />
          </Form.Item>
          <Form.Item name="nameEn" label="英文名" rules={[{ required: true, message: '请输入英文名' }]}>
            <Input placeholder="例: Bodh Gaya" />
          </Form.Item>
          <Form.Item name="country" label="国家" rules={[{ required: true, message: '请输入国家' }]}>
            <Input placeholder="例: India" />
          </Form.Item>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="latitude" label="纬度" rules={[{ required: true, message: '请输入纬度' }, { type: 'number', min: -90, max: 90, message: '纬度范围: -90 ~ 90' }]}>
              <InputNumber style={{ width: 180 }} placeholder="例: 24.6952" step={0.0001} />
            </Form.Item>
            <Form.Item name="longitude" label="经度" rules={[{ required: true, message: '请输入经度' }, { type: 'number', min: -180, max: 180, message: '经度范围: -180 ~ 180' }]}>
              <InputNumber style={{ width: 180 }} placeholder="例: 84.9914" step={0.0001} />
            </Form.Item>
            <Form.Item name="utcOffset" label="UTC偏移" rules={[{ required: true, message: '请输入UTC偏移' }, { type: 'number', min: -12, max: 14, message: 'UTC偏移范围: -12 ~ 14' }]}>
              <InputNumber style={{ width: 120 }} placeholder="例: 5.5" step={0.5} />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="描述" rules={[{ required: true, message: '请输入描述' }]}>
            <Input.TextArea rows={3} placeholder="圣地描述" />
          </Form.Item>
          <Form.Item name="imageUrl" label="图片URL" rules={[{ type: 'url', message: '请输入有效的URL' }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="religionId" label="所属文化传统" rules={[{ required: true, message: '请选择文化传统' }]}>
            <Select
              placeholder="选择文化传统"
              options={religions.map((r) => ({
                value: r.id,
                label: r.name || r.slug,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
