'use client';

import { useState } from 'react';
import { sendInvoiceAction } from '@/lib/actions';

export default function EmailButton({ id, clientEmail }: { id: string; clientEmail?: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    const email = prompt('Introduce el email del cliente:', clientEmail || '');
    if (!email) return;

    setLoading(true);
    try {
      const res = await sendInvoiceAction(id, email);
      if (res.success) {
        setSent(true);
        setTimeout(() => setSent(false), 5000);
      } else {
        alert('Error al enviar el email.');
      }
    } catch (err) {
      console.error(err);
      alert('Error crítico al enviar el email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 border rounded-custom transition-all ${
        sent 
          ? 'bg-green-500 border-green-500 text-white' 
          : 'border-border-base text-text-secondary hover:text-accent-primary hover:bg-bg-primary'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
      </svg>
      <span className="font-medium">{loading ? 'Enviando...' : sent ? '¡Enviado!' : 'Enviar por Email'}</span>
    </button>
  );
}
