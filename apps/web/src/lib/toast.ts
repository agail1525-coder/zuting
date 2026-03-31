/**
 * Global toast notification system — event-emitter pattern.
 * No React context needed; works from any client component.
 *
 * Usage:
 *   import { toast } from "@/lib/toast";
 *   toast.success("保存成功");
 *   toast.error("操作失败");
 *   toast.info("提示信息");
 *   toast.warning("请注意");
 */

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastEvent {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

type Listener = (event: ToastEvent) => void;

const listeners: Set<Listener> = new Set();
let nextId = 1;

function emit(type: ToastType, message: string, duration = 3000): void {
  const event: ToastEvent = { id: nextId++, type, message, duration };
  listeners.forEach((fn) => fn(event));
}

export const toast = {
  success: (message: string, duration?: number) => emit("success", message, duration),
  error: (message: string, duration?: number) => emit("error", message, duration),
  info: (message: string, duration?: number) => emit("info", message, duration),
  warning: (message: string, duration?: number) => emit("warning", message, duration),
};

/** Subscribe to toast events. Returns unsubscribe function. */
export function onToast(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
