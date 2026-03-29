import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Typography, Tag, Modal, List, Space, Button, Spin, Empty } from 'antd';
import { MessageOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getToken } from '../lib/auth';

const { Title, Text, Paragraph } = Typography;

const BASE = import.meta.env.VITE_API_URL || '/api';

interface ChatRoom {
  id: string;
  type: string;
  name: string | null;
  createdAt: string;
  participantCount?: number;
  messageCount?: number;
  lastMessage?: { content: string; createdAt: string; senderId: string };
}

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  type: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${url}`, { headers });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  PRIVATE: { label: '私聊', color: 'blue' },
  GROUP: { label: '群聊', color: 'green' },
  SERVICE: { label: '客服', color: 'orange' },
};

export default function ChatMonitorPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchJson<ChatRoom[]>('/chat/rooms/admin');
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load chat rooms:', err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const viewMessages = useCallback(async (room: ChatRoom) => {
    setSelectedRoom(room);
    setModalOpen(true);
    setMessagesLoading(true);
    try {
      const res = await fetchJson<{ items: ChatMessage[]; total: number }>(
        `/chat/rooms/${room.id}/messages?page=1&limit=100`,
      );
      setMessages(Array.isArray(res.items) ? res.items : []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const columns: ColumnsType<ChatRoom> = [
    {
      title: '房间名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string | null) => name ?? '(未命名)',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const info = TYPE_LABELS[type] ?? { label: type, color: 'default' };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: '参与人数',
      dataIndex: 'participantCount',
      key: 'participantCount',
      width: 100,
      render: (val: number | undefined) => val ?? '-',
    },
    {
      title: '消息数',
      dataIndex: 'messageCount',
      key: 'messageCount',
      width: 100,
      render: (val: number | undefined) => val ?? '-',
    },
    {
      title: '最近活动',
      dataIndex: 'lastMessage',
      key: 'lastActivity',
      width: 180,
      render: (lastMessage: ChatRoom['lastMessage']) => {
        if (!lastMessage) return <Text type="secondary">暂无</Text>;
        return (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {lastMessage.createdAt.slice(0, 16).replace('T', ' ')}
          </Text>
        );
      },
    },
    {
      title: '最近消息',
      key: 'lastContent',
      ellipsis: true,
      render: (_: unknown, record: ChatRoom) =>
        record.lastMessage?.content ? (
          <Text ellipsis style={{ maxWidth: 200 }}>
            {record.lastMessage.content}
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (val: string) => val?.slice(0, 16).replace('T', ' ') ?? '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: ChatRoom) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => viewMessages(record)}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', display: 'flex' }}>
          <Title level={4} style={{ margin: 0 }}>
            <MessageOutlined style={{ marginRight: 8 }} />
            聊天监控
          </Title>
          <Button icon={<ReloadOutlined />} onClick={loadRooms} loading={loading}>
            刷新
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={rooms}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, showTotal: (total) => `共 ${total} 个房间` }}
          locale={{ emptyText: <Empty description="暂无聊天房间" /> }}
        />
      </Card>

      <Modal
        title={`聊天记录 — ${selectedRoom?.name ?? '(未命名)'}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={640}
        styles={{ body: { maxHeight: 500, overflowY: 'auto' } }}
      >
        {messagesLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : messages.length === 0 ? (
          <Empty description="暂无消息" />
        ) : (
          <List
            dataSource={messages}
            renderItem={(msg) => (
              <List.Item style={{ padding: '8px 0', border: 'none' }}>
                <div style={{ width: '100%' }}>
                  <Space style={{ marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 12 }}>
                      {msg.senderId.slice(0, 8)}...
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {msg.createdAt.slice(0, 16).replace('T', ' ')}
                    </Text>
                    {msg.isDeleted && <Tag color="red" style={{ fontSize: 10 }}>已撤回</Tag>}
                  </Space>
                  <Paragraph
                    style={{
                      margin: 0,
                      padding: '6px 12px',
                      background: msg.isDeleted ? '#f5f5f5' : '#f0f5ff',
                      borderRadius: 8,
                      color: msg.isDeleted ? '#999' : '#333',
                      fontStyle: msg.isDeleted ? 'italic' : 'normal',
                    }}
                  >
                    {msg.isDeleted ? '消息已撤回' : msg.content}
                  </Paragraph>
                </div>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
}
