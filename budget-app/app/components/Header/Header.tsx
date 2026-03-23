'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/app/contexts/UserContext';

const Header = () => {
  const router = useRouter();
  const { logout } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 w-full min-w-0
        transition-all duration-300
        ${isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border' : 'bg-background/80 backdrop-blur-sm'}
      `}
    >
      <div className="pt-[env(safe-area-inset-top,0px)]">
        <div className="relative mx-auto flex h-16 w-full min-w-0 max-w-7xl items-center justify-center px-3 sm:px-6 lg:px-8 md:justify-between">
          <Link
            href="/dashboard"
            className="absolute left-1/2 top-1/2 flex min-h-[44px] min-w-0 max-w-[calc(100%-5.5rem)] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 rounded-lg active:opacity-80 md:static md:max-w-none md:translate-x-0 md:translate-y-0 md:justify-start"
            aria-label="HeHa Budgets home"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground sm:h-10 sm:w-10">
              <span className="text-lg font-bold text-background sm:text-xl">H²</span>
            </div>
            <span className="hidden min-w-0 truncate text-base font-bold text-foreground sm:inline sm:text-xl">
              HeHa Budgets
            </span>
          </Link>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[min(100%,5.5rem)] items-center justify-end pr-[max(0.75rem,env(safe-area-inset-right,0px))] md:pointer-events-auto md:static md:w-auto md:justify-end md:pr-0">
            <button
              type="button"
              onClick={handleLogout}
              className="pointer-events-auto flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-card px-2.5 text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground sm:px-4"
              aria-label="Log out"
            >
              <Image
                src="/icons/logout.svg"
                alt=""
                width={22}
                height={22}
                className="shrink-0 opacity-80 brightness-0 invert"
              />
              <span className="hidden whitespace-nowrap text-sm font-medium sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
