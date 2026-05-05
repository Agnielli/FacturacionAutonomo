import { Resend } from 'resend';

export async function sendInvoiceEmail({
  to,
  invoiceNumber,
  clientName,
  total,
  link
}: {
  to: string;
  invoiceNumber: string;
  clientName: string;
  total: number;
  link: string;
}) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey || apiKey === 'tu_api_key_aqui') {
      console.warn('RESEND_API_KEY is missing or invalid. Email simulation mode.');
      return { 
        success: false, 
        error: 'Falta la API Key de Resend. Por favor, añádela a tu archivo .env' 
      };
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: 'Facturas Sabariego <onboarding@resend.dev>',
      to: [to],
      subject: `Factura ${invoiceNumber} - Enrique Sabariego García`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Hola, ${clientName}</h2>
          <p>Espero que estés bien. Te adjunto el enlace para ver y descargar tu factura correspondiente a este periodo.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: bold;">Número de Factura</p>
            <p style="margin: 5px 0 15px 0; font-size: 18px; font-weight: bold; color: #1e293b;">${invoiceNumber}</p>
            
            <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: bold;">Total a Pagar</p>
            <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 800; color: #4f46e5;">€${total.toFixed(2)}</p>
          </div>
          
          <a href="${link}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 10px;">Ver Factura Completa</a>
          
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #94a3b8;">
            Enrique Sabariego García<br/>
            77336240M<br/>
            Garrucha, Almería
          </p>
        </div>
      `,
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}
