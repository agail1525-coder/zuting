import { useEffect, useState, useCallback } from 'react';
import {
  Table,
  Card,
  Typography,
  Tag,
  Select,
  Button,
  Drawer,
  Descriptions,
  Statistic,
  Row,
  Col,
  Space,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getReports, getReportStats, getReport, reviewReport } from '../lib/api';
import type { Report, ReportStats } from '../types';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'PENDING', label: '待处理' },
  { value: 'REVIEWED', label: '已通过' },
  { value: 'DISMISSED', label: '已驳回' },
];

const statusLabels: Record<string, { text: string; color: string }> = {
  PENDING: { text: '待处理', color: 'orange' },
  REVIEWED: { text: '已通过', color: 'green' },
  DISMISSED: { text: '已驳回', color: 'default' },
};

const reasonLabels: Record<string, string> = {
  INAPPROPRIATE: '不当内容',
  OFFENSIVE: '冒犯性内容',
  SPAM: '垃圾信息',
  RELIGIOUS_SENSITIVE: '文化敏感',
};

const targetTypeLabels: Record<string, { text: string; color: string }> = {
  JOURNAL: { text: '日志', color: 'blue' },
  POST: { text: '帖子', color: 'cyan' },
  REVIEW: { text: '评价', color: 'purple' },
};

export default function ModerationPage() {
  const [data, setData] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<Report | null>(null);
  const [reviewing, setReviewing] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    getReports(page, pageSize, filterStatus || undefined)
      .then((res) => {
        setData(res.data);
        setTotal(res.total);
      })
      .catch((err: unknown) => {
        message.error('加载举报列表失败: ' + (err instanceof Error ? err.message : '网络错误'));
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [page, pageSize, filterStatus]);

  const fetchStats = useCallback(() => {
    getReportStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const openDetail = async (id: string) => {
    try {
      const report = await getReport(id);
      setDetail(report);
      setDrawerOpen(true);
    } catch {
      message.error('加载详情失败');
    }
  };

  const handleReview = async (action: 'approve' | 'dismiss') => {
    if (!detail) return;
    setReviewing(true);
    try {
      await reviewReport(detail.id, action);
      message.success(action === 'approve' ? '已通过举报' : '已驳回举报');
      setDrawerOpen(false);
      setDetail(null);
      fetchData();
      fetchStats();
    } catch (err: unknown) {
      message.error('审核失败: ' + (err instanceof Error ? err.message : '操作错误'));
    } finally {
      setReviewing(false);
    }
  };

  const columns: ColumnsType<Report> = [
    {
      title: '举报人',
      dataIndex: ['reporter', 'nickname'],
      key: 'reporter',
      width: 120,
      render: (_: unknown, r: Report) => r.reporter?.nickname || '匿名用户',
    },
    {
      title: '目标类型',
      dataIndex: 'targetType',
      key: 'targetType',
      width: 90,
      render: (type: string) => {
        const info = targetTypeLabels[type];
        return info ? <Tag color={info.color}>{info.text}</Tag> : <Tag>{type}</Tag>;
      },
    },
    {
      title: '目标ID',
      dataIndex: 'targetId',
      key: 'targetId',
      width: 160,
      ellipsis: true,
      render: (id: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{id}</span>
      ),
    },
    {
      title: '举报原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 120,
      render: (reason: string) => (
        <Tag color="red">{reasonLabels[reason] || reason}</Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: (text: string) => (
        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0, color: '#ccc' }}>
          {text || '-'}
        </Paragraph>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const info = statusLabels[status];
        return info ? <Tag color={info.color}>{info.text}</Tag> : <Tag>{status}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: Report) => (
        <Button type="link" size="small" onClick={() => openDetail(record.id)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ marginBottom: 0 }}>
          内容审核
        </Title>
        <Select
          value={filterStatus}
          onChange={(v) => {
            setFilterStatus(v);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
          style={{ width: 140 }}
          placeholder="筛选状态"
        />
      </div>

      {stats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic title="总举报数" value={stats.total} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待处理"
                value={stats.byStatus['PENDING'] ?? 0}
                valueStyle={{ color: '#faad14' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已通过"
                value={stats.byStatus['REVIEWED'] ?? 0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已驳回"
                value={stats.byStatus['DISMISSED'] ?? 0}
                valueStyle={{ color: '#999' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: '暂无举报数据' }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
          size="middle"
          scroll={{ x: 1100 }}
        />
      </Card>

      <Drawer
        title="举报详情"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDetail(null);
        }}
        width={480}
        extra={
          detail?.status === 'PENDING' && (
            <Space>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={reviewing}
                onClick={() => handleReview('approve')}
              >
                通过
              </Button>
              <Button
                icon={<CloseCircleOutlined />}
                loading={reviewing}
                onClick={() => handleReview('dismiss')}
              >
                驳回
              </Button>
            </Space>
          )
        }
      >
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="举报ID">
              <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{detail.id}</span>
            </Descriptions.Item>
            <Descriptions.Item label="举报人">
              {detail.reporter?.nickname || '匿名用户'}
            </Descriptions.Item>
            <Descriptions.Item label="目标类型">
              {(() => {
                const info = targetTypeLabels[detail.targetType];
                return info ? <Tag color={info.color}>{info.text}</Tag> : detail.targetType;
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="目标ID">
              <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{detail.targetId}</span>
            </Descriptions.Item>
            <Descriptions.Item label="举报原因">
              <Tag color="red">{reasonLabels[detail.reason] || detail.reason}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="详细描述">
              {detail.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {(() => {
                const info = statusLabels[detail.status];
                return info ? <Tag color={info.color}>{info.text}</Tag> : detail.status;
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {dayjs(detail.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            {detail.reviewer && (
              <Descriptions.Item label="审核人">
                {detail.reviewer.nickname}
              </Descriptions.Item>
            )}
            {detail.reviewedAt && (
              <Descriptions.Item label="审核时间">
                {dayjs(detail.reviewedAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>
    </>
  );
}
