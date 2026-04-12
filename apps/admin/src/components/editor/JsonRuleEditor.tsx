import { useState } from 'react';
import { Input, Alert, Button, Space } from 'antd';

const { TextArea } = Input;

interface JsonRuleEditorProps {
  value?: unknown;
  onChange?: (v: unknown) => void;
  rows?: number;
}

export default function JsonRuleEditor({ value, onChange, rows = 10 }: JsonRuleEditorProps) {
  const [text, setText] = useState<string>(() => JSON.stringify(value ?? {}, null, 2));
  const [error, setError] = useState<string | null>(null);

  const format = () => {
    try {
      const parsed = JSON.parse(text);
      const pretty = JSON.stringify(parsed, null, 2);
      setText(pretty);
      setError(null);
      onChange?.(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON 无效');
    }
  };

  const handleChange = (v: string) => {
    setText(v);
    try {
      const parsed = JSON.parse(v);
      setError(null);
      onChange?.(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON 无效');
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <TextArea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        rows={rows}
        style={{ fontFamily: 'monospace', fontSize: 12 }}
        placeholder='{"rule": "value"}'
      />
      {error && <Alert type="error" showIcon message={error} />}
      <Button size="small" onClick={format}>
        格式化
      </Button>
    </Space>
  );
}
