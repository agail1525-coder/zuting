import { useEffect, useState } from 'react';
import { Table, Card, Typography, Select, Space, Tag, Button, Modal, Form, Input, InputNumber, Popconfirm, message, Descriptions, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ExperimentOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { getSeals, createSeal, updateSeal, deleteSeal } from '../lib/api';
import type { CreateSealDto } from '../lib/api';
import { SERIES_COLORS } from '../lib/theme';
import type { Seal } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

const SERIES_OPTIONS = ['初印系', '中印系', '印果印', '成道印', '归源印'];

const SERIES_ENUM_MAP: Record<string, string> = {
  '初印系': 'CHUYIN',
  '中印系': 'ZHONGYIN',
  '印果印': 'YINGUOYIN',
  '成道印': 'CHENGDAOYIN',
  '归源印': 'GUIYUANYIN',
};

const SERIES_LABEL_MAP: Record<string, string> = {
  CHUYIN: '初印系',
  ZHONGYIN: '中印系',
  YINGUOYIN: '印果印',
  CHENGDAOYIN: '成道印',
  GUIYUANYIN: '归源印',
};

const SERIES_ENUM_OPTIONS = [
  { value: 'CHUYIN', label: '初印系' },
  { value: 'ZHONGYIN', label: '中印系' },
  { value: 'YINGUOYIN', label: '印果印' },
  { value: 'CHENGDAOYIN', label: '成道印' },
  { value: 'GUIYUANYIN', label: '归源印' },
];

function getSeriesLabel(series: string): string {
  return SERIES_LABEL_MAP[series] || series || '-';
}

export default function SealsPage() {
  const [data, setData] = useState<Seal[]>([]);
  const [loading, setLoading] = useState(true);
  const [seriesFilter, setSeriesFilter] = useState<string | undefined>();
  const [detail, setDetail] = useState<Seal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Seal | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    setError(null);
    const enumSeries = seriesFilter ? SERIES_ENUM_MAP[seriesFilter] : undefined;
    getSeals(enumSeries).then(setData).catch((e: Error) => { setError(e.message || '加载失败'); message.error('数据加载失败'); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [seriesFilter]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Seal) => {
    setEditing(record);
    form.setFieldsValue({
      id: record.id,
      name: record.name,
      series: record.series,
      poem: record.poem,
      essence: record.essence,
      practice: record.practice,
      vow: record.vow,
      color: record.color,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editing) {
        const { id: _id, ...updateData } = values;
        await updateSeal(editing.id, updateData);
        message.success('更新成功');
      } else {
        await createSeal(values as CreateSealDto);
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

  const handleDelete = async (id: number) => {
    try {
      await deleteSeal(id);
      message.success('删除成功');
      load();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<Seal> = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: (a: Seal, b: Seal) => a.id - b.id,
    },
    {
      title: '印名',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, r: Seal) => (
        <span style={{ fontWeight: 600, color: '#D4A855' }}>{r.name || '-'}</span>
      ),
    },
    {
      title: '系列',
      dataIndex: 'series',
      key: 'series',
      render: (series: string) => {
        const label = getSeriesLabel(series);
        return (
          <Tag color={SERIES_COLORS[label] || '#999'} style={{ fontWeight: 600 }}>
            {label}
          </Tag>
        );
      },
    },
    {
      title: '偈颂',
      dataIndex: 'poem',
      key: 'poem',
      ellipsis: true,
      width: 200,
    },
    {
      title: '要义',
      dataIndex: 'essence',
      key: 'essence',
      ellipsis: true,
      width: 200,
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: Seal) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetail(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<ExperimentOutlined />} onClick={() => navigate(`/seals/${record.id}`)}>
            Studio
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除此印?" onConfirm={() => handleDelete(record.id)} okText="确认" cancelText="取消">
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
          曹溪愿命三十印
        </Title>
        <Space>
          <span style={{ color: '#999' }}>按系列筛选:</span>
          <Select
            allowClear
            placeholder="全部系列"
            style={{ width: 160 }}
            onChange={(v) => setSeriesFilter(v)}
            options={SERIES_OPTIONS.map((s) => ({ value: s, label: s }))}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增印
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
          pagination={{ pageSize: 15, showTotal: (t) => `共 ${t} 条` }}
          size="middle"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="印详情"
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={null}
        width={700}
      >
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{detail.id}</Descriptions.Item>
            <Descriptions.Item label="印名">{detail.name}</Descriptions.Item>
            <Descriptions.Item label="系列">
              <Tag color={SERIES_COLORS[getSeriesLabel(detail.series)] || '#999'}>
                {getSeriesLabel(detail.series)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="偈颂">{detail.poem || '-'}</Descriptions.Item>
            <Descriptions.Item label="要义">{detail.essence || '-'}</Descriptions.Item>
            <Descriptions.Item label="修行法">{detail.practice || '-'}</Descriptions.Item>
            <Descriptions.Item label="愿力">{detail.vow || '-'}</Descriptions.Item>
            <Descriptions.Item label="颜色">
              {detail.color ? <Tag color={detail.color}>{detail.color}</Tag> : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        title={editing ? '编辑印' : '新增印'}
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
          <Form.Item name="id" label="印序号 (ID)" rules={[{ required: true, message: '请输入序号' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="例: 1" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="name" label="印名" rules={[{ required: true, message: '请输入印名' }]}>
            <Input placeholder="例: 发心印" />
          </Form.Item>
          <Form.Item name="series" label="系列" rules={[{ required: true, message: '请选择系列' }]}>
            <Select placeholder="选择系列" options={SERIES_ENUM_OPTIONS} />
          </Form.Item>
          <Form.Item name="poem" label="偈颂" rules={[{ required: true, message: '请输入偈颂' }]}>
            <TextArea rows={3} placeholder="偈颂内容" />
          </Form.Item>
          <Form.Item name="essence" label="要义" rules={[{ required: true, message: '请输入要义' }]}>
            <TextArea rows={3} placeholder="要义阐述" />
          </Form.Item>
          <Form.Item name="practice" label="修行法" rules={[{ required: true, message: '请输入修行法' }]}>
            <TextArea rows={3} placeholder="修行方法" />
          </Form.Item>
          <Form.Item name="vow" label="愿力" rules={[{ required: true, message: '请输入愿力' }]}>
            <TextArea rows={2} placeholder="愿力" />
          </Form.Item>
          <Form.Item name="color" label="颜色">
            <Input placeholder="例: #D4A855" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
