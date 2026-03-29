import { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Rate, Select, Popconfirm, Button, Image, message, Space, Tabs, Tooltip } from 'antd';
import { DeleteOutlined, CheckOutlined, CloseOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getReviews, deleteReview } from '../lib/api';
import type { Review } from '../types';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

type ReviewStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';

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

const STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string }> = {
  ALL:      { label: '全部',   color: '' },
  PENDING:  { label: '待审核', color: 'orange' },
  APPROVED: { label: '已通过', color: 'green' },
  REJECTED: { label: '已拒绝', color: 'red' },
  HIDDEN:   { label: '已隐藏', color: 'default' },
};

export default function ReviewsPage() {
  const [data, setData] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [activeTab, setActiveTab] = useState<ReviewStatus>('ALL');
  // Local status management (no backend status field yet)
  const [localStatus, setLocalStatus] = useState<Record<string, ReviewStatus>>({});

  const fetchReviews = (p = page, ps = pageSize) => {
    setLoading(true);
    getReviews(p, ps, filterType || undefined)
      .then((res) => { setData(res.data); setTotal(res.total); })
      .catch((err: unknown) => {
        message.error('加载数据失败: ' + (err instanceof Error ? err.message : '网络错误'));
        setData([]); setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(page, pageSize); }, [page, pageSize, filterType]);

  const handleDelete = async (id: string) => {
    try {
      await deleteReview(id);
      message.success('已删除评价');
      fetchReviews(page, pageSize);
    } catch {
      message.error('删除失败');
    }
  };

  const handleStatusChange = (id: string, status: ReviewStatus) => {
    setLocalStatus((prev) => ({ ...prev, [id]: status }));
    const labels: Record<ReviewStatus, string> = {
      ALL: '', PENDING: '已标记待审核', APPROVED: '已通过审核', REJECTED: '已拒绝', HIDDEN: '已隐藏',
    };
    if (labels[status]) message.success(labels[status]);
  };

  const getEffectiveStatus = (id: string): ReviewStatus =>
    localStatus[id] ?? 'PENDING';

  const filteredData = data.filter((r) => {
    if (activeTab === 'ALL') return true;
    return getEffectiveStatus(r.id) === activeTab;
  });

  const tabItems = (Object.keys(STATUS_CONFIG) as ReviewStatus[]).map((key) => {
    const count = key === 'ALL'
      ? data.length
      : data.filter((r) => getEffectiveStatus(r.id) === key).length;
    return {
      key,
      label: `${STATUS_CONFIG[key].label}${count > 0 ? ` (${count})` : ''}`,
    };
  });

  const columns: ColumnsType<Review> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#888' }}>
          {id.slice(-8)}
        </span>
      ),
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 150,
      sorter: (a: Review, b: Review) => a.rating - b.rating,
      render: (rating: number) => <Rate disabled defaultValue={rating} style={{ fontSize: 13 }} />,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 240,
      render: (text: string) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: '展开' }} style={{ marginBottom: 0, color: '#ccc', fontSize: 13 }}>
          {text || '-'}
        </Paragraph>
      ),
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
      width: 130,
      ellipsis: true,
      render: (id: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#888' }}>
          {id.slice(-10)}
        </span>
      ),
    },
    {
      title: '用户',
      dataIndex: ['user', 'nickname'],
      key: 'user',
      width: 110,
      render: (_: unknown, r: Review) => r.user?.nickname || '匿名用户',
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: unknown, record: Review) => {
        const s = getEffectiveStatus(record.id);
        const cfg = STATUS_CONFIG[s];
        return cfg.color ? (
          <Tag color={cfg.color}>{cfg.label}</Tag>
        ) : (
          <Tag>{cfg.label}</Tag>
        );
      },
    },
    {
      title: '图片',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images: string[]) => {
        if (!images || images.length === 0) return '-';
        return (
          <Image.PreviewGroup>
            <Space size={4}>
              {images.slice(0, 3).map((url, i) => (
                <Image key={i} src={url} width={28} height={28} style={{ objectFit: 'cover', borderRadius: 3 }} />
              ))}
              {images.length > 3 && <span style={{ color: '#999', fontSize: 11 }}>+{images.length - 3}</span>}
            </Space>
          </Image.PreviewGroup>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      sorter: (a: Review, b: Review) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (v: string) => v ? dayjs(v).format('MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: Review) => {
        const s = getEffectiveStatus(record.id);
        return (
          <Space size={4}>
            {s !== 'APPROVED' && (
              <Tooltip title="通过">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  size="small"
                  style={{ color: '#52C41A' }}
                  onClick={() => handleStatusChange(record.id, 'APPROVED')}
                />
              </Tooltip>
            )}
            {s !== 'REJECTED' && (
              <Tooltip title="拒绝">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  size="small"
                  danger
                  onClick={() => handleStatusChange(record.id, 'REJECTED')}
                />
              </Tooltip>
            )}
            {s !== 'HIDDEN' && (
              <Tooltip title="隐藏">
                <Button
                  type="text"
                  icon={<EyeInvisibleOutlined />}
                  size="small"
                  style={{ color: '#888' }}
                  onClick={() => handleStatusChange(record.id, 'HIDDEN')}
                />
              </Tooltip>
            )}
            <Popconfirm
              title="确认删除此评价?"
              onConfirm={() => handleDelete(record.id)}
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="删除">
                <Button type="text" danger icon={<DeleteOutlined />} size="small" />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ color: '#D4A855', marginBottom: 0 }}>
          评价管理 / Review Management
        </Title>
        <Select
          value={filterType}
          onChange={(v) => { setFilterType(v); setPage(1); }}
          options={TARGET_TYPE_OPTIONS}
          style={{ width: 140 }}
          placeholder="筛选类型"
        />
      </div>
      <Card bodyStyle={{ padding: '0 0 16px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={(k) => { setActiveTab(k as ReviewStatus); setPage(1); }}
          items={tabItems}
          style={{ paddingLeft: 16, paddingRight: 16 }}
        />
        <div style={{ paddingLeft: 16, paddingRight: 16 }}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            locale={{ emptyText: '暂无评价数据' }}
            pagination={{
              current: page,
              pageSize,
              total: activeTab === 'ALL' ? total : filteredData.length,
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (p, ps) => { setPage(p); setPageSize(ps); },
            }}
            size="middle"
            scroll={{ x: 1200 }}
          />
        </div>
      </Card>
    </>
  );
}
