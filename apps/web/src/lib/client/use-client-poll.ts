'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { ClientRefreshContext } from '@/components/client/ClientRefreshProvider';
import { CLIENT_POLL_INTERVAL_MS, fetchClientJson } from '@/lib/client/fetch';

export function useClientPoll<T>(
  pollKey: string,
  loader: () => Promise<T | null>,
): { data: T | null; loading: boolean; refresh: () => Promise<void> } {
  const { markUpdated } = useContext(ClientRefreshContext);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await loader();
    if (next !== null) {
      setData(next);
      markUpdated();
    }
    setLoading(false);
  }, [loader, markUpdated]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, CLIENT_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [pollKey, refresh]);

  return { data, loading, refresh };
}

export function useClientPollUrl<T>(url: string) {
  const loader = useCallback(() => fetchClientJson<T>(url), [url]);
  return useClientPoll<T>(url, loader);
}
