import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { sendSupportNotification } from '../src/services/supportEmail';

describe('support email notifications', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not call the provider when mail configuration is incomplete', async () => {
    const send = jest.fn<typeof fetch>();
    const status = await sendSupportNotification(
      { id: 'ticket-1', type: 'SUPPORT', createdAt: new Date('2026-01-01T00:00:00Z') },
      {},
      send
    );

    expect(status).toBe('not_configured');
    expect(send).not.toHaveBeenCalled();
  });

  it('sends only a ticket locator, without user-submitted report content', async () => {
    let requestBody = '';
    const sensitiveReportText = 'Sensitive clinical details should stay in the application.';
    const send = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      requestBody = String(init?.body ?? '');
      return new Response(null, { status: 200 });
    }) as typeof fetch;

    const status = await sendSupportNotification(
      {
        id: 'ticket-2',
        type: 'REPORT',
        createdAt: new Date('2026-01-01T00:00:00Z')
      },
      { RESEND_API_KEY: 'test-key', EMAIL_FROM: 'MedMedia <support@example.com>', SUPPORT_EMAIL: 'team@example.com' },
      send
    );

    expect(status).toBe('sent');
    const email = JSON.parse(requestBody);
    expect(email.to).toEqual(['team@example.com']);
    expect(email.text).toContain('ticket-2');
    expect(email.text).not.toContain(sensitiveReportText);
  });

  it('reports provider rejection without losing the saved ticket flow', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const send = (async () => new Response(null, { status: 403 })) as typeof fetch;

    const status = await sendSupportNotification(
      { id: 'ticket-3', type: 'REPORT', createdAt: new Date('2026-01-01T00:00:00Z') },
      { RESEND_API_KEY: 'test-key', EMAIL_FROM: 'MedMedia <support@example.com>', SUPPORT_EMAIL: 'team@example.com' },
      send
    );

    expect(status).toBe('failed');
  });
});
