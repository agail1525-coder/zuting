import { useState } from 'react';
import {
  Tabs,
  Table,
  Button,
  Select,
  Space,
  Typography,
  Tag,
  Upload,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UploadOutlined, DollarOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

// ── 价格快照 ───────────────────────────────────────────────────────────────────

interface PriceSnapshot {
  id: string;
  entityType: string;
  entityId: string;
  date: string;
  price: number;
  currency: string;
}

const MOCK_SNAPSHOTS: PriceSnapshot[] = [
  { id: '1', entityType: '圣地', entityId: 'site-001', date: '2026-03-25', price: 299, currency: 'CNY' },
  { id: '2', entityType: '祖庭', entityId: 'temple-002', date: '2026-03-26', price: 199, currency: 'CNY' },
  { id: '3', entityType: '行程', entityId: 'trip-003', date: '2026-03-27', price: 1299, currency: 'CNY' },
  { id: '4', entityType: '路线', entityId: 'route-004', date: '2026-03-28', price: 499, currency: 'CNY' },
  { id: '5', entityType: '圣地', entityId: 'site-005', date: '2026-03-29', price: 349, currency: 'CNY' },
];

const ENTITY_TYPE_OPTIONS = ['全部', '圣地', '祖庭', '行程', '路线'];

const snapshotColumns: ColumnsType<PriceSnapshot> = [
  {
    title: '实体类型',
    dataIndex: 'entityType',
    key: 'entityType',
    width: 100,
    render: (v: string) => <Tag color="blue">{v}</Tag>,
  },
  {
    title: '实体ID',
    dataIndex: 'entityId',
    key: 'entityId',
    ellipsis: true,
  },
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
    width: 130,
  },
  {
    title: '价格',
    dataIndex: 'price',
    key: 'price',
    width: 110,
    render: (v: number) => (
      <span style={{ color: '#D4A855', fontWeight: 600 }}>
        {v.toLocaleString()}
      </span>
    ),
  },
  {
    title: '货币',
    dataIndex: 'currency',
    key: 'currency',
    width: 80,
  },
];

function SnapshotsTab() {
  const [filterType, setFilterType] = useState<string>('全部');

  const filtered =
    filterType === '全部'
      ? MOCK_SNAPSHOTS
      : MOCK_SNAPSHOTS.filter((s) => s.entityType === filterType);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <span style={{ color: '#999' }}>实体类型:</span>
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 120 }}
          >
            {ENTITY_TYPE_OPTIONS.map((t) => (
              <Option key={t} value={t}>
                {t}
              </Option>
            ))}
          </Select>
        </Space>
        <Upload
          accept=".csv,.json"
          showUploadList={false}
          beforeUpload={(file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const text = e.target?.result as string;
                let rows: PriceSnapshot[] = [];
                if (file.name.endsWith('.json')) {
                  rows = JSON.parse(text);
                } else {
                  const lines = text.split('\n').filter(Boolean);
                  const header = lines[0].split(',');
                  rows = lines.slice(1).map(line => {
                    const cols = line.split(',');
                    const obj: Record<string, string> = {};
                    header.forEach((h, i) => { obj[h.trim()] = (cols[i] || '').trim(); });
                    return {
                      id: obj.id || `import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                      entityType: obj.entityType || 'ROUTE',
                      entityId: obj.entityId || '',
                      date: obj.date || new Date().toISOString().slice(0, 10),
                      price: Number(obj.price) || 0,
                      currency: obj.currency || 'CNY',
                    };
                  });
                }
                message.success(`已解析 ${rows.length} 条价格记录（前端预览，需后端API持久化）`);
              } catch {
                message.error('文件解析失败，请检查格式');
              }
            };
            reader.readAsText(file);
            return false;
          }}
        >
          <Button icon={<UploadOutlined />} type="primary">
            导入价格数据
          </Button>
        </Upload>
      </div>
      <Table<PriceSnapshot>
        dataSource={filtered}
        columns={snapshotColumns}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: true }}
        size="middle"
      />
    </div>
  );
}

// ── 价格提醒 ───────────────────────────────────────────────────────────────────

type AlertStatus = '等待中' | '已触发';

interface PriceAlert {
  id: string;
  user: string;
  entityName: string;
  targetPrice: number;
  currentPrice: number;
  status: AlertStatus;
  createdAt: string;
}

const MOCK_ALERTS: PriceAlert[] = [
  {
    id: 'a1',
    user: '张三',
    entityName: '布达拉宫朝圣之旅',
    targetPrice: 999,
    currentPrice: 1199,
    status: '等待中',
    createdAt: '2026-03-20 10:00',
  },
  {
    id: 'a2',
    user: '李四',
    entityName: '麦加朝圣行程',
    targetPrice: 3000,
    currentPrice: 2880,
    status: '已触发',
    createdAt: '2026-03-18 14:30',
  },
  {
    id: 'a3',
    user: '王五',
    entityName: '耶路撒冷圣城游',
    targetPrice: 2500,
    currentPrice: 2700,
    status: '等待中',
    createdAt: '2026-03-22 09:15',
  },
  {
    id: 'a4',
    user: '赵六',
    entityName: '恒河朝圣路线',
    targetPrice: 800,
    currentPrice: 780,
    status: '已触发',
    createdAt: '2026-03-25 16:45',
  },
  {
    id: 'a5',
    user: '陈七',
    entityName: '少林寺禅修体验',
    targetPrice: 500,
    currentPrice: 550,
    status: '等待中',
    createdAt: '2026-03-27 11:20',
  },
];

const alertColumns: ColumnsType<PriceAlert> = [
  {
    title: '用户',
    dataIndex: 'user',
    key: 'user',
    width: 90,
  },
  {
    title: '实体名称',
    dataIndex: 'entityName',
    key: 'entityName',
    ellipsis: true,
  },
  {
    title: '目标价',
    dataIndex: 'targetPrice',
    key: 'targetPrice',
    width: 110,
    render: (v: number) => (
      <span style={{ color: '#52C41A', fontWeight: 600 }}>
        ¥{v.toLocaleString()}
      </span>
    ),
  },
  {
    title: '当前价',
    dataIndex: 'currentPrice',
    key: 'currentPrice',
    width: 110,
    render: (v: number) => (
      <span style={{ color: '#D4A855', fontWeight: 600 }}>
        ¥{v.toLocaleString()}
      </span>
    ),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (v: AlertStatus) => (
      <Tag color={v === '已触发' ? 'green' : 'orange'}>{v}</Tag>
    ),
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 160,
    render: (v: string) => <span style={{ color: '#999', fontSize: 12 }}>{v}</span>,
  },
];

function AlertsTab() {
  return (
    <Table<PriceAlert>
      dataSource={MOCK_ALERTS}
      columns={alertColumns}
      rowKey="id"
      pagination={{ pageSize: 10, showSizeChanger: true }}
      size="middle"
    />
  );
}

// ── 主页面 ────────────────────────────────────────────────────────────────────

export default function PriceManagePage() {
  const tabItems = [
    {
      key: 'snapshots',
      label: (
        <span>
          <DollarOutlined style={{ marginRight: 6 }} />
          价格快照
        </span>
      ),
      children: <SnapshotsTab />,
    },
    {
      key: 'alerts',
      label: '价格提醒',
      children: <AlertsTab />,
    },
  ];

  return (
    <div>
      <Title level={3} style={{ color: '#D4A855', marginBottom: 24 }}>
        价格管理
      </Title>
      <Tabs defaultActiveKey="snapshots" items={tabItems} />
    </div>
  );
}
