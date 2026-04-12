import { useEffect, useState, useCallback } from 'react';
import {
  Card, Typography, Row, Col, Statistic, Tag, Space, Button, Descriptions, Alert, message,
} from 'antd';
import {
  ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
  DatabaseOutlined, CloudOutlined,
} from '@ant-design/icons';
import { getHealthInfo, getHealthReady } from '../lib/m40';

const { Title, Paragraph } = Typography;

function fmtUptime(sec: number): string {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

export default function SystemHealthPage() {
  const [info, setInfo] = useState<Record<string, unknown> | null>(null);
  const [ready, setReady] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [i, r] = await Promise.all([getHealthInfo(), getHealthReady()]);
      setInfo(i);
      setReady(r);
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const dbOk = info?.database === 'connected';
  const redisOk = info?.redis === 'connected';
  const overall = dbOk && redisOk;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0, color: '#D4A855' }}>系统健康</Title>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={load}>刷新</Button>
      </Space>
      <Paragraph type="secondary">API / DB / Redis 健康状态，每 30 秒自动刷新。</Paragraph>

      {info && (
        <Alert
          style={{ marginBottom: 16 }}
          type={overall ? 'success' : 'error'}
          showIcon
          message={overall ? '全部服务运行正常' : '部分服务异常，请检查'}
        />
      )}

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="API 版本"
              value={String(info?.version ?? '-')}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="环境"
              value={String(info?.environment ?? '-')}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="数据库"
              value={dbOk ? '正常' : '异常'}
              prefix={<DatabaseOutlined style={{ color: dbOk ? '#52c41a' : '#ff4d4f' }} />}
              valueStyle={{ color: dbOk ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Redis"
              value={redisOk ? '正常' : '异常'}
              prefix={<CloudOutlined style={{ color: redisOk ? '#52c41a' : '#ff4d4f' }} />}
              valueStyle={{ color: redisOk ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="详细信息" size="small">
        {info ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="运行时间">{fmtUptime(Number(info.uptime ?? 0))}</Descriptions.Item>
            <Descriptions.Item label="服务器时间">{String(info.timestamp ?? '-')}</Descriptions.Item>
            <Descriptions.Item label="数据库">
              {dbOk ? <Tag icon={<CheckCircleOutlined />} color="success">Connected</Tag>
                    : <Tag icon={<CloseCircleOutlined />} color="error">Disconnected</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="Redis">
              {redisOk ? <Tag icon={<CheckCircleOutlined />} color="success">Connected</Tag>
                       : <Tag icon={<CloseCircleOutlined />} color="error">Disconnected</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="Readiness 探针" span={2}>
              <code>{JSON.stringify(ready, null, 2)}</code>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Paragraph type="secondary">加载中...</Paragraph>
        )}
      </Card>
    </div>
  );
}
