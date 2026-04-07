/**
 * TeamInquiry 状态机
 * NEW → CONTACTED → QUOTED → SIGNED → DELIVERED → CLOSED
 *  └──► LOST  (from NEW/CONTACTED/QUOTED)
 * 终态：CLOSED, LOST
 */
export type TeamInquiryStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUOTED'
  | 'SIGNED'
  | 'DELIVERED'
  | 'CLOSED'
  | 'LOST';

export const ALLOWED_INQUIRY_TRANSITIONS: Record<TeamInquiryStatus, TeamInquiryStatus[]> = {
  NEW: ['CONTACTED', 'LOST'],
  CONTACTED: ['QUOTED', 'LOST'],
  QUOTED: ['SIGNED', 'LOST'],
  SIGNED: ['DELIVERED'],
  DELIVERED: ['CLOSED'],
  CLOSED: [],
  LOST: [],
};

export function canTransition(from: TeamInquiryStatus, to: TeamInquiryStatus): boolean {
  return ALLOWED_INQUIRY_TRANSITIONS[from].includes(to);
}
