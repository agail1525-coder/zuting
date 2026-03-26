import { useState } from 'react';
import { Card, Typography, Input, Button, List, Space, Tag, Divider, message } from 'antd';
import { SendOutlined, RobotOutlined, BulbOutlined } from '@ant-design/icons';
import { chatWithXiaohong } from '../lib/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const SUGGESTIONS = [
  { text: '推荐一条佛教朝圣路线', category: '路线推荐' },
  { text: '菩提伽耶的历史背景是什么？', category: '知识问答' },
  { text: '基督教有哪些重要的朝圣地？', category: '知识问答' },
  { text: '如何安排一周的祖庭之旅？', category: '行程规划' },
  { text: '道教五大名山分别是哪些？', category: '知识问答' },
  { text: '朝圣旅行需要注意什么礼仪？', category: '旅行贴士' },
];

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIConfigPage() {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const text = chatInput.trim();
    if (!text) return;

    const userMsg: ChatMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setSending(true);

    try {
      const res = await chatWithXiaohong(text);
      const reply = res?.reply || res?.message || res?.content || '小鸿暂时无法回答，请稍后再试。';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '(API 连接失败，请确认后端服务已启动)' },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Title level={4} style={{ color: '#D4A855', marginBottom: 16 }}>
        <RobotOutlined style={{ marginRight: 8 }} />
        小鸿 AI 助手配置
      </Title>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Suggestions panel */}
        <Card
          title={
            <span>
              <BulbOutlined style={{ marginRight: 8, color: '#D4A855' }} />
              推荐问题列表
            </span>
          }
          style={{ flex: '1 1 360px', minWidth: 320 }}
        >
          <Paragraph style={{ color: '#999' }}>
            以下问题将作为用户的推荐提问，引导用户与小鸿互动。
          </Paragraph>
          <List
            dataSource={SUGGESTIONS}
            renderItem={(item) => (
              <List.Item
                style={{ cursor: 'pointer', borderBottom: '1px solid #1f1f1f' }}
                onClick={() => {
                  setChatInput(item.text);
                  message.info('已填入对话框');
                }}
              >
                <Space>
                  <Tag color="gold">{item.category}</Tag>
                  <Text style={{ color: '#ccc' }}>{item.text}</Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>

        {/* Chat test panel */}
        <Card
          title="对话测试"
          style={{ flex: '1 1 420px', minWidth: 360 }}
        >
          <div
            style={{
              height: 400,
              overflowY: 'auto',
              marginBottom: 16,
              padding: 12,
              background: '#0f0f0f',
              borderRadius: 8,
              border: '1px solid #1f1f1f',
            }}
          >
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 140, color: '#555' }}>
                <RobotOutlined style={{ fontSize: 40, marginBottom: 12 }} />
                <br />
                <Text style={{ color: '#555' }}>发送消息开始与小鸿对话</Text>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: msg.role === 'user' ? '#D4A855' : '#1a1a1a',
                    color: msg.role === 'user' ? '#000' : '#ccc',
                    border: msg.role === 'assistant' ? '1px solid #2a2a2a' : 'none',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="输入消息测试小鸿..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              style={{ flex: 1 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={sending}
              style={{ height: 'auto' }}
            >
              发送
            </Button>
          </Space.Compact>
        </Card>
      </div>
    </>
  );
}
