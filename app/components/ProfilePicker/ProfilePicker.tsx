'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProvider, useUser } from '@/app/contexts/UserContext';
import { CURRENCIES, type CurrencyCode } from '@/app/contexts/CurrencyContext';
import { getUsers, addUser, setCurrentUserId, findUserByName } from '@/app/db';
import type { User } from '@/app/db/types';
import { AppLogo } from '@/app/components/AppLogo';

const PROFILE_COLORS = [
  'from-emerald-500 to-teal-600',
  'from-sky-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-600',
  'from-teal-500 to-emerald-600',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  }
  return name.trim().slice(0, 2).toUpperCase() || '?';
}

function getProfileColor(id: number): string {
  return PROFILE_COLORS[id % PROFILE_COLORS.length];
}

function ProfileGrid({
  users,
  onSelect,
  onAddProfile,
  isSelecting,
}: {
  users: User[];
  onSelect: (user: User) => void;
  onAddProfile: () => void;
  isSelecting: boolean;
}) {
  return (
    <div className="w-full animate-fade-in opacity-0" style={{ animationFillMode: 'forwards' }}>
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">
          Pick your budget
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-sm mx-auto">
          Choose who&apos;s tracking—each profile keeps its own categories and spending.
        </p>
      </div>
      <div className="mx-auto flex w-full max-w-5xl flex-wrap justify-center gap-4 md:gap-6">
        {users.map((user, index) => (
          <button
            key={user.id}
            type="button"
            onClick={() => onSelect(user)}
            disabled={isSelecting}
            className="group flex w-40 shrink-0 flex-col items-center gap-3 rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm hover:border-accent hover:shadow-lg hover:shadow-accent/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-44 animate-fade-in-up opacity-0"
            style={{
              animationDelay: `${index * 0.08}s`,
              animationFillMode: 'forwards',
            }}
          >
            <div
              className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-bold text-white bg-gradient-to-br shadow-lg ${getProfileColor(user.id)} group-hover:scale-110 group-hover:shadow-xl transition-transform duration-300`}
            >
              {getInitials(user.name)}
            </div>
            <span className="text-sm md:text-base font-medium text-foreground truncate w-full text-center">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground">Continue</span>
          </button>
        ))}
        <button
          type="button"
          onClick={onAddProfile}
          disabled={isSelecting}
          className="flex min-h-[140px] w-40 shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card/30 p-5 hover:border-accent hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 disabled:opacity-60 sm:min-h-[160px] sm:w-44 animate-fade-in-up opacity-0"
          style={{
            animationDelay: `${users.length * 0.08}s`,
            animationFillMode: 'forwards',
          }}
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-dashed border-muted-foreground/50 flex items-center justify-center text-muted-foreground group-hover:border-accent transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm md:text-base font-medium text-muted-foreground">Add profile</span>
          <span className="text-xs text-muted-foreground">New budget tracker</span>
        </button>
      </div>
    </div>
  );
}

function AddProfileForm({
  onDone,
  onCancel,
}: {
  onDone: (user: User) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameTaken, setNameTaken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    setNameTaken(false);
    setIsSubmitting(true);
    try {
      const existing = await findUserByName(trimmed);
      if (existing) {
        setNameTaken(true);
        setIsSubmitting(false);
        return;
      }
      const user = await addUser(trimmed, currency);
      onDone(user);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAgain = () => {
    setNameTaken(false);
    setError(null);
    setTimeout(() => document.getElementById('new-profile-name')?.focus(), 0);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-sm p-6 md:p-8 bg-card/90 backdrop-blur-sm border border-border rounded-2xl shadow-2xl animate-scale-in opacity-0" style={{ animationFillMode: 'forwards' }}>
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-foreground mb-1">Add a budget profile</h2>
          <p className="text-sm text-muted-foreground">Track spending separately—great for family or shared expenses.</p>
        </div>

        {nameTaken ? (
          <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 space-y-4 animate-fade-in">
            <p className="text-sm text-foreground font-medium">
              This name is already taken. Choose this profile from the list instead, or use a different name.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 text-sm font-medium rounded-xl bg-accent text-accent-foreground hover:opacity-90"
              >
                Back to profiles
              </button>
              <button
                type="button"
                onClick={handleEditAgain}
                className="flex-1 py-3 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-muted/50"
              >
                Edit name
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              <label htmlFor="new-profile-name" className="block text-sm font-medium text-foreground mb-1">
                Name
              </label>
              <input
                id="new-profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex, Family"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                autoComplete="name"
              />
            </div>
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
              <label htmlFor="new-profile-currency" className="block text-sm font-medium text-foreground mb-1">
                Currency
              </label>
              <select
                id="new-profile-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23737373'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundSize: '1.25rem 1.25rem',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  paddingRight: '2.5rem',
                }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400 animate-fade-in">{error}</p>
            )}
            <div className="flex gap-3 pt-2 animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className="flex-1 py-3 text-sm font-medium rounded-xl bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? 'Adding…' : 'Add & continue'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function FirstProfileForm({ onDone }: { onDone: (user: User) => void }) {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await addUser(trimmed, currency);
      onDone(user);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-6 md:p-8 bg-card/90 backdrop-blur-sm border border-border rounded-2xl shadow-2xl animate-scale-in opacity-0" style={{ animationFillMode: 'forwards' }}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 text-accent mb-4 animate-glow-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1">Start your budget journey</h2>
        <p className="text-sm text-muted-foreground">Take control of your cash. Create your first profile and set up categories in a minute.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <label htmlFor="first-profile-name" className="block text-sm font-medium text-foreground mb-1">
            Your name
          </label>
          <input
            id="first-profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
            autoComplete="name"
          />
        </div>
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
          <label htmlFor="first-profile-currency" className="block text-sm font-medium text-foreground mb-1">
            Currency
          </label>
          <select
            id="first-profile-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23737373'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundSize: '1.25rem 1.25rem',
              backgroundPosition: 'right 0.75rem center',
              backgroundRepeat: 'no-repeat',
              paddingRight: '2.5rem',
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400 animate-fade-in">{error}</p>
        )}
        <div className="animate-fade-in-up opacity-0 pt-1" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full py-3.5 text-sm font-semibold rounded-xl bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent/20"
          >
            {isSubmitting ? 'Setting up…' : 'Get started'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ProfilePickerInner() {
  const router = useRouter();
  const { refreshUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    getUsers().then((list) => {
      setUsers(list);
      setLoading(false);
    });
  }, []);

  const refreshUsers = () => {
    getUsers().then(setUsers);
  };

  const handleSelectProfile = async (user: User) => {
    setIsSelecting(true);
    try {
      await setCurrentUserId(user.id);
      await refreshUser();
      router.replace('/dashboard');
    } catch (e) {
      console.error(e);
      setIsSelecting(false);
    }
  };

  const handleProfileAdded = async (user: User) => {
    await setCurrentUserId(user.id);
    await refreshUser();
    router.replace('/dashboard');
  };

  const handleFirstProfileDone = async (user: User) => {
    await setCurrentUserId(user.id);
    await refreshUser();
    router.replace('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-6 animate-fade-in">
        <div className="relative">
          <span className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent" />
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent/30 animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <div className="text-center">
          <p className="text-foreground font-medium">Loading your profiles</p>
          <p className="text-sm text-muted-foreground mt-1">One moment…</p>
        </div>
      </div>
    );
  }

  if (users.length === 0 && !showAddForm) {
    return (
      <div className="w-full flex justify-center">
        <FirstProfileForm onDone={handleFirstProfileDone} />
      </div>
    );
  }

  if (showAddForm) {
    return (
      <AddProfileForm
        onDone={(user) => {
          setShowAddForm(false);
          refreshUsers();
          handleProfileAdded(user);
        }}
        onCancel={() => setShowAddForm(false)}
      />
    );
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-8 w-full animate-fade-in text-center opacity-0" style={{ animationFillMode: 'forwards' }}>
        <div className="mb-6 flex justify-center">
          <AppLogo size="lg" priority />
        </div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Control your cash, conquer your goals
        </p>
      </div>
      <ProfileGrid
        users={users}
        onSelect={handleSelectProfile}
        onAddProfile={() => setShowAddForm(true)}
        isSelecting={isSelecting}
      />
    </div>
  );
}

export default function ProfilePicker() {
  return (
    <UserProvider>
      <ProfilePickerInner />
    </UserProvider>
  );
}
