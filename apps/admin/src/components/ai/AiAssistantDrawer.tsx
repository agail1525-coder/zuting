import { useState } from 'react';
import {
  Drawer,
  Tabs,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  Select,
  message,
} from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { useAdminAi } from '../../hooks/useAdminAi';
import type { SupportedLang } from '../../lib/m40';

const { TextArea } = Input;
const { Text } = Typography;

const LANGS: { value: SupportedLang; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'th', label: 'ไทย' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'ar', label: 'العربية' },
];

interface AiAssistantDrawerProps {
  open: boolean;
  onClose: () => void;
  resource: string;
  resourceId?: string;
  fieldName?: string;
  initialText?: string;
  onApplyText?: (text: string) => void;
  onApplyTranslations?: (map: Record<string, string>) => void;
}

export default function AiAssistantDrawer({
  open,
  onClose,
  resource,
  resourceId,
  fieldName = 'description',
  initialText = '',
  onApplyText,
  onApplyTranslations,
}: AiAssistantDrawerProps) {
  const ai = useAdminAi();
  const [genContext, setGenContext] = useState(initialText);
  const [genStyle, setGenStyle] = useState('禅意学术');
  const [genOutput, setGenOutput] = useState('');

  const [trText, setTrText] = useState(initialText);
  const [trTargets, setTrTargets] = useState<SupportedLang[]>(['en', 'ja']);
  const [trResults, setTrResults] = useState<Record<string, string>>({});

  const [seoOutput, setSeoOutput] = useState('');
  const [modText, setModText] = useState(initialText);
  const [modResult, setModResult] = useState<string>('');

  const handleGenerate = async () => {
    const r = await ai.generate({ resource, fieldName, context: genContext, style: genStyle });
    if (r) setGenOutput(r.output);
  };

  const handleTranslate = async () => {
    if (!trText.trim()) {
      message.warning('请输入原文');
      return;
    }
    const r = await ai.translate(trText, trTargets);
    if (r) setTrResults(r.results);
  };

  const handleSeo = async () => {
    if (!resourceId) {
      message.warning('详情页 ID 缺失');
      return;
    }
    const r = await ai.seo(resource, resourceId);
    if (r) setSeoOutput(r.output);
  };

  const handleModerate = async () => {
    const r = await ai.moderate(modText);
    if (r) setModResult(`${r.label} (score ${r.score}) · ${r.output}`);
  };

  return (
    <Drawer
      title={
        <Space>
          <RobotOutlined style={{ color: '#D4A855' }} />
          AI 助手 · {resource}
          {ai.state.lastTraceId && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              trace {ai.state.lastTraceId.slice(0, 8)}
            </Text>
          )}
        </Space>
      }
      open={open}
      onClose={onClose}
      width={480}
      destroyOnClose
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="所有 AI 输出需人工审核通过才入库（approved=false 不写业务表）"
      />

      <Tabs
        items={[
          {
            key: 'gen',
            label: '生成',
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <TextArea
                  rows={4}
                  value={genContext}
                  onChange={(e) => setGenContext(e.target.value)}
                  placeholder="提示/上下文..."
                />
                <Input
                  value={genStyle}
                  onChange={(e) => setGenStyle(e.target.value)}
                  addonBefore="风格"
                />
                <Button type="primary" loading={ai.state.loading} onClick={handleGenerate} block>
                  生成 {fieldName}
                </Button>
                {genOutput && (
                  <>
                    <TextArea rows={6} value={genOutput} readOnly />
                    {onApplyText && (
                      <Button onClick={() => onApplyText(genOutput)} block>
                        应用到字段
                      </Button>
                    )}
                  </>
                )}
              </Space>
            ),
          },
          {
            key: 'translate',
            label: '翻译',
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <TextArea
                  rows={4}
                  value={trText}
                  onChange={(e) => setTrText(e.target.value)}
                  placeholder="待译原文"
                />
                <Select<SupportedLang[]>
                  mode="multiple"
                  value={trTargets}
                  onChange={setTrTargets}
                  options={LANGS}
                  style={{ width: '100%' }}
                  placeholder="目标语言"
                />
                <Button type="primary" loading={ai.state.loading} onClick={handleTranslate} block>
                  批量翻译
                </Button>
                {Object.keys(trResults).length > 0 && (
                  <>
                    {Object.entries(trResults).map(([lang, text]) => (
                      <div key={lang}>
                        <Text type="secondary">{lang}</Text>
                        <TextArea rows={3} value={text} readOnly />
                      </div>
                    ))}
                    {onApplyTranslations && (
                      <Button onClick={() => onApplyTranslations(trResults)} block>
                        应用到多语言字段
                      </Button>
                    )}
                  </>
                )}
              </Space>
            ),
          },
          {
            key: 'seo',
            label: 'SEO',
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Text type="secondary">为 {resource}:{resourceId ?? '(未保存)'} 生成 SEO meta</Text>
                <Button type="primary" loading={ai.state.loading} onClick={handleSeo} block>
                  生成 SEO meta
                </Button>
                {seoOutput && <TextArea rows={8} value={seoOutput} readOnly />}
              </Space>
            ),
          },
          {
            key: 'moderate',
            label: '审核',
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <TextArea
                  rows={4}
                  value={modText}
                  onChange={(e) => setModText(e.target.value)}
                  placeholder="待审核内容"
                />
                <Button type="primary" loading={ai.state.loading} onClick={handleModerate} block>
                  AI 审核
                </Button>
                {modResult && <Alert type="info" message={modResult} />}
              </Space>
            ),
          },
        ]}
      />
    </Drawer>
  );
}
