'use client';

import { useState } from 'react';
import { generateMonthlyInvoices } from '@/lib/actions';

export default function GenerateMonthlyButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ created: number; skipped: number } | null>(null);

  const handleGenerate = async () => {
    if (!confirm('¿Seguro que quieres generar las facturas de este mes para los clientes recurrentes?')) return;
    
    setLoading(true);
    setStatus(null);
    try {
      const res = await generateMonthlyInvoices();
      setStatus(res);
      setTimeout(() => setStatus(null), 5000);
    } catch (err) {
      console.error(err);
      alert('Error al generar facturas recurrentes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-custom border-2 border-accent-primary text-accent-primary font-bold hover:bg-accent-primary hover:text-white transition-all duration-200 disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        {loading ? 'Generando...' : 'Generar Facturas Mensuales'}
      </button>
      
      {status && (
        <div className="absolute top-full mt-2 right-0 bg-bg-secondary p-3 rounded-custom border border-accent-primary shadow-lg z-50 animate-in fade-in zoom-in duration-200 min-w-[200px]">
          <p className="text-sm font-bold text-text-primary">
            ✅ {status.created} facturas generadas
          </p>
          <p className="text-xs text-text-secondary mt-1">
            ⚠️ {status.skipped} ya existían
          </p>
        </div>
      )}
    </div>
  );
}
