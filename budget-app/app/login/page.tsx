import ProfilePicker from '../components/ProfilePicker/ProfilePicker';

const Page = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Budgeting-themed background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-emerald-950/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--accent)/0.08,transparent)]" />
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-accent/5 blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-float animate-float-delay-2" />
      <div className="absolute top-1/3 right-20 w-48 h-48 rounded-full bg-emerald-500/5 blur-2xl animate-float animate-float-delay-1" />
      <div className="relative z-10 w-full max-w-2xl">
        <ProfilePicker />
      </div>
    </div>
  );
};

export default Page;
