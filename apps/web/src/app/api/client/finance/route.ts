import { type NextRequest } from 'next/server';
import { requireClientAuth } from '@/lib/client/auth';
import { getClientFinance } from '@/lib/client/data';
import { clientJsonResponse } from '@/lib/http/client-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireClientAuth(request);
  if (auth instanceof Response) return auth;
  return clientJsonResponse(await getClientFinance(auth));
}
