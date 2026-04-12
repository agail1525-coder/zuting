import { Card, Typography, Descriptions, Tag, Space, Button, Alert, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  SettingOutlined, ApartmentOutlined, AuditOutlined, RobotOutlined,
  HeartOutlined, DatabaseOutlined, BookOutlined,
} from '@ant-design/icons';
import TwoFactorCard from '../components/settings/TwoFactorCard';

const { Title, Paragraph } = Typography;

export default function SettingsPage() {
  const navigate = useNavigate();

  const shortcuts = [
    { icon: <ApartmentOutlined />, label: '角色权限', path: '/admin-roles', desc: '管理员角色 CRUD + 权限分配' },
    { icon: <AuditOutlined />, label: '审计日志', path: '/audit', desc: '全后台写操作审计' },
    { icon: <RobotOutlined />, label: 'AI 助手配置', path: '/ai-config', desc: '小鸿 AI 参数与推荐问题' },
    { icon: <HeartOutlined />, label: '系统健康', path: '/system-health', desc: 'API / DB / Redis 健康状态' },
    { icon: <BookOutlined />, label: '主题包总览', path: '/themes', desc: '团队文化 / 个人圆满 / 家庭幸福' },
    { icon: <DatabaseOutlined />, label: '媒体库', path: '/media', desc: '统一媒体资产中枢' },
  ];

  return (
    <div>
      <Title level={4} style={{  }}><SettingOutlined /> 系统设置</Title>
      <Paragraph type="secondary">快速访问系统核心配置与运维入口。</Paragraph>

      <Alert
        style={{ marginBottom: 16 }}
        type="info"
        showIcon
        message="佳绩之旅 · JOINUS.COM 管理后台 M40"
        description="基于 Vite + React 19 + Ant Design 5 + Recharts，43 个 Admin 页，支持 Studio 深度编辑、AI 辅助、审计追踪。"
      />

      <div style={{ marginBottom: 16 }}><TwoFactorCard /></div>

      <Card title="系统信息" size="small" style={{ marginBottom: 16 }}>
        <Descriptions column={3} bordered size="small">
          <Descriptions.Item label="产品">佳绩之旅</Descriptions.Item>
          <Descriptions.Item label="域名">JOINUS.COM</Descriptions.Item>
          <Descriptions.Item label="版本"><Tag color="gold">M40 Cockpit</Tag></Descriptions.Item>
          <Descriptions.Item label="文化传统">12 大传统</Descriptions.Item>
          <Descriptions.Item label="文化圣地">300 个</Descriptions.Item>
          <Descriptions.Item label="语言">7 种 i18n</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="快捷入口">
        <Row gutter={[16, 16]}>
          {shortcuts.map((s) => (
            <Col key={s.path} span={8}>
              <Card
                size="small"
                hoverable
                onClick={() => navigate(s.path)}
                style={{ cursor: 'pointer' }}
              >
                <Space>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{s.label}</div>
                    <div style={{ color: '#888', fontSize: 12 }}>{s.desc}</div>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="开发者资源" size="small" style={{ marginTop: 16 }}>
        <Space direction="vertical">
          <div>API 文档: <Button type="link" size="small" onClick={() => window.open('/api/docs', '_blank')}>/api/docs (Swagger)</Button></div>
          <div>Web 前台: <Button type="link" size="small" onClick={() => window.open('/', '_blank')}>/</Button></div>
          <div>技术栈: NestJS 11 · Prisma 6 · PostgreSQL 16 · Redis 7 · Next.js 15 · Vite · Expo · Taro</div>
        </Space>
      </Card>
    </div>
  );
}
