import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Space, Tabs, Typography, message } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  teamCultureTheme, personalGrowthTheme, familyHarmonyTheme, type ThemeRecord,
} from '../lib/m40';

const { Title } = Typography;

type Kind = 'team-culture' | 'personal-growth' | 'family-harmony';
const apiOf: Record<Kind, typeof teamCultureTheme> = {
  'team-culture': teamCultureTheme,
  'personal-growth': personalGrowthTheme,
  'family-harmony': familyHarmonyTheme,
};

function ThemeTable({ kind }: { kind: Kind }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<ThemeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiOf[kind].list(1, 50)
      .then((res) => {
        const arr = Array.isArray(res) ? res : (res?.items ?? []);
        setItems(arr);
      })
      .catch((e) => message.error(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setLoading(false));
  }, [kind]);

  const cols: ColumnsType<ThemeRecord> = [
    { title: 'Slug', dataIndex: 'slug', width: 160, render: (v: string) => <code>{v}</code> },
    { title: '标题', dataIndex: 'title' },
    { title: '副标题', dataIndex: 'subtitle', render: (v?: string) => v ?? '—' },
    { title: '主题色', dataIndex: 'color', width: 110, render: (v: string) => <Tag color={v}>{v}</Tag> },
    {
      title: '发布', dataIndex: 'isPublished', width: 80,
      render: (v: boolean) => (v ? <Tag color="green">已发布</Tag> : <Tag>草稿</Tag>),
    },
    {
      title: '操作', key: 'actions', width: 140,
      render: (_, r) => (
        <Button type="link" size="small" icon={<ExperimentOutlined />}
          onClick={() => navigate(`/${kind}/themes/${r.slug}`)}>
          Studio
        </Button>
      ),
    },
  ];

  return <Table rowKey="id" columns={cols} dataSource={items} loading={loading} pagination={false} />;
}

export default function ThemesOverviewPage() {
  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0, color: '#D4A855' }}>主题包总览</Title>
      </Space>
      <Card>
        <Tabs items={[
          { key: 'team-culture', label: '团队文化', children: <ThemeTable kind="team-culture" /> },
          { key: 'personal-growth', label: '个人圆满', children: <ThemeTable kind="personal-growth" /> },
          { key: 'family-harmony', label: '家庭幸福', children: <ThemeTable kind="family-harmony" /> },
        ]} />
      </Card>
    </div>
  );
}
