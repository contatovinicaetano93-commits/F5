import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { internalData } from '@/lib/internal/data';
import { parseMetricsCsv } from '@/lib/metrics/csv-import';

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const formData = await request.formData();
  const tenantId = formData.get('tenantId');
  const file = formData.get('file');

  if (typeof tenantId !== 'string' || !tenantId.trim()) {
    return NextResponse.json({ error: 'tenantId obrigatório' }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Arquivo CSV obrigatório' }, { status: 400 });
  }

  const text = await file.text();
  const { rows, errors: parseErrors } = parseMetricsCsv(text);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: 'Nenhuma linha válida', details: parseErrors },
      { status: 400 },
    );
  }

  const result = await internalData.metrics.importFromCsv(tenantId.trim(), rows);

  return NextResponse.json({
    ok: true,
    created: result.created,
    skipped: rows.length - result.created,
    errors: [...parseErrors, ...result.errors],
  });
}
