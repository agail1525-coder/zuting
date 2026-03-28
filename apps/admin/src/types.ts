/** Admin CRUD 页面接口定义 — 与 Prisma Schema 对齐 */

/** 通用分页响应 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/** 删除操作响应 */
export interface DeleteResponse {
  message: string;
}

/** 上传文件记录 */
export interface Upload {
  id: string;
  filename: string;
  url: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
}

/** 小鸿AI聊天响应 */
export interface XiaohongChatResponse {
  reply?: string;
  message?: string;
  content?: string;
}

/** 创建印DTO */
export interface CreateSealDto {
  name: string;
  nameEn?: string;
  order?: number;
  series: string;
  description?: string;
  verse?: string;
  poem: string;
  essence: string;
  practice: string;
  vow: string;
  color?: string;
}

/** 通知发送响应 */
export interface NotificationSendResponse {
  message: string;
  count: number;
}

export interface Religion {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  symbol?: string;
  color?: string;
  description?: string;
}

export interface HolySite {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  latitude: number;
  longitude: number;
  utcOffset: number;
  description: string;
  imageUrl?: string;
  soundEffect?: string;
  religionId: string;
}

export interface Temple {
  id: string;
  name: string;
  nameEn?: string;
  country: string;
  address?: string;
  foundingDate?: string;
  description: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  religionId: string;
}

export interface Patriarch {
  id: string;
  name: string;
  nameEn?: string;
  dates?: string;
  title?: string;
  biography: string;
  coreTeaching: string;
  imageUrl?: string;
  religionId: string;
}

export interface Teaching {
  id: string;
  name: string;
  originalText: string;
  sourceText?: string;
  translationCn?: string;
  religionId: string;
  language?: string;
}

export interface Seal {
  id: number;
  name: string;
  nameEn?: string;
  order?: number;
  series: string;
  description?: string;
  verse?: string;
  poem: string;
  essence: string;
  practice: string;
  vow: string;
  color?: string;
}

export interface Journal {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  status?: string;
  location?: string;
  author?: string;
  userId: string;
  tripId?: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string };
}

export interface Order {
  id: string;
  orderNo?: string;
  userId: string;
  tripId: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  paidAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt?: string;
  userName?: string;
  tripTitle?: string;
  user?: { id: string; name: string };
  trip?: { id: string; title: string };
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  type: string;
  value: number;
  minAmount: number | null;
  maxDiscount: number | null;
  totalCount: number;
  usedCount: number;
  isActive: boolean;
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
  _count?: { usages: number };
}

export interface CreateCouponDto {
  code: string;
  name: string;
  type: string;
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  totalCount: number;
  startAt: string;
  endAt: string;
}

export interface Review {
  id: string;
  userId: string;
  targetType: string;
  targetId: string;
  rating: number;
  content?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  user?: { id: string; nickname: string; avatar?: string };
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  description?: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  reporter?: { id: string; nickname: string; avatar?: string };
  reviewer?: { id: string; nickname: string; avatar?: string };
}

export interface ReportStats {
  total: number;
  byStatus: Record<string, number>;
  byReason: Record<string, number>;
}

export interface User {
  id: string;
  nickname: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { trips: number; orders: number; journals: number };
}

export interface AdminRoute {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  subtitle: string;
  category: string;
  difficulty: string;
  status: string;
  duration: number;
  nights: number;
  season: string;
  groupSize: string;
  priceFrom: number;
  coverImage: string | null;
  highlights: string[];
  description: string;
  rating: number | null;
  reviewCount: number;
  bookCount: number;
  religionId: string | null;
  createdAt: string;
  religion?: { id: string; name: string };
}

export interface AdminBooking {
  id: string;
  routeId: string;
  userId: string;
  startDate: string;
  persons: number;
  totalPrice: number;
  status: string;
  contactName: string | null;
  contactPhone: string | null;
  note: string | null;
  createdAt: string;
  route?: { id: string; title: string };
  user?: { id: string; nickname: string };
}

export interface Trip {
  id: string;
  title: string;
  destination?: string;
  status: string;
  userId: string;
  startDate?: string;
  endDate?: string;
  participants?: number;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  user?: { id: string; name: string };
  sites?: Array<{ id: string; name: string }>;
}
