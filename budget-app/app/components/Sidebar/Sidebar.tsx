'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const SIDEBAR_WIDTH_DESKTOP = 80; // w-20
const BOTTOM_BAR_HEIGHT_MOBILE = 72; // comfortable thumb zone; layout uses mb-20 (80px) so content clears

const menuItems = [
  { path: '/dashboard', icon: '/icons/dashboard.svg', label: 'Dashboard' },
  { path: '/categories', icon: '/icons/category.svg', label: 'Categories' },
  { path: '/calculators', icon: '/icons/calci.svg', label: 'Calculators' },
  { path: '/budgets', icon: '/icons/budget.svg', label: 'Budgets' },
  { path: '/profile', icon: '/icons/profile.svg', label: 'Profile' },
];

const Sidebar = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Desktop: vertical sidebar */}
      <aside
        className="fixed left-0 top-0 h-screen hidden md:flex flex-col items-center z-40 bg-card border-r border-border safe-top"
        style={{ width: SIDEBAR_WIDTH_DESKTOP }}
        aria-label="Main navigation"
      >
        <nav
          className="flex-1 w-full flex flex-col justify-center items-center py-4"
          aria-label="Primary"
        >
          <ul className="flex flex-col gap-2 w-full px-3">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                  className="relative flex items-center justify-center group"
                >
                  <span className="sr-only">{item.label}</span>
                  <span
                    className={`
                      flex items-center justify-center w-14 h-14 rounded-xl min-w-[44px] min-h-[44px]
                      transition-all duration-200
                      ${isActive(item.path)
                        ? 'bg-accent text-accent-foreground shadow-md'
                        : 'bg-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    <Image
                      src={item.icon}
                      alt=""
                      width={28}
                      height={28}
                      className={`
                        transition-opacity
                        ${isActive(item.path)
                          ? 'brightness-0 invert opacity-100'
                          : 'brightness-0 opacity-70 dark:invert group-hover:opacity-90'
                        }
                      `}
                    />
                  </span>
                  {/* Tooltip desktop */}
                  <span
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
                  >
                    {item.label}
                  </span>
                  {isActive(item.path) && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full"
                      aria-hidden
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile: bottom navigation - PWA safe area */}
      <aside
        className="fixed left-0 right-0 bottom-0 md:hidden z-40 bg-card border-t border-border safe-bottom"
        style={{ height: BOTTOM_BAR_HEIGHT_MOBILE }}
        aria-label="Main navigation"
      >
        <nav
          className="h-full flex items-center justify-around px-2 safe-left safe-right"
          aria-label="Primary"
        >
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              aria-current={isActive(item.path) ? 'page' : undefined}
              className="flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[56px] rounded-xl active:bg-muted/50 transition-colors"
            >
              <span
                className={`
                  flex items-center justify-center w-10 h-10 rounded-xl
                  ${isActive(item.path) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}
                `}
              >
                <Image
                  src={item.icon}
                  alt=""
                  width={24}
                  height={24}
                  className={
                    isActive(item.path)
                      ? 'brightness-0 invert opacity-100'
                      : 'brightness-0 opacity-70 dark:invert'
                  }
                />
              </span>
              <span
                className={`text-[10px] font-medium truncate max-w-[64px] ${
                  isActive(item.path) ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
