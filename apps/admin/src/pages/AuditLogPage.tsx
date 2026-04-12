import { useEffect, useState } from 'react';
import { Card, Table, Space, Input, Select, Tag, Typography, Button, Drawer, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { listAuditLogs, type AuditLog, type AdminActionKind } from '../lib/m40';

const { Title, Text } = Typography;

const ACTIONS: AdminActionKind[] = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'PUBLISH',
  'UNPUBLISH',
  'AI_GENERATE',
  'AI_TRANSLATE',
  'AI_MODERATE',
  'ROLLBACK',
];

const actionColor: Record<AdminActionKind, string> = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
  PUBLISH: 'gold',
  UNPUBLISH: 'orange',
  AI_GENERATE: 'purple',
  AI_TRANSLATE: 'purple',
  AI_MODERATE: 'purple',
  ROLLBACK: 'volcano',
};

export default function AuditLogPage() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [resource, setResource] = useState<string | undefined>();
  const [action, setAction] = useState<AdminActionKind | undefined>();
  const [detail, setDetail] = useState<AuditLog | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await listAuditLogs({ resource, action, page, pageSize });
      setItems(r.items);
      setTotal(r.total);
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const columns: ColumnsType<AuditLog> = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 130,
      render: (a: AdminActionKind) => <Tag color={actionColor[a]}>{a}</Tag>,
    },
    { title: '资源', dataIndex: 'resource', width: 140 },
    {
      title: '资源ID',
      dataIndex: 'resourceId',
      width: 220,
      render: (v?: string | null) => (v ? <Text code>{v}</Text> : <Text type="secondary">-</Text>),
    },
    { title: '管理员', dataIndex: 'adminId', width: 200 },
    {
      title: '详情',
      key: 'actions',
      width: 100,
      render: (_, row) => (
        <Button size="small" type="link" onClick={() => setDetail(row)}>
          查看 diff
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            审计日志
          </Title>
          <Tag color="gold">{total}</Tag>
        </Space>
      }
      extra={
        <Space>
          <Input
            placeholder="资源 slug，如 holy-site"
            value={resource}
            onChange={(e) => setResource(e.target.value)}
            onPressEnter={() => {
              setPage(1);
              load();
            }}
            allowClear
            style={{ width: 200 }}
          />
          <Select
            placeholder="操作"
            value={action}
            onChange={(v) => setAction(v)}
            allowClear
            style={{ width: 160 }}
            options={ACTIONS.map((a) => ({ value: a, label: a }))}
          />
          <Button
            type="primary"
            onClick={() => {
              setPage(1);
              load();
            }}
          >
            查询
          </Button>
        </Space>
      }
    >
      <Table
        rowKey="id"
        dataSource={items}
        columns={columns}
        loading={loading}
        size="small"
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ['20', '50', '100'],
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />

      <Drawer
        open={!!detail}
        title="审计详情"
        width={640}
        onClose={() => setDetail(null)}
        destroyOnClose
      >
        {detail && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text type="secondary">操作</Text>
              <div>
                <Tag color={actionColor[detail.action]}>{detail.action}</Tag>
              </div>
            </div>
            <div>
              <Text type="secondary">资源</Text>
              <div>
                {detail.resource}
                {detail.resourceId && (
                  <>
                    {' / '}
                    <Text code>{detail.resourceId}</Text>
                  </>
                )}
              </div>
            </div>
            <div>
              <Text type="secondary">管理员</Text>
              <div>{detail.adminId}</div>
            </div>
            {detail.aiTraceId && (
              <div>
                <Text type="secondary">AI Trace</Text>
                <div>
                  <Text code>{detail.aiTraceId}</Text>
                </div>
              </div>
            )}
            <div>
              <Text type="secondary">时间</Text>
              <div>{new Date(detail.createdAt).toLocaleString('zh-CN')}</div>
            </div>
            <div>
              <Text type="secondary">Diff</Text>
              <pre
                style={{
                  background: '#0f172a',
                  color: '#e2e8f0',
                  padding: 12,
                  borderRadius: 4,
                  overflow: 'auto',
                  maxHeight: 360,
                }}
              >
                {JSON.stringify(detail.diff ?? {}, null, 2)}
              </pre>
            </div>
          </Space>
        )}
      </Drawer>
    </Card>
  );
}
