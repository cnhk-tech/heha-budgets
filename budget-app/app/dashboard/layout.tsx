import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex flex-grow h-full">
        {/* Sidebar */}
        <Sidebar />
        {/* Main content */}
        {children}
      </main>
    </div>
  );
};

export default RootLayout;
