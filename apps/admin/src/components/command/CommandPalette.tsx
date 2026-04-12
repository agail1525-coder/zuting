import { useEffect, useState, useCallback } from 'react';
import { Modal, Input, List, Typography, Tag, Space, Button, Alert } from 'antd';
import { ThunderboltOutlined, RobotOutlined } from '@ant-design/icons';
import { aiCommand } from '../../lib/m40';

const { Text } = Typography;

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface ParsedCommand {
  action: string;
  confirmed: boolean;
  output?: string;
  traceId?: string;
  requiresConfirmation?: boolean;
}

const QUICK_HINTS = [
  '把广州六榕寺的封面换成 AI 水墨',
  '将泰国圣地简介批量翻译为 7 语言',
  '把上周评分低于 3 星的评价标记待审核',
  '创建五一限时促销活动：全场 8 折',
  '查询近 24 小时所有 DELETE 操作',
];

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedCommand | null>(null);

  useEffect(() => {
    if (!open) {
      setQ('');
      setParsed(null);
      setLoading(false);
    }
  }, [open]);

  const submit = useCallback(async () => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const r = await aiCommand(q.trim());
      setParsed({
        action: r.parsed.action,
        confirmed: r.parsed.confirmed,
        output: r.output,
        traceId: r.traceId,
        requiresConfirmation: r.requiresConfirmation,
      });
    } catch (err) {
      setParsed({
        action: 'error',
        confirmed: false,
        output: err instanceof Error ? err.message : '解析失败',
      });
    } finally {
      setLoading(false);
    }
  }, [q]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <Space>
          <ThunderboltOutlined style={{ color: '#D4A855' }} />
          <span>AI 命令栏 · Cmd+K</span>
        </Space>
      }
      width={640}
      destroyOnClose
    >
      <Input.Search
        autoFocus
        placeholder="用自然语言告诉我你想做什么，例如：把广州六榕寺封面换成 AI 水墨"
        enterButton="解析"
        size="large"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onSearch={submit}
        loading={loading}
      />

      {!parsed && (
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">灵感示例</Text>
          <List
            size="small"
            dataSource={QUICK_HINTS}
            renderItem={(hint) => (
              <List.Item
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setQ(hint);
                }}
              >
                <Space>
                  <RobotOutlined style={{ color: '#D4A855' }} />
                  <Text>{hint}</Text>
                </Space>
              </List.Item>
            )}
          />
        </div>
      )}

      {parsed && (
        <div style={{ marginTop: 16 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space>
              <Tag color="gold">{parsed.action}</Tag>
              {parsed.traceId && <Tag>trace: {parsed.traceId.slice(0, 8)}</Tag>}
            </Space>
            {parsed.output && (
              <Alert
                type={parsed.requiresConfirmation ? 'warning' : 'info'}
                message={parsed.output}
              />
            )}
            {parsed.requiresConfirmation && (
              <Space>
                <Button type="primary" danger>
                  二次确认执行
                </Button>
                <Button onClick={() => setParsed(null)}>取消</Button>
              </Space>
            )}
          </Space>
        </div>
      )}
    </Modal>
  );
}
