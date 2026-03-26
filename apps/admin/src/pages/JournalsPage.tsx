import { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Switch, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getJournals } from '../lib/api';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

export default function JournalsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJournals()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const columns: ColumnsType<any> = [
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
      render: (_: any, r: any) => r.user?.name || r.author || '-',
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
      render: (v: boolean, record: any) => (
        <Switch
          checked={v}
          size="small"
          onChange={() => message.info('功能开发中')}
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

  return (
    <>
      <Title level={4} style={{ color: '#D4A855', marginBottom: 16 }}>
        朝圣日记
      </Title>
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
    </>
  );
}
