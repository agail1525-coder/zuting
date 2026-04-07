import { useState, useEffect, useCallback } from 'react';
import {
  Tabs, Table, Button, Tag, Modal, Input, Form, Space, Typography, message,
  Card, Select, Statistic, Row, Col, InputNumber, Switch, Popconfirm,
} from 'antd';
import { ReloadOutlined, EditOutlined, PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getToken } from '../lib/auth';

const { Title } = Typography;
const { TextArea } = Input;
const BASE = import.meta.env.VITE_API_URL || '/api';

interface Inquiry {
  id: string;
  contactName: string;
  contactRole: string | null;
  phone: string;
  email: string | null;
  orgName: string;
  headcount: number;
  budget: number | null;
  message: string | null;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  theme: { id: string; title: string; slug: string } | null;
}

interface Theme {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  color: string;
  icon: string | null;
  coverUrl: string | null;
  keywords: string[];
  priceFrom: number | null;
  durationDays: number | null;
  sortOrder: number;
  isPublished: boolean;
}

interface CaseItem {
  id: string;
  slug: string;
  teamName: string;
  orgType: string;
  industry: string | null;
  themeId: string | null;
  headcount: number;
  story: string;
  highlights: string[];
  photos: string[];
  testimonial: string | null;
  consentSigned: boolean;
  isPublished: boolean;
}

interface Stats {
  totalInquiries: number;
  inquiriesByStatus: Array<{ status: string; count: number }>;
  totalTeams: number;
  totalCases: number;
  totalCertificates: number;
}

const STATUS_COLOR: Record<string, string> = {
  NEW: 'blue', CONTACTED: 'cyan', QUOTED: 'gold', SIGNED: 'lime',
  DELIVERED: 'green', CLOSED: 'default', LOST: 'red',
};
const STATUS_FLOW = ['NEW', 'CONTACTED', 'QUOTED', 'SIGNED', 'DELIVERED', 'CLOSED', 'LOST'];

function authHeaders(): Record<string, string> {
  const token = getToken();
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

export default function TeamCultureManagePage() {
  const [activeTab, setActiveTab] = useState('inquiries');
  const [stats, setStats] = useState<Stats | null>(null);

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiryStatus, setInquiryStatus] = useState<string | undefined>(undefined);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [statusModal, setStatusModal] = useState<{ inquiry: Inquiry; toStatus: string } | null>(null);
  const [statusNote, setStatusNote] = useState('');

  const [themes, setThemes] = useState<Theme[]>([]);
  const [themeModal, setThemeModal] = useState<Theme | null>(null);
  const [themeForm] = Form.useForm();

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [caseModal, setCaseModal] = useState<CaseItem | null>(null);
  const [caseForm] = Form.useForm();

  const loadStats = useCallback(async () => {
    try {
      setStats(await api<Stats>('/admin/team-culture/stats'));
    } catch (e) {
      message.error((e as Error).message);
    }
  }, []);

  const loadInquiries = useCallback(async () => {
    setLoadingInquiries(true);
    try {
      const qs = new URLSearchParams();
      if (inquiryStatus) qs.set('status', inquiryStatus);
      qs.set('pageSize', '100');
      const res = await api<{ items: Inquiry[] }>(`/admin/team-culture/inquiries?${qs}`);
      setInquiries(res.items);
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setLoadingInquiries(false);
    }
  }, [inquiryStatus]);

  const loadThemes = useCallback(async () => {
    try {
      const res = await api<{ items: Theme[] }>('/team-culture/themes?pageSize=50');
      setThemes(res.items);
    } catch (e) {
      message.error((e as Error).message);
    }
  }, []);

  const loadCases = useCallback(async () => {
    try {
      const res = await api<{ items: CaseItem[] }>('/team-culture/cases?pageSize=50');
      setCases(res.items);
    } catch (e) {
      message.error((e as Error).message);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadInquiries();
    loadThemes();
    loadCases();
  }, [loadStats, loadInquiries, loadThemes, loadCases]);

  async function handleStatusChange() {
    if (!statusModal) return;
    try {
      await api(`/admin/team-culture/inquiries/${statusModal.inquiry.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ toStatus: statusModal.toStatus, note: statusNote || undefined }),
      });
      message.success('状态已更新');
      setStatusModal(null);
      setStatusNote('');
      loadInquiries();
      loadStats();
    } catch (e) {
      message.error((e as Error).message);
    }
  }

  async function handleSaveTheme(values: Record<string, unknown>) {
    try {
      const payload = {
        ...values,
        keywords: typeof values.keywords === 'string' ? (values.keywords as string).split(',').map((s) => s.trim()).filter(Boolean) : values.keywords ?? [],
      };
      await api('/admin/team-culture/themes', { method: 'POST', body: JSON.stringify(payload) });
      message.success('主题已保存');
      setThemeModal(null);
      themeForm.resetFields();
      loadThemes();
    } catch (e) {
      message.error((e as Error).message);
    }
  }

  async function handleSaveCase(values: Record<string, unknown>) {
    try {
      const payload = {
        ...values,
        highlights: typeof values.highlights === 'string' ? (values.highlights as string).split(',').map((s) => s.trim()).filter(Boolean) : values.highlights ?? [],
        photos: typeof values.photos === 'string' ? (values.photos as string).split(',').map((s) => s.trim()).filter(Boolean) : values.photos ?? [],
      };
      await api('/admin/team-culture/cases', { method: 'POST', body: JSON.stringify(payload) });
      message.success('案例已保存');
      setCaseModal(null);
      caseForm.resetFields();
      loadCases();
      loadStats();
    } catch (e) {
      message.error((e as Error).message);
    }
  }

  // ── Inquiry columns ────────────────────────────────────
  const inquiryCols: ColumnsType<Inquiry> = [
    { title: '组织', dataIndex: 'orgName', key: 'orgName', width: 200 },
    { title: '联系人', dataIndex: 'contactName', key: 'contactName', width: 100 },
    { title: '电话', dataIndex: 'phone', key: 'phone', width: 130 },
    { title: '人数', dataIndex: 'headcount', key: 'headcount', width: 70 },
    {
      title: '预算', dataIndex: 'budget', key: 'budget', width: 110,
      render: (v: number | null) => (v ? `¥${(v / 100).toLocaleString()}` : '—'),
    },
    {
      title: '主题', dataIndex: ['theme', 'title'], key: 'theme', width: 100,
      render: (_: unknown, r: Inquiry) => r.theme?.title ?? '—',
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 110,
      render: (v: string) => <Tag color={STATUS_COLOR[v]}>{v}</Tag>,
    },
    {
      title: '提交时间', dataIndex: 'createdAt', key: 'createdAt', width: 150,
      render: (v: string) => new Date(v).toLocaleString(),
    },
    {
      title: '操作', key: 'actions', width: 200, fixed: 'right',
      render: (_: unknown, r: Inquiry) => (
        <Space size="small">
          {STATUS_FLOW.filter((s) => s !== r.status).slice(0, 3).map((s) => (
            <Button key={s} size="small" onClick={() => setStatusModal({ inquiry: r, toStatus: s })}>
              → {s}
            </Button>
          ))}
        </Space>
      ),
    },
  ];

  const themeCols: ColumnsType<Theme> = [
    { title: 'Slug', dataIndex: 'slug', key: 'slug', width: 130 },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '副标题', dataIndex: 'subtitle', key: 'subtitle' },
    { title: '颜色', dataIndex: 'color', key: 'color', width: 90, render: (v: string) => <Tag color={v}>{v}</Tag> },
    { title: '起价', dataIndex: 'priceFrom', key: 'priceFrom', width: 100, render: (v: number | null) => (v ? `¥${(v / 100).toLocaleString()}` : '—') },
    { title: '天数', dataIndex: 'durationDays', key: 'durationDays', width: 70 },
    { title: '发布', dataIndex: 'isPublished', key: 'isPublished', width: 70, render: (v: boolean) => (v ? <Tag color="green">已发布</Tag> : <Tag>草稿</Tag>) },
    {
      title: '操作', key: 'actions', width: 100,
      render: (_: unknown, r: Theme) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => { themeForm.setFieldsValue({ ...r, keywords: r.keywords.join(',') }); setThemeModal(r); }}>
          编辑
        </Button>
      ),
    },
  ];

  const caseCols: ColumnsType<CaseItem> = [
    { title: 'Slug', dataIndex: 'slug', key: 'slug', width: 200 },
    { title: '团队', dataIndex: 'teamName', key: 'teamName' },
    { title: '类型', dataIndex: 'orgType', key: 'orgType', width: 110 },
    { title: '人数', dataIndex: 'headcount', key: 'headcount', width: 70 },
    { title: '同意', dataIndex: 'consentSigned', key: 'consentSigned', width: 80, render: (v: boolean) => (v ? <Tag color="green">✓</Tag> : <Tag color="red">✗</Tag>) },
    { title: '发布', dataIndex: 'isPublished', key: 'isPublished', width: 80, render: (v: boolean) => (v ? <Tag color="green">已发布</Tag> : <Tag>草稿</Tag>) },
    {
      title: '操作', key: 'actions', width: 100,
      render: (_: unknown, r: CaseItem) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => { caseForm.setFieldsValue({ ...r, highlights: r.highlights.join(','), photos: r.photos.join(',') }); setCaseModal(r); }}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>团队文化打造</Title>

      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}><Card><Statistic title="总询价" value={stats.totalInquiries} /></Card></Col>
          {stats.inquiriesByStatus.slice(0, 4).map((s) => (
            <Col span={4} key={s.status}><Card><Statistic title={s.status} value={s.count} /></Card></Col>
          ))}
          <Col span={4}><Card><Statistic title="团队数" value={stats.totalTeams} /></Card></Col>
        </Row>
      )}

      <Tabs activeKey={activeTab} onChange={setActiveTab}
        items={[
          {
            key: 'inquiries', label: '销售线索',
            children: (
              <>
                <Space style={{ marginBottom: 16 }}>
                  <Select placeholder="按状态筛选" allowClear style={{ width: 180 }}
                    value={inquiryStatus}
                    onChange={setInquiryStatus}
                    options={STATUS_FLOW.map((s) => ({ value: s, label: s }))} />
                  <Button icon={<ReloadOutlined />} onClick={loadInquiries}>刷新</Button>
                </Space>
                <Table rowKey="id" columns={inquiryCols} dataSource={inquiries}
                  loading={loadingInquiries} scroll={{ x: 1400 }} pagination={{ pageSize: 20 }} />
              </>
            ),
          },
          {
            key: 'themes', label: '主题包',
            children: (
              <>
                <Space style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />}
                    onClick={() => { themeForm.resetFields(); setThemeModal({} as Theme); }}>新建主题</Button>
                </Space>
                <Table rowKey="id" columns={themeCols} dataSource={themes} pagination={false} />
              </>
            ),
          },
          {
            key: 'cases', label: '案例库',
            children: (
              <>
                <Space style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />}
                    onClick={() => { caseForm.resetFields(); setCaseModal({} as CaseItem); }}>新建案例</Button>
                </Space>
                <Table rowKey="id" columns={caseCols} dataSource={cases} pagination={false} />
              </>
            ),
          },
        ]}
      />

      {/* Status change modal */}
      <Modal open={!!statusModal} title={`流转状态 → ${statusModal?.toStatus}`}
        onOk={handleStatusChange} onCancel={() => { setStatusModal(null); setStatusNote(''); }}>
        <p>组织：{statusModal?.inquiry.orgName}</p>
        <TextArea rows={3} value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="备注 (可选)" />
      </Modal>

      {/* Theme modal */}
      <Modal open={!!themeModal} title={themeModal?.id ? '编辑主题' : '新建主题'} width={720}
        onOk={() => themeForm.submit()} onCancel={() => setThemeModal(null)}>
        <Form form={themeForm} layout="vertical" onFinish={handleSaveTheme}>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="subtitle" label="副标题"><Input /></Form.Item>
          <Form.Item name="description" label="描述" rules={[{ required: true }]}><TextArea rows={4} /></Form.Item>
          <Form.Item name="color" label="主色" rules={[{ required: true }]}><Input placeholder="#D4A855" /></Form.Item>
          <Form.Item name="icon" label="图标"><Input /></Form.Item>
          <Form.Item name="coverUrl" label="封面 URL"><Input /></Form.Item>
          <Form.Item name="keywords" label="关键词 (逗号分隔)"><Input /></Form.Item>
          <Form.Item name="priceFrom" label="起价 (分)"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="durationDays" label="天数"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="sortOrder" label="排序"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="isPublished" label="发布" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>

      {/* Case modal */}
      <Modal open={!!caseModal} title={caseModal?.id ? '编辑案例' : '新建案例'} width={720}
        onOk={() => caseForm.submit()} onCancel={() => setCaseModal(null)}>
        <Form form={caseForm} layout="vertical" onFinish={handleSaveCase}>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="teamName" label="团队名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="orgType" label="组织类型" rules={[{ required: true }]}>
            <Select options={['ENTERPRISE', 'SCHOOL', 'RELIGIOUS', 'NGO', 'FAMILY', 'GOVERNMENT', 'OTHER'].map((v) => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item name="industry" label="行业"><Input /></Form.Item>
          <Form.Item name="themeId" label="关联主题">
            <Select allowClear options={themes.map((t) => ({ value: t.id, label: t.title }))} />
          </Form.Item>
          <Form.Item name="headcount" label="人数" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="story" label="故事" rules={[{ required: true }]}><TextArea rows={6} /></Form.Item>
          <Form.Item name="highlights" label="亮点 (逗号分隔)"><Input /></Form.Item>
          <Form.Item name="photos" label="照片 URL (逗号分隔)"><Input /></Form.Item>
          <Form.Item name="testimonial" label="证言"><TextArea rows={3} /></Form.Item>
          <Form.Item name="consentSigned" label="已签知情同意书" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="isPublished" label="发布" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
