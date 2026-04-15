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
      <body>
        <nav
          style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            padding: '1.25rem 0',
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              gap: '2.5rem',
              fontWeight: 500,
              alignItems: 'center',
            }}
          >
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
                fontWeight: 700,
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🧾</span>
              <span>Sabariego Invoices</span>
            </Link>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link
                href="/clientes"
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
              >
                Mis Clientes
              </Link>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <ThemeToggle />
            </div>
          </div>
        </nav>
        <div style={{ paddingTop: '2rem' }}>{children}</div>
      </body>
    </html>
  );
}
