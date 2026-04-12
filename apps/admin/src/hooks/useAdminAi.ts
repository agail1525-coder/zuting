import { useCallback, useState } from 'react';
import { message } from 'antd';
import {
  aiContentGenerate,
  aiInsight,
  aiModerate,
  aiSeo,
  aiTranslate,
  type SupportedLang,
} from '../lib/m40';

export interface UseAdminAiState {
  loading: boolean;
  lastTraceId?: string;
}

export function useAdminAi() {
  const [state, setState] = useState<UseAdminAiState>({ loading: false });

  const run = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setState({ loading: true });
    try {
      const result = await fn();
      const traceId = (result as unknown as { traceId?: string })?.traceId;
      setState({ loading: false, lastTraceId: traceId });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI 调用失败';
      message.error(msg);
      setState({ loading: false });
      return null;
    }
  }, []);

  return {
    state,
    generate: (params: {
      resource: string;
      fieldName: string;
      context?: string;
      style?: string;
      language?: string;
    }) => run(() => aiContentGenerate(params)),
    translate: (text: string, targetLangs: SupportedLang[], sourceLang?: SupportedLang) =>
      run(() => aiTranslate({ text, sourceLang, targetLangs })),
    seo: (resource: string, id: string, language?: string) =>
      run(() => aiSeo({ resource, id, language })),
    moderate: (text?: string, imageUrl?: string) => run(() => aiModerate({ text, imageUrl })),
    insight: (question: string) => run(() => aiInsight(question)),
  };
}
