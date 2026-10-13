import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PortalShell } from '@/components/portal-shell';
import type { Admin } from '@/lib/types';
export const dynamic = 'force-dynamic';
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const backendUrl = (process.env.BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
  let admin: Admin | undefined;
  try {
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      headers: { Cookie: cookieStore.toString() },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (response.ok) {
      const result = await response.json();
      admin = result.data;
    }
  } catch {
    /* Login provides a useful connection error if the service is offline. */
  }
  if (!admin) redirect('/login');
  return <PortalShell admin={admin}>{children}</PortalShell>;
}
