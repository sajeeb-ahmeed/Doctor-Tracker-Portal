'use client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, queryString } from '@/lib/api';
import { useDebounced } from '@/lib/hooks';
import { shortDate } from '@/lib/utils';
import type { ListResponse, Metadata, Patient } from '@/lib/types';
import { DeletePatientDialog, PatientForm } from './forms';
import { Avatar, EmptyState, ErrorState, PaginationControls, Spinner, StatusBadge } from './ui';
import { FilterToolbar, SelectFilter } from './filters';

export function PatientsDirectory({ doctorId }: { doctorId?: string }) {
  const [search, setSearch] = useState(''),
    [condition, setCondition] = useState(''),
    [status, setStatus] = useState(''),
    [selectedDoctor, setSelectedDoctor] = useState(''),
    [from, setFrom] = useState(''),
    [to, setTo] = useState(''),
    [page, setPage] = useState(1),
    [adding, setAdding] = useState(false),
    [editing, setEditing] = useState<Patient | null>(null),
    [deleting, setDeleting] = useState<Patient | null>(null);
  const q = useDebounced(search);
  const metadata = useQuery({
    queryKey: ['meta'],
    queryFn: () => api<{ data: Metadata }>('/meta'),
  });
  const filters = {
    q,
    condition,
    status,
    doctorId: doctorId || selectedDoctor,
    from,
    to,
    page,
    limit: 8,
  };
  const query = useQuery({
    queryKey: ['patients', filters],
    queryFn: () =>
      api<ListResponse<Patient>>(
        `${doctorId ? `/doctors/${doctorId}/patients` : '/patients'}?${queryString(filters)}`,
      ),
    placeholderData: keepPreviousData,
  });
  useEffect(() => {
    if (query.data && !query.isPlaceholderData && !query.isFetching) {
      const last = Math.max(1, query.data.pagination.totalPages);
      if (page > last) setPage(last);
    }
  }, [query.data, query.isPlaceholderData, query.isFetching, page]);
  const update = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };
  const active = Boolean(search || condition || status || selectedDoctor || from || to);
  const clear = () => {
    setSearch('');
    setCondition('');
    setStatus('');
    setSelectedDoctor('');
    setFrom('');
    setTo('');
    setPage(1);
  };
  return (
    <>
      {!doctorId && (
        <>
          <div className="page-heading">
            <div>
              <span className="eyebrow">PEOPLE AT THE HEART OF CARE</span>
              <h1>
                Patients<span className="heading-dot">.</span>
              </h1>
              <p>Every patient. Every detail. Beautifully organized.</p>
            </div>
            <button className="button button-primary" onClick={() => setAdding(true)}>
              <Plus size={18} />
              Add patient
            </button>
          </div>
          <div className="directory-overview">
            <div className="overview-icon overview-violet">
              <Users size={22} />
            </div>
            <div>
              <strong>
                {query.data?.pagination.total ?? '—'}{' '}
                <span>{active ? 'matching patients' : 'patient records'}</span>
              </strong>
              <p>Your care community, connected.</p>
            </div>
            <span className="overview-label">
              <span className="tiny-dot" />
              Patient-first workspace
            </span>
          </div>
        </>
      )}
      <section
        className="panel directory-panel"
        aria-label={doctorId ? 'Assigned patients' : 'Patient directory'}
      >
        <div className="panel-header">
          <div>
            <h2>{doctorId ? 'Assigned patients' : 'Patient directory'}</h2>
            <p>
              {doctorId
                ? 'Manage the people in this doctor’s care.'
                : 'Keep care details accurate and accessible.'}
            </p>
          </div>
          <div className="panel-header-actions">
            {query.isFetching && <Spinner label="Updating" />}
            {doctorId && (
              <button
                className="button button-primary button-small"
                onClick={() => setAdding(true)}
              >
                <Plus size={16} />
                Add patient
              </button>
            )}
          </div>
        </div>
        <FilterToolbar
          searchLabel="Search patients"
          search={search}
          onSearch={update(setSearch)}
          active={active}
          onClear={clear}
          from={from}
          to={to}
          onFrom={update(setFrom)}
          onTo={update(setTo)}
        >
          <SelectFilter
            label="Condition"
            value={condition}
            onChange={update(setCondition)}
            options={(metadata.data?.data.conditions || []).map((value) => ({
              value,
              label: value,
            }))}
          />
          <SelectFilter
            label="Status"
            value={status}
            onChange={update(setStatus)}
            options={['Active', 'Recovered', 'Critical'].map((value) => ({ value, label: value }))}
          />
          {!doctorId && (
            <SelectFilter
              label="Doctor"
              value={selectedDoctor}
              onChange={update(setSelectedDoctor)}
              options={(metadata.data?.data.doctors || []).map((doctor) => ({
                value: doctor.id,
                label: doctor.name,
              }))}
            />
          )}
        </FilterToolbar>
        {query.isError ? (
          <ErrorState error={query.error} retry={() => query.refetch()} />
        ) : query.isPending ? (
          <div className="table-loading">
            <Spinner label="Loading patients…" />
          </div>
        ) : query.data.data.length === 0 ? (
          <EmptyState
            title={active ? 'No matching patients' : 'No patients yet'}
            description={
              active
                ? 'Try another search or adjust your filters.'
                : 'Add a patient to start building their care record.'
            }
            action={
              <button
                className="button button-secondary"
                onClick={active ? clear : () => setAdding(true)}
              >
                {active ? 'Clear filters' : 'Add patient'}
              </button>
            }
          />
        ) : (
          <div className="table-scroll">
            <table className="data-table patient-table">
              <thead>
                <tr>
                  <th scope="col">Patient</th>
                  <th scope="col">Condition</th>
                  {!doctorId && <th scope="col">Doctor</th>}
                  <th scope="col">Status</th>
                  <th scope="col">Registered</th>
                  <th scope="col" className="actions-heading">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {query.data.data.map((patient, index) => (
                  <tr key={patient.id}>
                    <td>
                      <div className="person-cell">
                        <Avatar name={patient.name} tone={index + 1} />
                        <div>
                          <span className="person-name">{patient.name}</span>
                          <span className="cell-secondary">
                            {patient.age} years <span className="inline-dot">·</span>{' '}
                            {patient.gender}
                          </span>
                          <a href={`tel:${patient.phone}`} className="cell-phone">
                            {patient.phone}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="condition-text">{patient.condition}</span>
                    </td>
                    {!doctorId && (
                      <td>
                        <Link className="doctor-cell-link" href={`/doctors/${patient.doctorId}`}>
                          {patient.doctor?.name || 'Assigned doctor'}
                        </Link>
                        <span className="cell-secondary">{patient.doctor?.specialization}</span>
                      </td>
                    )}
                    <td>
                      <StatusBadge status={patient.status} />
                    </td>
                    <td>
                      <span className="table-date">{shortDate(patient.createdAt)}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="table-action"
                          onClick={() => setEditing(patient)}
                          aria-label={`Edit ${patient.name}`}
                          title={`Edit ${patient.name}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="table-action table-action-danger"
                          onClick={() => setDeleting(patient)}
                          aria-label={`Delete ${patient.name}`}
                          title={`Delete ${patient.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {query.data && <PaginationControls pagination={query.data.pagination} onPage={setPage} />}
      </section>
      {adding && <PatientForm doctorId={doctorId} onClose={() => setAdding(false)} />}{' '}
      {editing && (
        <PatientForm patient={editing} doctorId={doctorId} onClose={() => setEditing(null)} />
      )}{' '}
      {deleting && <DeletePatientDialog patient={deleting} onClose={() => setDeleting(null)} />}
    </>
  );
}
