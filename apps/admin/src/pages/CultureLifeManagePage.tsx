import { useEffect, useState } from 'react';
import { Card, Tabs, Table, Tag, Typography, Empty, Spin, Alert } from 'antd';

const { Title, Paragraph, Text } = Typography;

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002';

const QUESTION_CODES = [
  'ORIGIN_PURPOSE','SUFFERING','LOVE_RELATIONSHIP','WEALTH_DESIRE',
  'FREEDOM_FATE','DEATH_TRANSCENDENCE','SIN_REDEMPTION','KNOWLEDGE',
  'SELF_OTHER','TIME_ETERNITY','BODY_SOUL','LEGACY_IMMORTALITY',
];

const STAGES = ['BIRTH','GROWTH','MARRIAGE','CAREER','MIDLIFE','AGING','DEATH'];

interface Question { id: string; code: string; title: string; titleEn: string; question: string; philosophicalDepth: string }
interface Perspective { id: string; corePosition: string; religion?: { name: string; color: string }; question?: { title: string } }
interface StageGuide   { id: string; stage: string; title: string; keyWisdom: string; religion?: { name: string; color: string } }

export default function CultureLifeManagePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [perspectives, setPerspectives] = useState<Perspective[]>([]);
  const [stages, setStages] = useState<StageGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [qRes, sRes] = await Promise.all([
          fetch(`${API_BASE}/api/culture-life/questions`).then(r => r.json()),
          fetch(`${API_BASE}/api/culture-life/stages`).then(r => r.json()),
        ]);
        setQuestions(qRes.items ?? []);
        setStages(sRes.items ?? []);

        // 聚合所有命题的观点
        const allPersp: Perspective[] = [];
        for (const q of (qRes.items ?? [])) {
          try {
            const m = await fetch(`${API_BASE}/api/culture-life/questions/${q.code}`).then(r => r.json());
            for (const p of (m.perspectives ?? [])) {
              allPersp.push({ ...p, question: { title: q.title } });
            }
          } catch {}
        }
        setPerspectives(allPersp);
      } catch (e: any) {
        setErr(e?.message ?? '加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spin />;

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>文化与生命（M40） — 内容管理</Title>
      <Paragraph type="secondary">
        12 大生命命题 × 12 文化 × 7 阶段。当前只读视图；编辑能力将在后续迭代加入。
      </Paragraph>

      {err && <Alert type="error" message={err} style={{ marginBottom: 16 }} />}

      <Tabs
        items={[
          {
            key: 'questions',
            label: `生命命题（${questions.length}/12）`,
            children: (
              <Card>
                <Table
                  rowKey="id"
                  pagination={false}
                  dataSource={questions}
                  columns={[
                    { title: 'Code', dataIndex: 'code', width: 180 },
                    { title: '中文', dataIndex: 'title' },
                    { title: 'English', dataIndex: 'titleEn' },
                    { title: '问句', dataIndex: 'question', ellipsis: true },
                  ]}
                  locale={{ emptyText: <Empty description="尚无数据，请先运行 seed-culture-life" /> }}
                />
              </Card>
            ),
          },
          {
            key: 'perspectives',
            label: `文化观点（${perspectives.length}/144）`,
            children: (
              <Card>
                <Table
                  rowKey="id"
                  pagination={{ pageSize: 20 }}
                  dataSource={perspectives}
                  columns={[
                    {
                      title: '文化',
                      render: (_, r) =>
                        r.religion ? <Tag color={r.religion.color}>{r.religion.name}</Tag> : '—',
                      width: 120,
                    },
                    { title: '命题', render: (_, r) => r.question?.title ?? '—', width: 180 },
                    { title: '核心立场', dataIndex: 'corePosition', ellipsis: true },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: 'stages',
            label: `生命阶段（${stages.length}/84）`,
            children: (
              <Card>
                <Table
                  rowKey="id"
                  pagination={{ pageSize: 20 }}
                  dataSource={stages}
                  columns={[
                    { title: '阶段', dataIndex: 'stage', width: 100 },
                    {
                      title: '文化',
                      render: (_, r) =>
                        r.religion ? <Tag color={r.religion.color}>{r.religion.name}</Tag> : '—',
                      width: 120,
                    },
                    { title: '标题', dataIndex: 'title' },
                    { title: '核心智慧', dataIndex: 'keyWisdom', ellipsis: true },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: 'coverage',
            label: '覆盖率',
            children: (
              <Card>
                <Paragraph>
                  <Text strong>命题：</Text>{questions.length}/12{' '}
                  {questions.length >= 12 ? <Tag color="green">完整</Tag> : <Tag color="orange">待补</Tag>}
                </Paragraph>
                <Paragraph>
                  <Text strong>观点矩阵：</Text>{perspectives.length}/144（12 命题 × 12 文化）{' '}
                  {perspectives.length >= 72 ? <Tag color="blue">V1 达标</Tag> : <Tag color="orange">待补</Tag>}
                </Paragraph>
                <Paragraph>
                  <Text strong>阶段指引：</Text>{stages.length}/84（7 阶段 × 12 文化）{' '}
                  {stages.length >= 42 ? <Tag color="blue">V1 达标</Tag> : <Tag color="orange">待补</Tag>}
                </Paragraph>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
