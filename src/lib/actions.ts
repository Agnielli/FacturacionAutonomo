'use server'
// Force reload after prisma generation

import prisma from './prisma'
import { revalidatePath } from 'next/cache'
import { sendInvoiceEmail } from './email'

export async function getClients() {
  return await prisma.client.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function getInvoices() {
  return await prisma.invoice.findMany({
    include: { client: true, items: true },
    orderBy: { date: 'desc' }
  })
}

export async function deleteInvoice(id: string) {
  await prisma.invoiceItem.deleteMany({
    where: { invoiceId: id }
  })
  const invoice = await prisma.invoice.delete({
    where: { id }
  })
  revalidatePath('/')
  return invoice
}

export async function deleteClient(id: string) {
  const invoicesCount = await prisma.invoice.count({
    where: { clientId: id }
  })
  
  if (invoicesCount > 0) {
    throw new Error('No se puede eliminar un cliente que tiene facturas asociadas.')
  }

  const client = await prisma.client.delete({
    where: { id }
  })
  revalidatePath('/clientes')
  return client
}

export async function toggleInvoicePaid(id: string, paid: boolean) {
  const invoice = await prisma.invoice.update({
    where: { id },
    data: { paid }
  })
  revalidatePath('/')
  return invoice
}

export async function getInvoiceById(id: string) {
  return await prisma.invoice.findFirst({
    where: { id },
    include: { 
      client: true,
      items: true
    }
  })
}

export async function getNextInvoiceNumber() {
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { invoiceNumber: 'desc' }
  })
  
  if (!lastInvoice) return 'INV-0001';
  
  const lastNum = parseInt(lastInvoice.invoiceNumber.split('-')[1]) || 0;
  return `INV-${(lastNum + 1).toString().padStart(4, '0')}`;
}

export async function createClient(data: { name: string; email?: string; nif?: string; address?: string }) {
  const client = await prisma.client.create({ data })
  revalidatePath('/clientes')
  return client
}

export async function updateClient(id: string, data: { name: string; email?: string; nif?: string; address?: string }) {
  const client = await prisma.client.update({
    where: { id },
    data
  })
  revalidatePath('/clientes')
  return client
}

export async function updateInvoice(id: string, data: any) {
  await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      invoiceNumber: data.invoiceNumber,
      date: new Date(data.date),
      clientName: data.clientName,
      amount: parseFloat(data.amount),
      tax: parseFloat(data.tax),
      total: parseFloat(data.total),
      details: data.details,
      items: {
        create: data.items.map((item: any) => ({
          description: item.description,
          quantity: parseFloat(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice),
          total: parseFloat(item.total)
        }))
      }
    }
  });
  revalidatePath('/');
  revalidatePath(`/facturas/${id}`);
  return invoice;
}

export async function createInvoice(data: any) {
  let clientId = data.clientId;

  if (!clientId && data.clientName) {
    const newClient = await prisma.client.create({ data: { name: data.clientName } })
    clientId = newClient.id;
  }

  const clientData = await prisma.client.findUnique({ where: { id: clientId } });

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: data.invoiceNumber,
      date: new Date(data.date),
      clientId: clientId,
      clientName: clientData?.name,
      clientNif: clientData?.nif,
      clientAddress: clientData?.address,
      amount: parseFloat(data.amount),
      tax: parseFloat(data.tax),
      total: parseFloat(data.total),
      details: data.details,
      items: {
        create: data.items.map((item: any) => ({
          description: item.description,
          quantity: parseFloat(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice),
          total: parseFloat(item.total)
        }))
      }
    }
  })
  revalidatePath('/')
  return invoice
}

export async function generateMonthlyInvoices() {
  const RECURRENT_CLIENTS = [
    {
      id: "B04897385",
      name: "G Mas I Igual Solución, SLU",
      concept: "Gestión y mantenimiento web, blog y SEO orgánico en giservicios.es (mes {month} {year})",
      amount: 100
    },
    {
      id: "45598348C",
      name: "Sebastián Victor García Gerez",
      concept: "Gestión y mantenimiento web y redes sociales sebaspinturas.es (mes {month} {year})",
      amount: 160
    },
    {
      id: "53345741R",
      name: "Francisco Castillo Moya",
      concept: "Mantenimiento web tentusilla.es ({month} {year})",
      amount: 25
    },
    {
      id: "44511994W",
      name: "Maria Amparo Rodriguez Ferrer",
      concept: "Pago fraccionado web vinculosconhuella.es ({month} {year})",
      amount: 75
    },
    {
      id: "B09666983",
      name: "Super Cash Garrucha SL",
      concept: "Gestión redes sociales (mes {month} {year})",
      amount: 100
    }
  ];

  const now = new Date();
  const monthName = now.toLocaleString('es-ES', { month: 'long' });
  const year = now.getFullYear();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let createdCount = 0;
  let skippedCount = 0;

  for (const template of RECURRENT_CLIENTS) {
    const existing = await prisma.invoice.findFirst({
      where: {
        clientId: template.id,
        date: { gte: firstDayOfMonth }
      }
    });

    if (existing) {
      skippedCount++;
      continue;
    }

    const nextInvoiceNumber = await getNextInvoiceNumber();
    const concept = template.concept
      .replace('{month}', monthName)
      .replace('{year}', year.toString());

    const client = await prisma.client.findUnique({ where: { id: template.id } });

    await prisma.invoice.create({
      data: {
        invoiceNumber: nextInvoiceNumber,
        date: now,
        clientId: template.id,
        clientName: client?.name,
        clientNif: client?.nif,
        clientAddress: client?.address,
        amount: template.amount,
        tax: template.amount * 0.21,
        total: template.amount * 1.21,
        items: {
          create: [{
            description: concept,
            quantity: 1,
            unitPrice: template.amount,
            total: template.amount
          }]
        }
      }
    });
    createdCount++;
  }

  revalidatePath('/');
  return { created: createdCount, skipped: skippedCount };
}

// --- EXPENSE ACTIONS ---

export async function getExpenses() {
  return await prisma.expense.findMany({
    orderBy: { date: 'desc' }
  })
}

export async function createExpense(data: {
  description: string;
  supplier?: string;
  category?: string;
  amount: number;
  tax: number;
  total: number;
  date: string;
}) {
  const expense = await prisma.expense.create({
    data: {
      ...data,
      date: new Date(data.date)
    }
  })
  revalidatePath('/gastos')
  revalidatePath('/')
  return expense
}

export async function deleteExpense(id: string) {
  const expense = await prisma.expense.delete({
    where: { id }
  })
  revalidatePath('/gastos')
  revalidatePath('/')
  return expense
}

export async function sendInvoiceAction(id: string, email: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true }
  })

  if (!invoice) throw new Error('Factura no encontrada')

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const link = `${baseUrl}/facturas/${id}`

  return await sendInvoiceEmail({
    to: email,
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.clientName || invoice.client?.name || 'Cliente',
    total: invoice.total,
    link
  })
}
