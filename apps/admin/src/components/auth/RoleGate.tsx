import type { ReactNode } from 'react';
import { Alert } from 'antd';
import { getCurrentUserRole } from '../../lib/auth';

interface RoleGateProps {
  allow?: string[];
  permission?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function RoleGate({ allow, children, fallback }: RoleGateProps) {
  const role = getCurrentUserRole();
  if (allow && allow.length > 0 && (!role || !allow.includes(role))) {
    return (
      <>
        {fallback ?? (
          <Alert
            type="warning"
            showIcon
            message="权限不足"
            description={`需要角色：${allow.join(' / ')}`}
          />
        )}
      </>
    );
  }
  return <>{children}</>;
}
