import { useState } from 'react';
import { Card, Button, Input, Space, Typography, Modal, message, Tag, Alert } from 'antd';
import { SafetyOutlined, LockOutlined } from '@ant-design/icons';
import { setup2FA, verify2FA, disable2FA } from '../../lib/m40';

const { Text, Paragraph } = Typography;

export default function TwoFactorCard() {
  const [setupData, setSetupData] = useState<{ secret: string; otpauthUri: string } | null>(null);
  const [code, setCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState<boolean | null>(null);

  const doSetup = async () => {
    setLoading(true);
    try {
      const r = await setup2FA();
      setSetupData({ secret: r.secret, otpauthUri: r.otpauthUri });
    } catch (e) {
      message.error(e instanceof Error ? e.message : '初始化失败');
    } finally { setLoading(false); }
  };

  const doVerify = async () => {
    if (code.length !== 6) { message.warning('请输入6位验证码'); return; }
    setLoading(true);
    try {
      await verify2FA(code);
      message.success('2FA 激活成功');
      setEnabled(true);
      setSetupData(null);
      setCode('');
    } catch (e) {
      message.error(e instanceof Error ? e.message : '验证失败');
    } finally { setLoading(false); }
  };

  const doDisable = () => {
    Modal.confirm({
      title: '关闭 2FA?',
      content: (
        <Space direction="vertical">
          <Text>请输入当前 2FA 验证码以确认关闭:</Text>
          <Input placeholder="6位验证码" maxLength={6} onChange={(e) => setDisableCode(e.target.value)} />
        </Space>
      ),
      onOk: async () => {
        if (disableCode.length !== 6) { message.warning('请输入6位验证码'); throw new Error('invalid'); }
        await disable2FA(disableCode);
        message.success('2FA 已关闭');
        setEnabled(false);
        setDisableCode('');
      },
    });
  };

  return (
    <Card
      title={<Space><SafetyOutlined /> 双因素认证 (2FA){enabled === true && <Tag color="green">已启用</Tag>}</Space>}
      size="small"
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="使用 Google Authenticator / Authy / 1Password 扫描二维码,每次登录输入 6 位动态验证码"
      />

      {!setupData && (
        <Space>
          <Button type="primary" icon={<LockOutlined />} loading={loading} onClick={doSetup}>
            开始绑定 / 重置 2FA
          </Button>
          <Button danger onClick={doDisable}>关闭 2FA</Button>
        </Space>
      )}

      {setupData && (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Paragraph>
            <Text strong>Secret (备份): </Text>
            <Text code copyable>{setupData.secret}</Text>
          </Paragraph>
          <Paragraph>
            <Text strong>otpauth URI (粘贴到 1Password / 手动添加): </Text>
            <Text code copyable style={{ wordBreak: 'break-all' }}>{setupData.otpauthUri}</Text>
          </Paragraph>
          <Paragraph type="secondary" style={{ fontSize: 12 }}>
            扫描后,输入 App 显示的 6 位验证码:
          </Paragraph>
          <Space>
            <Input placeholder="6位验证码" maxLength={6} value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onPressEnter={doVerify} style={{ width: 160 }} />
            <Button type="primary" onClick={doVerify} loading={loading}>激活</Button>
            <Button onClick={() => setSetupData(null)}>取消</Button>
          </Space>
        </Space>
      )}
    </Card>
  );
}
