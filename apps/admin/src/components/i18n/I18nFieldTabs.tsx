import { Tabs, Input, Button, Space, message } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useAdminAi } from '../../hooks/useAdminAi';
import type { SupportedLang } from '../../lib/m40';

const { TextArea } = Input;

export const LANGS: { value: SupportedLang; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'th', label: 'ไทย' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'ar', label: 'العربية' },
];

export type I18nValue = Partial<Record<SupportedLang, string>>;

interface I18nFieldTabsProps {
  value: I18nValue;
  onChange: (value: I18nValue) => void;
  rows?: number;
  placeholder?: string;
}

export default function I18nFieldTabs({
  value,
  onChange,
  rows = 4,
  placeholder = '请输入',
}: I18nFieldTabsProps) {
  const ai = useAdminAi();

  const update = (lang: SupportedLang, text: string) => {
    onChange({ ...value, [lang]: text });
  };

  const aiFill = async () => {
    const source = value.zh || value.en;
    if (!source) {
      message.warning('先填写中文或英文作为源语言');
      return;
    }
    const targets = LANGS.map((l) => l.value).filter((l) => l !== (value.zh ? 'zh' : 'en'));
    const r = await ai.translate(source, targets);
    if (r) {
      onChange({ ...value, ...r.results } as I18nValue);
      message.success('翻译已填入');
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'right', marginBottom: 8 }}>
        <Space>
          <Button
            size="small"
            icon={<ThunderboltOutlined />}
            loading={ai.state.loading}
            onClick={aiFill}
          >
            AI 一键翻译 6 语言
          </Button>
        </Space>
      </div>
      <Tabs
        items={LANGS.map((l) => ({
          key: l.value,
          label: l.label,
          children: (
            <TextArea
              rows={rows}
              value={value[l.value] ?? ''}
              onChange={(e) => update(l.value, e.target.value)}
              placeholder={placeholder}
              dir={l.value === 'ar' ? 'rtl' : 'ltr'}
            />
          ),
        }))}
      />
    </div>
  );
}
