import { Result, Button, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUserRole, logout } from '../lib/auth';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const role = getCurrentUserRole();
  return (
    <Result
      status="403"
      title="403 · 无权访问"
      subTitle={`当前角色 ${role ?? 'GUEST'} 无权访问该页面。如需开通权限，请联系超级管理员。`}
      extra={
        <Space>
          <Button type="primary" onClick={() => navigate('/')}>返回仪表盘</Button>
          <Link to="/login">
            <Button onClick={logout}>切换账户</Button>
          </Link>
        </Space>
      }
    />
  );
}
