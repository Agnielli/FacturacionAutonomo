'use client';

import { useState } from 'react';
import { createExpense } from '@/lib/actions';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  'Hosting & Software',
  'Publicidad & Marketing',
  'Suministros (Luz, Internet)',
  'Oficina & Material',
  'Formación',
  'Seguros & Gestoría',
  'Otros'
];

export default function ExpenseForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    supplier: '',
    category: 'Otros',
    amount: '',
    tax: '',
    total: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleAmountChange = (val: string, type: 'amount' | 'tax' | 'total') => {
    const num = parseFloat(val) || 0;
    const newDraft = { ...formData, [type]: val };
    
    // Auto-calculate others if possible
    if (type === 'amount') {
      const tax = num * 0.21;
      const total = num + tax;
      setFormData({ 
        ...newDraft, 
        tax: tax.toFixed(2), 
        total: total.toFixed(2) 
      });
    } else if (type === 'total') {
      const amount = num / 1.21;
      const tax = num - amount;
      setFormData({ 
        ...newDraft, 
        amount: amount.toFixed(2), 
        tax: tax.toFixed(2) 
      });
    } else {
      setFormData(newDraft);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createExpense({
        description: formData.description,
        supplier: formData.supplier,
        category: formData.category,
        amount: parseFloat(formData.amount),
        tax: parseFloat(formData.tax),
        total: parseFloat(formData.total),
        date: formData.date
      });
      router.push('/gastos');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el gasto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-bg-secondary p-8 rounded-custom shadow-custom-sm border border-border-base max-w-[800px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-text-secondary">Descripción del Gasto</label>
          <input
            type="text"
            className="form-input"
            placeholder="Ej. Suscripción Adobe Creative Cloud..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">Proveedor</label>
          <input
            type="text"
            className="form-input"
            placeholder="Ej. Adobe Systems..."
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">Categoría</label>
          <select
            className="form-input"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">Fecha</label>
          <input
            type="date"
            className="form-input"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">Base Imponible (€)</label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            value={formData.amount}
            onChange={(e) => handleAmountChange(e.target.value, 'amount')}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">IVA (€)</label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            value={formData.tax}
            onChange={(e) => handleAmountChange(e.target.value, 'tax')}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary font-bold text-accent-primary">Total con IVA (€)</label>
          <input
            type="number"
            step="0.01"
            className="form-input border-accent-primary/30 bg-accent-primary/5 focus:ring-accent-primary/50"
            value={formData.total}
            onChange={(e) => handleAmountChange(e.target.value, 'total')}
            required
          />
        </div>

        <div className="md:col-span-2 pt-8">
          <button
            type="submit"
            className="btn-primary w-full py-4 text-lg shadow-lg shadow-accent-primary/20"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Registrar Gasto'}
          </button>
        </div>
      </div>
    </form>
  );
}
