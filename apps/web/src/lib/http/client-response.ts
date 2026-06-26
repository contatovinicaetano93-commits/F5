import { NextResponse } from 'next/server';

const NO_STORE = 'no-store, no-cache, must-revalidate';

/** Resposta JSON do portal cliente — nunca cachear no CDN/browser. */
export function clientJsonResponse(
  data: unknown,
  init?: ResponseInit,
): NextResponse {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', NO_STORE);
  return NextResponse.json(data, { ...init, headers });
}
