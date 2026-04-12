import { useState } from 'react';
import { Button, Input, Space } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import MediaLibraryDialog from './MediaLibraryDialog';
import type { MediaAsset, MediaType } from '../../lib/m40';

interface MediaPickerProps {
  value?: string;
  onChange?: (url: string) => void;
  allowTypes?: MediaType[];
  placeholder?: string;
}

export default function MediaPicker({
  value,
  onChange = () => {},
  allowTypes = ['IMAGE'],
  placeholder = '选择媒体或输入 URL',
}: MediaPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          prefix={
            value ? (
              <img
                src={value}
                alt=""
                style={{ width: 20, height: 20, objectFit: 'cover', borderRadius: 2 }}
              />
            ) : null
          }
        />
        <Button icon={<PictureOutlined />} onClick={() => setOpen(true)}>
          媒体库
        </Button>
      </Space.Compact>
      <MediaLibraryDialog
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(a: MediaAsset) => onChange(a.url)}
        allowTypes={allowTypes}
      />
    </>
  );
}
