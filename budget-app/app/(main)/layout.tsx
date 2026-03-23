'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { UserProvider, useUser } from '../contexts/UserContext';
import { CurrencyProvider } from '../contexts/CurrencyContext';

function MainLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (!user) {
    return null;
  }

  return (
    <CurrencyProvider>
      <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
        <Header />
        <div className="flex min-h-0 min-w-0 flex-1 pt-header w-full">
          <Sidebar />
          <main
            className="flex min-h-0 min-w-0 flex-1 md:ml-16 lg:ml-20 p-4 sm:p-6 pb-bottom-nav md:pb-6"
            id="main-content"
          >
            <div className="max-w-7xl mx-auto min-w-0 w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </CurrencyProvider>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <MainLayoutInner>{children}</MainLayoutInner>
    </UserProvider>
  );
}
