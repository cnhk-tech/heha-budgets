'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/app/contexts/UserContext';
import { AppLogo } from '@/app/components/AppLogo';

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
        <div className="relative mx-auto flex h-16 w-full min-w-0 max-w-7xl items-center px-3 sm:px-6 lg:px-8">
          {/* Logo: left on mobile; on md+ same width as sidebar (md:w-16 lg:w-20) and centered in that rail */}
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center justify-center rounded-lg active:opacity-80 md:w-16 md:min-w-[4rem] lg:w-20 lg:min-w-[5rem]"
            aria-label="H² home"
          >
            <AppLogo size="header" priority />
          </Link>

          <div className="min-w-0 flex-1" aria-hidden />

          <div className="flex shrink-0 items-center justify-end pr-[max(0px,env(safe-area-inset-right,0px))]">
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-card px-2.5 text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground sm:min-w-0 sm:px-4"
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
