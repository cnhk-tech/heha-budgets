'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProvider, useUser } from '@/app/contexts/UserContext';
import { CURRENCIES, type CurrencyCode } from '@/app/contexts/CurrencyContext';
import { findUserByName } from '@/app/db';

function LoginFormInner() {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const router = useRouter();
  const { login } = useUser();

  useEffect(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      setIsNewUser(null);
      return;
    }
    const t = setTimeout(() => {
      findUserByName(trimmed).then((existing) => {
        setIsNewUser(!existing);
      });
    }, 400);
    return () => clearTimeout(t);
  }, [name]);

  const handleLogin = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    try {
      await login(trimmed, isNewUser === true ? currency : undefined);
      router.replace('/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showCurrency = name.trim() !== '' && isNewUser === true;

  return (
    <div className="w-full max-w-sm p-6 md:p-8 bg-card text-card-foreground rounded-2xl shadow-xl border border-border">
      <p className="text-lg font-semibold text-center md:text-2xl text-foreground">
        One step more to get into our App!
      </p>
      <div className="py-5 space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2 text-foreground">
            Your name
          </label>
          <input
            type="text"
            id="username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
            placeholder="Enter your name"
            autoComplete="username"
          />
        </div>
        {showCurrency && (
          <div>
            <label htmlFor="login-currency" className="block text-sm font-medium mb-2 text-foreground">
              Currency
            </label>
            <select
              id="login-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23737373'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundSize: '1.25rem 1.25rem',
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                paddingRight: '2.5rem',
              }}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <button
        onClick={handleLogin}
        disabled={!name.trim() || isSubmitting}
        className={`w-full py-3 px-4 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card ${
          name.trim() && !isSubmitting
            ? 'bg-accent text-accent-foreground hover:opacity-90 active:scale-[0.98]'
            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
        }`}
      >
        {isSubmitting ? 'Signing in…' : 'Login'}
      </button>
    </div>
  );
}

export default function LoginForm() {
  return (
    <UserProvider>
      <LoginFormInner />
    </UserProvider>
  );
}