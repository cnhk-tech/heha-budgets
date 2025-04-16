'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Sidebar = ({ username }: { username: string }) => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === `/${username}${path}`;

  const menuItems = [
    {
      path: '/dashboard',
      icon: '/icons/dashboard.svg',
      label: 'Dashboard',
    },
    {
      path: '/categories',
      icon: '/icons/category.svg',
      label: 'Categories',
    },
    {
      path: '/scanner',
      icon: '/icons/scanner.svg',
      label: 'Scanner',
    },
    {
      path: '/calculators',
      icon: '/icons/calci.svg',
      label: 'Calculators',
    },
    {
      path: '/budgets',
      icon: '/icons/budget.svg',
      label: 'Budgets',
    },
    {
      path: '/profile',
      icon: '/icons/profile.svg',
      label: 'Profile',
    },
  ];

  return (
    <div className="
      fixed left-0 top-0 h-screen w-20 bg-background
      flex flex-col items-center z-50
      max-md:flex-row max-md:w-full max-md:h-20 max-md:bottom-0 max-md:top-auto max-md:border-t max-md:border-r-0
    ">
      <nav className="
        flex-1 w-full flex flex-col justify-center items-center
        max-md:flex-row max-md:justify-around max-md:items-center
      ">
        <div className="
          flex flex-col space-y-8
          max-md:flex-row max-md:space-y-0 max-md:space-x-6 max-md:mx-2
        ">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={`/${username}${item.path}`}
              className="relative group"
            >
              <div className={`
                w-14 h-14 max-md:w-12 max-md:h-12 rounded-xl flex items-center justify-center
                transition-all duration-300
                ${isActive(item.path) 
                  ? 'bg-foreground shadow-lg scale-110 z-10' 
                  : 'bg-background hover:bg-foreground/10 hover:scale-[1.4]'
                }
              `}>
                <Image
                  className={`
                    transition-all duration-300
                    ${isActive(item.path) 
                      ? 'brightness-0 dark:invert' 
                      : 'dark:brightness-0 invert'
                    }
                  `}
                  src={item.icon}
                  alt={`${item.label} icon`}
                  width={32}
                  height={32}
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '60%',
                    maxHeight: '60%'
                  }}
                />
              </div>
              <div className="
                absolute left-full top-1/2 -translate-y-1/2 ml-2
                px-3 py-1 rounded-lg bg-foreground text-background text-sm
                opacity-0 group-hover:opacity-100 transition-all duration-300
                whitespace-nowrap z-20
                max-md:hidden
              ">
                {item.label}
              </div>
              {isActive(item.path) && (
                <div className="
                  absolute left-0 top-1/2 -translate-y-1/2
                  w-1 h-10 bg-foreground rounded-r-full
                  max-md:hidden
                " />
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;