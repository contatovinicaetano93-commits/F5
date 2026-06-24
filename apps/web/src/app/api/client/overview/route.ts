import { type NextRequest, NextResponse } from 'next/server';
import { requireClientAuth } from '@/lib/client/auth';
import { getClientOverview } from '@/lib/client/data';

export async function GET(request: NextRequest) {
  const auth = await requireClientAuth(request);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(await getClientOverview(auth));
}
