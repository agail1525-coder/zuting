import { useEffect, useState, useCallback } from 'react';
import {
  Table, Card, Typography, Tag, Button, Space, message, Popconfirm, Select,
  Modal, Form, Input, InputNumber, Divider, Empty,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, ReloadOutlined, EditOutlined,
  NodeIndexOutlined, MinusCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getRoutes, createRoute, updateRoute, deleteRoute, getHolySites, replaceRouteSites } from '../lib/api';
import type { RouteSiteItem } from '../lib/api';
import type { AdminRoute, HolySite } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CATEGORY_MAP: Record<string, { color: string; label: string }> = {
  ZEN: { color: 'gold', label: '禅宗' },
  BUDDHIST: { color: 'orange', label: '佛教' },
  TAOIST: { color: 'green', label: '道教' },
  CHRISTIAN: { color: 'red', label: '基督' },
  ISLAMIC: { color: 'lime', label: '伊斯兰' },
  CROSS_CULTURAL: { color: 'purple', label: '跨文化' },
  HINDU: { color: 'volcano', label: '印度教' },
  JEWISH: { color: 'blue', label: '犹太教' },
  CULTURAL_HERITAGE: { color: 'cyan', label: '文化遗产' },
};

const DIFFICULTY_MAP: Record<string, { color: string; label: string }> = {
  EASY: { color: 'success', label: '轻松' },
  MODERATE: { color: 'warning', label: '适中' },
  CHALLENGING: { color: 'error', label: '挑战' },
};

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  DRAFT: { color: 'default', label: '草稿' },
  PUBLISHED: { color: 'success', label: '已发布' },
  ARCHIVED: { color: 'default', label: '已归档' },
};

interface RouteFormValues {
  slug: string;
  title: string;
  titleEn: string;
  subtitle: string;
  category: string;
  difficulty: string;
  duration: number;
  nights: number;
  priceFrom: number;
  season: string;
  groupSize: string;
  description: string;
  status?: string;
}

interface SiteRow {
  key: string;
  siteId: string;
  day: number;
  order: number;
  duration: string | null;
  note: string | null;
}

export default function RoutesPage() {
  const [data, setData] = useState<AdminRoute[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRoute | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<RouteFormValues>();

  // Sites editor state
  const [sitesModalOpen, setSitesModalOpen] = useState(false);
  const [sitesRoute, setSitesRoute] = useState<AdminRoute | null>(null);
  const [siteRows, setSiteRows] = useState<SiteRow[]>([]);
  const [allSites, setAllSites] = useState<HolySite[]>([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [savingSites, setSavingSites] = useState(false);

  const load = (p = page, ps = pageSize, cat = category) => {
    setLoading(true);
    getRoutes(p, ps, cat)
      .then((res) => {
        setData(res.items);
        setTotal(res.total);
      })
      .catch(() => message.error('加载路线失败'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const loadAllSites = useCallback(async () => {
    if (allSites.length > 0) return;
    setLoadingSites(true);
    try {
      const sites = await getHolySites();
      setAllSites(sites);
    } catch {
      message.error('加载圣地列表失败');
    } finally {
      setLoadingSites(false);
    }
  }, [allSites.length]);

  const handleDelete = (id: string) => {
    deleteRoute(id)
      .then(() => {
        message.success('删除成功');
        load();
      })
      .catch(() => message.error('删除失败'));
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 'DRAFT', difficulty: 'MODERATE', duration: 3, nights: 2, priceFrom: 0 });
    setModalOpen(true);
  };

  const openEdit = (record: AdminRoute) => {
    setEditing(record);
    form.setFieldsValue({
      slug: record.slug,
      title: record.title,
      titleEn: record.titleEn,
      subtitle: record.subtitle,
      category: record.category,
      difficulty: record.difficulty,
      duration: record.duration,
      nights: record.nights,
      priceFrom: record.priceFrom,
      season: record.season,
      groupSize: record.groupSize,
      description: record.description,
      status: record.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload: Record<string, unknown> = {
        ...values,
        highlights: [],
        included: [],
        excluded: [],
        itinerary: [],
      };
      if (editing) {
        await updateRoute(editing.id, payload);
        message.success('更新成功');
      } else {
        await createRoute(payload);
        message.success('创建成功');
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(editing ? '更新失败' : '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Sites Editor ---
  const openSitesEditor = async (record: AdminRoute) => {
    setSitesRoute(record);
    await loadAllSites();
    // Pre-fill from record.sites (returned by backend includes)
    const existing: SiteRow[] = (record.sites || []).map((s, idx) => ({
      key: `s-${idx}`,
      siteId: s.siteId,
      day: s.day,
      order: s.order,
      duration: s.duration,
      note: s.note,
    }));
    setSiteRows(existing);
    setSitesModalOpen(true);
  };

  const addSiteRow = (day: number) => {
    const rowsInDay = siteRows.filter((r) => r.day === day);
    const nextOrder = rowsInDay.length > 0 ? Math.max(...rowsInDay.map((r) => r.order)) + 1 : 1;
    setSiteRows((prev) => [
      ...prev,
      { key: `s-${Date.now()}`, siteId: '', day, order: nextOrder, duration: null, note: null },
    ]);
  };

  const addNewDay = () => {
    const maxDay = siteRows.length > 0 ? Math.max(...siteRows.map((r) => r.day)) : 0;
    addSiteRow(maxDay + 1);
  };

  const removeSiteRow = (key: string) => {
    setSiteRows((prev) => prev.filter((r) => r.key !== key));
  };

  const updateSiteRow = (key: string, field: keyof SiteRow, value: unknown) => {
    setSiteRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const saveSites = async () => {
    if (!sitesRoute) return;
    const validRows = siteRows.filter((r) => r.siteId);
    const payload: RouteSiteItem[] = validRows.map((r) => ({
      siteId: r.siteId,
      day: r.day,
      order: r.order,
      duration: r.duration,
      note: r.note,
    }));
    setSavingSites(true);
    try {
      await replaceRouteSites(sitesRoute.id, payload);
      message.success('行程编排已保存');
      setSitesModalOpen(false);
      load();
    } catch {
      message.error('保存编排失败');
    } finally {
      setSavingSites(false);
    }
  };

  // Group site rows by day for display
  const groupedDays = (): number[] => {
    const days = [...new Set(siteRows.map((r) => r.day))].sort((a, b) => a - b);
    return days.length > 0 ? days : [];
  };

  const siteOptions = allSites.map((s) => ({
    value: s.id,
    label: `${s.name} · ${s.country}`,
  }));

  const columns: ColumnsType<AdminRoute> = [
    {
      title: '路线名称',
      dataIndex: 'title',
      width: 200,
      render: (title: string, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.titleEn}</div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 100,
      render: (cat: string) => {
        const m = CATEGORY_MAP[cat];
        return m ? <Tag color={m.color}>{m.label}</Tag> : cat;
      },
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      width: 80,
      render: (diff: string) => {
        const m = DIFFICULTY_MAP[diff];
        return m ? <Tag color={m.color}>{m.label}</Tag> : diff;
      },
    },
    {
      title: '行程',
      width: 90,
      render: (_: unknown, record) => `${record.duration}天${record.nights}晚`,
    },
    {
      title: '站点',
      width: 60,
      render: (_: unknown, record) => (record.sites?.length ?? 0),
    },
    {
      title: '起价(分)',
      dataIndex: 'priceFrom',
      width: 100,
      render: (v: number) => `¥${(v / 100).toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: string) => {
        const m = STATUS_MAP[status];
        return m ? <Tag color={m.color}>{m.label}</Tag> : status;
      },
    },
    {
      title: '评分',
      dataIndex: 'rating',
      width: 80,
      render: (v: number | null, record) =>
        v ? `${v.toFixed(1)} (${record.reviewCount})` : '-',
    },
    {
      title: '预订数',
      dataIndex: 'bookCount',
      width: 80,
    },
    {
      title: '操作',
      width: 160,
      render: (_: unknown, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button type="link" size="small" icon={<NodeIndexOutlined />} onClick={() => openSitesEditor(record)} title="编排站点" />
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Title level={4} style={{ margin: 0 }}>路线管理</Title>
          <Space>
            <Select
              placeholder="按分类筛选"
              allowClear
              style={{ width: 140 }}
              value={category}
              onChange={(v) => { setCategory(v); load(1, pageSize, v); }}
              options={Object.entries(CATEGORY_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
            />
            <Button icon={<ReloadOutlined />} onClick={() => load()}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建路线</Button>
          </Space>
        </Space>
        <Table<AdminRoute>
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); load(p, ps); },
          }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Space>

      {/* Route Create/Edit Modal */}
      <Modal
        title={editing ? '编辑路线' : '新建路线'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText={editing ? '保存' : '创建'}
        cancelText="取消"
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="路线名称" rules={[{ required: true, message: '请输入路线名称' }]}>
            <Input placeholder="例：六祖慧能路线" />
          </Form.Item>
          <Form.Item name="titleEn" label="英文名称" rules={[{ required: true, message: '请输入英文名称' }]}>
            <Input placeholder="例：Sixth Patriarch Huineng Route" />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true, message: '请输入Slug' }]}>
            <Input placeholder="例：sixth-patriarch-huineng" />
          </Form.Item>
          <Form.Item name="subtitle" label="副标题" rules={[{ required: true, message: '请输入副标题' }]}>
            <Input placeholder="例：追随六祖足迹，体验禅宗精髓" />
          </Form.Item>
          <Space size="middle" style={{ width: '100%' }}>
            <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]} style={{ width: 180 }}>
              <Select
                placeholder="选择分类"
                options={Object.entries(CATEGORY_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
              />
            </Form.Item>
            <Form.Item name="difficulty" label="难度" rules={[{ required: true, message: '请选择难度' }]} style={{ width: 140 }}>
              <Select
                placeholder="选择难度"
                options={Object.entries(DIFFICULTY_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
              />
            </Form.Item>
            <Form.Item name="status" label="状态" style={{ width: 140 }}>
              <Select
                placeholder="选择状态"
                options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
              />
            </Form.Item>
          </Space>
          <Space size="middle" style={{ width: '100%' }}>
            <Form.Item name="duration" label="天数" rules={[{ required: true, message: '请输入天数' }]} style={{ width: 120 }}>
              <InputNumber min={1} max={30} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="nights" label="晚数" rules={[{ required: true, message: '请输入晚数' }]} style={{ width: 120 }}>
              <InputNumber min={0} max={29} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="priceFrom" label="起价(分)" rules={[{ required: true, message: '请输入起价' }]} style={{ width: 160 }}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="例：328000" />
            </Form.Item>
          </Space>
          <Space size="middle" style={{ width: '100%' }}>
            <Form.Item name="season" label="适宜季节" rules={[{ required: true, message: '请输入适宜季节' }]} style={{ flex: 1 }}>
              <Input placeholder="例：春秋两季" />
            </Form.Item>
            <Form.Item name="groupSize" label="团队规模" rules={[{ required: true, message: '请输入团队规模' }]} style={{ flex: 1 }}>
              <Input placeholder="例：2-8人小团" />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="路线描述" rules={[{ required: true, message: '请输入路线描述' }]}>
            <TextArea rows={4} placeholder="详细路线介绍..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* RouteSite Editor Modal */}
      <Modal
        title={`行程编排 — ${sitesRoute?.title || ''}`}
        open={sitesModalOpen}
        onCancel={() => setSitesModalOpen(false)}
        onOk={saveSites}
        confirmLoading={savingSites}
        okText="保存编排"
        cancelText="取消"
        width={800}
        destroyOnClose
      >
        {loadingSites ? (
          <div style={{ textAlign: 'center', padding: 40 }}>加载圣地数据中...</div>
        ) : (
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {groupedDays().length === 0 && (
              <Empty description="暂无站点，点击下方按钮添加" style={{ margin: '20px 0' }} />
            )}
            {groupedDays().map((day) => (
              <div key={day} style={{ marginBottom: 16 }}>
                <Divider orientation="left" style={{ margin: '8px 0' }}>
                  <Text strong>第 {day} 天</Text>
                </Divider>
                {siteRows
                  .filter((r) => r.day === day)
                  .sort((a, b) => a.order - b.order)
                  .map((row) => (
                    <div key={row.key} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ width: 24, textAlign: 'center', flexShrink: 0, color: '#999' }}>
                        {row.order}
                      </Text>
                      <Select
                        showSearch
                        placeholder="选择圣地"
                        style={{ flex: 1 }}
                        value={row.siteId || undefined}
                        onChange={(v) => updateSiteRow(row.key, 'siteId', v)}
                        options={siteOptions}
                        filterOption={(input, option) =>
                          (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false
                        }
                      />
                      <Input
                        placeholder="时长"
                        style={{ width: 80 }}
                        value={row.duration || ''}
                        onChange={(e) => updateSiteRow(row.key, 'duration', e.target.value || null)}
                      />
                      <Input
                        placeholder="备注"
                        style={{ width: 140 }}
                        value={row.note || ''}
                        onChange={(e) => updateSiteRow(row.key, 'note', e.target.value || null)}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => removeSiteRow(row.key)}
                      />
                    </div>
                  ))}
                <Button
                  type="dashed"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => addSiteRow(day)}
                  style={{ marginLeft: 32 }}
                >
                  添加站点
                </Button>
              </div>
            ))}
            <Divider dashed />
            <Button type="dashed" block icon={<PlusOutlined />} onClick={addNewDay}>
              添加新一天
            </Button>
          </div>
        )}
      </Modal>
    </Card>
  );
}
