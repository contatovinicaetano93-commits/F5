import { NextResponse } from 'next/server';
import { getClientFinance } from '@/lib/client/data';

export async function GET() {
  return NextResponse.json(getClientFinance());
}
