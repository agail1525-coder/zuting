import { useEffect, useState, useCallback } from 'react';
import {
  Table, Card, Typography, Tag, Button, Space, Input,
  Select, Switch, message, Drawer, Descriptions, Avatar,
} from 'antd';
import { EyeOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { getUsers, updateUser } from '../lib/api';
import type { User } from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;

const ROLE_MAP: Record<string, { color: string; label: string }> = {
  PILGRIM: { color: 'blue', label: '探访者' },
  GUIDE: { color: 'green', label: '导游' },
  AMBASSADOR: { color: 'purple', label: '大使' },
  ADMIN: { color: 'gold', label: '管理员' },
};

const ROLE_OPTIONS = [
  { value: '', label: '全部角色' },
  { value: 'PILGRIM', label: '探访者' },
  { value: 'GUIDE', label: '导游' },
  { value: 'AMBASSADOR', label: '大使' },
  { value: 'ADMIN', label: '管理员' },
];

export default function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [detail, setDetail] = useState<User | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({
        page,
        limit: pageSize,
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setData(res.data);
      setTotal(res.total);
    } catch (err: unknown) {
      message.error('加载用户失败: ' + (err instanceof Error ? err.message : '网络错误'));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUser(userId, { role });
      message.success('角色已更新');
      load();
    } catch {
      message.error('更新角色失败');
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await updateUser(userId, { isActive });
      message.success(isActive ? '已激活用户' : '已停用用户');
      load();
    } catch {
      message.error('操作失败');
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current ?? 1);
    setPageSize(pagination.pageSize ?? 20);
  };

  const columns: ColumnsType<User> = [
    {
      title: '用户',
      key: 'user',
      width: 200,
      render: (_: unknown, r: User) => (
        <Space>
          <Avatar src={r.avatar} icon={<UserOutlined />} size="small" />
          <span style={{ fontWeight: 600 }}>{r.nickname}</span>
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (v: string | null) => v || <span style={{ color: '#666' }}>-</span>,
    },
    {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone',
      render: (v: string | null) => v || <span style={{ color: '#666' }}>-</span>,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role: string, r: User) => (
        <Select
          value={role}
          size="small"
          style={{ width: 120 }}
          onChange={(val) => handleRoleChange(r.id, val)}
          options={ROLE_OPTIONS.filter((o) => o.value !== '')}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (v: boolean, r: User) => (
        <Switch
          checked={v}
          size="small"
          onChange={(checked) => handleToggleActive(r.id, checked)}
        />
      ),
    },
    {
      title: '行程/订单/日志',
      key: 'counts',
      width: 130,
      render: (_: unknown, r: User) => {
        const c = r._count;
        if (!c) return '-';
        return `${c.trips} / ${c.orders} / ${c.journals}`;
      },
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 150,
      render: (v: string | null) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: User) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <>
      <Title level={4} style={{ color: '#D4A855', marginBottom: 16 }}>
        用户管理
      </Title>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="搜索昵称或邮箱"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            onPressEnter={load}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            value={roleFilter}
            onChange={(val) => { setRoleFilter(val); setPage(1); }}
            options={ROLE_OPTIONS}
            style={{ width: 140 }}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: '暂无用户数据' }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 个用户`,
          }}
          onChange={handleTableChange}
          size="middle"
          scroll={{ x: 1100 }}
        />
      </Card>

      <Drawer
        title="用户详情"
        open={!!detail}
        onClose={() => setDetail(null)}
        width={520}
      >
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{detail.id}</Descriptions.Item>
            <Descriptions.Item label="昵称">
              <Space>
                <Avatar src={detail.avatar} icon={<UserOutlined />} size="small" />
                {detail.nickname}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">{detail.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="手机">{detail.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="角色">
              <Tag color={ROLE_MAP[detail.role]?.color}>{ROLE_MAP[detail.role]?.label || detail.role}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={detail.isActive ? 'success' : 'error'}>{detail.isActive ? '活跃' : '已停用'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="邮箱验证">
              <Tag color={detail.emailVerified ? 'success' : 'default'}>{detail.emailVerified ? '已验证' : '未验证'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="手机验证">
              <Tag color={detail.phoneVerified ? 'success' : 'default'}>{detail.phoneVerified ? '已验证' : '未验证'}</Tag>
            </Descriptions.Item>
            {detail._count && (
              <>
                <Descriptions.Item label="行程数">{detail._count.trips}</Descriptions.Item>
                <Descriptions.Item label="订单数">{detail._count.orders}</Descriptions.Item>
                <Descriptions.Item label="日志数">{detail._count.journals}</Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="最后登录">
              {detail.lastLoginAt ? dayjs(detail.lastLoginAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="注册时间">
              {detail.createdAt ? dayjs(detail.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </>
  );
}
