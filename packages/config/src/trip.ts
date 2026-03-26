// Trip status configuration - 12 state lifecycle
export const TRIP_STATUSES = {
  DRAFT: { label: '草稿', labelEn: 'Draft', color: '#64748B', icon: 'edit' },
  PLANNING: { label: '规划中', labelEn: 'Planning', color: '#3B82F6', icon: 'map' },
  SUBMITTED: { label: '已提交', labelEn: 'Submitted', color: '#8B5CF6', icon: 'send' },
  CONFIRMED: { label: '已确认', labelEn: 'Confirmed', color: '#10B981', icon: 'check' },
  PAID: { label: '已支付', labelEn: 'Paid', color: '#059669', icon: 'credit-card' },
  PREPARING: { label: '准备中', labelEn: 'Preparing', color: '#F59E0B', icon: 'package' },
  IN_PROGRESS: { label: '朝圣中', labelEn: 'In Progress', color: '#D4A855', icon: 'compass' },
  COMPLETED: { label: '已完成', labelEn: 'Completed', color: '#22C55E', icon: 'flag' },
  REVIEWING: { label: '评价中', labelEn: 'Reviewing', color: '#06B6D4', icon: 'star' },
  CANCELLED: { label: '已取消', labelEn: 'Cancelled', color: '#EF4444', icon: 'x' },
  REFUNDING: { label: '退款中', labelEn: 'Refunding', color: '#F97316', icon: 'rotate-ccw' },
  REFUNDED: { label: '已退款', labelEn: 'Refunded', color: '#78716C', icon: 'check-circle' },
} as const;

export type TripStatusKey = keyof typeof TRIP_STATUSES;

// Valid state transitions
export const TRIP_TRANSITIONS: Record<string, { to: TripStatusKey; event: string; label: string; labelEn: string }[]> = {
  DRAFT: [
    { to: 'PLANNING', event: 'start_planning', label: '开始规划', labelEn: 'Start Planning' },
  ],
  PLANNING: [
    { to: 'SUBMITTED', event: 'submit', label: '提交行程', labelEn: 'Submit' },
    { to: 'DRAFT', event: 'save_draft', label: '存为草稿', labelEn: 'Save Draft' },
  ],
  SUBMITTED: [
    { to: 'CONFIRMED', event: 'admin_confirm', label: '确认行程', labelEn: 'Confirm' },
    { to: 'CANCELLED', event: 'user_cancel', label: '取消', labelEn: 'Cancel' },
  ],
  CONFIRMED: [
    { to: 'PAID', event: 'payment_success', label: '支付成功', labelEn: 'Payment Success' },
    { to: 'CANCELLED', event: 'user_cancel', label: '取消', labelEn: 'Cancel' },
    { to: 'REFUNDING', event: 'request_refund', label: '申请退款', labelEn: 'Request Refund' },
  ],
  PAID: [
    { to: 'PREPARING', event: 'start_prepare', label: '开始准备', labelEn: 'Start Preparation' },
    { to: 'REFUNDING', event: 'request_refund', label: '申请退款', labelEn: 'Request Refund' },
  ],
  PREPARING: [
    { to: 'IN_PROGRESS', event: 'start_trip', label: '出发朝圣', labelEn: 'Start Pilgrimage' },
  ],
  IN_PROGRESS: [
    { to: 'COMPLETED', event: 'complete_trip', label: '完成朝圣', labelEn: 'Complete' },
  ],
  COMPLETED: [
    { to: 'REVIEWING', event: 'start_review', label: '写评价', labelEn: 'Write Review' },
  ],
  REVIEWING: [
    { to: 'COMPLETED', event: 'finish_review', label: '完成评价', labelEn: 'Finish Review' },
  ],
  CANCELLED: [
    { to: 'DRAFT', event: 'reopen', label: '重新规划', labelEn: 'Reopen' },
  ],
  REFUNDING: [
    { to: 'REFUNDED', event: 'refund_approved', label: '退款成功', labelEn: 'Refund Approved' },
    { to: 'PAID', event: 'refund_rejected', label: '退款被拒', labelEn: 'Refund Rejected' },
  ],
  REFUNDED: [],
};

// Order status
export const ORDER_STATUSES = {
  PENDING: { label: '待支付', labelEn: 'Pending', color: '#F59E0B' },
  PAID: { label: '已支付', labelEn: 'Paid', color: '#22C55E' },
  CANCELLED: { label: '已取消', labelEn: 'Cancelled', color: '#EF4444' },
  REFUNDING: { label: '退款中', labelEn: 'Refunding', color: '#F97316' },
  REFUNDED: { label: '已退款', labelEn: 'Refunded', color: '#78716C' },
} as const;
