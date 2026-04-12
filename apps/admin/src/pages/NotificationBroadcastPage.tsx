import { useState } from 'react';
import {
  Card, Form, Input, Button, Space, Typography, message, Alert, Tag,
} from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { sendBroadcast } from '../lib/m40';

const { Title, Paragraph } = Typography;

export default function NotificationBroadcastPage() {
  const [form] = Form.useForm();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const send = async () => {
    try {
      const v = await form.validateFields();
      const userIds = String(v.userIds).split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
      if (!userIds.length) {
        message.error('请至少输入一个用户 ID');
        return;
      }
      setSending(true);
      const res = await sendBroadcast({
        userIds, title: v.title, content: v.content, link: v.link || undefined,
      });
      setResult(res.sent);
      message.success(`已发送 ${res.sent} 条`);
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(err instanceof Error ? err.message : '发送失败');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <Title level={4} style={{ color: '#D4A855' }}>通知广播</Title>
      <Paragraph type="secondary">向指定用户批量发送系统通知。</Paragraph>

      <Card style={{ maxWidth: 820 }}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }, { max: 80 }]}>
            <Input placeholder="例如：新路线上线公告" />
          </Form.Item>
          <Form.Item name="content" label="正文" rules={[{ required: true }, { max: 2000 }]}>
            <Input.TextArea rows={6} placeholder="通知正文..." />
          </Form.Item>
          <Form.Item name="link" label="链接 (可选)">
            <Input placeholder="/routes/abc123" />
          </Form.Item>
          <Form.Item
            name="userIds"
            label="接收用户 ID (逗号或换行分隔)"
            rules={[{ required: true }]}
            extra="粘贴多个 user ID，系统会批量发送"
          >
            <Input.TextArea rows={4} placeholder="cuid1, cuid2, cuid3..." />
          </Form.Item>
          <Space>
            <Button type="primary" icon={<SendOutlined />} loading={sending} onClick={send}>
              发送
            </Button>
            {result !== null && <Tag color="green">已送达: {result}</Tag>}
          </Space>
        </Form>
        {result !== null && (
          <Alert
            style={{ marginTop: 16 }}
            type="info"
            showIcon
            message="通知已推送到用户收件箱。查看 /audit 可追溯。"
          />
        )}
      </Card>
    </div>
  );
}
