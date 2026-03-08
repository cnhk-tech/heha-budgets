'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/app/contexts/UserContext';

const HEADER_HEIGHT = 64; // h-16, keep in sync with layout mt

const Header = () => {
  const router = useRouter();
  const { logout } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 safe-top
        transition-all duration-300
        ${isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border' : 'bg-background/80 backdrop-blur-sm'}
      `}
      style={{ height: HEADER_HEIGHT }}
    >
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Logo - min touch target on mobile */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 min-h-[44px] min-w-[44px] sm:min-w-0 rounded-lg active:opacity-80 -ml-2 sm:ml-0 pl-2 sm:pl-0"
            aria-label="HeHa Budgets home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-foreground flex items-center justify-center shrink-0">
              <span className="text-background font-bold text-lg sm:text-xl">H²</span>
            </div>
            <span className="text-foreground font-bold text-lg sm:text-xl hidden sm:block truncate">
              HeHa Budgets
            </span>
          </Link>

          {/* Log out - top right (icon-only on mobile, icon+text on desktop) */}
          <button
            type="button"
            onClick={handleLogout}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors px-3 md:px-4"
            aria-label="Log out"
          >
            <Image
              src="/icons/logout.svg"
              alt=""
              width={22}
              height={22}
              className="opacity-80 brightness-0 invert shrink-0"
            />
            <span className="hidden sm:inline text-sm font-medium">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
