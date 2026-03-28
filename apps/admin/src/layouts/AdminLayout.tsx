import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Avatar, Space, Breadcrumb } from 'antd';
import {
  DashboardOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  BankOutlined,
  UserOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  GiftOutlined,
  CarOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  StarOutlined,
  RobotOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { logout } from '../lib/auth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/religions', icon: <GlobalOutlined />, label: '信仰管理' },
  { key: '/holy-sites', icon: <EnvironmentOutlined />, label: '圣地管理' },
  { key: '/temples', icon: <BankOutlined />, label: '祖庭管理' },
  { key: '/patriarchs', icon: <UserOutlined />, label: '祖师管理' },
  { key: '/teachings', icon: <BookOutlined />, label: '祖训管理' },
  { key: '/seals', icon: <SafetyCertificateOutlined />, label: '三十印' },
  { type: 'divider' as const },
  { key: '/trips', icon: <CarOutlined />, label: '行程管理' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: '订单管理' },
  { key: '/coupons', icon: <GiftOutlined />, label: '优惠券管理' },
  { key: '/journals', icon: <FileTextOutlined />, label: '朝圣日记' },
  { key: '/reviews', icon: <StarOutlined />, label: '评价管理' },
  { key: '/users', icon: <TeamOutlined />, label: '用户管理' },
  { key: '/moderation', icon: <SafetyCertificateOutlined />, label: '内容审核' },
  { type: 'divider' as const },
  { key: '/ai-config', icon: <RobotOutlined />, label: 'AI助手配置' },
];

const breadcrumbMap: Record<string, string> = {
  '/': '仪表盘',
  '/religions': '信仰管理',
  '/holy-sites': '圣地管理',
  '/temples': '祖庭管理',
  '/patriarchs': '祖师管理',
  '/teachings': '祖训管理',
  '/seals': '三十印',
  '/trips': '行程管理',
  '/orders': '订单管理',
  '/coupons': '优惠券管理',
  '/journals': '朝圣日记',
  '/reviews': '评价管理',
  '/users': '用户管理',
  '/moderation': '内容审核',
  '/ai-config': 'AI助手配置',
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          borderRight: '1px solid #1f1f1f',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 20px',
            borderBottom: '1px solid #1f1f1f',
          }}
        >
          <span style={{ fontSize: 28 }}>🏛</span>
          {!collapsed && (
            <Text
              strong
              style={{
                color: '#D4A855',
                fontSize: 16,
                marginLeft: 10,
                whiteSpace: 'nowrap',
              }}
            >
              祖庭管理后台
            </Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1f1f1f',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Space>
            <span
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, cursor: 'pointer', color: '#D4A855' }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
            <Breadcrumb
              items={[
                { title: '首页' },
                { title: breadcrumbMap[location.pathname] || '仪表盘' },
              ]}
              style={{ margin: 0 }}
            />
          </Space>
          <Space>
            <Text style={{ color: '#999' }}>管理员</Text>
            <Avatar style={{ backgroundColor: '#D4A855' }} icon={<UserOutlined />} />
            <span
              onClick={logout}
              style={{ cursor: 'pointer', color: '#999', fontSize: 16, marginLeft: 8 }}
              title="退出登录"
            >
              <LogoutOutlined />
            </span>
          </Space>
        </Header>

        <Content style={{ margin: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
