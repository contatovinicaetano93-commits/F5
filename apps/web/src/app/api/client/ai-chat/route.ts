import { type NextRequest, NextResponse } from 'next/server';
import { requireClientAuth } from '@/lib/client/auth';

const RESPONSES: Record<string, string> = {
  vendas: 'As vendas do mês estão consolidadas no painel de Visão Geral. Acesse a seção "Resultado do digital" para ver o faturamento por canal.',
  pagamento: 'Os repasses seguem o calendário: Mercado Livre D+15 e Amazon D+60 após emissão da NF-e. Veja os próximos recebimentos no card "Pagamentos a receber".',
  produto: 'A performance por produto está disponível na aba Produtos. A F5 monitora giro, estoque e margem por SKU.',
  insight: 'Os insights da sua operação são publicados toda semana. Acesse a aba Insights para ver as análises mais recentes da equipe F5.',
  estoque: 'O controle de estoque é feito pela equipe F5 diretamente nas plataformas. Qualquer ajuste pode ser solicitado pelo WhatsApp.',
  amazon: 'Na Amazon 1P, a própria Amazon compra de você e revende. A F5 cuida do cadastro, precificação e acompanhamento dos pedidos.',
  mercado: 'No Mercado Livre 3P, a F5 opera sua conta como intermediária. Você vende pela plataforma com a estrutura da F5.',
  nf: 'As notas fiscais são processadas pela F5 após cada ciclo de vendas. O prazo de repasse começa a contar após a emissão.',
  contato: 'Para falar com a equipe F5, use o botão do WhatsApp ao lado. Atendemos de segunda a sexta, das 9h às 18h.',
};

function buildReply(message: string): string {
  const lower = message.toLowerCase();
  for (const [key, reply] of Object.entries(RESPONSES)) {
    if (lower.includes(key)) return reply;
  }
  return 'Entendi sua pergunta! Para informações mais específicas sobre sua operação, entre em contato com a equipe F5 pelo WhatsApp. Estamos de segunda a sexta, das 9h às 18h.';
}

export async function POST(request: NextRequest) {
  const auth = await requireClientAuth(request);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const message =
    body && typeof body === 'object' && 'message' in body && typeof (body as Record<string, unknown>).message === 'string'
      ? ((body as Record<string, string>).message).trim()
      : '';

  if (!message) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  if (message.length > 500) {
    return NextResponse.json({ error: 'message too long' }, { status: 400 });
  }

  return NextResponse.json({ reply: buildReply(message) });
}
