'use client';
import Link from 'next/link';
import { initDB } from './db';
import { useEffect } from 'react';

function HeHaIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M200-200v-560 560Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v100h-80v-100H200v560h560v-100h80v100q0 33-23.5 56.5T760-120H200Zm320-160q-33 0-56.5-23.5T440-360v-240q0-33 23.5-56.5T520-680h280q33 0 56.5 23.5T880-600v240q0 33-23.5 56.5T800-280H520Zm280-80v-240H520v240h280Zm-160-60q25 0 42.5-17.5T700-480q0-25-17.5-42.5T640-540q-25 0-42.5 17.5T580-480q0 25 17.5 42.5T640-420Z" />
    </svg>
  );
}

export default function Home() {
  useEffect(() => {
    initDB();
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-background">
      <main className="flex flex-col gap-10 row-start-2 items-center text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          Control your cash, conquer your goals
        </h1>
        <p className="text-muted-foreground max-w-md text-base sm:text-lg">
          Track budgets, manage categories, and plan with simple calculators—all in one place.
        </p>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            className="group rounded-xl border border-border bg-card text-card-foreground gap-2 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all flex items-center justify-center text-sm sm:text-base h-11 sm:h-12 px-5 sm:px-6 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            href="/login"
            rel="noopener noreferrer"
          >
            <HeHaIcon className="w-5 h-5 shrink-0 opacity-90 group-hover:opacity-100" />
            Start Budgeting
          </Link>
        </div>
      </main>
    </div>
  );
}
