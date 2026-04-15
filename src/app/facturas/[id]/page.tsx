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
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header className="header no-print" style={{ marginBottom: '2rem' }}>
        <Link href="/" className="btn btn-secondary">
          ← Volver
        </Link>
        <PrintButton />
      </header>

      <div className="invoice-paper" id="invoice-content">
        <div className="invoice-header">
          <div className="invoice-title">
            <h1>FACTURA</h1>
          </div>
          <div className="invoice-meta">
            <div className="meta-item">
              <span className="meta-label">Fecha:</span>
              <span className="meta-value">
                {new Date(invoice.date).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">N° Factura:</span>
              <span className="meta-value">{invoice.invoiceNumber}</span>
            </div>
          </div>
        </div>

        <div className="invoice-info-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '4rem' }}>
          <div className="info-block">
            <h3>EMISOR</h3>
            <div className="info-content">
              <p><strong>Enrique Sabariego García</strong></p>
              <p><strong>NIF:</strong> 77336240M</p>
              <p>Calle Murillo 2, Bl 4, Pt C, Bajo 3.</p>
              <p>04630 Garrucha (Almería)</p>
              <p>enrique@saiolab.com</p>
            </div>
          </div>
          <div className="info-block">
            <h3>CLIENTE</h3>
            <div className="info-content" style={{ wordBreak: 'normal', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
              <p>
                <strong>Nombre:</strong> {invoice.clientName || invoice.client.name}
              </p>
              <p>
                <strong>NIF/CIF:</strong> {invoice.clientNif || invoice.client.nif}
              </p>
              <p>
                <strong>Dirección:</strong> {invoice.clientAddress || invoice.client.address}
              </p>
            </div>
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>DESCRIPCIÓN</th>
              <th style={{ textAlign: 'center' }}>CANTIDAD</th>
              <th style={{ textAlign: 'right' }}>IMPORTE</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>
                    €
                    {item.unitPrice.toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td>{invoice.details || 'Servicios profesionales'}</td>
                <td style={{ textAlign: 'center' }}>1</td>
                <td style={{ textAlign: 'right' }}>
                  €
                  {invoice.amount.toLocaleString('es-ES', {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="invoice-totals">
          <div className="totals-row">
            <span>Sub-total:</span>
            <span>
              €
              {invoice.amount.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="totals-row">
            <span>IVA (21%):</span>
            <span>
              €
              {invoice.tax.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="totals-row grand-total">
            <span>TOTAL:</span>
            <span>
              €
              {invoice.total.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <div className="invoice-footer">
          <div className="payment-info">
            <h3>INFORMACIÓN DE PAGO</h3>
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
          <div className="issuer-signoff" style={{ textAlign: 'right', marginTop: 'auto' }}>
            <p style={{ fontStyle: 'italic' }}>Gracias por su confianza.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
