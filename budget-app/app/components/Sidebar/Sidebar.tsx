'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const menuItems = [
  { path: '/dashboard', icon: '/icons/dashboard.svg', label: 'Dashboard' },
  { path: '/categories', icon: '/icons/category.svg', label: 'Categories' },
  { path: '/calculators', icon: '/icons/calci.svg', label: 'Calculators' },
  { path: '/budgets', icon: '/icons/budget.svg', label: 'Budgets' },
  { path: '/transactions', icon: '/icons/history.svg', label: 'History' },
  { path: '/profile', icon: '/icons/profile.svg', label: 'Profile' },
];

const Sidebar = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Desktop / tablet: rail width follows breakpoint (matches layout md:ml-16 lg:ml-20) */}
      <aside
        className="fixed left-0 top-0 z-40 hidden h-dvh w-16 min-w-0 shrink-0 flex-col items-stretch border-r border-border bg-card pt-[env(safe-area-inset-top,0px)] md:flex lg:w-20"
        aria-label="Main navigation"
      >
        <nav
          className="flex min-h-0 w-full flex-1 flex-col items-stretch justify-center gap-1 overflow-y-auto py-3 lg:gap-2 lg:py-4"
          aria-label="Primary"
        >
          <ul className="flex w-full flex-col items-stretch gap-1 lg:gap-2">
            {menuItems.map((item) => (
              <li key={item.path} className="flex w-full justify-center px-0.5 lg:px-0">
                <Link
                  href={item.path}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                  className="group relative flex w-full max-w-[4.5rem] items-center justify-center lg:max-w-20"
                >
                  <span className="sr-only">{item.label}</span>
                  <span
                    className={`
                      flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-all duration-200
                      h-11 w-11 lg:h-14 lg:w-14
                      ${
                        isActive(item.path)
                          ? 'bg-accent text-accent-foreground shadow-md'
                          : 'bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }
                    `}
                  >
                    <Image
                      src={item.icon}
                      alt=""
                      width={28}
                      height={28}
                      className={`
                        h-[22px] w-[22px] lg:h-7 lg:w-7 transition-opacity
                        ${
                          isActive(item.path)
                            ? 'brightness-0 invert opacity-100'
                            : 'brightness-0 opacity-70 group-hover:opacity-90 dark:invert'
                        }
                      `}
                    />
                  </span>
                  <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background opacity-0 transition-opacity group-hover:opacity-100 lg:block">
                    {item.label}
                  </span>
                  {isActive(item.path) && (
                    <span
                      className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-accent lg:h-8"
                      aria-hidden
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile: equal flex columns — width tracks viewport; no fixed tab width / horizontal scroll */}
      <aside
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card md:hidden"
        aria-label="Main navigation"
      >
        <div className="pb-[env(safe-area-inset-bottom,0px)] pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))]">
          <nav
            className="flex h-[72px] w-full min-w-0 items-stretch gap-0.5 py-1 sm:gap-1 sm:py-1.5"
            aria-label="Primary"
          >
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                aria-current={isActive(item.path) ? 'page' : undefined}
                className="flex min-h-[48px] min-w-0 flex-1 basis-0 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 text-center transition-[transform,colors] active:scale-[0.97] active:bg-muted/40 sm:rounded-xl sm:px-1"
              >
                <span
                  className={`
                    flex shrink-0 items-center justify-center rounded-lg sm:rounded-xl
                    h-[clamp(1.75rem,8vw,2.5rem)] w-[clamp(1.75rem,8vw,2.5rem)]
                    ${isActive(item.path) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}
                  `}
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={24}
                    height={24}
                    className={`
                      h-[clamp(0.875rem,4.5vw,1.25rem)] w-[clamp(0.875rem,4.5vw,1.25rem)]
                      ${
                        isActive(item.path)
                          ? 'brightness-0 invert opacity-100'
                          : 'brightness-0 opacity-70 dark:invert'
                      }
                    `}
                  />
                </span>
                <span
                  className={`w-full truncate px-0.5 text-center font-medium leading-none text-[length:clamp(0.5625rem,2.8vw,0.6875rem)] sm:text-[0.6875rem] ${
                    isActive(item.path) ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
