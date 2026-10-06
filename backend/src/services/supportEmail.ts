import { env } from '../config/env';

export type SupportNotification = {
  id: string;
  type: 'SUPPORT' | 'REPORT';
  createdAt: Date;
};

export type NotificationStatus = 'sent' | 'not_configured' | 'failed';

type EmailConfig = {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  SUPPORT_EMAIL?: string;
};

export async function sendSupportNotification(
  ticket: SupportNotification,
  config: EmailConfig = env,
  send: typeof fetch = fetch
): Promise<NotificationStatus> {
  if (!config.RESEND_API_KEY || !config.EMAIL_FROM || !config.SUPPORT_EMAIL) {
    return 'not_configured';
  }

  try {
    const response = await send('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: config.EMAIL_FROM,
        to: [config.SUPPORT_EMAIL],
        subject: `MedMedia ${ticket.type === 'REPORT' ? 'report' : 'support'} ticket received`,
        // Ticket content can contain patient or other sensitive information.
        // Keep it in the authenticated application and send only a locator.
        text: `A new ${ticket.type.toLowerCase()} ticket was saved in MedMedia.\nTicket ID: ${ticket.id}\nReceived: ${ticket.createdAt.toISOString()}\nSign in to the application to review it. Do not forward sensitive details by email.`
      }),
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      console.warn(`[Email] Support notification was rejected (HTTP ${response.status}).`);
      return 'failed';
    }
    return 'sent';
  } catch {
    console.warn('[Email] Support notification could not be delivered.');
    return 'failed';
  }
}
