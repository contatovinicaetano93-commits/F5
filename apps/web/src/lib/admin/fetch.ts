export async function fetchAdminJson<T>(
  url: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; error: string; status: number }> {
  try {
    const res = await fetch(url, { credentials: 'include', ...init });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        typeof body === 'object' && body && 'error' in body
          ? String((body as { error?: string }).error ?? res.statusText)
          : res.statusText;
      return { ok: false, error: message, status: res.status };
    }
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, error: 'Erro de rede', status: 0 };
  }
}

export async function fetchAdminList<T>(url: string, init?: RequestInit): Promise<T[]> {
  const result = await fetchAdminJson<T[]>(url, init);
  if (!result.ok || !Array.isArray(result.data)) return [];
  return result.data;
}
