'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Building2, CalendarDays, Mail, Phone, Stethoscope, Users } from 'lucide-react';
import { api } from '@/lib/api';
import type { Doctor } from '@/lib/types';
import { shortDate } from '@/lib/utils';
import { Avatar, ErrorState, PageLoading } from './ui';
import { PatientsDirectory } from './patients-directory';
export function DoctorDetails({ id }: { id: string }) {
  const query = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => api<{ data: Doctor }>(`/doctors/${id}`),
  });
  if (query.isPending) return <PageLoading />;
  if (query.isError)
    return (
      <>
        <Link className="back-link" href="/doctors">
          <ArrowLeft size={16} />
          Back to doctors
        </Link>
        <ErrorState error={query.error} retry={() => query.refetch()} />
      </>
    );
  const doctor = query.data.data;
  return (
    <>
      <Link className="back-link" href="/doctors">
        <ArrowLeft size={16} />
        Back to doctors
      </Link>
      <div className="page-heading detail-heading">
        <div>
          <span className="eyebrow">DOCTOR PROFILE</span>
          <h1>
            Your specialist.
            <br className="mobile-only" /> Their care community.
          </h1>
          <p>A clear view of this doctor and their assigned patients.</p>
        </div>
      </div>
      <section className="doctor-profile panel">
        <div className="profile-main">
          <Avatar name={doctor.name} size="large" />
          <div>
            <span className="profile-caption">
              <Stethoscope size={14} />
              CARE TEAM MEMBER
            </span>
            <h2>{doctor.name}</h2>
            <span className="specialty-tag">{doctor.specialization}</span>
          </div>
        </div>
        <div className="profile-contact">
          <span>
            <Building2 size={16} />
            {doctor.hospital}
          </span>
          <a href={`mailto:${doctor.email}`}>
            <Mail size={16} />
            {doctor.email}
          </a>
          <a href={`tel:${doctor.phone}`}>
            <Phone size={16} />
            {doctor.phone}
          </a>
          <span>
            <CalendarDays size={16} />
            Joined {shortDate(doctor.createdAt)}
          </span>
        </div>
        <div className="profile-patients">
          <span>
            <Users size={21} />
          </span>
          <strong>{doctor.patientCount}</strong>
          <p>Assigned patients</p>
          <small>Care, connected.</small>
        </div>
      </section>
      <PatientsDirectory doctorId={id} />
    </>
  );
}
