'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Eye,
  EyeOff,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Brand } from '@/components/portal-shell';
import { Field, FormError, Spinner } from '@/components/ui';
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [show, setShow] = useState(false),
    [error, setError] = useState(''),
    [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      router.replace('/dashboard');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to sign in.');
      setPending(false);
    }
  }
  return (
    <main className="login-page">
      <section className="login-story">
        <Brand light />
        <div className="login-story-body">
          <span className="login-kicker">
            <span />
            THE NEXT CHAPTER OF CARE
          </span>
          <h1>
            A healthier
            <br />
            perspective.
          </h1>
          <p>
            Your people. Your practice. One beautifully
            <br className="desktop-break" /> connected workspace.
          </p>
          <div className="login-visual" aria-hidden="true">
            <div className="visual-grid" />
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="visual-orbit orbit-three" />
            <div className="visual-heart">
              <HeartPulse size={76} strokeWidth={1.3} />
            </div>
            <div className="visual-float float-doctors">
              <span>
                <Stethoscope size={19} />
              </span>
              <div>
                <strong>Care teams</strong>
                <small>Connected with purpose</small>
              </div>
            </div>
            <div className="visual-float float-patients">
              <span>
                <Users size={19} />
              </span>
              <div>
                <strong>Patient-first</strong>
                <small>Every detail matters</small>
              </div>
            </div>
            <span className="orbital-dot dot-one" />
            <span className="orbital-dot dot-two" />
            <span className="orbital-dot dot-three" />
          </div>
        </div>
        <div className="login-story-footer">
          <ShieldCheck size={16} />
          <span>Thoughtful technology. Human-centered care.</span>
        </div>
      </section>
      <section className="login-form-side">
        <div className="login-mobile-brand">
          <Brand />
        </div>
        <div className="login-form-wrap">
          <span className="login-icon">
            <LockKeyhole size={23} />
          </span>
          <span className="eyebrow">YOUR CARE WORKSPACE</span>
          <h2>Welcome back.</h2>
          <p className="login-intro">Sign in to keep exceptional care moving.</p>
          <form onSubmit={submit} className="login-form">
            <Field label="Email address" htmlFor="login-email">
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@yourpractice.com"
                disabled={pending}
              />
            </Field>
            <Field label="Password" htmlFor="login-password">
              <div className="password-field">
                <input
                  id="login-password"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  disabled={pending}
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={show ? 'Hide password' : 'Show password'}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
            <FormError message={error} />
            <button className="button button-primary login-submit" type="submit" disabled={pending}>
              {pending ? (
                <Spinner label="Signing in…" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          {process.env.NODE_ENV !== 'production' && (
            <div className="demo-card">
              <span className="demo-heading">
                <Sparkles size={15} />
                Explore the demo
              </span>
              <p>Use the seeded administrator account.</p>
              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>admin@doctortracker.demo</dd>
                </div>
                <div>
                  <dt>Password</dt>
                  <dd>DoctorDemo!2030</dd>
                </div>
              </dl>
              <button
                type="button"
                className="text-button"
                disabled={pending}
                onClick={() => {
                  setEmail('admin@doctortracker.demo');
                  setPassword('DoctorDemo!2030');
                }}
              >
                Use demo credentials
                <ArrowRight size={14} />
              </button>
            </div>
          )}
          <div className="login-secure">
            <ShieldCheck size={14} />
            <span>Secure access for authorized administrators</span>
          </div>
        </div>
        <span className="login-copyright">
          © {new Date().getFullYear()} DoctorTracker. Care, connected.
        </span>
      </section>
    </main>
  );
}
