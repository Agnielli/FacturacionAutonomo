import { getClients, getNextInvoiceNumber } from '@/lib/actions'
import InvoiceForm from '@/components/InvoiceForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic';

export default async function NuevaFacturaPage() {
  const clients = await getClients();
  const nextNumber = await getNextInvoiceNumber();

  return (
    <div className="container pb-16">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Nueva Factura</h1>
          <p className="text-text-secondary mt-1 font-medium">Crea una nueva factura y auto-completa clientes</p>
        </div>
        <Link 
          href="/" 
          className="flex items-center gap-2 px-5 py-2.5 rounded-custom border border-border-base bg-bg-secondary text-text-primary font-medium hover:bg-bg-primary hover:-translate-y-px transition-all duration-200 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Volver al Dashboard
        </Link>
      </header>
      
      <main className="animate-in fade-in slide-in-from-bottom-2 duration-400">
        <InvoiceForm clients={clients} nextInvoiceNumber={nextNumber} />
      </main>
    </div>
  );
}
