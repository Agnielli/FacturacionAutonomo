'use client';

import { useState } from 'react';
import { sendInvoiceAction } from '@/lib/actions';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';

export default function EmailButton({ id, clientEmail }: { id: string; clientEmail?: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const generatePDF = async () => {
    const element = document.getElementById('invoice-content');
    if (!element) return null;

    // html-to-image perfectly supports modern CSS (oklch, oklab)
    // Usamos toJpeg para que pese mucho menos el string de base64.
    const imgData = await toJpeg(element, {
      quality: 0.85,
      pixelRatio: 1.5,
      backgroundColor: '#ffffff'
    });
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    return pdf.output('datauristring');
  };

  const handleSend = async () => {
    const email = prompt('Introduce el email del cliente:', clientEmail || '');
    if (!email) return;

    setLoading(true);
    try {
      // 1. Generar el PDF en el cliente
      const pdfBase64 = await generatePDF();
      
      // 2. Enviar al servidor
      const res = await sendInvoiceAction(id, email, pdfBase64 || undefined);
      
      if (res.success) {
        setSent(true);
        setTimeout(() => setSent(false), 5000);
      } else {
        alert(res.error || 'Error al enviar el email.');
      }
    } catch (err) {
      console.error(err);
      alert('Error crítico al generar o enviar el PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 border rounded-custom shadow-sm transition-all duration-300 ${
        sent 
          ? 'bg-green-500 border-green-500 text-white' 
          : 'bg-bg-secondary border-border-base text-text-secondary hover:text-accent-primary hover:border-accent-primary hover:bg-bg-primary'
      }`}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
        </svg>
      )}
      <span className="font-medium">
        {loading ? 'Generando PDF...' : sent ? '¡Enviado con PDF!' : 'Enviar PDF por Email'}
      </span>
    </button>
  );
}
