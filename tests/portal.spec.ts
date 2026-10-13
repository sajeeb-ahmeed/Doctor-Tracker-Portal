import { expect, test } from '@playwright/test';
import {
  adminEmail,
  adminPassword,
  apiBaseURL,
  dashboardTotal,
  signIn,
  syntheticName,
} from './helpers';

test('anonymous administrators are redirected to login', async ({ page }) => {
  await page.goto('/patients');
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
});

test('incorrect credentials show an error and do not open the portal', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email address', exact: true }).fill(adminEmail);
  await page.getByLabel('Password', { exact: true }).fill('IncorrectPassword!2030');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: /invalid|incorrect|credentials/i }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
});

test('signing out clears access to protected portal pages', async ({ page }) => {
  await signIn(page);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
});

test('doctor and patient workflows persist and update dashboard totals', async ({ page }) => {
  test.setTimeout(90_000);
  const doctorName = syntheticName('Dr. E2E');
  const patientName = syntheticName('E2E Patient');
  const patientUpdatedName = `${patientName} Updated`;
  const suffix = Date.now();

  await signIn(page);
  const baselineDoctors = await dashboardTotal(page, 'doctors');
  const baselinePatients = await dashboardTotal(page, 'patients');

  await page.getByRole('link', { name: 'Doctors', exact: true }).click();
  await page.getByRole('button', { name: 'Add doctor', exact: true }).click();
  const doctorDialog = page.getByRole('dialog', { name: 'Add a doctor', exact: true });
  await doctorDialog.getByLabel('Full name', { exact: true }).fill(doctorName);
  await doctorDialog.getByLabel('Specialization', { exact: true }).fill('Cardiology');
  await doctorDialog.getByLabel('Hospital', { exact: true }).fill('E2E Medical Center');
  await doctorDialog.getByLabel('Phone number', { exact: true }).fill('+8801712345678');
  await doctorDialog
    .getByLabel('Email address', { exact: true })
    .fill(`doctor-${suffix}@example.test`);
  await doctorDialog.getByRole('button', { name: 'Create doctor', exact: true }).click();
  await expect(doctorDialog).not.toBeVisible();

  await page.getByRole('searchbox', { name: 'Search doctors', exact: true }).fill(doctorName);
  await expect(page.getByRole('link', { name: doctorName, exact: true })).toBeVisible();
  await page.getByLabel('Specialization', { exact: true }).selectOption({ label: 'Cardiology' });
  await page.getByLabel('Hospital', { exact: true }).selectOption({ label: 'E2E Medical Center' });
  await expect(page.getByRole('link', { name: doctorName, exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('searchbox', { name: 'Search doctors', exact: true }).fill(doctorName);
  await page.getByRole('link', { name: doctorName, exact: true }).click();

  await expect(page.getByRole('heading', { name: doctorName, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Add patient', exact: true }).first().click();
  const patientDialog = page.getByRole('dialog', { name: 'Add a patient', exact: true });
  await patientDialog.getByLabel('Full name', { exact: true }).fill(patientName);
  await patientDialog.getByLabel('Age', { exact: true }).fill('42');
  await patientDialog.getByLabel('Gender', { exact: true }).selectOption({ label: 'Female' });
  await patientDialog.getByLabel('Condition', { exact: true }).fill('E2E Cardiac follow-up');
  await patientDialog.getByLabel('Status', { exact: true }).selectOption({ label: 'Active' });
  await patientDialog.getByLabel('Phone number', { exact: true }).fill('+8801812345678');
  await patientDialog.getByLabel(/^Email address/).fill(`patient-${suffix}@example.test`);
  await patientDialog.getByRole('button', { name: 'Create patient', exact: true }).click();
  await expect(patientDialog).not.toBeVisible();
  await expect(page.getByText(patientName, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(patientName, { exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect.poll(() => dashboardTotal(page, 'doctors')).toBe(baselineDoctors + 1);
  await expect.poll(() => dashboardTotal(page, 'patients')).toBe(baselinePatients + 1);

  await page.getByRole('link', { name: 'Patients', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search patients', exact: true }).fill(patientName);
  await page.getByRole('button', { name: `Edit ${patientName}`, exact: true }).click();
  const editDialog = page.getByRole('dialog', { name: 'Edit patient', exact: true });
  await editDialog.getByLabel('Full name', { exact: true }).fill(patientUpdatedName);
  await editDialog.getByLabel('Condition', { exact: true }).fill('E2E Recovery review');
  await editDialog.getByLabel('Status', { exact: true }).selectOption({ label: 'Recovered' });
  await editDialog.getByLabel(/^Email address/).fill('');
  await editDialog.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(editDialog).not.toBeVisible();
  await page
    .getByRole('searchbox', { name: 'Search patients', exact: true })
    .fill(patientUpdatedName);
  await page
    .getByLabel('Condition', { exact: true })
    .selectOption({ label: 'E2E Recovery review' });
  await page.getByLabel('Status', { exact: true }).selectOption({ label: 'Recovered' });
  await expect(page.getByText(patientUpdatedName, { exact: true })).toBeVisible();
  await page.reload();
  await page
    .getByRole('searchbox', { name: 'Search patients', exact: true })
    .fill(patientUpdatedName);
  await expect(page.getByText(patientUpdatedName, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: `Edit ${patientUpdatedName}`, exact: true }).click();
  await expect(editDialog.getByLabel(/^Email address/)).toHaveValue('');
  await editDialog.getByRole('button', { name: 'Cancel', exact: true }).click();

  await page.getByRole('button', { name: `Delete ${patientUpdatedName}`, exact: true }).click();
  const deleteDialog = page.getByRole('dialog', { name: 'Delete patient', exact: true });
  await deleteDialog.getByRole('button', { name: 'Delete patient', exact: true }).click();
  await expect(deleteDialog).not.toBeVisible();
  await expect(page.getByText(patientUpdatedName, { exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect.poll(() => dashboardTotal(page, 'patients')).toBe(baselinePatients);
});

test('doctor directory supports combined date filters and page navigation', async ({ page }) => {
  await signIn(page);
  await page.getByRole('link', { name: 'Doctors', exact: true }).click();
  await expect(page.getByText(/Page 1 of \d+/)).toBeVisible();
  const next = page.getByRole('button', { name: 'Next page', exact: true });
  await expect(next).toBeEnabled();
  await next.click();
  await expect(page.getByText(/Page 2 of \d+/)).toBeVisible();
  await page.getByRole('button', { name: 'Previous page', exact: true }).click();
  await expect(page.getByText(/Page 1 of \d+/)).toBeVisible();

  await page.getByLabel('From date', { exact: true }).fill('2020-01-01');
  await page.getByLabel('To date', { exact: true }).fill('2099-12-31');
  await expect(page.getByText(/Page 1 of \d+/)).toBeVisible();
  await page.getByLabel('From date', { exact: true }).fill('2099-01-01');
  await expect(page.getByRole('link', { name: /^Dr\./ })).toHaveCount(0);
  await expect(page.getByText(/no (?:matching )?doctors|no results/i)).toBeVisible();
});

test('deleting the final patient on a directory page returns to a valid page', async ({
  page,
  request,
}) => {
  const fixture = syntheticName('Boundary Fixture');
  const condition = syntheticName('Boundary condition');
  const headers = { 'X-Requested-With': 'DoctorTracker' };
  const login = await request.post(`${apiBaseURL}/api/auth/login`, {
    headers,
    data: { email: adminEmail, password: adminPassword },
  });
  expect(login.ok()).toBeTruthy();
  const doctorResponse = await request.get(`${apiBaseURL}/api/doctors?limit=1`);
  const doctorId = (await doctorResponse.json()).data[0].id;
  const patientIds: string[] = [];

  try {
    for (let index = 0; index < 9; index += 1) {
      const response = await request.post(`${apiBaseURL}/api/patients`, {
        headers,
        data: {
          name: `${fixture} ${index}`,
          age: 42,
          gender: 'Female',
          condition,
          status: 'Active',
          phone: '+8801812345678',
          doctorId,
        },
      });
      expect(response.status()).toBe(201);
      patientIds.push((await response.json()).data.id);
    }
    await signIn(page);
    await page.getByRole('link', { name: 'Patients', exact: true }).click();
    await page.getByRole('searchbox', { name: 'Search patients', exact: true }).fill(fixture);
    await page.getByLabel('Condition', { exact: true }).selectOption({ label: condition });
    await expect(page.getByText('Page 1 of 2', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Next page', exact: true }).click();
    await expect(page.getByText('Page 2 of 2', { exact: true })).toBeVisible();
    const deleteButton = page.getByRole('button', { name: /^Delete Boundary Fixture/ });
    await expect(deleteButton).toHaveCount(1);
    await deleteButton.click();
    await page
      .getByRole('dialog', { name: 'Delete patient', exact: true })
      .getByRole('button', { name: 'Delete patient', exact: true })
      .click();
    await expect(page.getByText('Page 1 of 1', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Previous page', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: /^Edit Boundary Fixture/ })).toHaveCount(8);
  } finally {
    await Promise.all(
      patientIds.map((id) => request.delete(`${apiBaseURL}/api/patients/${id}`, { headers })),
    );
  }
});
