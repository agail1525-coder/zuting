// M40 资源:动作 权限清单
export const ADMIN_RESOURCES = [
  'religion',
  'holy-site',
  'temple',
  'patriarch',
  'teaching',
  'seal',
  'scripture',
  'route',
  'package',
  'booking',
  'trip',
  'order',
  'payment',
  'coupon',
  'promotion',
  'price',
  'membership',
  'referral',
  'points-mall',
  'merchant',
  'review',
  'community',
  'guide',
  'question',
  'journal',
  'collection',
  'moderation',
  'search',
  'recommendation',
  'notification',
  'share',
  'chat',
  'media',
  'ai-config',
  'xiaohong',
  'ai-community',
  'ai',
  'faith-assessment',
  'personal-growth',
  'family-harmony',
  'team-culture',
  'cultivation',
  'analytics',
  'user',
  'role',
  'audit',
] as const;

export const ADMIN_ACTIONS = ['read', 'create', 'update', 'delete', 'publish', 'moderate'] as const;

export type AdminResource = (typeof ADMIN_RESOURCES)[number];
export type AdminActionKind = (typeof ADMIN_ACTIONS)[number];

export function buildAllPermissions(): string[] {
  const result: string[] = [];
  for (const r of ADMIN_RESOURCES) {
    for (const a of ADMIN_ACTIONS) {
      result.push(`${r}:${a}`);
    }
  }
  return result;
}

export const SYSTEM_ROLES = [
  { name: 'SUPER_ADMIN', description: '超级管理员', permissions: ['*'] },
  {
    name: 'CONTENT_ADMIN',
    description: '内容运营',
    permissions: [
      'religion:*',
      'holy-site:*',
      'temple:*',
      'patriarch:*',
      'teaching:*',
      'seal:*',
      'scripture:*',
      'media:*',
      'route:read',
      'route:update',
    ],
  },
  {
    name: 'OPS_ADMIN',
    description: '运营管理',
    permissions: [
      'route:*',
      'package:*',
      'coupon:*',
      'promotion:*',
      'membership:*',
      'price:*',
      'points-mall:*',
    ],
  },
  {
    name: 'FINANCE_ADMIN',
    description: '财务',
    permissions: ['order:*', 'payment:*', 'referral:*'],
  },
  {
    name: 'MODERATOR',
    description: '审核员',
    permissions: ['review:*', 'moderation:*', 'community:moderate', 'guide:moderate', 'question:moderate'],
  },
  {
    name: 'VIEWER',
    description: '只读',
    permissions: ADMIN_RESOURCES.map((r) => `${r}:read`),
  },
];
