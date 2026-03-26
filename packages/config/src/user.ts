// User roles
export const USER_ROLES = {
  PILGRIM: { label: '朝圣者', labelEn: 'Pilgrim', level: 0 },
  GUIDE: { label: '导游', labelEn: 'Guide', level: 1 },
  AMBASSADOR: { label: '和平使者', labelEn: 'Peace Ambassador', level: 2 },
  ADMIN: { label: '管理员', labelEn: 'Admin', level: 9 },
} as const;

// VIP levels (future)
export const VIP_LEVELS = [
  { level: 0, name: '初心者', nameEn: 'Beginner', minPoints: 0 },
  { level: 1, name: '求道者', nameEn: 'Seeker', minPoints: 100 },
  { level: 2, name: '行者', nameEn: 'Practitioner', minPoints: 500 },
  { level: 3, name: '觉者', nameEn: 'Awakened', minPoints: 2000 },
  { level: 4, name: '使者', nameEn: 'Ambassador', minPoints: 10000 },
] as const;
