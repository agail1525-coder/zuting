/**
 * Generate a unique order number: OD + base36 timestamp + random suffix
 * Example: OD2N5XKABC12
 */
export function generateOrderNo(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `OD${ts}${rand}`;
}

export { formatAmount } from './utils/currency';
