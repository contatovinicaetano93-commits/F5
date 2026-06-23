import { NextResponse } from 'next/server';
import { getClientOverview } from '@/lib/client/data';

export async function GET() {
  return NextResponse.json(getClientOverview());
}
