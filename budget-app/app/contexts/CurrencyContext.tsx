'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { useUser } from './UserContext';

export const CURRENCIES = [
  { code: 'USD', label: 'US Dollar', locale: 'en-US' },
  { code: 'INR', label: 'Indian Rupee', locale: 'en-IN' },
  { code: 'EUR', label: 'Euro', locale: 'de-DE' },
  { code: 'GBP', label: 'British Pound', locale: 'en-GB' },
  { code: 'CAD', label: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', label: 'Australian Dollar', locale: 'en-AU' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

function getLocaleForCurrency(code: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === code)?.locale ?? 'en-US';
}

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatCurrency: (amount: number) => string;
  currencySymbol: string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useUser();
  const currency = (user?.currency && CURRENCIES.some((c) => c.code === user.currency))
    ? (user.currency as CurrencyCode)
    : 'USD';

  const setCurrency = useCallback(
    (code: CurrencyCode) => {
      updateUser({ currency: code });
    },
    [updateUser]
  );

  const formatCurrency = useCallback(
    (amount: number) => {
      const locale = getLocaleForCurrency(currency);
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    },
    [currency]
  );

  const currencySymbol = useMemo(() => {
    const locale = getLocaleForCurrency(currency);
    const parts = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).formatToParts(1);
    return parts.find((p) => p.type === 'currency')?.value ?? currency;
  }, [currency]);

  const value = useMemo<CurrencyContextValue>(
    () => ({ currency, setCurrency, formatCurrency, currencySymbol }),
    [currency, setCurrency, formatCurrency, currencySymbol]
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return ctx;
}
