import { useState } from 'react';
import {
  Card, Form, Input, Button, Space, Typography, Row, Col,
  InputNumber, Select, Alert, Statistic, message,
} from 'antd';
import { ThunderboltOutlined, ClearOutlined } from '@ant-design/icons';
import { aiPromptLabRun } from '../lib/m40';

const { Title, Paragraph, Text } = Typography;

const MODEL_OPTIONS = [
  { value: 'qwen-3.5-35b', label: 'Qwen3.5-35B (小鸿)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
];

export default function PromptLabPage() {
  const [form] = Form.useForm();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    output: string; latencyMs: number; tokensIn: number; tokensOut: number; traceId: string;
  } | null>(null);

  const run = async () => {
    try {
      const v = await form.validateFields();
      setRunning(true);
      setResult(null);
      const res = await aiPromptLabRun({
        prompt: v.prompt,
        model: v.model,
        temperature: v.temperature,
        maxTokens: v.maxTokens,
        systemPrompt: v.systemPrompt,
      });
      setResult(res);
      message.success(`运行完成 · ${res.latencyMs}ms`);
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(err instanceof Error ? err.message : '运行失败');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <Title level={4} style={{ color: '#D4A855' }}>Prompt 实验室</Title>
      <Paragraph type="secondary">实时测试 Prompt，所有调用落库 AiOperationTrace 审计。</Paragraph>

      <Row gutter={24}>
        <Col span={14}>
          <Card
            title="Prompt 配置"
            extra={
              <Space>
                <Button icon={<ClearOutlined />} onClick={() => { form.resetFields(); setResult(null); }}>清空</Button>
                <Button type="primary" icon={<ThunderboltOutlined />} loading={running} onClick={run}>运行</Button>
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{ model: 'qwen-3.5-35b', temperature: 0.7, maxTokens: 1024 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="model" label="模型" rules={[{ required: true }]}>
                    <Select options={MODEL_OPTIONS} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="temperature" label="Temperature">
                    <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="maxTokens" label="Max Tokens">
                    <InputNumber min={1} max={8192} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="systemPrompt" label="System Prompt (可选)">
                <Input.TextArea rows={3} placeholder="例如：你是文化旅行专家..." />
              </Form.Item>
              <Form.Item name="prompt" label="User Prompt" rules={[{ required: true }]}>
                <Input.TextArea rows={10} placeholder="输入测试 Prompt..." />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={10}>
          <Card title="运行结果" size="small" style={{ marginBottom: 16 }}>
            {!result && <Text type="secondary">尚未运行</Text>}
            {result && (
              <>
                <Row gutter={8} style={{ marginBottom: 12 }}>
                  <Col span={8}><Statistic title="延迟" value={result.latencyMs} suffix="ms" /></Col>
                  <Col span={8}><Statistic title="Tokens In" value={result.tokensIn} /></Col>
                  <Col span={8}><Statistic title="Tokens Out" value={result.tokensOut} /></Col>
                </Row>
                <Alert
                  type="info"
                  showIcon
                  message={<Text code>Trace: {result.traceId}</Text>}
                  style={{ marginBottom: 12 }}
                />
                <Card size="small" title="输出" bodyStyle={{ maxHeight: 480, overflow: 'auto' }}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{result.output}</Paragraph>
                </Card>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
