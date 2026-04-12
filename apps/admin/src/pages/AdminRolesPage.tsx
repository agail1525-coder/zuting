import { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tag, Button, Space, Typography, Modal, Form, Input, Select,
  Popconfirm, message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DatabaseOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  listAdminRoles, listAdminPermissions, seedSystemRoles,
  createAdminRole, updateAdminRole, deleteAdminRole, type AdminRoleRecord,
} from '../lib/m40';

const { Title, Paragraph } = Typography;

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<AdminRoleRecord[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<AdminRoleRecord | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([listAdminRoles(), listAdminPermissions()]);
      setRoles(r);
      setPermissions(p.all);
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSeed = async () => {
    try {
      await seedSystemRoles();
      message.success('系统角色已初始化');
      load();
    } catch (e) {
      message.error(e instanceof Error ? e.message : '初始化失败');
    }
  };

  const handleSave = async () => {
    try {
      const v = await form.validateFields();
      if (modal?.id) {
        await updateAdminRole(modal.id, { description: v.description, permissions: v.permissions });
        message.success('更新成功');
      } else {
        await createAdminRole({ name: v.name, description: v.description, permissions: v.permissions });
        message.success('创建成功');
      }
      setModal(null);
      form.resetFields();
      load();
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(err instanceof Error ? err.message : '保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdminRole(id);
      message.success('已删除');
      load();
    } catch (e) {
      message.error(e instanceof Error ? e.message : '删除失败');
    }
  };

  const cols: ColumnsType<AdminRoleRecord> = [
    { title: '角色名', dataIndex: 'name', width: 180, render: (v, r) => (
      <Space><strong>{v}</strong>{r.isSystem && <Tag color="blue">系统</Tag>}</Space>
    ) },
    { title: '描述', dataIndex: 'description', render: (v?: string) => v ?? '—' },
    {
      title: '权限数', dataIndex: 'permissions', width: 100,
      render: (v: string[]) => <Tag color="gold">{v.length}</Tag>,
    },
    {
      title: '创建时间', dataIndex: 'createdAt', width: 160,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作', key: 'actions', width: 180, fixed: 'right',
      render: (_, r) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => {
            form.setFieldsValue({ name: r.name, description: r.description, permissions: r.permissions });
            setModal(r);
          }}>编辑</Button>
          {!r.isSystem && (
            <Popconfirm title="确认删除此角色？" onConfirm={() => handleDelete(r.id)}>
              <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ color: '#D4A855' }}>管理员角色</Title>
      <Paragraph type="secondary">角色定义权限集合，用户关联角色获得对应权限。</Paragraph>

      <Card
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
            <Button icon={<DatabaseOutlined />} onClick={handleSeed}>初始化系统角色</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
              form.resetFields();
              setModal({} as AdminRoleRecord);
            }}>新建角色</Button>
          </Space>
        }
      >
        <Table rowKey="id" columns={cols} dataSource={roles} loading={loading} pagination={false} />
      </Card>

      <Modal
        open={!!modal}
        title={modal?.id ? '编辑角色' : '新建角色'}
        onOk={handleSave}
        onCancel={() => { setModal(null); form.resetFields(); }}
        width={680}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="角色名" rules={[{ required: true }]}>
            <Input disabled={!!modal?.id} placeholder="例如：EDITOR" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="permissions" label="权限" rules={[{ required: true }]}>
            <Select
              mode="multiple"
              placeholder="选择权限..."
              options={permissions.map((p) => ({ value: p, label: p }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
