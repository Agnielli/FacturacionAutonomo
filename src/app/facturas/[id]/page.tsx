import { getInvoiceById } from '@/lib/actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PrintButton from '@/components/PrintButton';

export const dynamic = 'force-dynamic';

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = (await getInvoiceById(id)) as any;

  if (!invoice) {
    notFound();
  }

  return (
    <div className="container pb-16">
      <header className="flex items-center justify-between gap-4 mb-10 no-print">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 border border-border-base rounded-custom text-text-secondary hover:text-text-primary hover:bg-bg-primary hover:-translate-y-px transition-all group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:-translate-x-1 transition-transform"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span className="font-medium">Volver</span>
        </Link>
        <PrintButton />
      </header>

      <div
        className="invoice-paper bg-bg-secondary p-8 sm:p-16 rounded-custom shadow-custom-lg border border-border-base mx-auto max-w-[850px] animate-in fade-in zoom-in-95 duration-500"
        id="invoice-content"
      >
        <div className="flex justify-between items-start mb-16">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-text-primary mb-2">
              FACTURA
            </h1>
            <div className="h-2 w-20 bg-accent-primary rounded-full"></div>
          </div>
          <div className="text-right space-y-2">
            <div className="flex justify-end gap-3">
              <span className="text-xs uppercase tracking-widest font-bold text-text-secondary">
                Fecha:
              </span>
              <span className="font-semibold text-text-primary">
                {new Date(invoice.date).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="flex justify-end gap-3">
              <span className="text-xs uppercase tracking-widest font-bold text-text-secondary">
                N° Factura:
              </span>
              <span className="font-bold text-accent-primary text-xl">
                {invoice.invoiceNumber}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-black text-accent-primary pb-2 border-b border-border-base">
              EMISOR
            </h3>
            <div className="text-[15px] leading-relaxed text-text-secondary">
              <p>
                <strong className="text-text-primary text-base">
                  Enrique Sabariego García
                </strong>
              </p>
              <p>
                <strong className="text-text-primary/80">NIF:</strong> 77336240M
              </p>
              <p>Calle Murillo 2, Bl 4, Pt C, Bajo 3.</p>
              <p>04630 Garrucha (Almería)</p>
              <p className="text-accent-primary font-medium">
                enrique@saiolab.com
              </p>
            </div>
          </div>
          <div className="space-y-4 text-right md:text-left">
            <h3 className="text-xs uppercase tracking-widest font-black text-accent-primary pb-2 border-b border-border-base md:text-right">
              CLIENTE
            </h3>
            <div className="text-[15px] leading-relaxed text-text-secondary">
              <p className="break-words">
                <strong className="text-text-primary/80">Nombre:</strong>{' '}
                {invoice.clientName || invoice.client.name}
              </p>
              <p>
                <strong className="text-text-primary/80">NIF/CIF:</strong>{' '}
                {invoice.clientNif || invoice.client.nif}
              </p>
              <p className="break-words">
                <strong className="text-text-primary/80">Dirección:</strong>{' '}
                {invoice.clientAddress || invoice.client.address}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden border border-border-base rounded-custom mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-primary">
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-text-secondary">
                  DESCRIPCIÓN
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-text-secondary text-center">
                  CANTIDAD
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-text-secondary text-right">
                  IMPORTE
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-8 py-6 text-text-primary font-medium">
                      {item.description}
                    </td>
                    <td className="px-8 py-6 text-center text-text-secondary font-medium">
                      {item.quantity}
                    </td>
                    <td className="px-8 py-6 text-right text-text-primary font-bold">
                      €
                      {item.unitPrice.toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-8 py-6 text-text-primary font-medium">
                    {invoice.details || 'Servicios profesionales'}
                  </td>
                  <td className="px-8 py-6 text-center text-text-secondary font-medium">
                    1
                  </td>
                  <td className="px-8 py-6 text-right text-text-primary font-bold">
                    €
                    {invoice.amount.toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ml-auto w-full md:w-80 space-y-3 mb-16">
          <div className="flex justify-between text-text-secondary text-sm">
            <span>Sub-total:</span>
            <span className="font-semibold text-text-primary">
              €
              {invoice.amount.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between text-text-secondary text-sm">
            <span>IVA (21%):</span>
            <span className="font-semibold text-text-primary">
              €
              {invoice.tax.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between pt-4 border-t-2 border-text-primary text-2xl font-black text-accent-primary">
            <span>TOTAL:</span>
            <span>
              €
              {invoice.total.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-8 pt-8 border-t border-border-base text-text-secondary/60">
          <div className="space-y-4 w-full">
            <h3 className="text-xs uppercase tracking-widest font-black text-text-primary/40">
              INFORMACIÓN DE PAGO
            </h3>
            <div className="text-xs space-y-1">
              <p>
                <strong>Banco:</strong> BBVA
              </p>
              <p>
                <strong>Nombre:</strong> Enrique Sabariego García
              </p>
              <p>
                <strong>IBAN:</strong> ES66 0182 6494 8402 0160 0123
              </p>
            </div>
          </div>
          <div className="text-right w-full">
            <p className="italic font-serif text-sm">
              Gracias por su confianza.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
