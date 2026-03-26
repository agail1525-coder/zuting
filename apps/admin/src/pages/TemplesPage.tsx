import { useEffect, useState } from 'react';
import { Table, Card, Typography, Select, Space, Tag, Button, Modal, Form, Input, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getTemples, getReligions, createTemple, updateTemple, deleteTemple } from '../lib/api';

const { Title } = Typography;

export default function TemplesPage() {
  const [data, setData] = useState<any[]>([]);
  const [religions, setReligions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [religionFilter, setReligionFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    getReligions().then(setReligions);
  }, []);

  const load = () => {
    setLoading(true);
    getTemples(religionFilter).then(setData).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [religionFilter]);

  const religionMap = Object.fromEntries(religions.map((r) => [r.id, r]));

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.nameZh || record.name,
      nameEn: record.nameEn || record.name,
      country: record.country,
      address: record.address,
      foundingDate: record.foundingDate,
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
        await updateTemple(editing.id, values);
        message.success('更新成功');
      } else {
        await createTemple(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      if (err?.errorFields) return;
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

  const columns: ColumnsType<any> = [
    {
      title: '祖庭名称',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, r: any) => (
        <span style={{ fontWeight: 600 }}>{r.nameZh || r.name || '-'}</span>
      ),
    },
    {
      title: '英文名',
      dataIndex: 'nameEn',
      key: 'nameEn',
      render: (_: any, r: any) => r.nameEn || r.name || '-',
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
      title: '所属信仰',
      dataIndex: 'religionId',
      key: 'religionId',
      render: (id: string) => {
        const r = religionMap[id];
        return r ? (
          <Tag color={r.color || 'gold'}>{r.nameZh || r.name || r.slug}</Tag>
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
      render: (_: any, record: any) => (
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
          祖庭管理
        </Title>
        <Space>
          <span style={{ color: '#999' }}>按信仰筛选:</span>
          <Select
            allowClear
            placeholder="全部信仰"
            style={{ width: 180 }}
            onChange={(v) => setReligionFilter(v)}
            options={religions.map((r) => ({
              value: r.id,
              label: r.nameZh || r.name || r.slug,
            }))}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增
          </Button>
        </Space>
      </div>
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
          <Form.Item name="country" label="国家">
            <Input placeholder="例: China" />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input placeholder="详细地址" />
          </Form.Item>
          <Form.Item name="foundingDate" label="创建年代">
            <Input placeholder="例: 495 AD" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="祖庭描述" />
          </Form.Item>
          <Form.Item name="imageUrl" label="图片URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="religionId" label="所属信仰" rules={[{ required: true, message: '请选择信仰' }]}>
            <Select
              placeholder="选择信仰"
              options={religions.map((r) => ({
                value: r.id,
                label: r.nameZh || r.name || r.slug,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
