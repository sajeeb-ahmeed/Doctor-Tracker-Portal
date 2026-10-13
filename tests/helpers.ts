import { expect, type Page } from '@playwright/test';

export const adminEmail = process.env.E2E_ADMIN_EMAIL || 'admin@doctortracker.demo';
export const adminPassword = process.env.E2E_ADMIN_PASSWORD || 'DoctorDemo!2030';
export const apiBaseURL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:4000';

export async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email address', exact: true }).fill(adminEmail);
  await page.getByLabel('Password', { exact: true }).fill(adminPassword);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
}

export async function dashboardTotal(page: Page, metric: 'doctors' | 'patients') {
  const value = page.getByTestId(`metric-${metric}`);
  await expect(value).toBeVisible();
  await expect(value).toHaveText(/\d/);
  return Number((await value.innerText()).replace(/[^\d]/g, ''));
}

export function syntheticName(prefix: string) {
  return `${prefix} ${Date.now()} ${Math.random().toString(36).slice(2, 7)}`;
}
