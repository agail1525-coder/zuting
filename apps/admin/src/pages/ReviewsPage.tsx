import { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Rate, Select, Popconfirm, Button, Image, message, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getReviews, deleteReview } from '../lib/api';
import type { Review } from '../types';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

const TARGET_TYPE_OPTIONS = [
  { value: '', label: '全部类型' },
  { value: 'TRIP', label: '行程' },
  { value: 'GUIDE', label: '导游' },
  { value: 'SITE', label: '圣地' },
];

const targetTypeLabels: Record<string, { text: string; color: string }> = {
  TRIP: { text: '行程', color: 'blue' },
  GUIDE: { text: '导游', color: 'green' },
  SITE: { text: '圣地', color: 'orange' },
};

export default function ReviewsPage() {
  const [data, setData] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  const fetchReviews = () => {
    setLoading(true);
    getReviews(filterType || undefined)
      .then(setData)
      .catch((err: unknown) => {
        message.error('加载数据失败: ' + (err instanceof Error ? err.message : '网络错误'));
        setData([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, [filterType]);

  const handleDelete = async (id: string) => {
    try {
      await deleteReview(id);
      message.success('已删除评价');
      fetchReviews();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<Review> = [
    {
      title: '评价者',
      dataIndex: ['user', 'nickname'],
      key: 'user',
      width: 120,
      render: (_: unknown, r: Review) => r.user?.nickname || '匿名用户',
    },
    {
      title: '目标类型',
      dataIndex: 'targetType',
      key: 'targetType',
      width: 90,
      render: (type: string) => {
        const info = targetTypeLabels[type];
        return info ? <Tag color={info.color}>{info.text}</Tag> : <Tag>{type}</Tag>;
      },
    },
    {
      title: '目标ID',
      dataIndex: 'targetId',
      key: 'targetId',
      width: 160,
      ellipsis: true,
      render: (id: string) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{id}</span>,
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 160,
      sorter: (a: Review, b: Review) => a.rating - b.rating,
      render: (rating: number) => <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} />,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 260,
      render: (text: string) => (
        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0, color: '#ccc' }}>
          {text || '-'}
        </Paragraph>
      ),
    },
    {
      title: '图片',
      dataIndex: 'images',
      key: 'images',
      width: 120,
      render: (images: string[]) => {
        if (!images || images.length === 0) return '-';
        return (
          <Image.PreviewGroup>
            <Space size={4}>
              {images.slice(0, 3).map((url, i) => (
                <Image key={i} src={url} width={32} height={32} style={{ objectFit: 'cover', borderRadius: 4 }} />
              ))}
              {images.length > 3 && <span style={{ color: '#999', fontSize: 12 }}>+{images.length - 3}</span>}
            </Space>
          </Image.PreviewGroup>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: (a: Review, b: Review) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: Review) => (
        <Popconfirm
          title="确认删除此评价?"
          onConfirm={() => handleDelete(record.id)}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ color: '#D4A855', marginBottom: 0 }}>
          评价管理
        </Title>
        <Select
          value={filterType}
          onChange={setFilterType}
          options={TARGET_TYPE_OPTIONS}
          style={{ width: 140 }}
          placeholder="筛选类型"
        />
      </div>
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: '暂无评价数据' }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          size="middle"
          scroll={{ x: 1100 }}
        />
      </Card>
    </>
  );
}
