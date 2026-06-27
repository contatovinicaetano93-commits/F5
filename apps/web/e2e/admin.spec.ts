import { test, expect } from '@playwright/test';

const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@f5digital.com.br';
const adminPassword = process.env.ADMIN_PASSWORD ?? '';

test.describe('Admin portal', () => {
  test.beforeEach(() => {
    test.skip(!adminPassword, 'ADMIN_PASSWORD não configurada');
  });

  test('login admin → central', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('input[type="email"]').fill(adminEmail);
    await page.locator('input[type="password"]').first().fill(adminPassword);
    await page.getByRole('button', { name: /acessar|entrar/i }).click();

    await expect(page).toHaveURL(/\/admin\/?$/);
    await expect(page.getByRole('heading', { name: /visão geral/i })).toBeVisible();
  });
});
