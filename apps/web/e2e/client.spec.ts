import { test, expect } from '@playwright/test';

const portalPassword = process.env.CLIENT_PORTAL_PASSWORD;

test.describe('Portal cliente', () => {
  test.beforeEach(() => {
    test.skip(!portalPassword, 'CLIENT_PORTAL_PASSWORD não configurada');
  });

  test('login portal → KPIs', async ({ page, request }) => {
    const loginRes = await request.post('/api/client/auth/login', {
      data: { password: portalPassword },
    });
    expect(loginRes.ok()).toBeTruthy();

    await page.goto('/cliente');
    await expect(page.getByText(/resultado do digital|vendas do mês/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
