import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { username: string };
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex flex-grow bg-foreground max-md:flex-wrap-reverse max-md:flex-row max-md:overflow-y-auto">
        {/* Sidebar */}
        <Sidebar username={params.username} />
        {/* Main content */}
        {children}
      </main>
    </div>
  );
};

export default RootLayout;
