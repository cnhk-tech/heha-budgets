'use client';

import { useState, useRef, useEffect } from 'react';

type Props = {
  selectedYear: number;
  onYearChange: (year: number) => void;
};

const PastFiveYearsDropdown = ({ selectedYear, onYearChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectYear = (year: number) => {
    onYearChange(year);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div className="flex flex-col gap-1">
        <label htmlFor="year-dropdown" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          View year
        </label>
        <button
          id="year-dropdown"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center justify-between gap-2 min-w-[140px] rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-card/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Choose a year to view budgets"
        >
          <span>{selectedYear}</span>
          <svg
            className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <p className="text-xs text-muted-foreground">
          Choose a year to view or edit monthly budgets
        </p>
      </div>

      {isOpen && (
        <div
          className="absolute left-0 z-20 mt-2 w-full min-w-[140px] rounded-xl border border-border bg-card py-1 shadow-lg focus:outline-none"
          role="listbox"
          aria-label="Year options"
        >
          {years.map((year) => (
            <button
              key={year}
              type="button"
              role="option"
              aria-selected={year === selectedYear}
              onClick={() => handleSelectYear(year)}
              className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                year === selectedYear
                  ? 'bg-accent/15 text-accent font-medium'
                  : 'text-foreground hover:bg-border/50'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastFiveYearsDropdown;
