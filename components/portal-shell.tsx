'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  ArrowUpRight,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Admin } from '@/lib/types';
import { Avatar } from './ui';
import { useToast } from './providers';
const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/patients', label: 'Patients', icon: Users },
];
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand ${light ? 'brand-light' : ''}`}>
      <span className="brand-symbol">
        <HeartPulse size={24} strokeWidth={2.3} />
      </span>
      <span>
        Doctor<span className="brand-weight">Tracker</span>
        <small>CARE, CONNECTED.</small>
      </span>
    </span>
  );
}
export function PortalShell({ admin, children }: { admin: Admin; children: React.ReactNode }) {
  const path = usePathname(),
    router = useRouter(),
    client = useQueryClient(),
    toast = useToast();
  const [pending, setPending] = useState(false);
  const current = links.find((link) => path.startsWith(link.href))?.label || 'Workspace';
  async function logout() {
    setPending(true);
    try {
      await api('/auth/logout', { method: 'POST' });
      client.clear();
      router.replace('/login');
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to sign out.', 'error');
      setPending(false);
    }
  }
  return (
    <div className="portal">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link href="/dashboard" className="brand-link" aria-label="DoctorTracker home">
          <Brand light />
        </Link>
        <div className="workspace-tag">
          <span className="workspace-dot" />
          ADMIN WORKSPACE
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <span className="nav-caption">WORKSPACE</span>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${path.startsWith(href) ? 'active' : ''}`}
              aria-current={path.startsWith(href) ? 'page' : undefined}
            >
              <Icon size={20} />
              <span>{label}</span>
              {path.startsWith(href) && <span className="nav-active-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-care">
          <span className="care-line" />
          <div className="care-orbit">
            <Activity size={22} />
          </div>
          <h3>
            Better care.
            <br />
            Beautifully connected.
          </h3>
          <p>
            A clear view of the people
            <br />
            at the heart of your practice.
          </p>
        </div>
        <div className="sidebar-bottom">
          <ShieldCheck size={16} />
          <span>Secure care workspace</span>
          <span className="secure-dot" />
        </div>
      </aside>
      <div className="portal-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{current}</strong>
          </div>
          <div className="topbar-right">
            <span className="system-status">
              <span />
              Admin session active
            </span>
            <div className="topbar-divider" />
            <Avatar name={admin.name} />
            <div className="user-meta">
              <strong>{admin.name}</strong>
              <small>Administrator</small>
            </div>
            <button
              className="icon-button logout-button"
              aria-label="Sign out"
              title="Sign out"
              disabled={pending}
              onClick={logout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {children}
        </main>
        <footer className="portal-footer">
          <span>
            DoctorTracker <span className="footer-dot">·</span> Care, connected.
          </span>
          <span>
            <ShieldCheck size={13} /> Protected admin environment
          </span>
        </footer>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={path.startsWith(href) ? 'active' : ''}
            aria-current={path.startsWith(href) ? 'page' : undefined}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
