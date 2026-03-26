import { useEffect, useState } from 'react';
import { Table, Card, Typography, Select, Space, Tag, Tooltip, Button, Modal, Form, Input, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getTeachings, getReligions, createTeaching, updateTeaching, deleteTeaching } from '../lib/api';
import type { Teaching, Religion } from '../types';

const { Title, Paragraph } = Typography;

export default function TeachingsPage() {
  const [data, setData] = useState<Teaching[]>([]);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [loading, setLoading] = useState(true);
  const [religionFilter, setReligionFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Teaching | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    getReligions().then(setReligions);
  }, []);

  const load = () => {
    setLoading(true);
    getTeachings(religionFilter).then(setData).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [religionFilter]);

  const religionMap = Object.fromEntries(religions.map((r) => [r.id, r]));

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Teaching) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      originalText: record.originalText,
      sourceText: record.sourceText,
      translationCn: record.translationCn,
      religionId: record.religionId,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editing) {
        await updateTeaching(editing.id, values);
        message.success('更新成功');
      } else {
        await createTeaching(values);
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
      await deleteTeaching(id);
      message.success('删除成功');
      load();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<Teaching> = [
    {
      title: '祖训',
      dataIndex: 'originalText',
      key: 'originalText',
      width: 350,
      render: (text: string) => (
        <Tooltip title={text}>
          <Paragraph
            ellipsis={{ rows: 2 }}
            style={{ marginBottom: 0, color: '#ccc' }}
          >
            {text || '-'}
          </Paragraph>
        </Tooltip>
      ),
    },
    {
      title: '来源',
      dataIndex: 'sourceText',
      key: 'sourceText',
      width: 180,
    },
    {
      title: '所属信仰',
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
      title: '原文语言',
      dataIndex: 'language',
      key: 'language',
      width: 100,
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: Teaching) => (
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
          祖训管理
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
              label: r.name || r.slug,
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
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          size="middle"
        />
      </Card>

      <Modal
        title={editing ? '编辑祖训' : '新增祖训'}
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
          <Form.Item name="name" label="标题">
            <Input placeholder="祖训标题 (可选)" />
          </Form.Item>
          <Form.Item name="originalText" label="原文" rules={[{ required: true, message: '请输入原文' }]}>
            <Input.TextArea rows={4} placeholder="祖训原文内容" />
          </Form.Item>
          <Form.Item name="sourceText" label="来源">
            <Input placeholder="例: 《论语》" />
          </Form.Item>
          <Form.Item name="translationCn" label="中文翻译">
            <Input.TextArea rows={3} placeholder="中文翻译 (原文非中文时填写)" />
          </Form.Item>
          <Form.Item name="religionId" label="所属信仰" rules={[{ required: true, message: '请选择信仰' }]}>
            <Select
              placeholder="选择信仰"
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
