import { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Switch, Input, Select, Space, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getJournals, updateJournal } from '../lib/api';
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

  const columns: ColumnsType<Journal> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text || '无标题'}</span>,
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
          朝圣日记
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
    </>
  );
}
