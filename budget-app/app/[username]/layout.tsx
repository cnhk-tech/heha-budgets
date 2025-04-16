import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}>) {
  const { username } = await params;
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex flex-1 mt-16">
        <Sidebar username={username} />
        <main className="flex-1 ml-20 p-6 max-md:ml-0 max-md:mb-20">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default RootLayout;
