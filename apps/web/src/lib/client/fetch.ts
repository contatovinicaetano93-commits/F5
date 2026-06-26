/** Intervalo de refresh automático no portal cliente (ms). */
export const CLIENT_POLL_INTERVAL_MS = 60_000;

export async function fetchClientJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
