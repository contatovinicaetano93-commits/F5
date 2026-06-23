import { NextResponse } from 'next/server';
import { getClientProducts } from '@/lib/client/data';

export async function GET() {
  return NextResponse.json(getClientProducts());
}
