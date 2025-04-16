'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    // Implement logout logic here
    router.push('/');
  };

  return (
    <header className={`
      fixed top-0 left-0 right-0 z-50
      transition-all duration-300
      ${isScrolled ? 'bg-background/80 backdrop-blur-md shadow-lg' : 'bg-transparent'}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-20 h-10 rounded-xl bg-foreground flex items-center justify-center shadow-md">
              <span className="text-background font-bold text-xl">H^2</span>
            </div>
            <span className="text-foreground font-bold text-xl hidden sm:block">HeHa Budgets</span>
          </Link>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-foreground/10 transition-colors flex items-center space-x-2"
            >
              <Image
                className='transition-all duration-300 dark:brightness-0 invert'
                src="/icons/logout.svg"
                alt="Logout"
                width={32}
                height={32}
              />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
