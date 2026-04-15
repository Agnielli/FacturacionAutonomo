'use server'

import prisma from './prisma'
import { revalidatePath } from 'next/cache'

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
  // Prisma 6+ handles cascade if defined, but using explicit delete for safety
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
  // Check if client has invoices
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
