import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-family',
});

export const metadata: Metadata = {
  title: 'Gestor de Facturas',
  description: 'Aplicación para gestionar facturas emitidas y clientes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-bg-primary text-text-primary font-sans antialiased">
        <nav className="bg-bg-secondary border-b border-border-base py-5 no-print">
          <div className="container flex gap-10 font-medium items-center">
            <Link
              href="/"
              className="flex items-center gap-3 text-text-primary text-xl font-bold hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl">🧾</span>
              <span>Sabariego Invoices</span>
            </Link>
            <div className="flex gap-6">
              <Link
                href="/clientes"
                className="text-text-secondary hover:text-accent-primary transition-colors"
              >
                Mis Clientes
              </Link>
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </nav>
        <main className="pt-8">{children}</main>
      </body>
    </html>
  );
}
