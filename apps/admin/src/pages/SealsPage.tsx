import { useEffect, useState } from 'react';
import { Table, Card, Typography, Select, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getSeals } from '../lib/api';
import { SERIES_COLORS } from '../lib/theme';

const { Title } = Typography;

const SERIES_OPTIONS = ['初印系', '中印系', '印果印', '成道印', '归源印'];

export default function SealsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seriesFilter, setSeriesFilter] = useState<string | undefined>();

  useEffect(() => {
    setLoading(true);
    getSeals(seriesFilter).then(setData).finally(() => setLoading(false));
  }, [seriesFilter]);

  const columns: ColumnsType<any> = [
    {
      title: '序号',
      dataIndex: 'order',
      key: 'order',
      width: 70,
      sorter: (a: any, b: any) => (a.order || 0) - (b.order || 0),
    },
    {
      title: '印名',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, r: any) => (
        <span style={{ fontWeight: 600, color: '#D4A855' }}>{r.nameZh || r.name || '-'}</span>
      ),
    },
    {
      title: '英文名',
      dataIndex: 'nameEn',
      key: 'nameEn',
      render: (_: any, r: any) => r.nameEn || r.name || '-',
    },
    {
      title: '系列',
      dataIndex: 'series',
      key: 'series',
      render: (series: string) => (
        <Tag color={SERIES_COLORS[series] || '#999'} style={{ fontWeight: 600 }}>
          {series || '-'}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 300,
    },
    {
      title: '关联',
      dataIndex: 'verse',
      key: 'verse',
      ellipsis: true,
      width: 200,
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
        </Space>
      </div>
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
    </>
  );
}
