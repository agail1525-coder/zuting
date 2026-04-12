import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Typography, Select, Space, Tag, Button, Modal, Form, Input, InputNumber, Popconfirm, message, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExperimentOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getTemples, getReligions, createTemple, updateTemple, deleteTemple } from '../lib/api';
import type { Temple, Religion } from '../types';

const { Title } = Typography;

export default function TemplesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Temple[]>([]);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [loading, setLoading] = useState(true);
  const [religionFilter, setReligionFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Temple | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    getReligions().then(setReligions).catch(() => message.error('文化传统列表加载失败'));
  }, []);

  const load = () => {
    setLoading(true);
    setError(null);
    getTemples(religionFilter).then(setData).catch((e: Error) => { setError(e.message || '加载失败'); message.error('数据加载失败'); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [religionFilter]);

  const religionMap = Object.fromEntries(religions.map((r) => [r.id, r]));

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Temple) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      nameEn: record.nameEn || record.name,
      country: record.country,
      address: record.address,
      foundingDate: record.foundingDate,
      description: record.description,
      imageUrl: record.imageUrl,
      latitude: record.latitude,
      longitude: record.longitude,
      religionId: record.religionId,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editing) {
        await updateTemple(editing.id, values);
        message.success('更新成功');
      } else {
        await createTemple(values);
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
      await deleteTemple(id);
      message.success('删除成功');
      load();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<Temple> = [
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
      title: '祖庭名称',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, r: Temple) => (
        <span style={{ fontWeight: 600 }}>{r.name || '-'}</span>
      ),
    },
    {
      title: '英文名',
      dataIndex: 'nameEn',
      key: 'nameEn',
      render: (_: string | undefined, r: Temple) => r.nameEn || r.name || '-',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '国家',
      dataIndex: 'country',
      key: 'country',
    },
    {
      title: '坐标',
      key: 'coordinates',
      width: 160,
      render: (_: unknown, r: Temple) =>
        r.latitude != null && r.longitude != null
          ? `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`
          : <span style={{ color: '#999' }}>未设置</span>,
    },
    {
      title: '所属文化',
      dataIndex: 'religionId',
      key: 'religionId',
      render: (id: string) => {
        const r = religionMap[id];
        return r ? (
          <Tag color={r.color || 'gold'}>{r.name || r.slug}</Tag>
        ) : '-';
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200,
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: Temple) => (
        <Space>
          <Button type="link" size="small" icon={<ExperimentOutlined />} onClick={() => navigate(`/temples/${record.id}`)}>
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
          祖庭管理
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
        title={editing ? '编辑祖庭' : '新增祖庭'}
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
            <Input placeholder="例: 少林寺" />
          </Form.Item>
          <Form.Item name="nameEn" label="英文名">
            <Input placeholder="例: Shaolin Temple" />
          </Form.Item>
          <Form.Item name="country" label="国家" rules={[{ required: true, message: '请输入国家' }]}>
            <Input placeholder="例: China" />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input placeholder="详细地址" />
          </Form.Item>
          <Form.Item name="foundingDate" label="创建年代">
            <Input placeholder="例: 495 AD" />
          </Form.Item>
          <Form.Item name="description" label="描述" rules={[{ required: true, message: '请输入描述' }]}>
            <Input.TextArea rows={3} placeholder="祖庭描述" />
          </Form.Item>
          <Form.Item name="imageUrl" label="图片URL" rules={[{ type: 'url', message: '请输入有效的URL' }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="latitude" label="纬度" style={{ flex: 1 }} rules={[{ type: 'number', min: -90, max: 90, message: '纬度范围 -90 ~ 90' }]}>
              <InputNumber style={{ width: '100%' }} step={0.000001} precision={6} placeholder="例: 34.5075" min={-90} max={90} />
            </Form.Item>
            <Form.Item name="longitude" label="经度" style={{ flex: 1 }} rules={[{ type: 'number', min: -180, max: 180, message: '经度范围 -180 ~ 180' }]}>
              <InputNumber style={{ width: '100%' }} step={0.000001} precision={6} placeholder="例: 112.9372" min={-180} max={180} />
            </Form.Item>
          </Space>
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
