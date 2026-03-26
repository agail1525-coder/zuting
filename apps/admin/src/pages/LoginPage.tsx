import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { login } from '../lib/auth';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      window.location.href = '/';
    } catch (err: any) {
      message.error(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
    }}>
      <Card style={{
        width: 400,
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 12,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ color: '#D4A855', marginBottom: 4 }}>
            祖庭管理后台
          </Title>
          <Text style={{ color: '#94a3b8' }}>Admin Dashboard Login</Text>
        </div>
        <Form onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: '请输入邮箱' }]}>
            <Input prefix={<MailOutlined />} placeholder="管理员邮箱" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block
              style={{ background: '#D4A855', borderColor: '#D4A855', height: 44 }}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
