'use client';

import { useState } from 'react';
import { createInvoice } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function InvoiceForm({
  clients,
  nextInvoiceNumber,
}: {
  clients: any[];
  nextInvoiceNumber?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');

  const [items, setItems] = useState([
    { description: '', quantity: 1, unitPrice: 0, total: 0 },
  ]);

  const [formData, setFormData] = useState({
    invoiceNumber:
      nextInvoiceNumber ||
      `FAC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    details: '',
  });

  const calculateGrandTotals = (currentItems: any[]) => {
    const subtotal = currentItems.reduce(
      (acc, item) => acc + (item.total || 0),
      0,
    );
    const tax = subtotal * 0.21;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateGrandTotals(items);

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      const q =
        field === 'quantity'
          ? parseFloat(value) || 0
          : newItems[index].quantity;
      const p =
        field === 'unitPrice'
          ? parseFloat(value) || 0
          : newItems[index].unitPrice;
      newItems[index].total = q * p;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { description: '', quantity: 1, unitPrice: 0, total: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const existingClient = clients.find(
      (c) => c.name.toLowerCase() === clientName.toLowerCase(),
    );

    try {
      await createInvoice({
        ...formData,
        amount: subtotal,
        tax,
        total,
        items,
        clientId: existingClient?.id || null,
        clientName: existingClient ? null : clientName,
      });
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Error creando la factura. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--bg-secondary)',
        padding: '2rem',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-color)',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      <div className="form-grid">
        <div className="form-group full-width">
          <label htmlFor="client" className="form-label">
            Cliente
          </label>
          <input
            type="text"
            list="clients-list"
            id="client"
            className="form-input"
            placeholder="Ej. ACME Corp..."
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />
          <datalist id="clients-list">
            {clients.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="invoiceNumber" className="form-label">
            Número de Factura
          </label>
          <input
            type="text"
            id="invoiceNumber"
            className="form-input"
            value={formData.invoiceNumber}
            onChange={(e) =>
              setFormData({ ...formData, invoiceNumber: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date" className="form-label">
            Fecha de Emisión
          </label>
          <input
            type="date"
            id="date"
            className="form-input"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div
          className="full-width"
          style={{ marginTop: '1.5rem', marginBottom: '1rem' }}
        >
          <h3
            style={{
              fontSize: '1.1rem',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '0.5rem',
            }}
          >
            Conceptos / Líneas de Factura
          </h3>

          <div className="items-list">
            {items.map((item, index) => (
              <div
                key={index}
                className="item-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 80px 120px 100px 40px',
                  gap: '1rem',
                  marginBottom: '1rem',
                  alignItems: 'end',
                }}
              >
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>
                    Descripción
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, 'description', e.target.value)
                    }
                    placeholder="Ej. Servicio de consultoría..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>
                    Cant.
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, 'quantity', e.target.value)
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>
                    Precio (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemChange(index, 'unitPrice', e.target.value)
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>
                    Subtotal
                  </label>
                  <div style={{ padding: '0.625rem 0', fontWeight: '500' }}>
                    €{item.total.toFixed(2)}
                  </div>
                </div>
                <div className="form-group">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.5rem',
                      minWidth: 'auto',
                      marginBottom: '0.2rem',
                    }}
                    disabled={items.length === 1}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="btn"
            style={{
              marginTop: '0.5rem',
              background: 'btn-secondary',
              color: 'var(--primary)',
              border: '1px solid var(--border-color)',
              fontWeight: '500',
            }}
          >
            + Añadir Concepto
          </button>
        </div>

        <div
          className="form-group full-width"
          style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius)',
            textAlign: 'right',
          }}
        >
          <div
            style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}
          >
            Base Imponible: <strong>€{subtotal.toFixed(2)}</strong>
          </div>
          <div
            style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}
          >
            IVA (21%): <strong>€{tax.toFixed(2)}</strong>
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--primary)',
            }}
          >
            TOTAL FACTURA: €{total.toFixed(2)}
          </div>
        </div>

        <div className="form-group full-width" style={{ marginTop: '2rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
          >
            {loading ? 'Guardando...' : 'Emitir Factura'}
          </button>
        </div>
      </div>
    </form>
  );
}
