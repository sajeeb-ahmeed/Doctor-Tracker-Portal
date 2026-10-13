'use client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowUpRight, Building2, Mail, Plus, Stethoscope, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, queryString } from '@/lib/api';
import { useDebounced } from '@/lib/hooks';
import { shortDate } from '@/lib/utils';
import type { Doctor, ListResponse, Metadata } from '@/lib/types';
import { DoctorForm } from './forms';
import { Avatar, EmptyState, ErrorState, PaginationControls, Spinner } from './ui';
import { FilterToolbar, SelectFilter } from './filters';

export function DoctorsDirectory() {
  const [search, setSearch] = useState(''),
    [specialization, setSpecialization] = useState(''),
    [hospital, setHospital] = useState(''),
    [from, setFrom] = useState(''),
    [to, setTo] = useState(''),
    [page, setPage] = useState(1),
    [adding, setAdding] = useState(false);
  const q = useDebounced(search);
  const metadata = useQuery({
    queryKey: ['meta'],
    queryFn: () => api<{ data: Metadata }>('/meta'),
  });
  const filters = { q, specialization, hospital, from, to, page, limit: 8 };
  const query = useQuery({
    queryKey: ['doctors', filters],
    queryFn: () => api<ListResponse<Doctor>>(`/doctors?${queryString(filters)}`),
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
  const active = Boolean(search || specialization || hospital || from || to);
  const clear = () => {
    setSearch('');
    setSpecialization('');
    setHospital('');
    setFrom('');
    setTo('');
    setPage(1);
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR CARE NETWORK</span>
          <h1>
            Doctors<span className="heading-dot">.</span>
          </h1>
          <p>A connected team. Exceptional care.</p>
        </div>
        <button className="button button-primary" onClick={() => setAdding(true)}>
          <Plus size={18} />
          Add doctor
        </button>
      </div>
      <div className="directory-overview">
        <div className="overview-icon">
          <Stethoscope size={22} />
        </div>
        <div>
          <strong>
            {query.data?.pagination.total ?? '—'}{' '}
            <span>{active ? 'matching doctors' : 'doctors in your network'}</span>
          </strong>
          <p>Every specialist, one clear view.</p>
        </div>
        <span className="overview-label">
          <ShieldSymbol />
          Connected care team
        </span>
      </div>
      <section className="panel directory-panel" aria-label="Doctor directory">
        <div className="panel-header">
          <div>
            <h2>Doctor directory</h2>
            <p>Manage your specialists and their patient lists.</p>
          </div>
          {query.isFetching && <Spinner label="Updating" />}
        </div>
        <FilterToolbar
          searchLabel="Search doctors"
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
            label="Specialization"
            value={specialization}
            onChange={update(setSpecialization)}
            options={(metadata.data?.data.specializations || []).map((value) => ({
              value,
              label: value,
            }))}
          />
          <SelectFilter
            label="Hospital"
            value={hospital}
            onChange={update(setHospital)}
            options={(metadata.data?.data.hospitals || []).map((value) => ({
              value,
              label: value,
            }))}
          />
        </FilterToolbar>
        {query.isError ? (
          <ErrorState error={query.error} retry={() => query.refetch()} />
        ) : query.isPending ? (
          <div className="table-loading">
            <Spinner label="Loading doctors…" />
          </div>
        ) : query.data.data.length === 0 ? (
          <EmptyState
            title={active ? 'No matching doctors' : 'Your care team starts here'}
            description={
              active
                ? 'Try another search or clear your filters.'
                : 'Add your first doctor to begin connecting patients with care.'
            }
            action={
              <button
                className="button button-secondary"
                onClick={active ? clear : () => setAdding(true)}
              >
                {active ? 'Clear filters' : 'Add doctor'}
              </button>
            }
          />
        ) : (
          <div className="table-scroll">
            <table className="data-table doctor-table">
              <thead>
                <tr>
                  <th scope="col">Doctor</th>
                  <th scope="col">Specialization</th>
                  <th scope="col">Hospital & contact</th>
                  <th scope="col">Patients</th>
                  <th scope="col">Registered</th>
                  <th scope="col">
                    <span className="sr-only">View details</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {query.data.data.map((doctor, index) => (
                  <tr key={doctor.id}>
                    <td>
                      <div className="person-cell">
                        <Avatar name={doctor.name} tone={index} />
                        <div>
                          <Link className="person-name" href={`/doctors/${doctor.id}`}>
                            {doctor.name}
                          </Link>
                          <a className="cell-secondary" href={`mailto:${doctor.email}`}>
                            <Mail size={11} />
                            {doctor.email}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="specialty-tag">{doctor.specialization}</span>
                    </td>
                    <td>
                      <span className="hospital-cell">
                        <Building2 size={13} />
                        {doctor.hospital}
                      </span>
                      <a className="cell-secondary" href={`tel:${doctor.phone}`}>
                        {doctor.phone}
                      </a>
                    </td>
                    <td>
                      <span className="patient-count">
                        <Users size={14} />
                        {doctor.patientCount}
                      </span>
                    </td>
                    <td>
                      <span className="table-date">{shortDate(doctor.createdAt)}</span>
                    </td>
                    <td>
                      <Link
                        className="table-action"
                        href={`/doctors/${doctor.id}`}
                        aria-label={`View ${doctor.name}`}
                      >
                        <ArrowUpRight size={19} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {query.data && <PaginationControls pagination={query.data.pagination} onPage={setPage} />}
      </section>
      {adding && <DoctorForm onClose={() => setAdding(false)} />}
    </>
  );
}
function ShieldSymbol() {
  return <span className="tiny-dot" />;
}
