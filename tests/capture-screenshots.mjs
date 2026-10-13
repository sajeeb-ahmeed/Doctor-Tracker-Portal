import { chromium, devices } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const screenshotsDirectory = resolve('docs/screenshots');
await mkdir(screenshotsDirectory, { recursive: true });
const browser = await chromium.launch();

async function signIn(page) {
  await page.goto(`${baseURL}/login`);
  await page
    .getByRole('textbox', { name: 'Email address', exact: true })
    .fill(process.env.E2E_ADMIN_EMAIL || 'admin@doctortracker.demo');
  await page
    .getByLabel('Password', { exact: true })
    .fill(process.env.E2E_ADMIN_PASSWORD || 'DoctorDemo!2030');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL(/\/dashboard(?:\?|$)/);
  await page.getByTestId('metric-doctors').waitFor();
}

async function capture(page, fileName, fullPage = true) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  await page.screenshot({
    path: resolve(screenshotsDirectory, fileName),
    fullPage,
    scale: 'css',
    animations: 'disabled',
  });
  process.stdout.write(`Saved docs/screenshots/${fileName}\n`);
}

try {
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: 'light',
  });
  const desktopPage = await desktop.newPage();
  await signIn(desktopPage);
  await capture(desktopPage, 'dashboard-desktop.png');
  await desktopPage.getByRole('link', { name: 'Doctors', exact: true }).click();
  await desktopPage.waitForURL(/\/doctors(?:\?|$)/);
  await desktopPage.getByRole('heading', { level: 1, name: 'Doctors.', exact: true }).waitFor();
  await desktopPage.getByRole('cell').first().waitFor();
  await capture(desktopPage, 'doctors-desktop.png');
  await desktop.close();

  const mobile = await browser.newContext({ ...devices['Pixel 7'], colorScheme: 'light' });
  const mobilePage = await mobile.newPage();
  await signIn(mobilePage);
  await capture(mobilePage, 'dashboard-mobile.png', false);
  await mobilePage.getByRole('link', { name: 'Patients', exact: true }).click();
  await mobilePage.waitForURL(/\/patients(?:\?|$)/);
  await mobilePage.getByRole('heading', { level: 1, name: 'Patients.', exact: true }).waitFor();
  await mobilePage.getByRole('button', { name: 'Add patient', exact: true }).waitFor();
  await mobilePage.getByRole('cell').first().waitFor();
  await capture(mobilePage, 'patients-mobile.png', false);
  await mobile.close();
} finally {
  await browser.close();
}
