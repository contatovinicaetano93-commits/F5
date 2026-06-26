'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

type ClientRefreshContextValue = {
  markUpdated: () => void;
  freshnessLabel: string;
};

export const ClientRefreshContext = createContext<ClientRefreshContextValue>({
  markUpdated: () => {},
  freshnessLabel: 'Carregando…',
});

function formatFreshness(date: Date | null): string {
  if (!date) return 'Carregando…';
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 15) return 'Atualizado agora';
  if (sec < 60) return `Atualizado há ${sec}s`;
  const min = Math.floor(sec / 60);
  if (min === 1) return 'Atualizado há 1 min';
  return `Atualizado há ${min} min`;
}

export function ClientRefreshProvider({ children }: { children: React.ReactNode }) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [freshnessLabel, setFreshnessLabel] = useState('Carregando…');

  const markUpdated = useCallback(() => setLastUpdated(new Date()), []);

  useEffect(() => {
    const tick = () => setFreshnessLabel(formatFreshness(lastUpdated));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  return (
    <ClientRefreshContext.Provider value={{ markUpdated, freshnessLabel }}>
      {children}
    </ClientRefreshContext.Provider>
  );
}

export function useClientRefresh() {
  return useContext(ClientRefreshContext);
}
