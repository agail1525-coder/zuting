import { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Switch, Input, Select, Space, Button, Popconfirm, Modal, Tooltip, message } from 'antd';
import { SearchOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getJournals, updateJournal, deleteJournal } from '../lib/api';
import type { Journal } from '../types';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

export default function JournalsPage() {
  const [data, setData] = useState<Journal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [publicFilter, setPublicFilter] = useState<string>('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<Journal | null>(null);

  const fetchJournals = (p = page, ps = pageSize) => {
    setLoading(true);
    getJournals(p, ps)
      .then((res) => { setData(res.data); setTotal(res.total); })
      .catch((err: unknown) => { message.error('加载数据失败: ' + (err instanceof Error ? err.message : '网络错误')); setData([]); setTotal(0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJournals(page, pageSize); }, [page, pageSize]);

  const handleTogglePublic = async (id: string, currentValue: boolean) => {
    try {
      await updateJournal(id, { isPublic: !currentValue });
      message.success(currentValue ? '已设为私密' : '已设为公开');
      fetchJournals(page, pageSize);
    } catch {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteJournal(id);
      message.success('已删除日志');
      fetchJournals(page, pageSize);
    } catch {
      message.error('删除失败');
    }
  };

  const showDetail = (record: Journal) => {
    setDetailRecord(record);
    setDetailOpen(true);
  };

  const columns: ColumnsType<Journal> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Journal) => (
        <a onClick={() => showDetail(record)} style={{ fontWeight: 600, color: '#D4A855' }}>
          {text || '无标题'}
        </a>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      render: (_: unknown, r: Journal) => r.user?.name || r.author || '-',
    },
    {
      title: '内容预览',
      dataIndex: 'content',
      key: 'content',
      width: 300,
      render: (text: string) => (
        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0, color: '#ccc' }}>
          {text || '-'}
        </Paragraph>
      ),
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '公开',
      dataIndex: 'isPublic',
      key: 'isPublic',
      width: 80,
      render: (v: boolean, record: Journal) => (
        <Switch
          checked={v}
          size="small"
          onChange={() => handleTogglePublic(record.id, v)}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'PUBLISHED') return <Tag color="success">已发布</Tag>;
        if (status === 'DRAFT') return <Tag color="default">草稿</Tag>;
        return <Tag>{status || '未知'}</Tag>;
      },
    },
    {
      title: '发布日期',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: Journal) => (
        <Space>
          <Tooltip title="查看详情">
            <Button type="text" icon={<EyeOutlined />} size="small" onClick={() => showDetail(record)} />
          </Tooltip>
          <Popconfirm
            title="确认删除此日志?"
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
      ),
    },
  ];

  const filteredData = data.filter((item) => {
    const keyword = searchText.toLowerCase();
    const matchesSearch = !searchText ||
      item.title?.toLowerCase().includes(keyword) ||
      item.content?.toLowerCase().includes(keyword) ||
      (item.user?.name || item.author || '').toLowerCase().includes(keyword);
    const matchesPublic = publicFilter === 'all' ||
      (publicFilter === 'public' && item.isPublic) ||
      (publicFilter === 'private' && !item.isPublic);
    return matchesSearch && matchesPublic;
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ color: '#D4A855', margin: 0 }}>
          文化之旅日记
        </Title>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索标题/内容/作者..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 240 }}
          />
          <Select
            value={publicFilter}
            onChange={setPublicFilter}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'public', label: '公开' },
              { value: 'private', label: '私密' },
            ]}
          />
        </Space>
      </div>
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: '暂无数据' }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
          size="middle"
        />
      </Card>

      <Modal
        title={detailRecord?.title || '日志详情'}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={640}
      >
        {detailRecord && (
          <div>
            <p><strong>作者:</strong> {detailRecord.user?.name || detailRecord.author || '-'}</p>
            <p><strong>地点:</strong> {detailRecord.location || '-'}</p>
            <p><strong>状态:</strong> {detailRecord.status === 'PUBLISHED' ? '已发布' : detailRecord.status === 'DRAFT' ? '草稿' : (detailRecord.status || '未知')}</p>
            <p><strong>公开:</strong> {detailRecord.isPublic ? '是' : '否'}</p>
            <p><strong>发布日期:</strong> {detailRecord.createdAt ? dayjs(detailRecord.createdAt).format('YYYY-MM-DD HH:mm') : '-'}</p>
            <div style={{ marginTop: 16, padding: 16, background: '#1a1a2e', borderRadius: 8, whiteSpace: 'pre-wrap', color: '#ccc', maxHeight: 400, overflow: 'auto' }}>
              {detailRecord.content || '暂无内容'}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
