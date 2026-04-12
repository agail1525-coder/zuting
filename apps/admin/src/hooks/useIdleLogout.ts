import { useEffect } from 'react';
import { logout } from '../lib/auth';

const IDLE_MS = 30 * 60 * 1000;
const EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const;

export function useIdleLogout(ms = IDLE_MS) {
  useEffect(() => {
    let timer: number | undefined;
    const reset = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        alert('会话已超时 (30分钟无操作), 请重新登录');
        logout();
      }, ms);
    };
    reset();
    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      if (timer) window.clearTimeout(timer);
      EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [ms]);
}
