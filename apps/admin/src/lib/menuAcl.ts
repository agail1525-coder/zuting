import type { AdminRole } from './auth';

export const MENU_ROLE_MAP: Record<string, AdminRole[]> = {
  '/': ['ADMIN', 'GUIDE'],

  'grp-content': ['ADMIN', 'GUIDE'],
  '/religions': ['ADMIN'],
  '/holy-sites': ['ADMIN', 'GUIDE'],
  '/temples': ['ADMIN', 'GUIDE'],
  '/patriarchs': ['ADMIN', 'GUIDE'],
  '/teachings': ['ADMIN', 'GUIDE'],
  '/seals': ['ADMIN'],
  '/media': ['ADMIN', 'GUIDE'],

  'grp-commerce': ['ADMIN'],
  '/routes': ['ADMIN'],
  '/bookings': ['ADMIN'],
  '/trips': ['ADMIN', 'GUIDE'],
  '/orders': ['ADMIN'],
  '/coupons': ['ADMIN'],
  '/promotions': ['ADMIN'],
  '/membership': ['ADMIN'],
  '/prices': ['ADMIN'],
  '/merchants': ['ADMIN'],

  'grp-community': ['ADMIN', 'GUIDE'],
  '/community': ['ADMIN', 'GUIDE'],
  '/journals': ['ADMIN', 'GUIDE'],
  '/reviews': ['ADMIN', 'GUIDE'],
  '/moderation': ['ADMIN'],
  '/chat-monitor': ['ADMIN'],

  'grp-cultivation': ['ADMIN', 'GUIDE'],
  '/cultivation': ['ADMIN', 'GUIDE'],
  '/team-culture': ['ADMIN'],
  '/themes': ['ADMIN', 'GUIDE'],

  'grp-ai': ['ADMIN'],
  '/ai-config': ['ADMIN'],
  '/prompt-lab': ['ADMIN'],
  '/ai-traces': ['ADMIN'],
  '/ai-community-monitor': ['ADMIN'],

  'grp-growth': ['ADMIN'],
  '/analytics': ['ADMIN'],
  '/search-stats': ['ADMIN'],
  '/i18n-share': ['ADMIN'],
  '/recommendation': ['ADMIN'],
  '/share-poster': ['ADMIN'],
  '/notification-broadcast': ['ADMIN'],

  'grp-system': ['ADMIN'],
  '/users': ['ADMIN'],
  '/admin-roles': ['ADMIN'],
  '/audit': ['ADMIN'],
  '/system-health': ['ADMIN'],
  '/settings': ['ADMIN'],
};

export function canAccess(key: string, role: AdminRole | null): boolean {
  if (!role) return false;
  const allowed = MENU_ROLE_MAP[key];
  if (!allowed) return true;
  return allowed.includes(role);
}

interface MenuLike {
  key: string;
  children?: MenuLike[];
  [k: string]: unknown;
}

export function filterMenu<T extends MenuLike>(items: T[], role: AdminRole | null): T[] {
  return items
    .map((it) => {
      if (it.children) {
        const kids = filterMenu(it.children, role);
        if (kids.length === 0) return null;
        return { ...it, children: kids } as T;
      }
      return canAccess(it.key, role) ? it : null;
    })
    .filter((x): x is T => x !== null);
}
