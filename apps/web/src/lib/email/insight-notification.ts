type InsightNotificationInput = {
  tenantName: string;
  recipientEmail: string;
  insightTitle: string;
  insightBody: string;
  portalUrl: string;
};

function buildHtml(input: InsightNotificationInput): string {
  const body = input.insightBody.replace(/\n/g, '<br/>');
  return `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; color: #0D1B2A;">
      <p style="color: #64748B; font-size: 13px; margin: 0 0 8px;">F5 Digital · Insight da semana</p>
      <h1 style="font-size: 20px; margin: 0 0 12px;">${input.insightTitle}</h1>
      <p style="line-height: 1.6; margin: 0 0 20px;">${body}</p>
      <a href="${input.portalUrl}" style="display: inline-block; background: #0066FF; color: #fff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Ver no portal
      </a>
      <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">Cliente: ${input.tenantName}</p>
    </div>
  `.trim();
}

/**
 * Notificação por e-mail ao publicar insight visível ao cliente.
 * Sem RESEND_API_KEY: stub em dev; silencioso em prod.
 */
export async function sendInsightNotification(
  input: InsightNotificationInput,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[insight-notification stub]', {
        to: input.recipientEmail,
        tenant: input.tenantName,
        title: input.insightTitle,
      });
    }
    return;
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ??
    'F5 Digital <insights@f5digital.com.br>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.recipientEmail],
      subject: `[F5] ${input.insightTitle}`,
      html: buildHtml(input),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('[insight-notification] falha Resend', res.status, detail);
  }
}
