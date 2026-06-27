import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { parseNfXml } from '@/lib/nf/parser';
import {
  assertUploadSize,
  MAX_XML_UPLOAD_BYTES,
} from '@/lib/resilience/upload-limits';

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'Arquivo XML obrigatório' }, { status: 422 });
  }

  const sizeError = assertUploadSize(file as File, MAX_XML_UPLOAD_BYTES, 'XML');
  if (sizeError) {
    return NextResponse.json({ error: sizeError }, { status: 413 });
  }

  try {
    const parsed = await parseNfXml(await file.text());
    return NextResponse.json({
      nfNumber: parsed.nfNumber,
      nfSeries: parsed.nfSeries,
      nfDate: parsed.nfDate.toISOString(),
      emitente: parsed.emitente,
      destinatario: parsed.destinatario,
      valorTotal: parsed.valorTotal,
      itemsCount: parsed.items.length,
      items: parsed.items.slice(0, 5).map((item) => ({
        sku: item.sku,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorTotal: item.valorTotal,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'XML inválido';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
