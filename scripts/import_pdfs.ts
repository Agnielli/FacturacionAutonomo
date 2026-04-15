import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const invoicesDir = path.join(process.cwd(), 'invoices_to_import');

async function main() {
  if (!fs.existsSync(invoicesDir)) {
    console.log('El directorio invoices_to_import no existe.');
    return;
  }

  const files = fs.readdirSync(invoicesDir).filter(f => f.toLowerCase().endsWith('.pdf'));
  
  if (files.length === 0) {
    console.log('No se encontraron PDFs en la carpeta invoices_to_import.');
    return;
  }

  console.log(`Encontrados ${files.length} archivos PDF. Empezando extracción...\n`);

  for (const file of files) {
    const filePath = path.join(invoicesDir, file);
    const dataBuffer = fs.readFileSync(filePath);
    try {
      const parser = new PDFParse({ data: dataBuffer });
      const data = await parser.getText();
      const text = data.text;
      
      // Extraction logic
      const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
      const invoiceNumMatch = text.match(/N°\s+(\d+)/);
      const totalMatch = text.match(/TOTAL\s+([\d,.]+)/);
      
      if (!invoiceNumMatch || !totalMatch) {
        console.warn(`No se pudo extraer información básica de ${file}`);
        continue;
      }

      const invoiceNumber = `INV-${invoiceNumMatch[1].padStart(4, '0')}`;
      const dateStr = dateMatch ? dateMatch[1] : '01/01/2026';
      const [day, month, year] = dateStr.split('/').map(Number);
      const invoiceDate = new Date(year, month - 1, day);
      
      const totalAmount = parseFloat(totalMatch[1].replace(',', '.'));
      const amount = totalAmount / 1.21;
      const tax = totalAmount - amount;

      // Extract client info (heuristic based on observed format)
      // Format: NIF / CIF \n Dirección: ... \n [NIF] \n [NAME] \n N°
      const nifMatch = text.match(/NIF \/ CIF\s+Dirección:[^]*?([A-Z0-9]{8,9})\s+([^]*?)\s+N°/);
      let clientName = "Cliente Desconocido";
      let clientNif = "";
      let clientAddress = "";

      if (nifMatch) {
        clientNif = nifMatch[1].trim();
        clientName = nifMatch[2].trim().split('\n')[0].trim();
        const addrMatch = text.match(/Dirección:\s+([^]*?)\s+[A-Z0-9]{8,9}/);
        if (addrMatch) {
          clientAddress = addrMatch[1].trim().replace(/\n/g, ', ');
        }
      }

      console.log(`Importando ${invoiceNumber}: ${clientName} - ${totalAmount}€`);

      // 1. Ensure client exists
      const client = await prisma.client.upsert({
        where: { id: clientNif || clientName },
        update: {
          name: clientName,
          nif: clientNif,
          address: clientAddress,
        },
        create: {
          id: clientNif || clientName,
          name: clientName,
          nif: clientNif,
          address: clientAddress,
        }
      });

      // 2. Create or update invoice
      await prisma.invoice.upsert({
        where: { invoiceNumber },
        update: {
          clientId: client.id,
          date: invoiceDate,
          amount,
          tax,
          total: totalAmount,
          details: `Importado de PDF: ${file}`
        },
        create: {
          invoiceNumber,
          clientId: client.id,
          date: invoiceDate,
          amount,
          tax,
          total: totalAmount,
          details: `Importado de PDF: ${file}`
        }
      });
      
    } catch (err) {
      console.error(`Error procesando ${file}:`, err);
    }
  }

  console.log("\nImportación completada con éxito.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
