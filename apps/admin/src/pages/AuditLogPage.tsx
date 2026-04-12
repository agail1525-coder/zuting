import { useEffect, useState } from 'react';
import { Card, Table, Space, Input, Select, Tag, Typography, Button, Drawer, DatePicker, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { listAuditLogs, type AuditLog, type AdminActionKind } from '../lib/m40';
import { exportCsv } from '../lib/csv';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ACTIONS: AdminActionKind[] = [
  'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'UNPUBLISH',
  'AI_GENERATE', 'AI_TRANSLATE', 'AI_MODERATE', 'ROLLBACK',
];

const actionColor: Record<AdminActionKind, string> = {
  CREATE: 'green', UPDATE: 'blue', DELETE: 'red',
  PUBLISH: 'gold', UNPUBLISH: 'orange',
  AI_GENERATE: 'purple', AI_TRANSLATE: 'purple', AI_MODERATE: 'purple',
  ROLLBACK: 'volcano',
};

export default function AuditLogPage() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [resource, setResource] = useState<string | undefined>();
  const [adminId, setAdminId] = useState<string | undefined>();
  const [action, setAction] = useState<AdminActionKind | undefined>();
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [detail, setDetail] = useState<AuditLog | null>(null);
  const [exporting, setExporting] = useState(false);

  const buildParams = (p = page, ps = pageSize) => ({
    resource, adminId, action,
    dateFrom: range?.[0]?.toISOString(),
    dateTo: range?.[1]?.toISOString(),
    page: p, pageSize: ps,
  });

  const load = async () => {
    setLoading(true);
    try {
      const r = await listAuditLogs(buildParams());
      setItems(r.items);
      setTotal(r.total);
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, pageSize]); // eslint-disable-line

  const handleQuery = () => { setPage(1); load(); };

  const handleExport = async () => {
    setExporting(true);
    try {
      const r = await listAuditLogs({ ...buildParams(1, 100) });
      const rows = r.items.map((i) => ({
        createdAt: new Date(i.createdAt).toLocaleString('zh-CN'),
        action: i.action,
        resource: i.resource,
        resourceId: i.resourceId ?? '',
        adminId: i.adminId,
        aiTraceId: i.aiTraceId ?? '',
        diff: JSON.stringify(i.diff ?? {}),
      }));
      exportCsv(`audit-log-${Date.now()}`, rows, [
        { key: 'createdAt', label: '时间' },
        { key: 'action', label: '操作' },
        { key: 'resource', label: '资源' },
        { key: 'resourceId', label: '资源ID' },
        { key: 'adminId', label: '管理员' },
        { key: 'aiTraceId', label: 'AI Trace' },
        { key: 'diff', label: 'Diff' },
      ]);
      message.success(`已导出 ${rows.length} 条（首页）`);
    } catch (err) {
      message.error(err instanceof Error ? err.message : '导出失败');
    } finally {
      setExporting(false);
    }
  };

  const columns: ColumnsType<AuditLog> = [
    { title: '时间', dataIndex: 'createdAt', width: 180, render: (v: string) => new Date(v).toLocaleString('zh-CN') },
    { title: '操作', dataIndex: 'action', width: 130, render: (a: AdminActionKind) => <Tag color={actionColor[a]}>{a}</Tag> },
    { title: '资源', dataIndex: 'resource', width: 140 },
    { title: '资源ID', dataIndex: 'resourceId', width: 220, render: (v?: string | null) => (v ? <Text code>{v}</Text> : <Text type="secondary">-</Text>) },
    { title: '管理员', dataIndex: 'adminId', width: 220, render: (v: string) => <Text code copyable={{ text: v }}>{v.slice(0, 8)}…</Text> },
    { title: '详情', key: 'actions', width: 100, render: (_, row) => (<Button size="small" type="link" onClick={() => setDetail(row)}>查看</Button>) },
  ];

  return (
    <Card
      title={<Space><Title level={4} style={{ margin: 0 }}>审计日志</Title><Tag color="gold">{total}</Tag></Space>}
      extra={<Button icon={<DownloadOutlined />} onClick={handleExport} loading={exporting}>导出CSV</Button>}
    >
      <Space wrap style={{ marginBottom: 12 }}>
        <Input placeholder="资源 (如 holy-site)" value={resource} onChange={(e) => setResource(e.target.value)} allowClear style={{ width: 180 }} />
        <Input placeholder="管理员 ID" value={adminId} onChange={(e) => setAdminId(e.target.value)} allowClear style={{ width: 220 }} />
        <Select placeholder="操作" value={action} onChange={setAction} allowClear style={{ width: 140 }}
          options={ACTIONS.map((a) => ({ value: a, label: a }))} />
        <RangePicker showTime value={range as [Dayjs, Dayjs] | null}
          onChange={(v) => setRange(v && v[0] && v[1] ? [v[0], v[1]] : null)} />
        <Button type="primary" onClick={handleQuery}>查询</Button>
      </Space>
      <Table
        rowKey="id" dataSource={items} columns={columns} loading={loading} size="small"
        pagination={{
          current: page, pageSize, total, showSizeChanger: true,
          pageSizeOptions: ['20', '50', '100'],
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />

      <Drawer open={!!detail} title="审计详情" width={640} onClose={() => setDetail(null)} destroyOnClose>
        {detail && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div><Text type="secondary">操作</Text><div><Tag color={actionColor[detail.action]}>{detail.action}</Tag></div></div>
            <div><Text type="secondary">资源</Text><div>{detail.resource}{detail.resourceId && (<> / <Text code>{detail.resourceId}</Text></>)}</div></div>
            <div><Text type="secondary">管理员</Text><div><Text code copyable>{detail.adminId}</Text></div></div>
            {detail.aiTraceId && <div><Text type="secondary">AI Trace</Text><div><Text code>{detail.aiTraceId}</Text></div></div>}
            <div><Text type="secondary">时间</Text><div>{new Date(detail.createdAt).toLocaleString('zh-CN')}</div></div>
            <div><Text type="secondary">Diff</Text>
              <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: 12, borderRadius: 4, overflow: 'auto', maxHeight: 360 }}>
                {JSON.stringify(detail.diff ?? {}, null, 2)}
              </pre>
            </div>
          </Space>
        )}
      </Drawer>
    </Card>
  );
}
