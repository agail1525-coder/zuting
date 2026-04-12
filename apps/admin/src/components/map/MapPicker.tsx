import { InputNumber, Space, Typography, Alert } from 'antd';

const { Text } = Typography;

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
}

// Leaflet 地图在 W2 再接入；目前提供经纬度直编 + OSM 跳转预览。
export default function MapPicker({ latitude, longitude, onChange }: MapPickerProps) {
  const hasCoord = typeof latitude === 'number' && typeof longitude === 'number';
  const preview = hasCoord
    ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`
    : null;

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space>
        <InputNumber
          value={latitude}
          onChange={(v) => onChange(Number(v ?? 0), longitude ?? 0)}
          placeholder="纬度 lat"
          step={0.0001}
          style={{ width: 180 }}
        />
        <InputNumber
          value={longitude}
          onChange={(v) => onChange(latitude ?? 0, Number(v ?? 0))}
          placeholder="经度 lng"
          step={0.0001}
          style={{ width: 180 }}
        />
      </Space>
      {preview ? (
        <Text>
          <a href={preview} target="_blank" rel="noreferrer">
            在 OpenStreetMap 预览
          </a>
        </Text>
      ) : (
        <Alert type="info" showIcon message="填写经纬度后可预览，W2 将升级为交互取点" />
      )}
    </Space>
  );
}
