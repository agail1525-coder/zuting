import { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Modal, Descriptions, Button, Space, Form, Input, Popconfirm, message, Alert } from 'antd';
import { EyeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getReligions, createReligion, updateReligion, deleteReligion } from '../lib/api';
import type { Religion } from '../types';

const { Title } = Typography;

export default function ReligionsPage() {
  const [data, setData] = useState<Religion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [detail, setDetail] = useState<Religion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Religion | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    setError(null);
    getReligions().then(setData).catch((e: Error) => { setError(e.message || '加载失败'); message.error('数据加载失败'); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Religion) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      nameEn: record.nameEn || record.name,
      slug: record.slug,
      symbol: record.symbol,
      color: record.color,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editing) {
        await updateReligion(editing.id, values);
        message.success('更新成功');
      } else {
        await createReligion(values);
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
      await deleteReligion(id);
      message.success('删除成功');
      load();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<Religion> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: Religion) => (
        <span style={{ fontWeight: 600 }}>{record.name || record.slug}</span>
      ),
    },
    {
      title: '英文名',
      dataIndex: 'nameEn',
      key: 'nameEn',
      render: (_: string, r: Religion) => r.nameEn || r.name || '-',
    },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    {
      title: '符号',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (v: string) => <span style={{ fontSize: 20 }}>{v || '-'}</span>,
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) =>
        color ? (
          <Tag color={color} style={{ minWidth: 60, textAlign: 'center' }}>
            {color}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: Religion) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetail(record)}>
            查看
          </Button>
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

  const filteredData = searchText
    ? data.filter((r) => {
        const keyword = searchText.toLowerCase();
        return (
          r.name?.toLowerCase().includes(keyword) ||
          r.nameEn?.toLowerCase().includes(keyword) ||
          r.slug?.toLowerCase().includes(keyword)
        );
      })
    : data;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ color: '#D4A855', margin: 0 }}>
          文化传统管理
        </Title>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索名称/英文名/Slug..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 240 }}
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
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 条` }}
          size="middle"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="文化传统详情"
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={null}
        width={600}
      >
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{detail.id}</Descriptions.Item>
            <Descriptions.Item label="名称">{detail.name}</Descriptions.Item>
            <Descriptions.Item label="英文名">{detail.nameEn || detail.name}</Descriptions.Item>
            <Descriptions.Item label="Slug">{detail.slug}</Descriptions.Item>
            <Descriptions.Item label="符号">{detail.symbol || '-'}</Descriptions.Item>
            <Descriptions.Item label="颜色">
              {detail.color ? <Tag color={detail.color}>{detail.color}</Tag> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="描述">{detail.description || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        title={editing ? '编辑文化传统' : '新增文化传统'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText={editing ? '保存' : '创建'}
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="例: 佛教文化" />
          </Form.Item>
          <Form.Item name="nameEn" label="英文名" rules={[{ required: true, message: '请输入英文名' }]}>
            <Input placeholder="例: Buddhism" />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true, message: '请输入slug' }]}>
            <Input placeholder="例: buddhism" />
          </Form.Item>
          <Form.Item name="symbol" label="符号">
            <Input placeholder="例: ☸" />
          </Form.Item>
          <Form.Item name="color" label="颜色">
            <Input placeholder="例: #D4A855" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
