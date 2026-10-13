'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Plus, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Metadata, Patient } from '@/lib/types';
import { errorMessage } from '@/lib/utils';
import { Dialog, Field, FormError, Spinner } from './ui';
import { useToast } from './providers';

export function DoctorForm({ onClose }: { onClose: () => void }) {
  const client = useQueryClient(),
    toast = useToast();
  const [values, setValues] = useState({
    name: '',
    specialization: '',
    hospital: '',
    phone: '',
    email: '',
  });
  const metadata = useQuery({
    queryKey: ['meta'],
    queryFn: () => api<{ data: Metadata }>('/meta'),
  });
  const mutation = useMutation({
    mutationFn: () => api('/doctors', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: async () => {
      await client.invalidateQueries();
      toast('Doctor added to your care team.');
      onClose();
    },
  });
  const fields = mutation.error instanceof ApiError ? mutation.error.fields : undefined;
  const change = (key: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));
  return (
    <Dialog
      title="Add a doctor"
      subtitle="Bring a new specialist into your care network."
      onClose={() => {
        if (!mutation.isPending) onClose();
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <div className="dialog-body">
          <div className="form-section-label">DOCTOR INFORMATION</div>
          <div className="form-grid">
            <Field label="Full name" htmlFor="doctor-name" error={fields?.name}>
              <input
                id="doctor-name"
                value={values.name}
                onChange={(e) => change('name', e.target.value)}
                placeholder="Dr. Maya Rahman"
                required
                minLength={2}
                maxLength={100}
                disabled={mutation.isPending}
              />
            </Field>
            <Field
              label="Specialization"
              htmlFor="doctor-specialization"
              error={fields?.specialization}
            >
              <input
                id="doctor-specialization"
                value={values.specialization}
                onChange={(e) => change('specialization', e.target.value)}
                placeholder="Cardiology"
                list="specializations-list"
                required
                maxLength={100}
                disabled={mutation.isPending}
              />
              <datalist id="specializations-list">
                {metadata.data?.data.specializations.map((value) => (
                  <option value={value} key={value} />
                ))}
              </datalist>
            </Field>
            <div className="form-full">
              <Field label="Hospital" htmlFor="doctor-hospital" error={fields?.hospital}>
                <input
                  id="doctor-hospital"
                  value={values.hospital}
                  onChange={(e) => change('hospital', e.target.value)}
                  placeholder="Hospital or practice name"
                  list="hospitals-list"
                  required
                  maxLength={100}
                  disabled={mutation.isPending}
                />
                <datalist id="hospitals-list">
                  {metadata.data?.data.hospitals.map((value) => (
                    <option value={value} key={value} />
                  ))}
                </datalist>
              </Field>
            </div>
            <Field label="Phone number" htmlFor="doctor-phone" error={fields?.phone}>
              <input
                id="doctor-phone"
                type="tel"
                value={values.phone}
                onChange={(e) => change('phone', e.target.value)}
                placeholder="+880 1700 000000"
                required
                maxLength={25}
                disabled={mutation.isPending}
              />
            </Field>
            <Field label="Email address" htmlFor="doctor-email" error={fields?.email}>
              <input
                id="doctor-email"
                type="email"
                value={values.email}
                onChange={(e) => change('email', e.target.value)}
                placeholder="doctor@hospital.com"
                required
                maxLength={254}
                disabled={mutation.isPending}
              />
            </Field>
          </div>
          <FormError message={mutation.error ? errorMessage(mutation.error) : undefined} />
        </div>
        <div className="dialog-footer">
          <button
            type="button"
            className="button button-secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </button>
          <button className="button button-primary" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Spinner label="Creating…" />
            ) : (
              <>
                <Plus size={16} />
                Create doctor
              </>
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export function PatientForm({
  onClose,
  patient,
  doctorId,
}: {
  onClose: () => void;
  patient?: Patient;
  doctorId?: string;
}) {
  const client = useQueryClient(),
    toast = useToast();
  const [values, setValues] = useState({
    name: patient?.name || '',
    age: patient ? String(patient.age) : '',
    gender: patient?.gender || 'Female',
    condition: patient?.condition || '',
    status: patient?.status || 'Active',
    phone: patient?.phone || '',
    email: patient?.email || '',
    doctorId: patient?.doctorId || doctorId || '',
  });
  const metadata = useQuery({
    queryKey: ['meta'],
    queryFn: () => api<{ data: Metadata }>('/meta'),
  });
  const mutation = useMutation({
    mutationFn: () =>
      api(patient ? `/patients/${patient.id}` : '/patients', {
        method: patient ? 'PATCH' : 'POST',
        body: JSON.stringify({ ...values, age: Number(values.age), email: values.email.trim() }),
      }),
    onSuccess: async () => {
      await client.invalidateQueries();
      toast(patient ? 'Patient information updated.' : 'Patient added to your care workspace.');
      onClose();
    },
  });
  const fields = mutation.error instanceof ApiError ? mutation.error.fields : undefined;
  const change = (key: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));
  return (
    <Dialog
      title={patient ? 'Edit patient' : 'Add a patient'}
      subtitle={
        patient
          ? 'Keep their care details up to date.'
          : 'A new record. A more connected care journey.'
      }
      onClose={() => {
        if (!mutation.isPending) onClose();
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <div className="dialog-body">
          <div className="form-section-label">PATIENT INFORMATION</div>
          <div className="form-grid">
            <div className="form-full">
              <Field label="Full name" htmlFor="patient-name" error={fields?.name}>
                <input
                  id="patient-name"
                  value={values.name}
                  onChange={(e) => change('name', e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Patient’s full name"
                  disabled={mutation.isPending}
                />
              </Field>
            </div>
            <Field label="Age" htmlFor="patient-age" error={fields?.age}>
              <input
                id="patient-age"
                type="number"
                min="0"
                max="120"
                step="1"
                value={values.age}
                onChange={(e) => change('age', e.target.value)}
                required
                placeholder="Age in years"
                disabled={mutation.isPending}
              />
            </Field>
            <Field label="Gender" htmlFor="patient-gender" error={fields?.gender}>
              <select
                id="patient-gender"
                value={values.gender}
                onChange={(e) => change('gender', e.target.value)}
                disabled={mutation.isPending}
              >
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Condition" htmlFor="patient-condition" error={fields?.condition}>
              <input
                id="patient-condition"
                value={values.condition}
                onChange={(e) => change('condition', e.target.value)}
                list="conditions-list"
                placeholder="e.g. Hypertension"
                required
                maxLength={100}
                disabled={mutation.isPending}
              />
              <datalist id="conditions-list">
                {metadata.data?.data.conditions.map((value) => (
                  <option value={value} key={value} />
                ))}
              </datalist>
            </Field>
            <Field label="Status" htmlFor="patient-status" error={fields?.status}>
              <select
                id="patient-status"
                value={values.status}
                onChange={(e) => change('status', e.target.value)}
                disabled={mutation.isPending}
              >
                <option>Active</option>
                <option>Recovered</option>
                <option>Critical</option>
              </select>
            </Field>
            <div className="form-full">
              <Field
                label="Doctor"
                htmlFor="patient-doctor"
                error={fields?.doctorId}
                hint={doctorId ? 'Assigned to this doctor.' : undefined}
              >
                <select
                  id="patient-doctor"
                  value={values.doctorId}
                  onChange={(e) => change('doctorId', e.target.value)}
                  required
                  disabled={mutation.isPending || Boolean(doctorId) || metadata.isPending}
                >
                  <option value="">
                    {metadata.isPending ? 'Loading doctors…' : 'Select a doctor'}
                  </option>
                  {metadata.data?.data.doctors.map((doctor) => (
                    <option value={doctor.id} key={doctor.id}>
                      {doctor.name} · {doctor.specialization}
                    </option>
                  ))}
                </select>
              </Field>
              {metadata.isError && (
                <p className="field-error" role="alert">
                  Unable to load doctors.{' '}
                  <button type="button" className="text-button" onClick={() => metadata.refetch()}>
                    Try again
                  </button>
                </p>
              )}
            </div>
            <Field label="Phone number" htmlFor="patient-phone" error={fields?.phone}>
              <input
                id="patient-phone"
                type="tel"
                value={values.phone}
                onChange={(e) => change('phone', e.target.value)}
                required
                maxLength={25}
                placeholder="+880 1700 000000"
                disabled={mutation.isPending}
              />
            </Field>
            <Field label="Email address" htmlFor="patient-email" optional error={fields?.email}>
              <input
                id="patient-email"
                type="email"
                value={values.email}
                onChange={(e) => change('email', e.target.value)}
                placeholder="patient@email.com"
                maxLength={254}
                disabled={mutation.isPending}
              />
            </Field>
          </div>
          <FormError message={mutation.error ? errorMessage(mutation.error) : undefined} />
        </div>
        <div className="dialog-footer">
          <button
            type="button"
            className="button button-secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </button>
          <button
            className="button button-primary"
            type="submit"
            disabled={
              mutation.isPending || metadata.isPending || metadata.isError || !values.doctorId
            }
          >
            {mutation.isPending ? (
              <Spinner label="Saving…" />
            ) : patient ? (
              <>
                <Check size={16} />
                Save changes
              </>
            ) : (
              <>
                <Plus size={16} />
                Create patient
              </>
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export function DeletePatientDialog({
  patient,
  onClose,
}: {
  patient: Patient;
  onClose: () => void;
}) {
  const client = useQueryClient(),
    toast = useToast();
  const mutation = useMutation({
    mutationFn: () => api(`/patients/${patient.id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await client.invalidateQueries();
      toast('Patient record deleted.');
      onClose();
    },
  });
  return (
    <Dialog
      title="Delete patient"
      onClose={() => {
        if (!mutation.isPending) onClose();
      }}
      compact
    >
      <div className="dialog-body">
        <span className="delete-symbol">
          <Trash2 size={25} />
        </span>
        <p className="delete-description">
          Delete <strong>{patient.name}</strong> from your workspace?
        </p>
        <p className="muted">
          This permanently removes their patient record and updates the assigned doctor’s list and
          dashboard statistics.
        </p>
        <FormError message={mutation.error ? errorMessage(mutation.error) : undefined} />
      </div>
      <div className="dialog-footer">
        <button className="button button-secondary" onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </button>
        <button
          className="button button-danger"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Spinner label="Deleting…" />
          ) : (
            <>
              <Trash2 size={16} />
              Delete patient
            </>
          )}
        </button>
      </div>
    </Dialog>
  );
}
