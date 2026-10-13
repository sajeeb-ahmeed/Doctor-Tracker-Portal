import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="not-found">
      <span className="eyebrow">DOCTORTRACKER</span>
      <h1>That page isn’t here.</h1>
      <p>Let’s get you back to your care workspace.</p>
      <Link className="button button-primary" href="/dashboard">
        Go to dashboard
      </Link>
    </main>
  );
}
