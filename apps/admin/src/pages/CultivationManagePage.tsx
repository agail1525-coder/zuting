import { useEffect, useState, useCallback } from 'react';
import {
  Table,
  Card,
  Typography,
  Tag,
  Select,
  Button,
  Modal,
  Input,
  Descriptions,
  Statistic,
  Row,
  Col,
  Space,
  Tabs,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserAddOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  getCultivationApplications,
  approveCultivationApplication,
  rejectCultivationApplication,
  grantCultivationAccess,
  revokeCultivationAccess,
  type CultivationApplication,
} from '../lib/api';

const { Title, Paragraph } = Typography;

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'PENDING', label: '待审核' },
  { value: 'APPROVED', label: '已通过' },
  { value: 'REJECTED', label: '已拒绝' },
];

const statusTag: Record<string, { text: string; color: string }> = {
  PENDING: { text: '待审核', color: 'orange' },
  APPROVED: { text: '已通过', color: 'green' },
  REJECTED: { text: '已拒绝', color: 'red' },
};

const ROLE_OPTIONS = ['SEEKER', 'PRACTITIONER', 'MENTOR', 'MASTER'];

export default function CultivationManagePage() {
  const [data, setData] = useState<CultivationApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  // Detail drawer
  const [detail, setDetail] = useState<CultivationApplication | null>(null);

  // Reject modal
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Grant modal
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantUserId, setGrantUserId] = useState('');
  const [grantRole, setGrantRole] = useState('PRACTITIONER');
  const [grantDays, setGrantDays] = useState<number | undefined>(undefined);

  // Revoke modal
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeUserId, setRevokeUserId] = useState('');
  const [revokeReason, setRevokeReason] = useState('');

  const fetchData = useCallback(() => {
    setLoading(true);
    getCultivationApplications(page, pageSize, filterStatus || undefined)
      .then((res) => {
        setData(res.items);
        setTotal(res.total);
      })
      .catch((e) => {
        message.error('加载失败: ' + (e instanceof Error ? e.message : '网络错误'));
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [page, pageSize, filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id: string) => {
    try {
      await approveCultivationApplication(id);
      message.success('已通过');
      fetchData();
      setDetail(null);
    } catch (e) {
      message.error('操作失败: ' + (e instanceof Error ? e.message : ''));
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) {
      message.warning('请输入拒绝原因');
      return;
    }
    try {
      await rejectCultivationApplication(rejectId, rejectReason.trim());
      message.success('已拒绝');
      setRejectId(null);
      setRejectReason('');
      fetchData();
      setDetail(null);
    } catch (e) {
      message.error('操作失败: ' + (e instanceof Error ? e.message : ''));
    }
  };

  const handleGrant = async () => {
    if (!grantUserId.trim()) {
      message.warning('请输入用户 ID');
      return;
    }
    try {
      await grantCultivationAccess(grantUserId.trim(), grantRole, grantDays);
      message.success('已授权');
      setGrantOpen(false);
      setGrantUserId('');
      fetchData();
    } catch (e) {
      message.error('操作失败: ' + (e instanceof Error ? e.message : ''));
    }
  };

  const handleRevoke = async () => {
    if (!revokeUserId.trim() || !revokeReason.trim()) {
      message.warning('请输入用户 ID 和原因');
      return;
    }
    try {
      await revokeCultivationAccess(revokeUserId.trim(), revokeReason.trim());
      message.success('已撤销');
      setRevokeOpen(false);
      setRevokeUserId('');
      setRevokeReason('');
    } catch (e) {
      message.error('操作失败: ' + (e instanceof Error ? e.message : ''));
    }
  };

  const columns: ColumnsType<CultivationApplication> = [
    {
      title: '用户',
      dataIndex: 'userId',
      key: 'userId',
      width: 200,
      ellipsis: true,
      render: (_, r) => r.user?.name || r.userId.slice(0, 8),
    },
    {
      title: '主修',
      dataIndex: 'primaryTradition',
      key: 'tradition',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => {
        const s = statusTag[v] || { text: v, color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '审核时间',
      dataIndex: 'reviewedAt',
      key: 'reviewedAt',
      width: 160,
      render: (v: string | null) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => setDetail(record)}>
            详情
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                通过
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setRejectId(record.id);
                  setRejectReason('');
                }}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const stats = {
    total: data.length,
    pending: data.filter((d) => d.status === 'PENDING').length,
    approved: data.filter((d) => d.status === 'APPROVED').length,
    rejected: data.filter((d) => d.status === 'REJECTED').length,
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          ☸ 修行圈管理
        </Title>
        <Space>
          <Button icon={<UserAddOutlined />} onClick={() => setGrantOpen(true)}>
            直接授权
          </Button>
          <Button icon={<StopOutlined />} danger onClick={() => setRevokeOpen(true)}>
            撤销资格
          </Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="总申请" value={total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="待审核" value={stats.pending} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="已通过" value={stats.approved} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="已拒绝" value={stats.rejected} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <span>状态筛选：</span>
          <Select
            value={filterStatus}
            onChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
            style={{ width: 150 }}
          />
          <Button onClick={fetchData}>刷新</Button>
        </Space>
      </Card>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
        }}
      />

      {/* Detail modal */}
      <Modal
        title="申请详情"
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={
          detail?.status === 'PENDING'
            ? [
                <Button key="reject" danger onClick={() => { setRejectId(detail!.id); setRejectReason(''); }}>
                  拒绝
                </Button>,
                <Button key="approve" type="primary" onClick={() => handleApprove(detail!.id)}>
                  通过
                </Button>,
              ]
            : [<Button key="close" onClick={() => setDetail(null)}>关闭</Button>]
        }
        width={640}
      >
        {detail && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="用户 ID" span={2}>
              {detail.userId}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusTag[detail.status]?.color}>{statusTag[detail.status]?.text}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="主修">{detail.primaryTradition || '-'}</Descriptions.Item>
            <Descriptions.Item label="动机" span={2}>
              <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{detail.motivation}</Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label="经验" span={2}>
              <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                {detail.experience || '-'}
              </Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label="申请时间">
              {dayjs(detail.createdAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="审核时间">
              {detail.reviewedAt ? dayjs(detail.reviewedAt).format('YYYY-MM-DD HH:mm') : '-'}
            </Descriptions.Item>
            {detail.rejectionReason && (
              <Descriptions.Item label="拒绝原因" span={2}>
                {detail.rejectionReason}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Reject modal */}
      <Modal
        title="拒绝申请"
        open={!!rejectId}
        onCancel={() => setRejectId(null)}
        onOk={handleReject}
        okText="确认拒绝"
        okButtonProps={{ danger: true }}
      >
        <Input.TextArea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          placeholder="请说明拒绝原因..."
          maxLength={500}
        />
      </Modal>

      {/* Grant modal */}
      <Modal
        title="直接授权修行资格"
        open={grantOpen}
        onCancel={() => setGrantOpen(false)}
        onOk={handleGrant}
        okText="确认授权"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <div style={{ marginBottom: 4 }}>用户 ID *</div>
            <Input
              value={grantUserId}
              onChange={(e) => setGrantUserId(e.target.value)}
              placeholder="输入用户 cuid"
            />
          </div>
          <div>
            <div style={{ marginBottom: 4 }}>角色</div>
            <Select
              value={grantRole}
              onChange={setGrantRole}
              options={ROLE_OPTIONS.map((r) => ({ value: r, label: r }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <div style={{ marginBottom: 4 }}>有效期 (天, 留空=永久)</div>
            <Input
              type="number"
              value={grantDays}
              onChange={(e) =>
                setGrantDays(e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
              placeholder="例如 365"
            />
          </div>
        </Space>
      </Modal>

      {/* Revoke modal */}
      <Modal
        title="撤销修行资格"
        open={revokeOpen}
        onCancel={() => setRevokeOpen(false)}
        onOk={handleRevoke}
        okText="确认撤销"
        okButtonProps={{ danger: true }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <div style={{ marginBottom: 4 }}>用户 ID *</div>
            <Input
              value={revokeUserId}
              onChange={(e) => setRevokeUserId(e.target.value)}
              placeholder="输入用户 cuid"
            />
          </div>
          <div>
            <div style={{ marginBottom: 4 }}>撤销原因 *</div>
            <Input.TextArea
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              rows={3}
              placeholder="请说明撤销原因..."
              maxLength={500}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
}
