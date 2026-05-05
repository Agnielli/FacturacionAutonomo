import { getInvoiceById, getClients } from '@/lib/actions';
import { notFound } from 'next/navigation';
import InvoiceForm from '@/components/InvoiceForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  const clients = await getClients();

  if (!invoice) {
    notFound();
  }

  return (
    <div className="container pb-16">
      <header className="flex items-center justify-between gap-4 mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 border border-border-base rounded-custom text-text-secondary hover:text-text-primary transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Volver</span>
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Editar Factura {invoice.invoiceNumber}</h1>
      </header>

      <InvoiceForm clients={clients} initialData={invoice} />
    </div>
  );
}
