import { DoctorDetails } from '@/components/doctor-details';
export default async function DoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DoctorDetails id={id} />;
}
