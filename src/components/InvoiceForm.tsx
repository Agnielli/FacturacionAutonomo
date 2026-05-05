'use client';

import { useState, useEffect } from 'react';
import { createInvoice, updateInvoice } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function InvoiceForm({
  clients,
  nextInvoiceNumber,
  initialData,
}: {
  clients: any[];
  nextInvoiceNumber?: string;
  initialData?: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState(initialData?.clientName || initialData?.client?.name || '');

  const [items, setItems] = useState(
    initialData?.items?.map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    })) || [{ description: '', quantity: 1, unitPrice: 0, total: 0 }]
  );

  const [formData, setFormData] = useState({
    invoiceNumber: initialData?.invoiceNumber || nextInvoiceNumber || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    details: initialData?.details || '',
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
      const q = field === 'quantity' ? parseFloat(value) || 0 : newItems[index].quantity;
      const p = field === 'unitPrice' ? parseFloat(value) || 0 : newItems[index].unitPrice;
      newItems[index].total = q * p;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_: any, i: number) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const existingClient = clients.find(
      (c) => c.name.toLowerCase() === clientName.toLowerCase(),
    );

    try {
      if (initialData?.id) {
        await updateInvoice(initialData.id, {
          ...formData,
          amount: subtotal,
          tax,
          total,
          items,
          clientName: clientName,
        });
      } else {
        await createInvoice({
          ...formData,
          amount: subtotal,
          tax,
          total,
          items,
          clientId: existingClient?.id || null,
          clientName: existingClient ? null : clientName,
        });
      }
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Error al guardar la factura.');
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find(c => c.name === clientName);

  return (
    <div className="flex flex-col xl:flex-row gap-10 items-start">
      {/* FORM SIDE */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 w-full bg-bg-secondary p-8 rounded-custom shadow-custom-sm border border-border-base animate-in fade-in slide-in-from-left-4 duration-400"
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
              {items.map((item: any, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-[1fr_80px_120px_100px_40px] gap-4 items-end animate-in fade-in duration-200"
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
                      className="btn-icon text-red-500 border-red-100 hover:bg-red-50"
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
              {loading ? 'Guardando...' : (initialData ? 'Actualizar Factura' : 'Emitir Factura')}
            </button>
          </div>
        </div>
      </form>

      {/* PREVIEW SIDE */}
      <div className="hidden xl:block sticky top-8 w-[600px] animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Vista Previa en Tiempo Real</h3>
          <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary text-[10px] font-black rounded-full uppercase tracking-tighter">Draft Mode</span>
        </div>
        
        <div className="bg-white text-slate-900 p-10 shadow-2xl rounded-sm border border-slate-200 min-h-[840px] flex flex-col origin-top scale-[0.9] -mt-10">
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-4xl font-black tracking-tighter mb-1">FACTURA</h1>
                <div className="h-1.5 w-16 bg-[#4f46e5] rounded-full"></div>
              </div>
              <div className="text-right text-xs space-y-1">
                <p><span className="text-slate-400 font-bold uppercase mr-2">Fecha:</span> <strong>{new Date(formData.date).toLocaleDateString('es-ES')}</strong></p>
                <p><span className="text-slate-400 font-bold uppercase mr-2">Nº Factura:</span> <strong className="text-[#4f46e5] text-sm">{formData.invoiceNumber}</strong></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-12 border-t border-b border-slate-100 py-6">
              <div className="space-y-2">
                <h3 className="text-[10px] font-black text-[#4f46e5] uppercase tracking-widest">Emisor</h3>
                <div className="text-xs space-y-0.5">
                  <p><strong>Enrique Sabariego García</strong></p>
                  <p>77336240M</p>
                  <p>Calle Murillo 2, Bl 4, Pt C, Bajo 3.</p>
                  <p>04630 Garrucha (Almería)</p>
                </div>
              </div>
              <div className="space-y-2 text-right">
                <h3 className="text-[10px] font-black text-[#4f46e5] uppercase tracking-widest">Cliente</h3>
                <div className="text-xs space-y-0.5">
                  <p><strong>{clientName || '[Nombre del Cliente]'}</strong></p>
                  {selectedClient && (
                    <>
                      <p>{selectedClient.nif}</p>
                      <p className="max-w-[200px] ml-auto">{selectedClient.address}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <table className="w-full text-xs mb-8">
              <thead>
                <tr className="border-b-2 border-slate-900 text-left">
                  <th className="py-2 px-2 font-black uppercase tracking-widest text-[10px]">Descripción</th>
                  <th className="py-2 px-2 text-center font-black uppercase tracking-widest text-[10px]">Cant.</th>
                  <th className="py-2 px-2 text-right font-black uppercase tracking-widest text-[10px]">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="py-3 px-2 font-medium">{item.description || '...'}</td>
                    <td className="py-3 px-2 text-center">{item.quantity}</td>
                    <td className="py-3 px-2 text-right font-bold">€{item.unitPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="ml-auto w-48 space-y-2 mb-10">
              <div className="flex justify-between text-slate-500 text-[10px] uppercase font-bold">
                <span>Sub-total:</span>
                <span className="text-slate-900">€{subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[10px] uppercase font-bold">
                <span>IVA (21%):</span>
                <span className="text-slate-900">€{tax.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-slate-900 text-lg font-black text-[#4f46e5]">
                <span>TOTAL:</span>
                <span>€{total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 text-[10px] text-slate-400">
            <h3 className="font-black mb-2 text-slate-500">INFORMACIÓN DE PAGO</h3>
            <p><strong>IBAN:</strong> ES66 0182 6494 8402 0160 0123</p>
            <p className="mt-4 italic text-right">Gracias por su confianza.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
