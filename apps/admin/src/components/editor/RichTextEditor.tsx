import { Input } from 'antd';

const { TextArea } = Input;

interface RichTextEditorProps {
  value?: string;
  onChange?: (v: string) => void;
  rows?: number;
  placeholder?: string;
}

// W1 基础实现：AntD TextArea。W2 再升级为 TipTap 富文本。
export default function RichTextEditor({
  value,
  onChange,
  rows = 8,
  placeholder,
}: RichTextEditorProps) {
  return (
    <TextArea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      style={{ fontFamily: 'inherit' }}
    />
  );
}
