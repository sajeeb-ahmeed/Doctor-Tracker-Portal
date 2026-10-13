'use client';
import { CalendarDays, SlidersHorizontal, X } from 'lucide-react';
import { useId } from 'react';
import { SearchField } from './ui';
export function DateFilters({
  from,
  to,
  onFrom,
  onTo,
}: {
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="date-filter-group">
      <CalendarDays size={16} aria-hidden="true" />
      <label className="sr-only" htmlFor={`${id}-from`}>
        From date
      </label>
      <input
        id={`${id}-from`}
        aria-label="From date"
        type="date"
        value={from}
        max={to || undefined}
        onChange={(e) => onFrom(e.target.value)}
      />
      <span>to</span>
      <label className="sr-only" htmlFor={`${id}-to`}>
        To date
      </label>
      <input
        id={`${id}-to`}
        aria-label="To date"
        type="date"
        value={to}
        min={from || undefined}
        onChange={(e) => onTo(e.target.value)}
      />
    </div>
  );
}
export function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="select-filter">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <select id={id} aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">
          All{' '}
          {label.toLowerCase() === 'status'
            ? 'statuses'
            : label.toLowerCase() === 'specialization'
              ? 'specializations'
              : label.toLowerCase() === 'hospital'
                ? 'hospitals'
                : label.toLowerCase() === 'doctor'
                  ? 'doctors'
                  : 'conditions'}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
export function FilterToolbar({
  searchLabel,
  search,
  onSearch,
  children,
  active,
  onClear,
  from,
  to,
  onFrom,
  onTo,
}: {
  searchLabel: string;
  search: string;
  onSearch: (value: string) => void;
  children: React.ReactNode;
  active: boolean;
  onClear: () => void;
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
}) {
  return (
    <div className="filter-toolbar">
      <div className="filter-row">
        <SearchField
          label={searchLabel}
          value={search}
          onChange={onSearch}
          placeholder={
            searchLabel === 'Search doctors'
              ? 'Search name, specialty, hospital…'
              : 'Search name, condition, phone…'
          }
        />
        <span className="filter-indicator">
          <SlidersHorizontal size={15} />
          Filter
        </span>
        {children}
      </div>
      <div className="filter-date-row">
        <span className="filter-date-caption">
          Registration date <span>UTC</span>
        </span>
        <DateFilters from={from} to={to} onFrom={onFrom} onTo={onTo} />
        {active && (
          <button className="text-button clear-filters" onClick={onClear}>
            <X size={14} />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
