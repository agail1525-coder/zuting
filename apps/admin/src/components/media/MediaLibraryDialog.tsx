import { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  Input,
  Select,
  Space,
  Button,
  Empty,
  Spin,
  Tag,
  Typography,
  Tabs,
  message,
} from 'antd';
import { PictureOutlined, ThunderboltOutlined } from '@ant-design/icons';
import {
  listMedia,
  aiGenerateImage,
  createMediaAsset,
  type MediaAsset,
  type MediaType,
} from '../../lib/m40';

const { Text } = Typography;

interface MediaLibraryDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  allowTypes?: MediaType[];
  multiple?: boolean;
}

export default function MediaLibraryDialog({
  open,
  onClose,
  onSelect,
  allowTypes = ['IMAGE'],
  multiple = false,
}: MediaLibraryDialogProps) {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [type, setType] = useState<MediaType>(allowTypes[0]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listMedia({ type, q, pageSize: 60 });
      setItems(res.items);
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [type, q]);

  useEffect(() => {
    if (open) fetchList();
  }, [open, fetchList]);

  const handlePick = (asset: MediaAsset) => {
    if (multiple) {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(asset.id)) next.delete(asset.id);
        else next.add(asset.id);
        return next;
      });
    } else {
      onSelect(asset);
      onClose();
    }
  };

  const confirmMulti = () => {
    const picked = items.filter((a) => selected.has(a.id));
    picked.forEach((p) => onSelect(p));
    onClose();
  };

  const handleAiGen = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const asset = await aiGenerateImage({ prompt: aiPrompt });
      message.success('AI 生成成功');
      setItems((prev) => [asset, ...prev]);
      setAiPrompt('');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'AI 生成失败');
    } finally {
      setAiLoading(false);
    }
  };

  const handleUrlAdd = async () => {
    if (!urlInput.trim()) return;
    try {
      const asset = await createMediaAsset({ url: urlInput.trim(), type });
      message.success('已登记');
      setItems((prev) => [asset, ...prev]);
      setUrlInput('');
    } catch (err) {
      message.error(err instanceof Error ? err.message : '登记失败');
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Space>
          <PictureOutlined style={{ color: '#D4A855' }} />
          媒体库
        </Space>
      }
      width={960}
      footer={
        multiple ? (
          <Space>
            <Text type="secondary">{selected.size} 项已选</Text>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" disabled={selected.size === 0} onClick={confirmMulti}>
              确认
            </Button>
          </Space>
        ) : null
      }
      destroyOnClose
    >
      <Tabs
        items={[
          {
            key: 'browse',
            label: '浏览',
            children: (
              <>
                <Space style={{ marginBottom: 12 }} wrap>
                  <Select<MediaType>
                    value={type}
                    onChange={setType}
                    options={allowTypes.map((t) => ({ value: t, label: t }))}
                    style={{ width: 140 }}
                  />
                  <Input.Search
                    placeholder="搜索 alt/描述"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onSearch={fetchList}
                    style={{ width: 280 }}
                  />
                  <Button onClick={fetchList}>刷新</Button>
                </Space>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spin />
                  </div>
                ) : items.length === 0 ? (
                  <Empty description="暂无媒体资产" />
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                      gap: 12,
                      maxHeight: 480,
                      overflowY: 'auto',
                    }}
                  >
                    {items.map((a) => {
                      const isSel = selected.has(a.id);
                      return (
                        <div
                          key={a.id}
                          onClick={() => handlePick(a)}
                          style={{
                            border: `2px solid ${isSel ? '#D4A855' : '#1f1f1f'}`,
                            borderRadius: 6,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            background: '#141414',
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              aspectRatio: '1',
                              background: `#000 url(${a.url}) center/cover no-repeat`,
                            }}
                          />
                          <div style={{ padding: 6 }}>
                            <Text
                              ellipsis
                              style={{ fontSize: 12, color: '#ccc', display: 'block' }}
                            >
                              {a.altText || a.url.split('/').pop()}
                            </Text>
                            {a.aiGenerated && <Tag color="gold">AI</Tag>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ),
          },
          {
            key: 'url',
            label: '链接登记',
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="https://..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <Button type="primary" onClick={handleUrlAdd} block>
                  登记到媒体库
                </Button>
              </Space>
            ),
          },
          {
            key: 'ai',
            label: (
              <Space>
                <ThunderboltOutlined />
                AI 文生图
              </Space>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Input.TextArea
                  rows={4}
                  placeholder="描述想要的图：如『禅意水墨，广州六榕寺秋景』"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <Button
                  type="primary"
                  loading={aiLoading}
                  onClick={handleAiGen}
                  icon={<ThunderboltOutlined />}
                  block
                >
                  AI 生成
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </Modal>
  );
}
