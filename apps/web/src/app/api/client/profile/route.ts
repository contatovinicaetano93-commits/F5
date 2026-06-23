import { NextResponse } from 'next/server';
import { getClientProfile } from '@/lib/client/data';

export async function GET() {
  return NextResponse.json(getClientProfile());
}
