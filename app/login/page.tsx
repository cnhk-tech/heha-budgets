import Link from 'next/link';
import ProfilePicker from '../components/ProfilePicker/ProfilePicker';

const Page = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center gap-8 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] overflow-hidden">
      {/* Budgeting-themed background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-emerald-950/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--accent)/0.08,transparent)]" />
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-accent/5 blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-float animate-float-delay-2" />
      <div className="absolute top-1/3 right-20 w-48 h-48 rounded-full bg-emerald-500/5 blur-2xl animate-float animate-float-delay-1" />
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center">
        <ProfilePicker />
      </div>
      <footer className="relative z-10 w-full max-w-md shrink-0 text-center">
        <p className="text-sm text-muted-foreground">
          Want to learn more before you sign in?{' '}
          <Link
            href="/"
            className="font-medium text-foreground underline decoration-muted-foreground/50 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Read the overview
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default Page;
