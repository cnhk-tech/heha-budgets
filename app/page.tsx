'use client';

import Link from 'next/link';
// import { useCallback, useEffect, useState } from 'react';
import { AppLogo } from '@/app/components/AppLogo';

function LandingBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
      aria-hidden
    >
      {/* Soft grain — texture without visible grid lines */}
      <div className="landing-grain absolute inset-0" />
      {/* Soft wash — uses accent + foreground tokens */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 50% -30%, color-mix(in srgb, var(--accent) 14%, transparent) 0%, transparent 55%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 100% 80%, color-mix(in srgb, var(--foreground) 6%, transparent) 0%, transparent 50%)',
        }}
      />
      {/* Animated orbs — fused to palette */}
      <div
        className="landing-blob-a absolute -left-[18%] top-[-12%] h-[min(85vw,720px)] w-[min(85vw,720px)] rounded-full bg-accent/[0.11] blur-[100px]"
        style={{ willChange: 'transform, opacity' }}
      />
      <div
        className="landing-blob-b absolute -right-[12%] top-[28%] h-[min(70vw,560px)] w-[min(70vw,560px)] rounded-full bg-accent/[0.07] blur-[90px]"
        style={{ willChange: 'transform, opacity' }}
      />
      <div
        className="landing-blob-c absolute bottom-[-8%] left-[22%] h-[min(55vw,480px)] w-[min(90vw,900px)] rounded-full bg-foreground/[0.04] blur-[110px]"
        style={{ willChange: 'transform, opacity' }}
      />
      {/* Slow light sweep */}
      <div
        className="landing-shimmer absolute -left-1/4 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-accent/[0.07] to-transparent blur-3xl"
        style={{ willChange: 'transform, opacity' }}
      />
      {/* Vignette — grounds the page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_45%,transparent_30%,var(--background)_95%)] opacity-[0.85]" />
    </div>
  );
}

// function ScrollToTopButton() {
//   const [visible, setVisible] = useState(false);

//   useEffect(() => {
//     const onScroll = () => setVisible(window.scrollY > 360);
//     onScroll();
//     window.addEventListener('scroll', onScroll, { passive: true });
//     return () => window.removeEventListener('scroll', onScroll);
//   }, []);

//   const scrollToTop = useCallback(() => {
//     const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
//     window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
//   }, []);

//   if (!visible) return null;

//   return (
//     <button
//       type="button"
//       onClick={scrollToTop}
//       className="fixed bottom-[calc(7.75rem+env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] z-50 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/25 ring-1 ring-white/10 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-0 dark:ring-white/5"
//       aria-label="Back to top"
//     >
//       <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
//         <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5V4.5m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
//       </svg>
//     </button>
//   );
// }

const features = [
  {
    title: 'Monthly budgets that stay honest',
    description:
      'Set limits per category for each month. See what’s left at a glance—spent and remaining update as you go.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Categories you actually use',
    description:
      'Organize spending with icons and types. Filter activity by category so you always know where money went.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    title: 'Pay with UPI from the dashboard',
    description:
      'Scan merchant QR codes or enter a UPI ID, then jump straight to your payment app. H² tracks the attempt and updates your budget when you confirm success.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0l.001 0M18 9h2M2 2h2v2h2v18H2V2z" />
      </svg>
    ),
  },
  {
    title: 'Transaction history & swipe to tidy',
    description:
      'Every paid and failed attempt is logged. Swipe or drag to delete—successful payments can refund that amount back into the month’s balance.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    title: 'Money calculators in one place',
    description:
      'SIP, loans, FD, inflation, retirement, and more—quick tools beside your budget so planning stays in one tab.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Profiles for every spender',
    description:
      'Switch between people or households—each profile keeps its own categories, budgets, and history on this device.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

const steps = [
  {
    step: '01',
    title: 'Create a profile',
    text: 'Sign in with a name and currency. Your data stays on this browser.',
  },
  {
    step: '02',
    title: 'Build your month',
    text: 'Add categories and set budgets for the current month—adjust anytime.',
  },
  {
    step: '03',
    title: 'Spend & sync',
    text: 'Pay via UPI from the app, log results, and watch balances update in real time.',
  },
];

const privacyPoints = [
  {
    title: 'Stays on this device',
    body: 'Your budgets and history are saved in this browser. We don’t upload them or sell your information.',
  },
  {
    title: 'UPI is between you and your bank',
    body: 'When you pay, you continue in your payment app. H² doesn’t handle your PIN, card, or bank login.',
  },
  {
    title: 'Export if you need a copy',
    body: 'Clearing site data or removing this browser can erase local data. Export from the app whenever you want a backup.',
  },
  {
    title: 'QR codes use your camera',
    body: 'We only turn the camera on when you scan. Open H² from a bookmark or install you trust—same as any app that uses the camera.',
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen text-foreground">
      <LandingBackdrop />

      <header className="sticky top-0 z-50 bg-background/80 shadow-[0_8px_32px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/65 dark:shadow-[0_8px_40px_-24px_rgba(0,0,0,0.65)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <AppLogo priority />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3">
            <a
              href="#features"
              className="hidden rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground sm:inline"
            >
              Features
            </a>
            <a
              href="#privacy"
              className="hidden rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground sm:inline"
            >
              Privacy
            </a>
            <Link
              href="/login"
              className="rounded-xl bg-card/90 px-4 py-2.5 text-sm font-semibold text-foreground shadow-md shadow-black/5 ring-1 ring-border/30 transition-[background-color,box-shadow,ring-color] hover:bg-card hover:shadow-lg hover:ring-accent/35 dark:shadow-black/40"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 sm:pb-32 sm:pt-28">
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted/25 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground shadow-inner ring-1 ring-border/15 backdrop-blur-sm">
              Budgets · UPI · Calculators
            </p>
            <h1 className="font-display text-[2.35rem] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl sm:leading-[1.08]">
              Your money,{' '}
              <span className="bg-gradient-to-br from-accent via-accent to-foreground/70 bg-clip-text text-transparent">
                squared away
              </span>
            </h1>
            <div className="mx-auto mt-8 flex justify-center" aria-hidden>
              <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 via-accent/15 to-accent/5 text-xl font-semibold tabular-nums text-accent shadow-[0_0_28px_-6px] shadow-accent/45 ring-1 ring-inset ring-accent/35 before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-40 before:content-['']">
                ₹
              </span>
            </div>
            <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              H² is a calm, fast budget companion: category limits, UPI-ready pay flow, and history that stays on{' '}
              <strong className="font-medium text-foreground/90">your device</strong>—no spreadsheet grind.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Link
                href="/login"
                className="inline-flex min-h-[48px] w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-accent px-8 py-3.5 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/15 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/20 active:translate-y-0 sm:w-auto"
              >
                Start Budgeting
              </Link>
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground underline-offset-[6px] transition-colors hover:text-foreground hover:underline"
              >
                See what’s inside
              </a>
            </div>
          </div>
        </section>

        {/* Social proof strip — soft band, no rules */}
        <section className="bg-gradient-to-b from-muted/[0.14] via-muted/[0.06] to-transparent py-14 backdrop-blur-[1px]">
          <div className="mx-auto grid max-w-5xl place-items-center gap-12 px-4 text-center sm:grid-cols-3 sm:gap-10 sm:px-6">
            <div className="max-w-xs">
              <p className="font-display text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">Local-first</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Data lives in your browser storage</p>
            </div>
            <div className="max-w-xs">
              <p className="font-display text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">UPI-aware</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Scan QRs & open your payment app</p>
            </div>
            <div className="max-w-xs">
              <p className="font-display text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">All-in-one</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Budgets + calculators in one place</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Features</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Everything you need to steer spending
              </h2>
              <p className="mt-5 text-muted-foreground">
                Built for people who want clarity without another complicated finance app.
              </p>
            </div>
            <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <li
                  key={f.title}
                  className="group rounded-2xl bg-card/45 p-6 shadow-md shadow-black/[0.04] ring-1 ring-border/15 backdrop-blur-[2px] transition-[box-shadow,transform,background-color,ring-color] duration-300 hover:-translate-y-0.5 hover:bg-card/75 hover:shadow-lg hover:shadow-black/[0.06] hover:ring-accent/25 dark:shadow-black/30"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-accent/12 p-3 text-accent ring-1 ring-accent/20 transition-[background-color,ring-color] group-hover:bg-accent/[0.16] group-hover:ring-accent/35">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-gradient-to-b from-muted/[0.1] to-transparent px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Flow</p>
            <h2 className="mt-3 text-center font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              How it works
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-center text-muted-foreground">
              Three steps from zero to a budget you can actually stick to.
            </p>
            <ol className="mt-16 grid gap-12 sm:grid-cols-3 sm:gap-10">
              {steps.map((s) => (
                <li key={s.step} className="relative text-center">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/90 font-mono text-xs font-bold text-accent shadow-md ring-1 ring-border/25">
                    {s.step}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Privacy */}
        <section id="privacy" className="scroll-mt-20 px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center sm:mb-12 sm:text-left">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Privacy</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Your data, your device
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:mx-0">
                Short version: H² keeps your money picture on this device. No jargon—just how we treat your information.
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4" role="list">
              {privacyPoints.map((item) => (
                <li
                  key={item.title}
                  className="flex min-h-0 overflow-hidden rounded-2xl bg-card/50 shadow-sm ring-1 ring-border/20 backdrop-blur-sm transition-colors hover:bg-card/65 hover:ring-border/30"
                >
                  <div className="w-1 shrink-0 bg-gradient-to-b from-accent/80 to-accent/40" aria-hidden />
                  <div className="min-w-0 flex-1 px-4 py-4 sm:px-5 sm:py-5">
                    <h3 className="text-[15px] font-semibold leading-snug text-foreground sm:text-base">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* <ScrollToTopButton /> */}

      <footer className="bg-gradient-to-t from-muted/[0.08] to-transparent px-4 pb-[max(3rem,env(safe-area-inset-bottom,0px))] pt-12 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 pr-14 sm:flex-row sm:pr-16">
          <div className="flex items-center gap-2.5">
            <AppLogo size="sm" />
            <span className="text-sm text-muted-foreground">Personal budgeting</span>
          </div>
          <p className="text-center text-xs text-muted-foreground sm:text-right">
            © {new Date().getFullYear()} H². Built for clarity, not clutter.
          </p>
        </div>
      </footer>
    </div>
  );
}
