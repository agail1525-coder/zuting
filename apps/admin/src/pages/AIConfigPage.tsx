import { useState, useEffect, useCallback } from 'react';
import {
  Card, Typography, Input, Button, List, Space, Tag, Modal, Form, Popconfirm,
  Spin, message, Tabs, Select, Slider, Switch, Statistic, Row, Col, Alert, Tooltip,
} from 'antd';
import {
  SendOutlined, RobotOutlined, BulbOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, SettingOutlined, SafetyOutlined, BarChartOutlined, ApiOutlined,
} from '@ant-design/icons';
import {
  chatWithXiaohong,
  getXiaohongSuggestions,
  createXiaohongSuggestion,
  updateXiaohongSuggestion,
  deleteXiaohongSuggestion,
  getAiConfigs,
  updateAiConfig,
} from '../lib/api';
import type { XiaohongSuggestion, AiConfig } from '../lib/api';
import type { XiaohongChatResponse } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
}

// ── Helpers ──

function configValue(configs: AiConfig[], key: string, fallback = ''): string {
  return configs.find((c) => c.key === key)?.value ?? fallback;
}

function configsByCategory(configs: AiConfig[], category: string): AiConfig[] {
  return configs.filter((c) => c.category === category);
}

// ── Main Component ──

export default function AIConfigPage() {
  const [configs, setConfigs] = useState<AiConfig[]>([]);
  const [configsLoading, setConfigsLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // key being saved

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [sending, setSending] = useState(false);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<XiaohongSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [form] = Form.useForm<{ text: string; category: string }>();

  // ── Data fetching ──

  const fetchConfigs = useCallback(async () => {
    setConfigsLoading(true);
    try {
      const data = await getAiConfigs();
      setConfigs(data);
    } catch {
      message.error('加载AI配置失败');
    } finally {
      setConfigsLoading(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async () => {
    setSuggestionsLoading(true);
    try {
      const data = await getXiaohongSuggestions();
      setSuggestions(data);
    } catch {
      message.warning('推荐问题加载失败');
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
    fetchSuggestions();
  }, [fetchConfigs, fetchSuggestions]);

  // ── Config update handler ──

  const handleConfigSave = async (key: string, value: string) => {
    setSaving(key);
    try {
      await updateAiConfig(key, value);
      message.success('配置已保存');
      // Update local state
      setConfigs((prev) =>
        prev.map((c) => (c.key === key ? { ...c, value } : c)),
      );
    } catch {
      message.error('保存失败');
    } finally {
      setSaving(null);
    }
  };

  // ── Chat handlers ──

  const handleSend = async () => {
    const text = chatInput.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setChatInput('');
    setSending(true);

    try {
      const res = await chatWithXiaohong(text) as XiaohongChatResponse & { content?: string; intent?: string };
      const reply =
        res?.content || res?.reply || res?.message || '小鸿暂时无法回答';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply, intent: (res as any)?.intent },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '(API 连接失败)' },
      ]);
    } finally {
      setSending(false);
    }
  };

  // ── Suggestion CRUD ──

  const openCreateModal = () => {
    setEditingIndex(null);
    form.resetFields();
    form.setFieldsValue({ text: '', category: '通用' });
    setModalOpen(true);
  };

  const openEditModal = (index: number, item: XiaohongSuggestion) => {
    setEditingIndex(index);
    form.setFieldsValue({ text: item.text, category: item.category });
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setModalSaving(true);
      if (editingIndex !== null) {
        await updateXiaohongSuggestion(editingIndex, values);
        message.success('建议已更新');
      } else {
        await createXiaohongSuggestion(values);
        message.success('建议已添加');
      }
      setModalOpen(false);
      await fetchSuggestions();
    } catch (err) {
      if (err && typeof err === 'object' && 'message' in err) {
        message.error(String((err as { message: string }).message));
      }
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteSuggestion = async (index: number) => {
    try {
      await deleteXiaohongSuggestion(index);
      message.success('建议已删除');
      await fetchSuggestions();
    } catch {
      message.error('删除失败');
    }
  };

  // ── API status check ──
  const apiKeyConfigured = !!configValue(configs, 'model');
  const currentModel = configValue(configs, 'model', '/root/autodl-tmp/models/qwen3.5-35b-a3b-fp8');

  // ── Tab items ──

  const tabItems = [
    {
      key: 'model',
      label: (
        <span>
          <SettingOutlined /> 模型配置
        </span>
      ),
      children: (
        <ModelConfigTab
          configs={configs}
          saving={saving}
          onSave={handleConfigSave}
          loading={configsLoading}
        />
      ),
    },
    {
      key: 'prompt',
      label: (
        <span>
          <RobotOutlined /> 人设与提示词
        </span>
      ),
      children: (
        <PromptConfigTab
          configs={configs}
          saving={saving}
          onSave={handleConfigSave}
          loading={configsLoading}
        />
      ),
    },
    {
      key: 'suggestions',
      label: (
        <span>
          <BulbOutlined /> 推荐问题
        </span>
      ),
      children: (
        <SuggestionsTab
          suggestions={suggestions}
          loading={suggestionsLoading}
          onAdd={openCreateModal}
          onEdit={openEditModal}
          onDelete={handleDeleteSuggestion}
          onClickSuggestion={(text) => {
            setChatInput(text);
            message.info('已填入对话框');
          }}
        />
      ),
    },
    {
      key: 'test',
      label: (
        <span>
          <SendOutlined /> 对话测试
        </span>
      ),
      children: (
        <ChatTestTab
          messages={messages}
          chatInput={chatInput}
          sending={sending}
          onInputChange={setChatInput}
          onSend={handleSend}
          currentModel={currentModel}
        />
      ),
    },
    {
      key: 'stats',
      label: (
        <span>
          <BarChartOutlined /> 使用统计
        </span>
      ),
      children: <StatsTab />,
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Title level={4} style={{ color: '#D4A855', margin: 0 }}>
          <RobotOutlined style={{ marginRight: 8 }} />
          小鸿 AI 助手配置中心
        </Title>
        <Tag color={apiKeyConfigured ? 'green' : 'orange'} style={{ marginLeft: 'auto' }}>
          <ApiOutlined /> {apiKeyConfigured ? 'LLM 模式' : '规则引擎模式'}
        </Tag>
      </div>

      {!configsLoading && !configValue(configs, 'system_prompt') && (
        <Alert
          message="AI配置未初始化"
          description="请运行 pnpm db:seed 初始化AI配置数据"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Tabs items={tabItems} defaultActiveKey="model" />

      {/* Create / Edit Suggestion Modal */}
      <Modal
        title={editingIndex !== null ? '编辑建议' : '新增建议'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalSaving}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="text"
            label="建议文本"
            rules={[
              { required: true, message: '请输入建议文本' },
              { max: 200, message: '最多200字' },
            ]}
          >
            <Input placeholder="例如：推荐一个朝圣路线" />
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ max: 50, message: '最多50字' }]}
          >
            <Input placeholder="例如：路线推荐、知识问答、修行指导" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

// ═══════════════════════════════════════════════
//  Tab 1: 模型配置
// ══════════���════════════════════════════��═══════

function ModelConfigTab({
  configs,
  saving,
  onSave,
  loading,
}: {
  configs: AiConfig[];
  saving: string | null;
  onSave: (key: string, value: string) => Promise<void>;
  loading: boolean;
}) {
  const [model, setModel] = useState('');
  const [maxTokens, setMaxTokens] = useState('2048');
  const [temperature, setTemperature] = useState(0.7);
  const [contextWindow, setContextWindow] = useState('10');
  const [enableRag, setEnableRag] = useState(true);
  const [enableHistory, setEnableHistory] = useState(true);

  useEffect(() => {
    if (configs.length) {
      setModel(configValue(configs, 'model', '/root/autodl-tmp/models/qwen3.5-35b-a3b-fp8'));
      setMaxTokens(configValue(configs, 'max_tokens', '2048'));
      setTemperature(parseFloat(configValue(configs, 'temperature', '0.7')));
      setContextWindow(configValue(configs, 'context_window', '10'));
      setEnableRag(configValue(configs, 'enable_rag', 'true') === 'true');
      setEnableHistory(configValue(configs, 'enable_history', 'true') === 'true');
    }
  }, [configs]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin tip="加载配置..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>模型选择</Text>
            <Tooltip title="vLLM 服务器上的模型路径（OpenAI兼容格式）">
              <Select
                value={model}
                onChange={setModel}
                style={{ width: '100%', marginTop: 4 }}
                options={[
                  { value: '/root/autodl-tmp/models/qwen3.5-35b-a3b-fp8', label: 'Qwen3.5-35B-A3B-FP8 (当前部署，推荐)' },
                  { value: '/root/autodl-tmp/models/qwen3.5-122b-a10b-fp8', label: 'Qwen3.5-122B-A10B-FP8 (升级计划)' },
                ]}
              />
            </Tooltip>
            <Button
              type="primary"
              size="small"
              style={{ marginTop: 8 }}
              loading={saving === 'model'}
              onClick={() => onSave('model', model)}
            >
              保存
            </Button>
          </div>

          <div>
            <Text strong>温度: {temperature}</Text>
            <Paragraph style={{ color: '#888', fontSize: 12, margin: '2px 0 0' }}>
              0 = 确定性回答，1 = 更有创造性
            </Paragraph>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={temperature}
              onChange={setTemperature}
            />
            <Button
              type="primary"
              size="small"
              loading={saving === 'temperature'}
              onClick={() => onSave('temperature', String(temperature))}
            >
              ���存
            </Button>
          </div>

          <div>
            <Text strong>最大输出 Token</Text>
            <Input
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
              placeholder="2048"
              style={{ marginTop: 4 }}
            />
            <Button
              type="primary"
              size="small"
              style={{ marginTop: 8 }}
              loading={saving === 'max_tokens'}
              onClick={() => onSave('max_tokens', maxTokens)}
            >
              保存
            </Button>
          </div>

          <div>
            <Text strong>上下文轮数</Text>
            <Paragraph style={{ color: '#888', fontSize: 12, margin: '2px 0 0' }}>
              发送给AI的历史对话轮数（越多上下文越丰富，消耗更多token）
            </Paragraph>
            <Input
              value={contextWindow}
              onChange={(e) => setContextWindow(e.target.value)}
              placeholder="10"
              style={{ marginTop: 4 }}
            />
            <Button
              type="primary"
              size="small"
              style={{ marginTop: 8 }}
              loading={saving === 'context_window'}
              onClick={() => onSave('context_window', contextWindow)}
            >
              保存
            </Button>
          </div>

          <div style={{ display: 'flex', gap: 32 }}>
            <div>
              <Text strong>RAG 检索</Text>
              <br />
              <Switch
                checked={enableRag}
                onChange={(v) => {
                  setEnableRag(v);
                  onSave('enable_rag', String(v));
                }}
              />
              <Text style={{ marginLeft: 8, color: '#999' }}>
                {enableRag ? '自动检索数据库' : '已关闭'}
              </Text>
            </div>
            <div>
              <Text strong>对话历史</Text>
              <br />
              <Switch
                checked={enableHistory}
                onChange={(v) => {
                  setEnableHistory(v);
                  onSave('enable_history', String(v));
                }}
              />
              <Text style={{ marginLeft: 8, color: '#999' }}>
                {enableHistory ? '多轮对话' : '单轮模式'}
              </Text>
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
}

// ════���══════════════════════════════════════════
//  Tab 2: 人���与提示词
// ════════════���═══════════════════════════���══════

function PromptConfigTab({
  configs,
  saving,
  onSave,
  loading,
}: {
  configs: AiConfig[];
  saving: string | null;
  onSave: (key: string, value: string) => Promise<void>;
  loading: boolean;
}) {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [safetyPrompt, setSafetyPrompt] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    if (configs.length) {
      setSystemPrompt(configValue(configs, 'system_prompt', ''));
      setSafetyPrompt(configValue(configs, 'safety_prompt', ''));
      setWelcomeMessage(configValue(configs, 'welcome_message', ''));
    }
  }, [configs]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin tip="加载配置..." />
      </div>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Card
        size="small"
        title={
          <span>
            <RobotOutlined style={{ marginRight: 8, color: '#D4A855' }} />
            系统人设
          </span>
        }
        extra={
          <Text style={{ color: '#888', fontSize: 12 }}>
            决定小鸿的身份、风格和行为准则
          </Text>
        }
      >
        <TextArea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={12}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            loading={saving === 'system_prompt'}
            onClick={() => onSave('system_prompt', systemPrompt)}
          >
            ���存人设
          </Button>
          <Text style={{ color: '#666', fontSize: 12, lineHeight: '32px' }}>
            {systemPrompt.length} 字
          </Text>
        </div>
      </Card>

      <Card
        size="small"
        title={
          <span>
            <SafetyOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
            安全约束
          </span>
        }
        extra={
          <Text style={{ color: '#888', fontSize: 12 }}>
            附加在人设后的安全边界
          </Text>
        }
      >
        <TextArea
          value={safetyPrompt}
          onChange={(e) => setSafetyPrompt(e.target.value)}
          rows={6}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />
        <Button
          type="primary"
          style={{ marginTop: 8 }}
          loading={saving === 'safety_prompt'}
          onClick={() => onSave('safety_prompt', safetyPrompt)}
        >
          保��安全约束
        </Button>
      </Card>

      <Card size="small" title="欢迎语">
        <TextArea
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          rows={3}
        />
        <Button
          type="primary"
          style={{ marginTop: 8 }}
          loading={saving === 'welcome_message'}
          onClick={() => onSave('welcome_message', welcomeMessage)}
        >
          ���存欢迎语
        </Button>
      </Card>
    </Space>
  );
}

// ══════════════════���════════════════════���═══════
//  Tab 3: 推荐问题
// ════════════���══════════════════════════════════

function SuggestionsTab({
  suggestions,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onClickSuggestion,
}: {
  suggestions: XiaohongSuggestion[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (index: number, item: XiaohongSuggestion) => void;
  onDelete: (index: number) => void;
  onClickSuggestion: (text: string) => void;
}) {
  return (
    <Card
      title={
        <span>
          <BulbOutlined style={{ marginRight: 8, color: '#D4A855' }} />
          推荐问题列表
        </span>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="small"
          onClick={onAdd}
        >
          新增
        </Button>
      }
      style={{ maxWidth: 700 }}
    >
      <Paragraph style={{ color: '#999' }}>
        以下问题将作为用户的推荐提问，引导用户与小鸿互动。数据持久化在AI配置中心。
      </Paragraph>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin tip="加载中..." />
        </div>
      ) : suggestions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>
          暂无建议，点击「新增」添加
        </div>
      ) : (
        <List
          dataSource={suggestions}
          renderItem={(item, index) => (
            <List.Item
              style={{ borderBottom: '1px solid #1f1f1f' }}
              actions={[
                <Button
                  key="edit"
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(index, item)}
                />,
                <Popconfirm
                  key="delete"
                  title="确定删除该建议？"
                  onConfirm={() => onDelete(index)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>,
              ]}
            >
              <div
                style={{ cursor: 'pointer', flex: 1 }}
                onClick={() => onClickSuggestion(item.text)}
              >
                <Space>
                  <Tag color="gold">{item.category}</Tag>
                  <Text style={{ color: '#ccc' }}>{item.text}</Text>
                </Space>
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}

// ══════════��════════════════════════════���═══════
//  Tab 4: 对话测试
// ════════════════════════════════════════��══════

function ChatTestTab({
  messages,
  chatInput,
  sending,
  onInputChange,
  onSend,
  currentModel,
}: {
  messages: ChatMsg[];
  chatInput: string;
  sending: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  currentModel: string;
}) {
  return (
    <Card
      title={
        <span>
          对话测试
          <Tag style={{ marginLeft: 8 }} color="blue">
            {currentModel}
          </Tag>
        </span>
      }
      style={{ maxWidth: 700 }}
    >
      <div
        style={{
          height: 420,
          overflowY: 'auto',
          marginBottom: 16,
          padding: 12,
          background: '#0f0f0f',
          borderRadius: 8,
          border: '1px solid #1f1f1f',
        }}
      >
        {messages.length === 0 && (
          <div
            style={{ textAlign: 'center', paddingTop: 160, color: '#555' }}
          >
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
              justifyContent:
                msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: 12,
                background:
                  msg.role === 'user' ? '#D4A855' : '#1a1a1a',
                color: msg.role === 'user' ? '#000' : '#ccc',
                border:
                  msg.role === 'assistant'
                    ? '1px solid #2a2a2a'
                    : 'none',
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.content}
              {msg.intent && msg.role === 'assistant' && (
                <div style={{ marginTop: 6, fontSize: 11, color: '#666' }}>
                  意图: {msg.intent}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Space.Compact style={{ width: '100%' }}>
        <TextArea
          value={chatInput}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="输入消息测试小鸿..."
          autoSize={{ minRows: 1, maxRows: 3 }}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          style={{ flex: 1 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={onSend}
          loading={sending}
          style={{ height: 'auto' }}
        >
          发送
        </Button>
      </Space.Compact>
    </Card>
  );
}

// ═══��════════════════════���═══════════════════��══
//  Tab 5: 使用���计
// ═════════════════════════════════════════���═════

function StatsTab() {
  return (
    <div style={{ maxWidth: 700 }}>
      <Alert
        message="统计功能"
        description="对话统计数据将在使用Qwen大模型后自动生成。包括：每日对话数、Token消耗、热门意图分布等。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="今日对话数" value={0} prefix={<RobotOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="今日Token消耗" value={0} prefix={<BarChartOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="活跃用户" value={0} prefix={<BulbOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
