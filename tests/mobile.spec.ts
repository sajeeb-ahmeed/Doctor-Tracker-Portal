import { expect, test } from '@playwright/test';
import { signIn } from './helpers';

test('mobile portal navigation, dashboard and directories fit the viewport', async ({ page }) => {
  await signIn(page);
  await expect(page.getByTestId('metric-doctors')).toBeVisible();
  await expect(page.getByTestId('metric-patients')).toBeVisible();
  await expectNoPageOverflow(page);

  await page.getByRole('link', { name: 'Doctors', exact: true }).click();
  await expect(page.getByRole('searchbox', { name: 'Search doctors', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add doctor', exact: true })).toBeVisible();
  await expectNoPageOverflow(page);

  await page.getByRole('link', { name: 'Patients', exact: true }).click();
  await expect(page.getByRole('searchbox', { name: 'Search patients', exact: true })).toBeVisible();
  await expectNoPageOverflow(page);
});

async function expectNoPageOverflow(page: import('@playwright/test').Page) {
  const dimensions = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(
    dimensions.content,
    'The document should not overflow horizontally on mobile',
  ).toBeLessThanOrEqual(dimensions.viewport + 1);
}
