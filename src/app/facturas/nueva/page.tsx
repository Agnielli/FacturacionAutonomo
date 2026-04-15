import { getClients, getNextInvoiceNumber } from '@/lib/actions'
import InvoiceForm from '@/components/InvoiceForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic';

export default async function NuevaFacturaPage() {
  const clients = await getClients();
  const nextNumber = await getNextInvoiceNumber();

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header className="header">
        <div>
          <h1>Nueva Factura</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Crea una nueva factura y auto-completa clientes</p>
        </div>
        <Link href="/" className="btn" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          Volver al Dashboard
        </Link>
      </header>
      
      <main>
        <InvoiceForm clients={clients} nextInvoiceNumber={nextNumber} />
      </main>
    </div>
  );
}
