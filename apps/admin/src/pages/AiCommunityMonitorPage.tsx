import { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tag, Space, Typography, message, Button, Row, Col, Statistic, Empty,
} from 'antd';
import { ReloadOutlined, RobotOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { listAiTraces, type AiTrace } from '../lib/m40';

const { Title, Paragraph } = Typography;

const AI_COMMUNITY_SCENARIOS = ['community-post', 'community-answer', 'community-comment'];

export default function AiCommunityMonitorPage() {
  const [traces, setTraces] = useState<AiTrace[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ posts: 0, answers: 0, comments: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        AI_COMMUNITY_SCENARIOS.map((s) => listAiTraces({ scenario: s, page: 1, pageSize: 50 })),
      );
      const all: AiTrace[] = [];
      const counts = { posts: 0, answers: 0, comments: 0 };
      results.forEach((r, i) => {
        all.push(...r.items);
        if (i === 0) counts.posts = r.total;
        if (i === 1) counts.answers = r.total;
        if (i === 2) counts.comments = r.total;
      });
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTraces(all.slice(0, 50));
      setStats(counts);
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cols: ColumnsType<AiTrace> = [
    { title: '场景', dataIndex: 'scenario', width: 160, render: (v) => <Tag color="purple">{v}</Tag> },
    { title: '模型', dataIndex: 'model', width: 160 },
    { title: '资源', key: 'res', width: 220, render: (_, r) => `${r.resource ?? '-'} / ${r.resourceId?.slice(0, 10) ?? '-'}` },
    { title: 'Tokens', key: 'tokens', width: 120, render: (_, r) => `${r.tokensIn ?? 0} → ${r.tokensOut ?? 0}` },
    { title: '延迟', dataIndex: 'latencyMs', width: 90, render: (v) => v ? `${v}ms` : '-' },
    { title: '状态', dataIndex: 'approved', width: 80, render: (v: boolean) => v ? <Tag color="green">已批</Tag> : <Tag color="orange">待审</Tag> },
    { title: '时间', dataIndex: 'createdAt', width: 140, render: (v: string) => new Date(v).toLocaleString('zh-CN') },
  ];

  return (
    <div>
      <Title level={4} style={{ color: '#D4A855' }}><RobotOutlined /> AI 社区监控</Title>
      <Paragraph type="secondary">12 智能体自动发帖/回答/评论 CRON 监控，追踪 AI 社区活跃度。</Paragraph>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}><Card size="small"><Statistic title="AI 游记总数" value={stats.posts} /></Card></Col>
        <Col span={8}><Card size="small"><Statistic title="AI 回答总数" value={stats.answers} /></Card></Col>
        <Col span={8}><Card size="small"><Statistic title="AI 评论总数" value={stats.comments} /></Card></Col>
      </Row>

      <Card
        title="最近 50 条 AI 社区操作"
        extra={<Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>}
      >
        {traces.length === 0 && !loading ? (
          <Empty description="暂无 AI 社区操作记录" />
        ) : (
          <Table rowKey="id" columns={cols} dataSource={traces} loading={loading} pagination={false} scroll={{ x: 1100 }} />
        )}
      </Card>
    </div>
  );
}
