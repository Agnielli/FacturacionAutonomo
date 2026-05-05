import { getInvoices } from '@/lib/actions';
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';
import GenerateMonthlyButton from '@/components/GenerateMonthlyButton';
import PaidToggle from '@/components/PaidToggle';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const invoices = await getInvoices();
  const currentYear = new Date().getFullYear();
  const currentYearInvoices = invoices.filter(
    (inv: any) => new Date(inv.date).getFullYear() === currentYear,
  );
  
  const currentYearTotal = currentYearInvoices.reduce(
    (acc: number, inv: any) => acc + (inv.total || 0),
    0,
  );
  const currentYearSubtotal = currentYearInvoices.reduce(
    (acc: number, inv: any) => acc + (inv.amount || 0),
    0,
  );
  const currentYearVat = currentYearInvoices.reduce(
    (acc: number, inv: any) => acc + (inv.tax || 0),
    0,
  );
  const currentYearRetention = currentYearSubtotal * 0.19;
  const currentYearLiquido = currentYearSubtotal - currentYearRetention;
  
  const currentYearCount = currentYearInvoices.length;

  // Grouping logic (using Local Time as per user preference)
  const groupedInvoices = invoices.reduce((acc: any, inv: any) => {
    const date = new Date(inv.date);
    const year = date.getFullYear().toString();
    const quarter = `T${Math.floor(date.getMonth() / 3) + 1}`;

    if (!acc[year]) acc[year] = {};
    if (!acc[year][quarter]) acc[year][quarter] = [];

    acc[year][quarter].push(inv);
    return acc;
  }, {});

  const years = Object.keys(groupedInvoices).sort((a, b) => b.localeCompare(a));

  return (
    <div className="container pb-16">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Enrique Sabariego García</h1>
          <p className="text-text-secondary mt-1 font-medium">
            Resumen de tu facturación {currentYear}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <GenerateMonthlyButton />
          <Link href="/facturas/nueva" className="btn-primary px-6 py-3">
            <span className="mr-2 text-xl">+</span> Nueva Factura
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-bg-secondary p-6 rounded-custom border border-border-base shadow-custom-sm group hover:-translate-y-1 transition-transform duration-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
            Total Facturado (IVA incl.)
          </h3>
          <p className="text-2xl font-bold text-text-primary">
            €{currentYearTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-bg-secondary p-6 rounded-custom border border-border-base shadow-custom-sm group hover:-translate-y-1 transition-transform duration-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
            Suma de IVA (21%)
          </h3>
          <p className="text-2xl font-bold text-text-secondary">
            €{currentYearVat.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-bg-secondary p-6 rounded-custom border border-border-base shadow-custom-sm group hover:-translate-y-1 transition-transform duration-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
            Retención IRPF (19% s/Base)
          </h3>
          <p className="text-2xl font-bold text-red-500">
            -€{currentYearRetention.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-bg-secondary p-6 rounded-custom border-2 border-accent-primary shadow-lg shadow-accent-primary/5 group hover:-translate-y-1 transition-transform duration-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-accent-primary mb-2">
            Total Líquido ({currentYear})
          </h3>
          <p className="text-2xl font-extrabold text-accent-primary">
            €{currentYearLiquido.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <main className="space-y-12">
        {invoices.length === 0 ? (
          <div className="py-20 text-center bg-bg-secondary rounded-custom border border-border-base border-dashed">
            <div className="text-6xl mb-4 opacity-20">📄</div>
            <p className="text-xl font-medium text-text-secondary">No hay facturas todavía.</p>
            <p className="text-sm text-text-secondary/60 mt-2">Comienza creando tu primera factura.</p>
          </div>
        ) : (
          years.map((year) => {
            let yearTotal = 0;
            Object.values(groupedInvoices[year]).forEach((qInvs: any) => {
              yearTotal += qInvs.reduce((sum: number, i: any) => sum + i.total, 0);
            });

            return (
              <div key={year}>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-4xl font-black text-text-primary">{year}</h2>
                  <span className="px-4 py-1 bg-bg-secondary border border-border-base rounded-full text-sm font-bold text-text-secondary shadow-sm">
                    Total año: €{yearTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="h-px flex-1 bg-border-base opacity-50"></div>
                </div>

                <div className="space-y-8">
                  {Object.keys(groupedInvoices[year])
                    .sort((a, b) => b.localeCompare(a))
                    .map((quarter) => {
                      const qInvoices = [...groupedInvoices[year][quarter]].sort((a, b) => 
                        b.invoiceNumber.localeCompare(a.invoiceNumber, undefined, { numeric: true })
                      );
                      const qTotal = qInvoices.reduce((sum: number, i: any) => sum + i.total, 0);

                      return (
                        <section key={quarter} className="bg-bg-secondary rounded-custom shadow-custom-sm border border-border-base overflow-hidden">
                          <div className="px-8 py-4 bg-bg-primary border-b border-border-base flex justify-between items-center sm:flex-row flex-col gap-2">
                            <h3 className="text-lg font-bold text-text-primary">Trimestre {quarter}</h3>
                            <span className="text-accent-primary font-bold">
                              Subtotal Trimestre: €{qTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-bg-primary/50">
                                  <th className="px-8 py-3 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border-base">Nº Factura</th>
                                  <th className="px-8 py-3 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border-base">Cliente</th>
                                  <th className="px-8 py-3 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border-base">Fecha</th>
                                  <th className="px-8 py-3 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border-base text-right">Total</th>
                                  <th className="px-8 py-3 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border-base text-center">Estado</th>
                                  <th className="px-8 py-3 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border-base text-right">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border-base">
                                {qInvoices.map((inv: any) => (
                                  <tr key={inv.id} className="hover:bg-bg-primary/30 transition-colors">
                                    <td className="px-8 py-4 font-bold text-text-primary">{inv.invoiceNumber}</td>
                                    <td className="px-8 py-4 text-sm font-medium">{inv.client.name}</td>
                                    <td className="px-8 py-4 text-sm text-text-secondary">{new Date(inv.date).toLocaleDateString('es-ES')}</td>
                                    <td className="px-8 py-4 font-bold text-right text-text-primary">
                                      €{inv.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                      <PaidToggle id={inv.id} initialStatus={inv.paid} />
                                    </td>
                                    <td className="px-8 py-4">
                                      <div className="flex justify-end gap-2">
                                        <Link href={`/facturas/${inv.id}/edit`} className="btn-icon hover:text-accent-primary" title="Editar">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                          </svg>
                                        </Link>
                                        <Link href={`/facturas/${inv.id}`} className="btn-icon hover:text-accent-primary" title="Ver/Descargar">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                          </svg>
                                        </Link>
                                        <DeleteButton id={inv.id} type="invoice" />
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </section>
                      );
                    })}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
