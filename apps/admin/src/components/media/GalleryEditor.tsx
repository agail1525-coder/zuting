import { useState } from 'react';
import { Button, Input, Space, Typography, message } from 'antd';
import {
  PictureOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import MediaLibraryDialog from './MediaLibraryDialog';
import type { MediaAsset } from '../../lib/m40';

const { Text } = Typography;

export interface GalleryItem {
  url: string;
  caption?: string;
  sortOrder: number;
}

interface GalleryEditorProps {
  value?: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  max?: number;
}

export default function GalleryEditor({ value = [], onChange, max = 30 }: GalleryEditorProps) {
  const [open, setOpen] = useState(false);

  const addAsset = (asset: MediaAsset) => {
    if (value.length >= max) {
      message.warning(`最多 ${max} 张`);
      return;
    }
    onChange([
      ...value,
      { url: asset.url, caption: asset.altText || '', sortOrder: value.length },
    ]);
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx).map((it, i) => ({ ...it, sortOrder: i })));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const to = idx + dir;
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    [next[idx], next[to]] = [next[to], next[idx]];
    onChange(next.map((it, i) => ({ ...it, sortOrder: i })));
  };

  const updateCaption = (idx: number, caption: string) => {
    onChange(value.map((it, i) => (i === idx ? { ...it, caption } : it)));
  };

  return (
    <>
      <div
        style={{
          border: '1px dashed #333',
          borderRadius: 6,
          padding: 12,
          background: '#141414',
        }}
      >
        {value.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <PictureOutlined style={{ fontSize: 32, color: '#444' }} />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">画廊暂空</Text>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 12,
            }}
          >
            {value.map((item, idx) => (
              <div
                key={`${item.url}-${idx}`}
                style={{
                  border: '1px solid #333',
                  borderRadius: 6,
                  padding: 8,
                  background: '#0a0a0a',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    background: `#000 url(${item.url}) center/cover no-repeat`,
                    borderRadius: 4,
                    marginBottom: 6,
                  }}
                />
                <Input
                  size="small"
                  value={item.caption}
                  onChange={(e) => updateCaption(idx, e.target.value)}
                  placeholder="说明/alt"
                  style={{ marginBottom: 6 }}
                />
                <Space size={4}>
                  <Button
                    size="small"
                    icon={<ArrowUpOutlined />}
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                  />
                  <Button
                    size="small"
                    icon={<ArrowDownOutlined />}
                    onClick={() => move(idx, 1)}
                    disabled={idx === value.length - 1}
                  />
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(idx)}
                  />
                </Space>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            从媒体库添加 ({value.length}/{max})
          </Button>
        </div>
      </div>
      <MediaLibraryDialog
        open={open}
        onClose={() => setOpen(false)}
        onSelect={addAsset}
        allowTypes={['IMAGE']}
      />
    </>
  );
}
