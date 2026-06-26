import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getAdminEmail } from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin/audit';
import { parseCatalogCsv } from '@/lib/admin/catalog-import';
import { requireDatabaseForWrite } from '@/lib/admin/system-status';
import { internalData } from '@/lib/internal/data';
import {
  assertUploadSize,
  MAX_CSV_UPLOAD_BYTES,
} from '@/lib/resilience/upload-limits';

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const dbError = requireDatabaseForWrite();
  if (dbError) return dbError;

  const formData = await request.formData();
  const tenantId = formData.get('tenantId');
  const file = formData.get('file');

  if (typeof tenantId !== 'string' || !tenantId.trim()) {
    return NextResponse.json({ error: 'tenantId obrigatório' }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Arquivo CSV obrigatório' }, { status: 400 });
  }

  const sizeError = assertUploadSize(file, MAX_CSV_UPLOAD_BYTES, 'CSV');
  if (sizeError) {
    return NextResponse.json({ error: sizeError }, { status: 413 });
  }

  const text = await file.text();
  const { rows, errors: parseErrors } = parseCatalogCsv(text);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: 'Nenhuma linha válida', details: parseErrors },
      { status: 400 },
    );
  }

  const result = await internalData.products.importFromCsv(tenantId.trim(), rows);

  await logAdminAudit({
    action: 'admin.catalog_import',
    actorEmail: getAdminEmail(),
    request,
    metadata: {
      tenantId: tenantId.trim(),
      created: result.created,
      updated: result.updated,
      rows: rows.length,
    },
  });

  return NextResponse.json({
    ok: true,
    created: result.created,
    updated: result.updated,
    errors: [...parseErrors, ...result.errors],
  });
}
