import { useEffect, useState } from 'react';
import { Table, Card, Typography, Select, Space, Tag, Button, Modal, Form, Input, Popconfirm, message, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getPatriarchs, getReligions, createPatriarch, updatePatriarch, deletePatriarch } from '../lib/api';
import type { Patriarch, Religion } from '../types';

const { Title } = Typography;

export default function PatriarchsPage() {
  const [data, setData] = useState<Patriarch[]>([]);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [loading, setLoading] = useState(true);
  const [religionFilter, setReligionFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Patriarch | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    getReligions().then(setReligions).catch(() => message.error('文化传统列表加载失败'));
  }, []);

  const load = () => {
    setLoading(true);
    setError(null);
    getPatriarchs(religionFilter).then(setData).catch((e: Error) => { setError(e.message || '加载失败'); message.error('数据加载失败'); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [religionFilter]);

  const religionMap = Object.fromEntries(religions.map((r) => [r.id, r]));

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Patriarch) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      nameEn: record.nameEn || record.name,
      dates: record.dates,
      title: record.title,
      biography: record.biography,
      coreTeaching: record.coreTeaching,
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
        await updatePatriarch(editing.id, values);
        message.success('更新成功');
      } else {
        await createPatriarch(values);
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
      await deletePatriarch(id);
      message.success('删除成功');
      load();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<Patriarch> = [
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
      title: '祖师名称',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, r: Patriarch) => (
        <span style={{ fontWeight: 600 }}>{r.name || '-'}</span>
      ),
    },
    {
      title: '英文名',
      dataIndex: 'nameEn',
      key: 'nameEn',
      render: (_: string | undefined, r: Patriarch) => r.nameEn || r.name || '-',
    },
    {
      title: '生卒年',
      key: 'era',
      render: (_: unknown, r: Patriarch) => r.dates || '-',
    },
    {
      title: '称号',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
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
      title: '简介',
      dataIndex: 'biography',
      key: 'biography',
      ellipsis: true,
      width: 200,
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: Patriarch) => (
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
          祖师管理
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
        title={editing ? '编辑祖师' : '新增祖师'}
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
            <Input placeholder="例: 释迦牟尼" />
          </Form.Item>
          <Form.Item name="nameEn" label="英文名">
            <Input placeholder="例: Shakyamuni Buddha" />
          </Form.Item>
          <Form.Item name="dates" label="生卒年">
            <Input placeholder="例: 563 BC - 483 BC" />
          </Form.Item>
          <Form.Item name="title" label="称号">
            <Input placeholder="例: 佛教文化创始人" />
          </Form.Item>
          <Form.Item name="biography" label="传记">
            <Input.TextArea rows={3} placeholder="祖师生平简介" />
          </Form.Item>
          <Form.Item name="coreTeaching" label="核心教义">
            <Input.TextArea rows={2} placeholder="核心教义概述" />
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
