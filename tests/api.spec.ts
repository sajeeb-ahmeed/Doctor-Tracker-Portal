import { expect, test } from '@playwright/test';
import { adminEmail, adminPassword, apiBaseURL, syntheticName } from './helpers';

test.use({ baseURL: apiBaseURL });

const mutationHeaders = { 'X-Requested-With': 'DoctorTracker' };

test('API denies anonymous access and validates the mutation header', async ({ request }) => {
  const unauthorized = await request.get('/api/patients');
  expect(unauthorized.status()).toBe(401);

  const rejectedLogin = await request.post('/api/auth/login', {
    data: { email: adminEmail, password: adminPassword },
  });
  expect(rejectedLogin.status()).toBe(403);

  const incorrectLogin = await request.post('/api/auth/login', {
    headers: mutationHeaders,
    data: { email: adminEmail, password: 'IncorrectPassword!2030' },
  });
  expect(incorrectLogin.status()).toBe(401);
});

test('authenticated API supports persistent directory and patient workflows', async ({
  request,
}) => {
  const suffix = Date.now();
  const doctorName = syntheticName('Dr. API');
  const patientName = syntheticName('API Patient');

  const login = await request.post('/api/auth/login', {
    headers: mutationHeaders,
    data: { email: adminEmail, password: adminPassword },
  });
  expect(login.ok()).toBeTruthy();
  expect(login.headers()['set-cookie']).toContain('HttpOnly');
  const me = await request.get('/api/auth/me');
  expect(me.ok()).toBeTruthy();
  expect((await me.json()).data.email).toBe(adminEmail);

  const doctorsBefore = await request.get('/api/doctors?limit=1');
  expect(doctorsBefore.ok()).toBeTruthy();
  const firstPage = await doctorsBefore.json();
  expect(firstPage.data).toHaveLength(1);
  expect(firstPage.pagination.page).toBe(1);
  expect(firstPage.pagination.totalPages).toBeGreaterThan(1);
  const secondPage = await request.get('/api/doctors?limit=1&page=2');
  const secondPageBody = await secondPage.json();
  expect(secondPageBody.data[0].id).not.toBe(firstPage.data[0].id);

  const doctorResponse = await request.post('/api/doctors', {
    headers: mutationHeaders,
    data: {
      name: doctorName,
      specialization: 'Cardiology',
      hospital: 'API Medical Center',
      phone: '+8801712345678',
      email: `doctor-api-${suffix}@example.test`,
    },
  });
  expect(doctorResponse.status()).toBe(201);
  const doctor = (await doctorResponse.json()).data;
  expect(doctor.id).toBeTruthy();

  const doctorQuery = new URLSearchParams({
    q: doctorName,
    specialization: 'Cardiology',
    hospital: 'API Medical Center',
    from: '2020-01-01',
    to: '2099-12-31',
  });
  const filteredDoctors = await request.get(`/api/doctors?${doctorQuery}`);
  const filteredDoctorsBody = await filteredDoctors.json();
  expect(filteredDoctorsBody.pagination.total).toBe(1);
  expect(filteredDoctorsBody.data[0].id).toBe(doctor.id);
  const futureDoctors = await request.get('/api/doctors?from=2099-01-01&to=2099-12-31');
  expect((await futureDoctors.json()).pagination.total).toBe(0);

  const baselineDashboard = await request.get('/api/dashboard');
  expect(baselineDashboard.ok()).toBeTruthy();
  const baselineTotals = (await baselineDashboard.json()).data.totals;
  let patientId: string | undefined;
  try {
    const createPatient = await request.post('/api/patients', {
      headers: mutationHeaders,
      data: {
        name: patientName,
        age: 42,
        gender: 'Female',
        condition: 'API follow-up',
        status: 'Active',
        phone: '+8801812345678',
        email: `patient-api-${suffix}@example.test`,
        doctorId: doctor.id,
      },
    });
    expect(createPatient.status()).toBe(201);
    patientId = (await createPatient.json()).data.id;
    expect(patientId).toBeTruthy();
    const dashboardAfterCreate = (await (await request.get('/api/dashboard')).json()).data.totals;
    expect(dashboardAfterCreate.patients).toBe(baselineTotals.patients + 1);
    expect(dashboardAfterCreate.activePatients).toBe(baselineTotals.activePatients + 1);

    const patientQuery = new URLSearchParams({
      q: patientName,
      doctorId: doctor.id,
      condition: 'API follow-up',
      status: 'Active',
    });
    const filteredPatients = await request.get(`/api/patients?${patientQuery}`);
    const filteredPatientsBody = await filteredPatients.json();
    expect(filteredPatientsBody.pagination.total).toBe(1);
    expect(filteredPatientsBody.data[0].id).toBe(patientId);

    const updated = await request.patch(`/api/patients/${patientId}`, {
      headers: mutationHeaders,
      data: { condition: 'API recovery review', status: 'Recovered' },
    });
    expect(updated.ok()).toBeTruthy();
    expect((await updated.json()).data.status).toBe('Recovered');
    const dashboardAfterUpdate = (await (await request.get('/api/dashboard')).json()).data.totals;
    expect(dashboardAfterUpdate.patients).toBe(baselineTotals.patients + 1);
    expect(dashboardAfterUpdate.activePatients).toBe(baselineTotals.activePatients);
    const oldFilter = await request.get(`/api/patients?${patientQuery}`);
    expect((await oldFilter.json()).pagination.total).toBe(0);

    const deleted = await request.delete(`/api/patients/${patientId}`, {
      headers: mutationHeaders,
    });
    expect(deleted.ok()).toBeTruthy();
    patientId = undefined;
    const afterDelete = await request.get(`/api/patients?q=${encodeURIComponent(patientName)}`);
    expect((await afterDelete.json()).pagination.total).toBe(0);
    const dashboardAfterDelete = (await (await request.get('/api/dashboard')).json()).data.totals;
    expect(dashboardAfterDelete.patients).toBe(baselineTotals.patients);
  } finally {
    if (patientId) {
      await request.delete(`/api/patients/${patientId}`, { headers: mutationHeaders });
    }
  }

  const logout = await request.post('/api/auth/logout', { headers: mutationHeaders });
  expect(logout.ok()).toBeTruthy();
  expect((await request.get('/api/auth/me')).status()).toBe(401);
});
