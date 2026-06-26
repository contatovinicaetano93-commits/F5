import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getAdminEmail } from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin/audit';
import { requireDatabaseForWrite } from '@/lib/admin/system-status';
import { internalData } from '@/lib/internal/data';
import {
  assertUploadSize,
  MAX_XML_UPLOAD_BYTES,
} from '@/lib/resilience/upload-limits';

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const dbError = requireDatabaseForWrite();
  if (dbError) return dbError;

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const tenantId = formData.get('tenantId') as string | null;
  const marketplace = formData.get('marketplace') as string | null;

  if (!file || !tenantId) {
    return NextResponse.json(
      { error: 'Arquivo XML e cliente são obrigatórios' },
      { status: 400 },
    );
  }

  const sizeError = assertUploadSize(file, MAX_XML_UPLOAD_BYTES, 'XML');
  if (sizeError) {
    return NextResponse.json({ error: sizeError }, { status: 413 });
  }

  if (!file.name.toLowerCase().endsWith('.xml')) {
    return NextResponse.json(
      { error: 'Apenas arquivos .xml são aceitos' },
      { status: 400 },
    );
  }

  try {
    const xmlContent = await file.text();
    const nf = await internalData.nfs.createFromXml(
      tenantId,
      xmlContent,
      marketplace,
    );
    await logAdminAudit({
      action: 'admin.nf_upload',
      actorEmail: getAdminEmail(),
      request,
      metadata: {
        tenantId,
        nfNumber: nf.nfNumber,
        valorTotal: nf.valorTotal,
      },
    });
    return NextResponse.json(
      {
        success: true,
        message: 'NF-e processada com sucesso',
        data: nf,
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao processar NF-e';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
