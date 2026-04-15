import { getInvoices } from '@/lib/actions';
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';

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
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header className="header">
        <div>
          <h1>Enrique Sabariego García</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Resumen de tu facturación {currentYear}
          </p>
        </div>
        <Link href="/facturas/nueva" className="btn btn-primary">
          Nueva Factura
        </Link>
      </header>

      <div
        className="stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="stat-card" style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Total Facturado (IVA incl.)
          </h3>
          <p style={{ fontSize: '1.75rem', fontWeight: '600' }}>
            €{currentYearTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="stat-card" style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Suma de IVA (21%)
          </h3>
          <p style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            €{currentYearVat.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="stat-card" style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Retención IRPF (19% s/Base)
          </h3>
          <p style={{ fontSize: '1.75rem', fontWeight: '600', color: '#f87171' }}>
            -€{currentYearRetention.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="stat-card" style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '2px solid var(--accent-primary)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Total Líquido ({currentYear})
          </h3>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
            €{currentYearLiquido.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <main>
        {invoices.length === 0 ? (
          <div
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div
              style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}
            >
              📄
            </div>
            <p style={{ fontSize: '1.1rem' }}>No hay facturas todavía.</p>
          </div>
        ) : (
          years.map((year) => {
            // Calculate year total
            let yearTotal = 0;
            Object.values(groupedInvoices[year]).forEach((qInvs: any) => {
              yearTotal += qInvs.reduce(
                (sum: number, i: any) => sum + i.total,
                0,
              );
            });

            return (
              <div key={year} style={{ marginBottom: '3rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>
                      {year}
                    </h2>
                    <span
                      style={{
                        fontSize: '1.1rem',
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-primary)',
                        padding: '0.2rem 0.8rem',
                        borderRadius: '1rem',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      Total año: €
                      {yearTotal.toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '2px',
                      flex: 1,
                      background: 'var(--border-color)',
                      opacity: 0.5,
                    }}
                  ></div>
                </div>

                {Object.keys(groupedInvoices[year])
                  .sort((a, b) => b.localeCompare(a))
                  .map((quarter) => {
                    const qInvoices = [...groupedInvoices[year][quarter]].sort(
                      (a, b) => {
                        // Primary sort by invoice number DESC (most reliable for user sequence)
                        return b.invoiceNumber.localeCompare(
                          a.invoiceNumber,
                          undefined,
                          { numeric: true },
                        );
                      },
                    );
                    const qTotal = qInvoices.reduce(
                      (sum: number, i: any) => sum + i.total,
                      0,
                    );

                    return (
                      <section
                        key={quarter}
                        style={{
                          marginBottom: '2rem',
                          background: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius)',
                          boxShadow: 'var(--shadow-sm)',
                          border: '1px solid var(--border-color)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            padding: '1.25rem 2rem',
                            background: 'var(--bg-primary)',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                            Trimestre {quarter}
                          </h3>
                          <span
                            style={{
                              fontSize: '1rem',
                              fontWeight: '500',
                              color: 'var(--primary)',
                            }}
                          >
                            Subtotal Trimestre: €
                            {qTotal.toLocaleString('es-ES', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                          <table
                            style={{
                              width: '100%',
                              borderCollapse: 'collapse',
                              textAlign: 'left',
                            }}
                          >
                            <thead>
                              <tr style={{ background: 'var(--bg-primary)' }}>
                                <th
                                  style={{
                                    padding: '1rem 2rem',
                                    fontWeight: '500',
                                    color: 'var(--text-secondary)',
                                    borderBottom:
                                      '1px solid var(--border-color)',
                                  }}
                                >
                                  Nº Factura
                                </th>
                                <th
                                  style={{
                                    padding: '1rem 2rem',
                                    fontWeight: '500',
                                    color: 'var(--text-secondary)',
                                    borderBottom:
                                      '1px solid var(--border-color)',
                                  }}
                                >
                                  Cliente
                                </th>
                                <th
                                  style={{
                                    padding: '1rem 2rem',
                                    fontWeight: '500',
                                    color: 'var(--text-secondary)',
                                    borderBottom:
                                      '1px solid var(--border-color)',
                                  }}
                                >
                                  Fecha
                                </th>
                                <th
                                  style={{
                                    padding: '1rem 2rem',
                                    fontWeight: '500',
                                    color: 'var(--text-secondary)',
                                    borderBottom:
                                      '1px solid var(--border-color)',
                                    textAlign: 'right',
                                  }}
                                >
                                  Total
                                </th>
                                <th
                                  style={{
                                    padding: '1rem 2rem',
                                    fontWeight: '500',
                                    color: 'var(--text-secondary)',
                                    borderBottom:
                                      '1px solid var(--border-color)',
                                    textAlign: 'right',
                                  }}
                                >
                                  Acciones
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {qInvoices.map((inv: any) => (
                                <tr
                                  key={inv.id}
                                  className="table-row"
                                  style={{
                                    borderBottom:
                                      '1px solid var(--border-color)',
                                  }}
                                >
                                  <td
                                    style={{
                                      padding: '1rem 2rem',
                                      fontWeight: '500',
                                    }}
                                  >
                                    {inv.invoiceNumber}
                                  </td>
                                  <td style={{ padding: '1rem 2rem' }}>
                                    {inv.client.name}
                                  </td>
                                  <td style={{ padding: '1rem 2rem' }}>
                                    {new Date(inv.date).toLocaleDateString(
                                      'es-ES',
                                    )}
                                  </td>
                                  <td
                                    style={{
                                      padding: '1rem 2rem',
                                      fontWeight: '600',
                                      textAlign: 'right',
                                    }}
                                  >
                                    €
                                    {inv.total.toLocaleString('es-ES', {
                                      minimumFractionDigits: 2,
                                    })}
                                  </td>
                                  <td
                                    style={{
                                      padding: '1rem 2rem',
                                      textAlign: 'right',
                                    }}
                                  >
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                      <Link
                                        href={`/facturas/${inv.id}`}
                                        className="btn-icon"
                                        title="Ver/Descargar"
                                      >
                                        📄
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
            );
          })
        )}
      </main>
    </div>
  );
}
