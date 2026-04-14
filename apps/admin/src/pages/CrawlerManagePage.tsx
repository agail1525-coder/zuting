import { useEffect, useState } from 'react';
import { Typography, Card, Tabs, Table, Tag, Button, Space, message, Popconfirm, Select, Progress, Row, Col, Statistic, Descriptions } from 'antd';
import { ReloadOutlined, PlayCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { getToken } from '../lib/auth';

const { Title, Text } = Typography;

const BASE = import.meta.env.VITE_API_URL || '/api';

async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

const DOMAIN_COLOR: Record<string, string> = {
  HOLY_SITE: 'magenta', MERCHANT: 'blue', PRICE: 'orange', GUIDE: 'cyan', NEWS: 'purple',
};
const CHANNEL_COLOR: Record<string, string> = {
  OFFICIAL: 'gold', WIKI: 'green', OTA: 'geekblue', MAP: 'volcano', UGC: 'lime', MEDIA: 'pink',
};
const HEALTH_COLOR: Record<string, string> = {
  HEALTHY: 'green', WARNING: 'orange', CRITICAL: 'red', DEAD: 'red', UNKNOWN: 'default', EMPTY: 'default', DISABLED: 'default',
};

interface Source {
  id: string; key?: string; name: string; baseUrl: string; type: string;
  targetDomain: string; channel: string; priority: number; strategy: string;
  healthScore: number; consecutiveFails: number; rateLimitMs: number;
  schedule: string; enabled: boolean; lastRunAt?: string; lastStatus?: string;
  notes?: string;
}
interface HealthRow {
  id: string; name: string; domain: string; channel: string; priority: number;
  enabled: boolean; healthScore: number; consecutiveFails: number;
  successRate: number | null; avgMs: number | null; lastSuccess: string | null;
  lastRunAt: string | null; lastStatus: string | null; status: string;
}
interface CoverageCell {
  domain: string; channel: string; sourceCount: number; activeCount: number;
  itemsLast24h: number; avgHealth: number; status: string; takenAt?: string;
}
interface RunRow {
  id: string; sourceId: string; status: string; startedAt: string; finishedAt?: string;
  itemsFound: number; itemsCreated: number; itemsSkipped: number; errorLog?: string; triggeredBy: string;
}
interface ItemRow {
  id: string; sourceId: string; title?: string; externalUrl: string;
  status: string; targetType?: string; targetId?: string; fetchedAt: string;
}

function SourcesTab() {
  const [items, setItems] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState<string | undefined>();
  const [channel, setChannel] = useState<string | undefined>();

  const load = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: '1', limit: '50' });
      if (domain) qs.append('domain', domain);
      if (channel) qs.append('channel', channel);
      const data = await api<{ items: Source[] }>(`/crawlers/sources?${qs}`);
      setItems(data.items);
    } catch (e) { message.error(String(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [domain, channel]);

  const run = async (id: string) => {
    try { await api(`/crawlers/sources/${id}/run`, { method: 'POST' }); message.success('已触发'); load(); }
    catch (e) { message.error(String(e)); }
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Select placeholder="目标域" allowClear value={domain} onChange={setDomain} style={{ width: 140 }}
          options={['HOLY_SITE','MERCHANT','PRICE','GUIDE','NEWS'].map(v => ({ value: v, label: v }))} />
        <Select placeholder="纵层" allowClear value={channel} onChange={setChannel} style={{ width: 120 }}
          options={['OFFICIAL','WIKI','OTA','MAP','UGC','MEDIA'].map(v => ({ value: v, label: v }))} />
        <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
      </Space>
      <Table<Source> rowKey="id" loading={loading} dataSource={items} size="small"
        columns={[
          { title: '名称', dataIndex: 'name', width: 220, ellipsis: true,
            render: (v, r) => <>{v}<br /><Text type="secondary" style={{ fontSize: 11 }}>{r.key}</Text></> },
          { title: '域', dataIndex: 'targetDomain', width: 100, render: (v) => <Tag color={DOMAIN_COLOR[v]}>{v}</Tag> },
          { title: '纵层', dataIndex: 'channel', width: 90, render: (v) => <Tag color={CHANNEL_COLOR[v]}>{v}</Tag> },
          { title: '优先', dataIndex: 'priority', width: 60 },
          { title: '策略', dataIndex: 'strategy', width: 80 },
          { title: '健康', dataIndex: 'healthScore', width: 100, render: (v) => <Progress percent={Math.round(v * 100)} size="small" /> },
          { title: '失败×', dataIndex: 'consecutiveFails', width: 70 },
          { title: '调度', dataIndex: 'schedule', width: 110 },
          { title: '启用', dataIndex: 'enabled', width: 70, render: (v) => v ? <Tag color="green">✓</Tag> : <Tag>—</Tag> },
          { title: '上次', dataIndex: 'lastRunAt', width: 140, render: (v) => v ? new Date(v).toLocaleString() : '—' },
          { title: '状态', dataIndex: 'lastStatus', width: 80 },
          { title: '操作', width: 90, render: (_, r) => (
            <Popconfirm title="立即抓取此源?" onConfirm={() => run(r.id)}>
              <Button size="small" icon={<PlayCircleOutlined />}>抓取</Button>
            </Popconfirm>
          )},
        ]} />
    </>
  );
}

function HealthTab() {
  const [rows, setRows] = useState<HealthRow[]>([]);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const data = await api<{ rows: HealthRow[] }>('/crawlers/health');
      setRows(data.rows);
    } catch (e) { message.error(String(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const healthy = rows.filter(r => r.status === 'HEALTHY').length;
  const warning = rows.filter(r => r.status === 'WARNING' || r.status === 'CRITICAL').length;
  const dead = rows.filter(r => r.status === 'DEAD').length;

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="健康" value={healthy} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="警告" value={warning} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="已停" value={dead} valueStyle={{ color: '#f5222d' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="总源数" value={rows.length} /></Card></Col>
      </Row>
      <Space style={{ marginBottom: 12 }}><Button icon={<ReloadOutlined />} onClick={load}>刷新</Button></Space>
      <Table<HealthRow> rowKey="id" loading={loading} dataSource={rows} size="small"
        columns={[
          { title: '源', dataIndex: 'name', ellipsis: true, width: 220 },
          { title: '域/纵', width: 160, render: (_, r) => <><Tag color={DOMAIN_COLOR[r.domain]}>{r.domain}</Tag><Tag color={CHANNEL_COLOR[r.channel]}>{r.channel}</Tag></> },
          { title: '优先', dataIndex: 'priority', width: 60 },
          { title: '状态', dataIndex: 'status', width: 100, render: (v) => <Tag color={HEALTH_COLOR[v]}>{v}</Tag> },
          { title: '7d 成功率', dataIndex: 'successRate', width: 110,
            render: (v) => v === null ? '—' : <Progress percent={Math.round(v * 100)} size="small" /> },
          { title: '健康分', dataIndex: 'healthScore', width: 90, render: (v) => v.toFixed(2) },
          { title: '失败×', dataIndex: 'consecutiveFails', width: 70 },
          { title: '平均ms', dataIndex: 'avgMs', width: 90, render: (v) => v ? Math.round(v) : '—' },
          { title: '上次', dataIndex: 'lastRunAt', width: 140, render: (v) => v ? new Date(v).toLocaleString() : '—' },
        ]} />
    </>
  );
}

function CoverageTab() {
  const [cells, setCells] = useState<CoverageCell[]>([]);
  const [takenAt, setTakenAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api<{ takenAt: string | null; snapshots: CoverageCell[] }>('/crawlers/coverage');
      setCells(data.snapshots);
      setTakenAt(data.takenAt);
    } catch (e) { message.error(String(e)); }
    setLoading(false);
  };
  const regen = async () => {
    try { await api('/crawlers/coverage/generate', { method: 'POST' }); message.success('已生成'); load(); }
    catch (e) { message.error(String(e)); }
  };
  useEffect(() => { load(); }, []);

  const domains = ['HOLY_SITE','MERCHANT','PRICE','GUIDE','NEWS'];
  const channels = ['OFFICIAL','WIKI','OTA','MAP','UGC','MEDIA'];
  const getCell = (d: string, c: string) => cells.find((x) => x.domain === d && x.channel === c);

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Text>快照时间: {takenAt ? new Date(takenAt).toLocaleString() : '(尚未生成)'}</Text>
        <Button icon={<ThunderboltOutlined />} type="primary" onClick={regen}>生成新快照</Button>
        <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
      </Space>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 860 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #f0f0f0', padding: 8, background: '#fafafa' }}>域 \ 纵</th>
              {channels.map(c => <th key={c} style={{ border: '1px solid #f0f0f0', padding: 8, background: '#fafafa' }}><Tag color={CHANNEL_COLOR[c]}>{c}</Tag></th>)}
            </tr>
          </thead>
          <tbody>
            {domains.map(d => (
              <tr key={d}>
                <td style={{ border: '1px solid #f0f0f0', padding: 8, background: '#fafafa' }}><Tag color={DOMAIN_COLOR[d]}>{d}</Tag></td>
                {channels.map(c => {
                  const cell = getCell(d, c);
                  return (
                    <td key={c} style={{ border: '1px solid #f0f0f0', padding: 8, minWidth: 120 }}>
                      {cell ? (
                        <>
                          <Tag color={HEALTH_COLOR[cell.status] || 'default'}>{cell.status}</Tag>
                          <div style={{ fontSize: 12, marginTop: 4 }}>源 {cell.activeCount}/{cell.sourceCount}</div>
                          <div style={{ fontSize: 12 }}>24h项 {cell.itemsLast24h}</div>
                          <div style={{ fontSize: 12 }}>健康 {(cell.avgHealth * 100).toFixed(0)}%</div>
                        </>
                      ) : <Text type="secondary">—</Text>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ItemsTab() {
  const [rows, setRows] = useState<ItemRow[]>([]);
  const [status, setStatus] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: '1', limit: '50' });
      if (status) qs.append('status', status);
      const data = await api<{ items: ItemRow[] }>(`/crawlers/items?${qs}`);
      setRows(data.items);
    } catch (e) { message.error(String(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [status]);

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Select placeholder="状态" allowClear value={status} onChange={setStatus} style={{ width: 130 }}
          options={['PENDING','DISPATCHED','SKIPPED','FAILED'].map(v => ({ value: v, label: v }))} />
        <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
      </Space>
      <Table<ItemRow> rowKey="id" loading={loading} dataSource={rows} size="small"
        columns={[
          { title: '标题', dataIndex: 'title', ellipsis: true },
          { title: '状态', dataIndex: 'status', width: 110, render: (v) => <Tag>{v}</Tag> },
          { title: '目标类型', dataIndex: 'targetType', width: 120 },
          { title: '目标ID', dataIndex: 'targetId', width: 160, ellipsis: true },
          { title: '外链', dataIndex: 'externalUrl', ellipsis: true,
            render: (v) => <a href={v} target="_blank" rel="noreferrer">{v}</a> },
          { title: '抓取时间', dataIndex: 'fetchedAt', width: 160, render: (v) => new Date(v).toLocaleString() },
        ]} />
    </>
  );
}

function RunsTab() {
  const [rows, setRows] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const data = await api<{ items: RunRow[] }>('/crawlers/runs?page=1&limit=50');
      setRows(data.items);
    } catch (e) { message.error(String(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <>
      <Space style={{ marginBottom: 12 }}><Button icon={<ReloadOutlined />} onClick={load}>刷新</Button></Space>
      <Table<RunRow> rowKey="id" loading={loading} dataSource={rows} size="small"
        columns={[
          { title: '开始', dataIndex: 'startedAt', width: 160, render: (v) => new Date(v).toLocaleString() },
          { title: '状态', dataIndex: 'status', width: 100, render: (v) => <Tag color={v === 'SUCCESS' ? 'green' : v === 'FAILED' ? 'red' : 'blue'}>{v}</Tag> },
          { title: '触发', dataIndex: 'triggeredBy', width: 90 },
          { title: '找到', dataIndex: 'itemsFound', width: 80 },
          { title: '新建', dataIndex: 'itemsCreated', width: 80 },
          { title: '跳过', dataIndex: 'itemsSkipped', width: 80 },
          { title: '错误', dataIndex: 'errorLog', ellipsis: true },
        ]} />
    </>
  );
}

function MatrixRunTab() {
  const [result, setResult] = useState<{ total: number; results: Array<{ name: string; ok: boolean; error?: string }> } | null>(null);
  const [loading, setLoading] = useState(false);
  const [minPriority, setMinPriority] = useState<number>(4);

  const run = async () => {
    setLoading(true);
    try {
      const data = await api<{ total: number; results: Array<{ name: string; ok: boolean; error?: string }> }>(
        '/crawlers/matrix/run',
        { method: 'POST', body: JSON.stringify({ minPriority }) },
      );
      setResult(data);
      message.success(`已跑 ${data.total} 源`);
    } catch (e) { message.error(String(e)); }
    setLoading(false);
  };

  return (
    <>
      <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="说明">按优先级 ≥ minPriority 降序,对所有启用源串行抓取,间隔 rateLimitMs。</Descriptions.Item>
      </Descriptions>
      <Space style={{ marginBottom: 16 }}>
        <Select value={minPriority} onChange={setMinPriority} style={{ width: 160 }}
          options={[1,2,3,4,5].map(v => ({ value: v, label: `minPriority ≥ ${v}` }))} />
        <Button type="primary" icon={<ThunderboltOutlined />} loading={loading} onClick={run}>跑完整矩阵</Button>
      </Space>
      {result && (
        <Table rowKey="name" dataSource={result.results} size="small" pagination={false}
          columns={[
            { title: '源', dataIndex: 'name' },
            { title: '结果', dataIndex: 'ok', width: 80, render: (v) => v ? <Tag color="green">OK</Tag> : <Tag color="red">FAIL</Tag> },
            { title: '错误', dataIndex: 'error', ellipsis: true },
          ]} />
      )}
    </>
  );
}

export default function CrawlerManagePage() {
  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>🕸️ 爬虫++ 管理 (5×6 立体矩阵)</Title>
      <Text type="secondary">24/7 全球旅行数据采集引擎 · 圣地/商家/价格/攻略/动态 × 官方/百科/OTA/地图/UGC/自媒体</Text>
      <Card style={{ marginTop: 16 }}>
        <Tabs items={[
          { key: 'sources', label: '源管理', children: <SourcesTab /> },
          { key: 'health', label: '健康扫描', children: <HealthTab /> },
          { key: 'coverage', label: '覆盖矩阵 5×6', children: <CoverageTab /> },
          { key: 'matrix', label: '跑矩阵', children: <MatrixRunTab /> },
          { key: 'items', label: '抓取项', children: <ItemsTab /> },
          { key: 'runs', label: '运行历史', children: <RunsTab /> },
        ]} />
      </Card>
    </div>
  );
}
