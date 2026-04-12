import { useEffect, useState } from 'react';
import { Timeline, Tag, Typography, Spin, Empty, Button, Space } from 'antd';
import { getResourceHistory, type AuditLog } from '../../lib/m40';

const { Text } = Typography;

interface AuditTimelineProps {
  resource: string;
  resourceId: string;
  onRollback?: (log: AuditLog) => void;
}

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
  PUBLISH: 'gold',
  UNPUBLISH: 'default',
  AI_GENERATE: 'purple',
  AI_TRANSLATE: 'purple',
  AI_MODERATE: 'purple',
  ROLLBACK: 'orange',
};

export default function AuditTimeline({ resource, resourceId, onRollback }: AuditTimelineProps) {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getResourceHistory(resource, resourceId)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [resource, resourceId]);

  if (loading) return <Spin />;
  if (items.length === 0) return <Empty description="暂无变更记录" />;

  return (
    <Timeline
      items={items.map((log) => ({
        color: ACTION_COLOR[log.action] ?? 'blue',
        children: (
          <Space direction="vertical" size={4}>
            <Space>
              <Tag color={ACTION_COLOR[log.action]}>{log.action}</Tag>
              <Text type="secondary">{new Date(log.createdAt).toLocaleString()}</Text>
            </Space>
            <Text style={{ fontSize: 12 }}>admin:{log.adminId.slice(0, 8)}</Text>
            {log.diff !== undefined && log.diff !== null && (
              <pre
                style={{
                  fontSize: 11,
                  background: '#0a0a0a',
                  padding: 8,
                  borderRadius: 4,
                  maxWidth: 400,
                  overflow: 'auto',
                  maxHeight: 120,
                }}
              >
                {JSON.stringify(log.diff, null, 2)}
              </pre>
            )}
            {onRollback && log.action !== 'CREATE' && (
              <Button size="small" onClick={() => onRollback(log)}>
                回滚到此版本
              </Button>
            )}
          </Space>
        ),
      }))}
    />
  );
}
