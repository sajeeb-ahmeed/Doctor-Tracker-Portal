'use client';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  Loader2,
  Search,
  X,
  Users,
  RotateCcw,
} from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Pagination } from '@/lib/types';

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span className="loading-inline" role="status">
      <Loader2 className="spin" size={18} />
      <span>{label}</span>
    </span>
  );
}
export function PageLoading() {
  return (
    <div className="page-loading" role="status">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-subtitle" />
      <div className="skeleton-grid">
        {[1, 2, 3, 4].map((i) => (
          <div className="skeleton skeleton-card" key={i} />
        ))}
      </div>
      <div className="skeleton skeleton-panel" />
      <span className="sr-only">Loading portal data</span>
    </div>
  );
}
export function ErrorState({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="state-box error-state" role="alert">
      <span className="state-icon">
        <CircleAlert size={25} />
      </span>
      <h3>We couldn’t load this data</h3>
      <p>
        {error instanceof Error ? error.message : 'Please check your connection and try again.'}
      </p>
      <button className="button button-secondary" onClick={retry}>
        <RotateCcw size={16} />
        Try again
      </button>
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="state-box">
      <span className="state-icon">
        <Users size={25} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Avatar({
  name,
  size = 'normal',
  tone = 0,
}: {
  name: string;
  size?: 'normal' | 'large';
  tone?: number;
}) {
  const parts = name.trim().split(/\s+/);
  return (
    <span className={`avatar avatar-${size} avatar-tone-${tone % 4}`} aria-hidden="true">
      {parts
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()}
    </span>
  );
}
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <span />
      {status}
    </span>
  );
}
export function SearchField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="search-field">
      <Search size={18} aria-hidden="true" />
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="search"
        placeholder={placeholder || label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className="icon-button"
          onClick={() => onChange('')}
          aria-label={`Clear ${label.toLowerCase()}`}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
export function PaginationControls({
  pagination,
  onPage,
}: {
  pagination: Pagination;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, pagination.totalPages);
  const start = pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);
  return (
    <div className="pagination">
      <p>
        Showing{' '}
        <strong>
          {start}–{end}
        </strong>{' '}
        of <strong>{pagination.total}</strong>
      </p>
      <div className="pagination-buttons">
        <button
          className="button button-secondary button-small"
          disabled={pagination.page <= 1}
          onClick={() => onPage(pagination.page - 1)}
          aria-label="Previous page"
        >
          <ArrowLeft size={16} />
        </button>
        <span>
          Page <strong>{pagination.page}</strong> of {pages}
        </span>
        <button
          className="button button-secondary button-small"
          disabled={pagination.page >= pages}
          onClick={() => onPage(pagination.page + 1)}
          aria-label="Next page"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
export function Dialog({
  title,
  subtitle,
  onClose,
  children,
  compact = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  compact?: boolean;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const scroll = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      const initial =
        dialogRef.current?.querySelector<HTMLElement>('input, select, textarea') ||
        dialogRef.current?.querySelector<HTMLElement>('button');
      initial?.focus();
    }, 0);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
      }
      if (e.key === 'Tab') {
        const items = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]',
        );
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = scroll;
      document.removeEventListener('keydown', handleKey);
      previous?.focus();
    };
  }, []);
  return createPortal(
    <div
      className="dialog-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`dialog ${compact ? 'dialog-compact' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
      >
        <div className="dialog-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog">
            <X size={21} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
export function Field({
  label,
  htmlFor,
  error,
  children,
  optional = false,
  hint,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
  hint?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>
        {label}
        {optional && <span className="optional">Optional</span>}
      </label>
      {children}
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
      {!error && hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}
export function FormError({ message }: { message?: string }) {
  return message ? (
    <div className="form-error" role="alert">
      <CircleAlert size={17} />
      <span>{message}</span>
    </div>
  ) : null;
}
export function SuccessMark() {
  return (
    <span className="success-mark">
      <Check size={15} />
    </span>
  );
}
