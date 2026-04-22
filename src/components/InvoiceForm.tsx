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
      className="bg-bg-secondary p-8 rounded-custom shadow-custom-sm border border-border-base max-w-[1000px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <label htmlFor="client" className="block text-sm font-medium text-text-secondary">
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

        <div className="space-y-2">
          <label htmlFor="invoiceNumber" className="block text-sm font-medium text-text-secondary">
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

        <div className="space-y-2">
          <label htmlFor="date" className="block text-sm font-medium text-text-secondary">
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

        <div className="md:col-span-2 pt-6">
          <h3 className="text-lg font-semibold text-text-primary border-b border-border-base pb-3 mb-6">
            Conceptos / Líneas de Factura
          </h3>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-[1fr_80px_120px_100px_40px] gap-4 items-end animate-in fade-in slide-in-from-left-2 duration-200"
              >
                <div className="space-y-2">
                  <label className="block text-[0.7rem] uppercase tracking-wider font-bold text-text-secondary">
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
                <div className="space-y-2">
                  <label className="block text-[0.7rem] uppercase tracking-wider font-bold text-text-secondary">
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
                <div className="space-y-2">
                  <label className="block text-[0.7rem] uppercase tracking-wider font-bold text-text-secondary">
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
                <div className="space-y-2">
                  <label className="block text-[0.7rem] uppercase tracking-wider font-bold text-text-secondary">
                    Subtotal
                  </label>
                  <div className="py-3 font-semibold text-text-primary">
                    €{item.total.toFixed(2)}
                  </div>
                </div>
                <div className="flex justify-end pb-1">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="btn-icon text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200"
                    disabled={items.length === 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-6 flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent-primary border border-accent-primary/20 rounded-custom hover:bg-accent-primary hover:text-white transition-all duration-200"
          >
            <span>+</span> Añadir Concepto
          </button>
        </div>

        <div className="md:col-span-2 md:ml-auto w-full md:w-[350px] mt-8 p-6 bg-bg-primary rounded-custom border border-border-base text-right space-y-3">
          <div className="flex justify-between text-text-secondary">
            <span>Base Imponible:</span>
            <span className="font-semibold text-text-primary">€{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>IVA (21%):</span>
            <span className="font-semibold text-text-primary">€{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-border-base text-xl font-bold text-accent-primary">
            <span>TOTAL:</span>
            <span>€{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="md:col-span-2 pt-8">
          <button
            type="submit"
            className="btn-primary w-full py-4 text-lg shadow-lg shadow-accent-primary/20"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Emitir Factura'}
          </button>
        </div>
      </div>
    </form>
  );
}
