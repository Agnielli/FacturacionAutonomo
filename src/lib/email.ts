import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendInvoiceEmail({
  to,
  invoiceNumber,
  clientName,
  total,
  link,
  attachments
}: {
  to: string;
  invoiceNumber: string;
  clientName: string;
  total: number;
  link: string;
  attachments?: any[];
}) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('AVISO: SMTP no configurado en el archivo .env.');
      return { 
        success: false, 
        error: 'Faltan los datos del servidor SMTP (SMTP_USER, SMTP_PASSWORD) en tu archivo .env' 
      };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Enrique Sabariego" <enrique@saiolab.com>',
      to: to,
      subject: `Factura ${invoiceNumber} - Enrique Sabariego García`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Hola, ${clientName}</h2>
          <p>Espero que estés bien. Te adjunto la factura <strong>${invoiceNumber}</strong> en PDF correspondiente a este periodo.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: bold;">Número de Factura</p>
            <p style="margin: 5px 0 15px 0; font-size: 18px; font-weight: bold; color: #1e293b;">${invoiceNumber}</p>
            
            <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: bold;">Total a Pagar</p>
            <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 800; color: #4f46e5;">€${total.toFixed(2)}</p>
          </div>
          
          <p style="font-size: 14px; color: #64748b;">También puedes verla online aquí:</p>
          <a href="${link}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-bottom: 20px;">Ver Online</a>
          
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
            <strong>Enrique Sabariego García</strong><br/>
            NIF: 77336240M<br/>
            04630 Garrucha (Almería)
          </p>
        </div>
      `,
      attachments: attachments
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, data: info };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error: 'No se pudo enviar el correo. Revisa la configuración SMTP.' };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
  
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Enrique Sabariego" <info@saiolab.com>',
      to: email,
      subject: 'Recuperación de Contraseña - Facturación',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Recuperación de Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para continuar:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Restablecer Contraseña</a>
          </div>
          
          <p style="font-size: 14px; color: #64748b;">Este enlace caducará en 1 hora. Si no has solicitado esto, puedes ignorar este correo.</p>
          
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #94a3b8;">
            <strong>Enrique Sabariego García</strong>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error enviando email de reset:', error);
    return { success: false, error: 'Error al enviar el email' };
  }
}
