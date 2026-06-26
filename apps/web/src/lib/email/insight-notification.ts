type InsightNotificationInput = {
  tenantName: string;
  recipientEmail: string;
  insightTitle: string;
  insightBody: string;
  portalUrl: string;
};

/**
 * Stub de notificação por e-mail (Resend P2).
 * Com RESEND_API_KEY configurada, loga intenção; envio real fica para P1-15.
 */
export async function sendInsightNotification(input: InsightNotificationInput): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[insight-notification stub]', {
        to: input.recipientEmail,
        tenant: input.tenantName,
        title: input.insightTitle,
      });
    }
    return;
  }

  // P2: integrar Resend quando API key estiver em produção
  console.info('[insight-notification] RESEND_API_KEY set — envio real pendente', {
    to: input.recipientEmail,
    title: input.insightTitle,
  });
}
