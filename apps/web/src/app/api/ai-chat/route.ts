import { NextRequest, NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/admin-auth';
import { getClientAuthContext } from '@/lib/client/auth';

const MAX_MESSAGE_LENGTH = 1000;

function buildReply(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('nfe') || normalized.includes('nota')) {
    return 'Para NF-e, acesse o módulo financeiro/NF-e e confirme cliente, marketplace e XML antes de importar. Se precisar, a equipe F5 pode validar o arquivo pelo WhatsApp.';
  }

  if (normalized.includes('produto') || normalized.includes('sku') || normalized.includes('catálogo')) {
    return 'Para catálogo e SKUs, confira produtos monitorados, giro e conversão no painel. A operação F5 atualiza os cadastros conforme o cenário do cliente.';
  }

  if (normalized.includes('receb') || normalized.includes('financeiro') || normalized.includes('repasse')) {
    return 'Para recebimentos, acompanhe o calendário financeiro do portal: Mercado Livre/Shopee usam D+15 e Amazon usa D+60 no modelo F5.';
  }

  return 'Posso orientar sobre operação F5, catálogo, NF-e, recebimentos e insights. Para suporte específico, envie contexto do cliente/SKU ou acione o WhatsApp da equipe F5.';
}

export async function POST(request: NextRequest) {
  const clientContext = hasAdminSession(request) ? null : await getClientAuthContext(request);
  if (!hasAdminSession(request) && !clientContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === 'string' ? body.message.trim() : '';

  if (!message) {
    return NextResponse.json({ error: 'Mensagem obrigatória' }, { status: 422 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: 'Mensagem muito longa' }, { status: 413 });
  }

  return NextResponse.json({ reply: buildReply(message) });
}
