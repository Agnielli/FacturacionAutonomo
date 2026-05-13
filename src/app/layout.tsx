import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import LogoutButton from '@/components/LogoutButton';
import { auth } from '@/auth';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-family',
});

export const metadata: Metadata = {
  title: 'Sabariego Invoices',
  description: 'Gestión profesional de facturas y gastos',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const isAuthPage = !session;

  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-bg-primary text-text-primary font-sans antialiased">
        {!isAuthPage && (
          <nav className="bg-bg-secondary border-b border-border-base py-5 no-print">
            <div className="container flex gap-10 font-medium items-center">
              <Link
                href="/"
                className="flex items-center gap-3 text-text-primary text-xl font-bold hover:opacity-80 transition-opacity"
              >
                <span className="text-2xl">🧾</span>
                <span>Sabariego Invoices</span>
              </Link>
              <div className="flex gap-8">
                <Link
                  href="/clientes"
                  className="text-text-secondary hover:text-accent-primary transition-colors text-sm uppercase tracking-wider font-bold"
                >
                  Clientes
                </Link>
                <Link
                  href="/gastos"
                  className="text-text-secondary hover:text-accent-primary transition-colors text-sm uppercase tracking-wider font-bold"
                >
                  Gastos
                </Link>
                <Link
                  href="/impuestos"
                  className="text-text-secondary hover:text-accent-primary transition-colors text-sm uppercase tracking-wider font-bold"
                >
                  Impuestos
                </Link>
              </div>
              <div className="ml-auto flex items-center gap-6">
                <ThemeToggle />
                <div className="h-4 w-px bg-border-base"></div>
                <LogoutButton />
              </div>
            </div>
          </nav>
        )}
        <main className={!isAuthPage ? "pt-8" : ""}>{children}</main>
      </body>
    </html>
  );
}
