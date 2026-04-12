import { useEffect, useState } from 'react';
import {
  Table, Card, Tag, Space, Button, Tabs, Select, message,
  Popconfirm, Typography, Row, Col,
} from 'antd';
import { EyeOutlined, StopOutlined, DeleteOutlined, ExperimentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const BASE = import.meta.env.VITE_API_URL || '/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Guide {
  id: string;
  title: string;
  author?: { nickname?: string; id: string };
  status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: string;
  createdAt: string;
}

interface Question {
  id: string;
  title: string;
  author?: { nickname?: string; id: string };
  status: 'OPEN' | 'ANSWERED' | 'CLOSED';
  viewCount: number;
  answerCount: number;
  createdAt: string;
}

interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

async function apiPatch(url: string, body: Record<string, unknown>) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function apiDelete(url: string) {
  const res = await fetch(url, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// ─── Guide Status Tag ─────────────────────────────────────────────────────────

const GUIDE_STATUS_COLOR: Record<Guide['status'], string> = {
  DRAFT: 'default',
  PUBLISHED: 'green',
  HIDDEN: 'red',
};
const GUIDE_STATUS_LABEL: Record<Guide['status'], string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  HIDDEN: '已隐藏',
};

// ─── Question Status Tag ──────────────────────────────────────────────────────

const Q_STATUS_COLOR: Record<Question['status'], string> = {
  OPEN: 'blue',
  ANSWERED: 'green',
  CLOSED: 'default',
};
const Q_STATUS_LABEL: Record<Question['status'], string> = {
  OPEN: '开放',
  ANSWERED: '已解答',
  CLOSED: '已关闭',
};

// ─── Guides Tab ───────────────────────────────────────────────────────────────

function GuidesTab() {
  const navigate = useNavigate();
  const [data, setData] = useState<Guide[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  const fetchGuides = async (p = page, status = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (status !== 'ALL') params.set('status', status);
      const result = await apiGet<PagedResult<Guide>>(
        `${BASE}/guides?${params.toString()}`,
      );
      setData(Array.isArray(result?.items) ? result.items : []);
      setTotal(result?.total ?? 0);
    } catch {
      // API might not exist yet — show empty gracefully
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchGuides(page, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleHide = async (id: string) => {
    try {
      await apiPatch(`${BASE}/guides/${id}`, { status: 'HIDDEN' });
      message.success('已隐藏');
      void fetchGuides();
    } catch {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`${BASE}/guides/${id}`);
      message.success('已删除');
      void fetchGuides();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<Guide> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 240,
    },
    {
      title: '作者',
      key: 'author',
      width: 120,
      render: (_, record) => record.author?.nickname || '匿名',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: Guide['status']) => (
        <Tag color={GUIDE_STATUS_COLOR[status]}>{GUIDE_STATUS_LABEL[status]}</Tag>
      ),
    },
    {
      title: '浏览数',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 80,
      sorter: (a, b) => a.viewCount - b.viewCount,
      render: (v: number) => (v ?? 0).toLocaleString(),
    },
    {
      title: '点赞数',
      dataIndex: 'likeCount',
      key: 'likeCount',
      width: 80,
      sorter: (a, b) => a.likeCount - b.likeCount,
      render: (v: number) => (v ?? 0).toLocaleString(),
    },
    {
      title: '评论数',
      dataIndex: 'commentCount',
      key: 'commentCount',
      width: 80,
      render: (v: number) => (v ?? 0).toLocaleString(),
    },
    {
      title: '发布时间',
      key: 'publishedAt',
      width: 120,
      render: (_, record) => {
        const d = record.publishedAt || record.createdAt;
        return d ? new Date(d).toLocaleDateString('zh-CN') : '-';
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type="link"
            icon={<ExperimentOutlined />}
            onClick={() => navigate(`/guides/${record.id}`)}
          >
            Studio
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/guides/${record.id}`, '_blank')}
          >
            查看
          </Button>
          <Popconfirm
            title="确认隐藏此游记？"
            onConfirm={() => handleHide(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button size="small" icon={<StopOutlined />} disabled={record.status === 'HIDDEN'}>
              隐藏
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确认删除？此操作不可恢复。"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <span style={{ color: '#999' }}>状态筛选：</span>
          <Select
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            style={{ width: 140 }}
            options={[
              { value: 'ALL', label: '全部状态' },
              { value: 'DRAFT', label: '草稿' },
              { value: 'PUBLISHED', label: '已发布' },
              { value: 'HIDDEN', label: '已隐藏' },
            ]}
          />
        </Col>
        <Col>
          <span style={{ color: '#666', fontSize: 13 }}>共 {total} 条</span>
        </Col>
      </Row>

      <Table<Guide>
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          pageSize: 20,
          total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
          showQuickJumper: true,
        }}
        locale={{ emptyText: '暂无游记数据' }}
      />
    </div>
  );
}

// ─── Questions Tab ────────────────────────────────────────────────────────────

function QuestionsTab() {
  const navigate = useNavigate();
  const [data, setData] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  const fetchQuestions = async (p = page, status = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (status !== 'ALL') params.set('status', status);
      const result = await apiGet<PagedResult<Question>>(
        `${BASE}/questions?${params.toString()}`,
      );
      setData(Array.isArray(result?.items) ? result.items : []);
      setTotal(result?.total ?? 0);
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchQuestions(page, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleClose = async (id: string) => {
    try {
      await apiPatch(`${BASE}/questions/${id}`, { status: 'CLOSED' });
      message.success('已关闭');
      void fetchQuestions();
    } catch {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`${BASE}/questions/${id}`);
      message.success('已删除');
      void fetchQuestions();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<Question> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 260,
    },
    {
      title: '提问者',
      key: 'author',
      width: 120,
      render: (_, record) => record.author?.nickname || '匿名',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: Question['status']) => (
        <Tag color={Q_STATUS_COLOR[status]}>{Q_STATUS_LABEL[status]}</Tag>
      ),
    },
    {
      title: '浏览数',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 80,
      sorter: (a, b) => a.viewCount - b.viewCount,
      render: (v: number) => (v ?? 0).toLocaleString(),
    },
    {
      title: '回答数',
      dataIndex: 'answerCount',
      key: 'answerCount',
      width: 80,
      render: (v: number) => (v ?? 0).toLocaleString(),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (v: string) => (v ? new Date(v).toLocaleDateString('zh-CN') : '-'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type="link"
            icon={<ExperimentOutlined />}
            onClick={() => navigate(`/questions/${record.id}`)}
          >
            Studio
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/questions/${record.id}`, '_blank')}
          >
            查看
          </Button>
          <Popconfirm
            title="确认关闭此问答？"
            onConfirm={() => handleClose(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button size="small" icon={<StopOutlined />} disabled={record.status === 'CLOSED'}>
              关闭
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确认删除？此操作不可恢复。"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <span style={{ color: '#999' }}>状态筛选：</span>
          <Select
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            style={{ width: 140 }}
            options={[
              { value: 'ALL', label: '全部状态' },
              { value: 'OPEN', label: '开放' },
              { value: 'ANSWERED', label: '已解答' },
              { value: 'CLOSED', label: '已关闭' },
            ]}
          />
        </Col>
        <Col>
          <span style={{ color: '#666', fontSize: 13 }}>共 {total} 条</span>
        </Col>
      </Row>

      <Table<Question>
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          pageSize: 20,
          total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
          showQuickJumper: true,
        }}
        locale={{ emptyText: '暂无问答数据' }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityManagePage() {
  const tabItems = [
    { key: 'guides', label: '游记管理', children: <GuidesTab /> },
    { key: 'questions', label: '问答管理', children: <QuestionsTab /> },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        社区管理
      </Title>
      <Card >
        <Tabs defaultActiveKey="guides" items={tabItems} />
      </Card>
    </div>
  );
}
