import Image from 'next/image';

const SIZE_CLASSES = {
  /** Footer, compact spots */
  sm: 'h-7 w-7 min-h-[28px] min-w-[28px]',
  /** Default: landing nav */
  md: 'h-9 w-9 min-h-[36px] min-w-[36px] sm:h-10 sm:w-10 sm:min-h-10 sm:min-w-10',
  /** Main app header — aligned with sidebar rail, slightly larger for clarity */
  header:
    'h-11 w-11 min-h-[44px] min-w-[44px] sm:h-12 sm:w-12 sm:min-h-[48px] sm:min-w-[48px]',
  /** Login / profile hero */
  lg: 'h-16 w-16 min-h-[64px] min-w-[64px] sm:h-20 sm:w-20 sm:min-h-20 sm:min-w-20',
} as const;

const SIZE_PX = { sm: 28, md: 40, header: 48, lg: 80 } as const;

export type AppLogoSize = keyof typeof SIZE_CLASSES;

type AppLogoProps = {
  size?: AppLogoSize;
  className?: string;
  /** Use on LCP / above-the-fold logos */
  priority?: boolean;
};

/**
 * Brand mark from `public/icons/app-icon.png` — use wherever “H²” was shown as a logo chip.
 */
export function AppLogo({ size = 'md', className = '', priority = false }: AppLogoProps) {
  const dim = SIZE_PX[size];
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card ring-1 ring-border/30 ${SIZE_CLASSES[size]} ${className}`}
    >
      <Image
        src="/icons/app-icon.png"
        alt=""
        width={dim}
        height={dim}
        sizes={`${dim}px`}
        className="h-full w-full object-contain p-0.5"
        priority={priority}
      />
    </span>
  );
}
