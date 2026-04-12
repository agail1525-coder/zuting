import { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tag, Button, Space, Typography, Input, Select,
  Drawer, Descriptions, message,
} from 'antd';
import { CheckCircleOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { listAiTraces, approveAiTrace, type AiTrace } from '../lib/m40';

const { Title, Paragraph, Text } = Typography;

const SCENARIO_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'translate', label: '翻译' },
  { value: 'content-generate', label: '内容生成' },
  { value: 'seo', label: 'SEO' },
  { value: 'moderate', label: '审核' },
  { value: 'insight', label: '洞察' },
  { value: 'command', label: '指令' },
  { value: 'prompt-lab', label: 'Prompt Lab' },
];

export default function AiTracesPage() {
  const [items, setItems] = useState<AiTrace[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [scenario, setScenario] = useState('');
  const [adminId, setAdminId] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<AiTrace | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    listAiTraces({
      scenario: scenario || undefined,
      adminId: adminId || undefined,
      page, pageSize: 20,
    })
      .then((res) => { setItems(res.items); setTotal(res.total); })
      .catch((e) => message.error(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setLoading(false));
  }, [page, scenario, adminId]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => {
    try {
      await approveAiTrace(id);
      message.success('已批准');
      load();
    } catch (e) {
      message.error(e instanceof Error ? e.message : '批准失败');
    }
  };

  const cols: ColumnsType<AiTrace> = [
    { title: '场景', dataIndex: 'scenario', width: 120, render: (v) => <Tag color="gold">{v}</Tag> },
    { title: '模型', dataIndex: 'model', width: 160 },
    { title: 'Prompt', dataIndex: 'prompt', ellipsis: true },
    { title: '输入', dataIndex: 'tokensIn', width: 80 },
    { title: '输出', dataIndex: 'tokensOut', width: 80 },
    { title: '延迟', dataIndex: 'latencyMs', width: 90, render: (v?: number) => v ? `${v}ms` : '-' },
    { title: '成本', dataIndex: 'cost', width: 100, render: (v?: string) => v ?? '-' },
    {
      title: '状态', dataIndex: 'approved', width: 90,
      render: (v: boolean) => v ? <Tag color="green">已批准</Tag> : <Tag color="orange">待审</Tag>,
    },
    {
      title: '时间', dataIndex: 'createdAt', width: 140,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作', key: 'actions', width: 160, fixed: 'right',
      render: (_, r) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => setDetail(r)}>详情</Button>
          {!r.approved && (
            <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApprove(r.id)}>批准</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ color: '#D4A855' }}>AI 审计日志</Title>
      <Paragraph type="secondary">所有 AI 调用的追踪，支持审批与溯源。</Paragraph>

      <Card
        extra={
          <Space>
            <Select style={{ width: 160 }} value={scenario} onChange={setScenario} options={SCENARIO_OPTIONS} />
            <Input.Search placeholder="管理员 ID" allowClear style={{ width: 220 }}
              onSearch={(v) => { setAdminId(v); setPage(1); }} />
            <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={cols}
          dataSource={items}
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            current: page, pageSize: 20, total,
            onChange: (p) => setPage(p),
            showTotal: (t) => `共 ${t} 条`,
          }}
        />
      </Card>

      <Drawer open={!!detail} width={720} title="AI 追踪详情" onClose={() => setDetail(null)}>
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID"><Text code>{detail.id}</Text></Descriptions.Item>
            <Descriptions.Item label="场景">{detail.scenario}</Descriptions.Item>
            <Descriptions.Item label="模型">{detail.model}</Descriptions.Item>
            <Descriptions.Item label="资源">{detail.resource ?? '-'} / {detail.resourceId ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="管理员">{detail.adminId}</Descriptions.Item>
            <Descriptions.Item label="Tokens">{detail.tokensIn ?? '-'} → {detail.tokensOut ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="延迟 / 成本">{detail.latencyMs ?? '-'}ms / {detail.cost ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="已批准">{detail.approved ? '是' : '否'}{detail.approvedBy ? ` (by ${detail.approvedBy})` : ''}</Descriptions.Item>
            <Descriptions.Item label="时间">{new Date(detail.createdAt).toLocaleString('zh-CN')}</Descriptions.Item>
            <Descriptions.Item label="Prompt">
              <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{detail.prompt}</Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label="Output">
              <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{detail.output ?? '-'}</Paragraph>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
