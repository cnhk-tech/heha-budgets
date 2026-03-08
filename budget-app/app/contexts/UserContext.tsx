'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getCurrentUser,
  setCurrentUserId,
  addUser,
  findUserByName,
  updateUser as updateUserDb,
  type User,
} from '@/app/db/users';

type UserContextValue = {
  user: User | null;
  isLoading: boolean;
  setUser: (u: User | null) => void;
  login: (name: string, currency?: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updates: { name?: string; currency?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const u = await getCurrentUser();
    setUserState(u);
  }, []);

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((u) => {
      if (mounted) {
        setUserState(u);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (name: string, currency?: string): Promise<User> => {
    const existing = await findUserByName(name);
    const preferredCurrency = currency && /^[A-Z]{3}$/.test(currency) ? currency : 'USD';
    let target: User;
    if (existing) {
      target = existing;
      await setCurrentUserId(target.id);
      if (preferredCurrency !== existing.currency) {
        await updateUserDb(target.id, { currency: preferredCurrency });
        target = { ...target, currency: preferredCurrency };
      }
    } else {
      target = await addUser(name, preferredCurrency);
      await setCurrentUserId(target.id);
    }
    setUserState(target);
    return target;
  }, []);

  const logout = useCallback(async () => {
    await setCurrentUserId(null);
    setUserState(null);
  }, []);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
  }, []);

  const updateUser = useCallback(
    async (updates: { name?: string; currency?: string }) => {
      if (!user) return;
      await updateUserDb(user.id, updates);
      await refreshUser();
    },
    [user, refreshUser]
  );

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      isLoading,
      setUser,
      login,
      logout,
      updateUser,
      refreshUser,
    }),
    [user, isLoading, setUser, login, logout, updateUser, refreshUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
