import { useEffect, useRef } from 'react';
import type { FormInstance } from 'antd';
import { message } from 'antd';

const PREFIX = 'admin-draft:';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface Options {
  form: FormInstance;
  key: string;
  enabled?: boolean;
  intervalMs?: number;
}

export function useDraftAutosave({ form, key, enabled = true, intervalMs = 30_000 }: Options) {
  const storageKey = PREFIX + key;
  const restored = useRef(false);

  useEffect(() => {
    if (!enabled || restored.current) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { savedAt: number; values: Record<string, unknown> };
      if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
        localStorage.removeItem(storageKey);
        return;
      }
      form.setFieldsValue(parsed.values);
      restored.current = true;
      message.info(`已恢复 ${Math.round((Date.now() - parsed.savedAt) / 60000)} 分钟前的本地草稿`);
    } catch {
      /* ignore */
    }
  }, [enabled, storageKey, form]);

  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => {
      try {
        const values = form.getFieldsValue(true);
        localStorage.setItem(storageKey, JSON.stringify({ savedAt: Date.now(), values }));
      } catch {
        /* ignore quota errors */
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [enabled, storageKey, form, intervalMs]);
}

export function clearDraft(key: string) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}
