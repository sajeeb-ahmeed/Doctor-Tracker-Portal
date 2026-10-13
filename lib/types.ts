export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  patientCount: number;
}
export type PatientStatus = 'Active' | 'Recovered' | 'Critical';
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  condition: string;
  status: PatientStatus;
  phone: string;
  email?: string;
  doctorId: string;
  doctor: { id: string; name: string; specialization: string };
  createdAt: string;
  updatedAt: string;
}
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface ListResponse<T> {
  data: T[];
  pagination: Pagination;
}
export interface Metadata {
  specializations: string[];
  hospitals: string[];
  conditions: string[];
  doctors: { id: string; name: string; specialization: string }[];
}
export interface Dashboard {
  totals: { doctors: number; patients: number; activePatients: number; hospitals: number };
  registrations: { date: string; label: string; patients: number; doctors: number }[];
  patientsPerDoctor: { doctorId: string; name: string; specialization: string; patients: number }[];
  conditions: { condition: string; patients: number }[];
  recentPatients: Patient[];
}
