/** 用户角色 */
export type UserRole = 'PILGRIM' | 'GUIDE' | 'AMBASSADOR' | 'ADMIN';

/** 用户 */
export interface User {
  id: string;
  phone?: string;
  email?: string;
  nickname: string;
  avatar?: string;
  role: UserRole;
  language: string;
  createdAt: string;
}

/** 修行记录 */
export interface Practice {
  id: string;
  userId: string;
  sealId: number;
  date: string;
  duration?: number;   // 分钟
  note?: string;
}

/** 旅行状态 */
export type TripStatus = 'PLANNING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED';

/** 旅行计划 */
export interface Trip {
  id: string;
  userId: string;
  title: string;
  startDate?: string;
  endDate?: string;
  status: TripStatus;
  createdAt: string;
}

/** 社区帖子 */
export interface Post {
  id: string;
  userId: string;
  content: string;
  images: string[];
  siteTag?: string;
  likes: number;
  createdAt: string;
}
