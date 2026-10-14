import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';
import './navy-refinements.css';
export const metadata: Metadata = {
  title: { default: 'DoctorTracker — Care, connected.', template: '%s | DoctorTracker' },
  description:
    'A secure, thoughtfully designed portal for doctors, patients, and healthcare insights.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
