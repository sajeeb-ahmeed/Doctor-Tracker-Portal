'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Building2,
  HeartPulse,
  Plus,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, queryString } from '@/lib/api';
import type { Dashboard } from '@/lib/types';
import { number, shortDate } from '@/lib/utils';
import { Avatar, EmptyState, ErrorState, PageLoading, StatusBadge } from './ui';
import { DateFilters } from './filters';
import { PatientForm } from './forms';

const colors = ['#266cba', '#21a096', '#7686d0', '#d9a461', '#73a4c7', '#9ba8bb'];
export function DashboardView() {
  const [from, setFrom] = useState(''),
    [to, setTo] = useState(''),
    [adding, setAdding] = useState(false);
  const query = useQuery({
    queryKey: ['dashboard', { from, to }],
    queryFn: () => api<{ data: Dashboard }>(`/dashboard?${queryString({ from, to })}`),
  });
  return (
    <>
      <div className="page-heading dashboard-heading">
        <div>
          <span className="eyebrow">A HEALTHIER PERSPECTIVE</span>
          <h1>
            Care at a glance<span className="heading-dot">.</span>
          </h1>
          <p>The people and insights that keep your practice moving.</p>
        </div>
        <button className="button button-primary" onClick={() => setAdding(true)}>
          <Plus size={18} />
          Add patient
        </button>
      </div>
      <div className="dashboard-date-bar">
        <span>
          <span className="tiny-dot" />
          Registration insights <small>UTC</small>
        </span>
        <div>
          <DateFilters from={from} to={to} onFrom={setFrom} onTo={setTo} />
          {(from || to) && (
            <button
              className="icon-button"
              aria-label="Clear date filters"
              onClick={() => {
                setFrom('');
                setTo('');
              }}
            >
              <X size={17} />
            </button>
          )}
        </div>
      </div>
      {query.isPending ? (
        <PageLoading />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => query.refetch()} />
      ) : (
        <DashboardContent data={query.data.data} filtered={Boolean(from || to)} />
      )}{' '}
      {adding && <PatientForm onClose={() => setAdding(false)} />}
    </>
  );
}
function DashboardContent({ data, filtered }: { data: Dashboard; filtered: boolean }) {
  const doctors = [...data.patientsPerDoctor].sort((a, b) => b.patients - a.patients).slice(0, 5);
  const maxPatients = Math.max(...doctors.map((doctor) => doctor.patients), 1);
  const conditionData = data.conditions.slice(0, 5);
  const otherCount = data.conditions.slice(5).reduce((sum, item) => sum + item.patients, 0);
  if (otherCount) conditionData.push({ condition: 'Other conditions', patients: otherCount });
  const conditionTotal = conditionData.reduce((sum, item) => sum + item.patients, 0);
  const cards = [
    {
      label: 'Total doctors',
      value: data.totals.doctors,
      caption: 'Specialists in your network',
      icon: Stethoscope,
      className: 'teal',
      href: '/doctors',
      testId: 'metric-doctors',
    },
    {
      label: 'Total patients',
      value: data.totals.patients,
      caption: 'People in your care community',
      icon: Users,
      className: 'violet',
      href: '/patients',
      testId: 'metric-patients',
    },
    {
      label: 'Active patients',
      value: data.totals.activePatients,
      caption: 'Active and critical patient records',
      icon: HeartPulse,
      className: 'peach',
      href: '/patients',
      testId: 'metric-active',
    },
    {
      label: 'Hospitals',
      value: data.totals.hospitals,
      caption: 'Across your doctor network',
      icon: Building2,
      className: 'blue',
      href: '/doctors',
      testId: 'metric-hospitals',
    },
  ];
  return (
    <>
      <section className="care-hero">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <span />
            CONNECTED CARE, CLEARER INSIGHTS
          </span>
          <h2>
            Your care network.
            <br />
            <span>A little more in focus.</span>
          </h2>
          <p>
            Behind every record is a person.
            <br />
            Keep your team connected and your care moving forward.
          </p>
          <Link href="/doctors" className="hero-link">
            Explore your care team
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-grid" />
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <div className="hero-orbit hero-orbit-three" />
          <div className="hero-heart">
            <HeartPulse size={67} strokeWidth={1.5} />
          </div>
          <div className="hero-orbit-bubble bubble-one">
            <Stethoscope size={19} />
          </div>
          <div className="hero-orbit-bubble bubble-two">
            <Users size={18} />
          </div>
          <span className="hero-node hero-node-one" />
          <span className="hero-node hero-node-two" />
          <span className="hero-node hero-node-three" />
          <div className="hero-art-caption">
            <span />
            HUMAN-CENTERED. CONNECTED.
          </div>
        </div>
      </section>
      <section className="metric-grid" aria-label="Workspace statistics">
        {cards.map(({ label, value, caption, icon: Icon, className, href, testId }) => (
          <Link className={`metric-card metric-${className}`} href={href} key={label}>
            <div className="metric-top">
              <span className="metric-icon">
                <Icon size={21} />
              </span>
              <ArrowUpRight size={17} className="metric-arrow" />
            </div>
            <div className="metric-label">{label}</div>
            <strong className="metric-value" data-testid={testId}>
              {number(value)}
            </strong>
            <span className="metric-caption">
              {filtered ? 'In the selected registration period' : caption}
            </span>
          </Link>
        ))}
      </section>
      <div className="dashboard-grid">
        <section className="panel registrations-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">YOUR NETWORK OVER TIME</span>
              <h2>Care is growing.</h2>
              <p>New patient and doctor registrations</p>
            </div>
            <div className="chart-legend">
              <span>
                <i className="legend-teal" />
                Patients
              </span>
              <span>
                <i className="legend-violet" />
                Doctors
              </span>
            </div>
          </div>
          {data.registrations.length ? (
            <>
              <div
                className="chart-area"
                role="img"
                aria-label="Patient and doctor registration chart. Registration dates are in UTC."
              >
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart
                    data={data.registrations}
                    margin={{ top: 12, right: 14, left: -22, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="patientGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#266cba" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#266cba" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="doctorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#21a096" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#21a096" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#e4eaf3" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64758c', fontSize: 11 }}
                      minTickGap={35}
                      dy={8}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64758c', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        border: '1px solid #dce7f3',
                        borderRadius: 12,
                        fontSize: 12,
                        boxShadow: '0 10px 30px #172d501a',
                      }}
                    />
                    <Area
                      isAnimationActive={false}
                      type="monotone"
                      dataKey="patients"
                      name="Patients"
                      stroke="#266cba"
                      strokeWidth={2.5}
                      fill="url(#patientGradient)"
                      activeDot={{ r: 5, strokeWidth: 3, stroke: '#fff' }}
                    />
                    <Area
                      isAnimationActive={false}
                      type="monotone"
                      dataKey="doctors"
                      name="Doctors"
                      stroke="#21a096"
                      strokeWidth={2}
                      fill="url(#doctorGradient)"
                      activeDot={{ r: 4, strokeWidth: 3, stroke: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="chart-footnote">
                <Activity size={13} />
                Registrations grouped by date in UTC<span>Counts reflect the selected period</span>
              </p>
            </>
          ) : (
            <EmptyState
              title="A fresh start"
              description="Registration trends will appear as your care network grows."
            />
          )}
        </section>
        <section className="panel doctors-distribution">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">A CONNECTED CARE TEAM</span>
              <h2>Patients per doctor</h2>
              <p>Top doctors by assigned patient count</p>
            </div>
            <span className="subtle-icon">
              <Stethoscope size={20} />
            </span>
          </div>
          {doctors.length ? (
            <div className="doctor-distribution-list">
              {doctors.map((doctor, index) => (
                <Link
                  href={`/doctors/${doctor.doctorId}`}
                  className="doctor-distribution-row"
                  key={doctor.doctorId}
                >
                  <Avatar name={doctor.name} tone={index} />
                  <div className="distribution-main">
                    <div>
                      <strong>{doctor.name}</strong>
                      <b>{number(doctor.patients)}</b>
                    </div>
                    <small>{doctor.specialization}</small>
                    <div className="distribution-track">
                      <span
                        style={{
                          width: `${(doctor.patients / maxPatients) * 100}%`,
                          background: colors[index % colors.length],
                        }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Your team starts here"
              description="Add doctors to see patient assignments."
            />
          )}
          <Link href="/doctors" className="panel-bottom-link">
            View all doctors
            <ArrowRight size={15} />
          </Link>
        </section>
        <section className="panel recent-patients">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">THE PEOPLE BEHIND THE NUMBERS</span>
              <h2>Recently registered patients</h2>
              <p>New additions to your care community</p>
            </div>
            <Link href="/patients" className="text-button">
              View all
              <ArrowUpRight size={15} />
            </Link>
          </div>
          {data.recentPatients.length ? (
            <div className="table-scroll">
              <table className="data-table recent-table">
                <thead>
                  <tr>
                    <th scope="col">Patient</th>
                    <th scope="col">Condition</th>
                    <th scope="col">Status</th>
                    <th scope="col">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPatients.slice(0, 5).map((patient, index) => (
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
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="condition-text">{patient.condition}</span>
                      </td>
                      <td>
                        <StatusBadge status={patient.status} />
                      </td>
                      <td>
                        <span className="table-date">{shortDate(patient.createdAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Ready for your first patient"
              description="Patient records will appear here after registration."
            />
          )}
        </section>
        <section className="panel condition-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">UNDERSTAND YOUR COMMUNITY</span>
              <h2>Care distribution</h2>
              <p>Patient records by condition</p>
            </div>
          </div>
          {conditionTotal > 0 ? (
            <>
              <div
                className="condition-chart"
                role="img"
                aria-label={`${conditionTotal} patient records distributed across medical conditions.`}
              >
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      isAnimationActive={false}
                      data={conditionData}
                      dataKey="patients"
                      nameKey="condition"
                      innerRadius={67}
                      outerRadius={88}
                      paddingAngle={4}
                      cornerRadius={5}
                      stroke="none"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {conditionData.map((item, index) => (
                        <Cell key={item.condition} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ border: '1px solid #dce7f3', borderRadius: 12, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center">
                  <strong>{number(conditionTotal)}</strong>
                  <span>patient records</span>
                </div>
              </div>
              <div className="conditions-legend">
                {conditionData.map((item, index) => (
                  <div key={item.condition}>
                    <span>
                      <i style={{ background: colors[index % colors.length] }} />
                      {item.condition}
                    </span>
                    <strong>{number(item.patients)}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="Insights begin with people"
              description="Conditions will appear when patients are added."
            />
          )}
        </section>
      </div>
    </>
  );
}
