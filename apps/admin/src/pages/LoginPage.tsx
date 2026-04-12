import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Checkbox, Space, Modal } from 'antd';
import { LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { login, OtpRequiredError, getRememberedEmail, setRememberedEmail } from '../lib/auth';

const { Title, Text, Link: AntLink } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);

  const onFinish = async (values: { identifier: string; password: string; otpCode?: string; remember?: boolean }) => {
    setLoading(true);
    try {
      await login(values.identifier, values.password, values.otpCode);
      setRememberedEmail(values.remember ? values.identifier : null);
      window.location.href = import.meta.env.PROD ? '/admin/' : '/';
    } catch (err: unknown) {
      if (err instanceof OtpRequiredError) {
        setOtpRequired(true);
        message.info('请输入双因素验证码 / Enter 2FA code');
      } else {
        message.error(err instanceof Error ? err.message : '登录失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = () => {
    Modal.info({
      title: '忘记密码',
      content: (
        <div>
          <p>请联系超级管理员重置密码，或使用已绑定邮箱通过以下邮件申请:</p>
          <Text copyable code>ops@joinus.com</Text>
          <p style={{ marginTop: 12, color: '#999', fontSize: 12 }}>
            自助重置功能开发中（预计 M41 上线）
          </p>
        </div>
      ),
    });
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
        width: 420,
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 12,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            佳绩之旅 · 驾驶舱
          </Title>
          <Text style={{ color: '#94a3b8' }}>Admin Cockpit Login</Text>
        </div>
        <Form
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={{ identifier: getRememberedEmail() ?? '', remember: !!getRememberedEmail() }}
        >
          <Form.Item
            name="identifier"
            rules={[{
              required: true,
              validator: (_, v: string) => {
                if (!v) return Promise.reject(new Error('请输入邮箱或手机号'));
                const s = v.trim();
                if (/^1\d{10}$/.test(s)) return Promise.resolve();
                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return Promise.resolve();
                return Promise.reject(new Error('请输入有效的邮箱或11位手机号'));
              },
            }]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱 或 11位手机号" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" autoComplete="current-password" />
          </Form.Item>
          {otpRequired && (
            <Form.Item
              name="otpCode"
              rules={[{ required: true, len: 6, message: '6位验证码' }]}
              extra={<Text style={{ color: '#94a3b8', fontSize: 12 }}>从 Authenticator App 获取 / from your 2FA app</Text>}
            >
              <Input prefix={<SafetyOutlined />} placeholder="双因素验证码 (6位)" maxLength={6} autoFocus />
            </Form.Item>
          )}
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox style={{ color: '#94a3b8' }}>记住邮箱</Checkbox>
              </Form.Item>
              <AntLink onClick={forgotPassword} style={{  }}>忘记密码?</AntLink>
            </Space>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block
              style={{ background: '#D4A855', borderColor: '#D4A855', height: 44 }}>
              {otpRequired ? '验证并登录' : '登录'}
            </Button>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Text style={{ color: '#64748b', fontSize: 12 }}>
            仅授权管理员可访问 · Authorized admins only
          </Text>
        </div>
      </Card>
    </div>
  );
}
