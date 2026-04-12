import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Avatar, Space, Breadcrumb, Button, Tag } from 'antd';
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
  SearchOutlined,
  ReadOutlined,
  CrownOutlined,
  DollarOutlined,
  TranslationOutlined,
  ShopOutlined,
  BarChartOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  PictureOutlined,
  AuditOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  HeartOutlined,
  ApartmentOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { logout, getCurrentUserRole } from '../lib/auth';
import { filterMenu } from '../lib/menuAcl';
import CommandPalette from '../components/command/CommandPalette';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },

  {
    key: 'grp-content',
    icon: <GlobalOutlined />,
    label: '内容中心',
    children: [
      { key: '/religions', icon: <GlobalOutlined />, label: '文化传统' },
      { key: '/holy-sites', icon: <EnvironmentOutlined />, label: '文化圣地' },
      { key: '/temples', icon: <BankOutlined />, label: '祖庭' },
      { key: '/patriarchs', icon: <UserOutlined />, label: '祖师' },
      { key: '/teachings', icon: <BookOutlined />, label: '祖训' },
      { key: '/seals', icon: <SafetyCertificateOutlined />, label: '三十印' },
      { key: '/media', icon: <PictureOutlined />, label: '媒体库' },
    ],
  },

  {
    key: 'grp-commerce',
    icon: <ShoppingCartOutlined />,
    label: '商业中心',
    children: [
      { key: '/routes', icon: <CarOutlined />, label: '路线' },
      { key: '/bookings', icon: <ShoppingCartOutlined />, label: '预订' },
      { key: '/trips', icon: <CarOutlined />, label: '行程' },
      { key: '/orders', icon: <ShoppingCartOutlined />, label: '订单' },
      { key: '/coupons', icon: <GiftOutlined />, label: '优惠券' },
      { key: '/promotions', icon: <GiftOutlined />, label: '促销' },
      { key: '/membership', icon: <CrownOutlined />, label: '会员' },
      { key: '/prices', icon: <DollarOutlined />, label: '价格' },
      { key: '/merchants', icon: <ShopOutlined />, label: '商家' },
    ],
  },

  {
    key: 'grp-community',
    icon: <ReadOutlined />,
    label: '社区中心',
    children: [
      { key: '/community', icon: <ReadOutlined />, label: '社区管理' },
      { key: '/journals', icon: <FileTextOutlined />, label: '文化日志' },
      { key: '/reviews', icon: <StarOutlined />, label: '评价' },
      { key: '/moderation', icon: <SafetyCertificateOutlined />, label: '内容审核' },
      { key: '/chat-monitor', icon: <MessageOutlined />, label: '聊天监控' },
    ],
  },

  {
    key: 'grp-cultivation',
    icon: <HeartOutlined />,
    label: '修行中心',
    children: [
      { key: '/cultivation', icon: <HeartOutlined />, label: '修行圈' },
      { key: '/team-culture', icon: <TeamOutlined />, label: '团队文化' },
      { key: '/themes', icon: <BookOutlined />, label: '主题包总览' },
    ],
  },

  {
    key: 'grp-ai',
    icon: <RobotOutlined />,
    label: 'AI 中枢',
    children: [
      { key: '/ai-config', icon: <RobotOutlined />, label: 'AI 助手配置' },
      { key: '/prompt-lab', icon: <ThunderboltOutlined />, label: 'Prompt 实验室' },
      { key: '/ai-traces', icon: <ThunderboltOutlined />, label: 'AI 操作追踪' },
      { key: '/ai-community-monitor', icon: <RobotOutlined />, label: 'AI 社区监控' },
    ],
  },

  {
    key: 'grp-growth',
    icon: <BarChartOutlined />,
    label: '增长中心',
    children: [
      { key: '/analytics', icon: <BarChartOutlined />, label: '数据分析' },
      { key: '/search-stats', icon: <SearchOutlined />, label: '搜索统计' },
      { key: '/i18n-share', icon: <TranslationOutlined />, label: '国际化&分享' },
      { key: '/recommendation', icon: <BarChartOutlined />, label: '推荐看板' },
      { key: '/share-poster', icon: <TranslationOutlined />, label: '分享&海报' },
      { key: '/notification-broadcast', icon: <MessageOutlined />, label: '通知广播' },
    ],
  },

  {
    key: 'grp-system',
    icon: <SettingOutlined />,
    label: '系统',
    children: [
      { key: '/users', icon: <TeamOutlined />, label: '用户' },
      { key: '/admin-roles', icon: <ApartmentOutlined />, label: '角色权限' },
      { key: '/audit', icon: <AuditOutlined />, label: '审计日志' },
      { key: '/system-health', icon: <DatabaseOutlined />, label: '系统健康' },
      { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
    ],
  },
];

const breadcrumbMap: Record<string, string> = {
  '/': '仪表盘',
  '/religions': '文化传统',
  '/holy-sites': '文化圣地',
  '/temples': '祖庭',
  '/patriarchs': '祖师',
  '/teachings': '祖训',
  '/seals': '三十印',
  '/media': '媒体库',
  '/routes': '路线',
  '/bookings': '预订',
  '/trips': '行程',
  '/orders': '订单',
  '/coupons': '优惠券',
  '/promotions': '促销',
  '/membership': '会员',
  '/prices': '价格',
  '/merchants': '商家',
  '/community': '社区管理',
  '/journals': '文化日志',
  '/reviews': '评价',
  '/moderation': '内容审核',
  '/chat-monitor': '聊天监控',
  '/cultivation': '修行圈',
  '/team-culture': '团队文化',
  '/ai-config': 'AI 助手配置',
  '/prompt-lab': 'Prompt 实验室',
  '/ai-traces': 'AI 操作追踪',
  '/ai-community-monitor': 'AI 社区监控',
  '/recommendation': '推荐看板',
  '/share-poster': '分享&海报',
  '/notification-broadcast': '通知广播',
  '/system-health': '系统健康',
  '/settings': '系统设置',
  '/themes': '主题包总览',
  '/analytics': '数据分析',
  '/search-stats': '搜索统计',
  '/i18n-share': '国际化&分享',
  '/users': '用户',
  '/admin-roles': '角色权限',
  '/audit': '审计日志',
};

export default function AdminCockpitLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={248}
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
              佳绩之旅 · 驾驶舱
            </Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={[
            'grp-content',
            'grp-commerce',
            'grp-community',
            'grp-cultivation',
            'grp-ai',
            'grp-growth',
            'grp-system',
          ]}
          items={filterMenu(menuItems, getCurrentUserRole())}
          onClick={({ key }) => {
            if (key.startsWith('/')) navigate(key);
          }}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 248, transition: 'margin-left 0.2s' }}>
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
                { title: '佳绩之旅' },
                { title: breadcrumbMap[location.pathname] || '仪表盘' },
              ]}
              style={{ margin: 0 }}
            />
          </Space>
          <Space>
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={() => setPaletteOpen(true)}
              style={{ color: '#D4A855' }}
            >
              命令台
              <Tag style={{ marginLeft: 8 }}>⌘K</Tag>
            </Button>
            <Tag style={{ margin: 0, background: 'transparent', color: '#64748b', borderColor: '#334155' }}
              title={`Build: ${__BUILD_TIME__}`}>
              v{__BUILD_SHA__}
            </Tag>
            <Tag color={getCurrentUserRole() === 'ADMIN' ? 'gold' : 'blue'} style={{ margin: 0 }}>
              {getCurrentUserRole() ?? 'GUEST'}
            </Tag>
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

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </Layout>
  );
}
