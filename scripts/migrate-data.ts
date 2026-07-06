import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  const readJson = (file: string) => {
    try {
      const content = fs.readFileSync(file, 'utf8').trim()
      return content ? JSON.parse(content) : []
    } catch (e) {
      return []
    }
  }

  const clients = readJson('clients.json')
  const invoices = readJson('invoices.json')
  const items = readJson('items.json')
  const expenses = readJson('expenses.json')

  console.log(`Migrando ${clients.length} clientes...`)
  for (const client of clients) {
    await prisma.client.upsert({
      where: { id: client.id },
      update: {
        name: client.name,
        email: client.email,
        nif: client.nif,
        address: client.address,
        createdAt: new Date(client.createdAt),
        updatedAt: new Date(client.updatedAt),
      },
      create: {
        id: client.id,
        name: client.name,
        email: client.email,
        nif: client.nif,
        address: client.address,
        createdAt: new Date(client.createdAt),
        updatedAt: new Date(client.updatedAt),
      },
    })
  }

  console.log(`Migrando ${invoices.length} facturas...`)
  for (const inv of invoices) {
    await prisma.invoice.upsert({
      where: { id: inv.id },
      update: {
        invoiceNumber: inv.invoiceNumber,
        date: new Date(inv.date),
        clientId: inv.clientId,
        clientName: inv.clientName,
        clientNif: inv.clientNif,
        clientAddress: inv.clientAddress,
        amount: inv.amount,
        tax: inv.tax,
        total: inv.total,
        status: (inv.paid === 1 || inv.paid === true) ? 'COBRADA' : 'GENERADA',
        details: inv.details,
        createdAt: new Date(inv.createdAt),
        updatedAt: new Date(inv.updatedAt),
      },
      create: {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: new Date(inv.date),
        clientId: inv.clientId,
        clientName: inv.clientName,
        clientNif: inv.clientNif,
        clientAddress: inv.clientAddress,
        amount: inv.amount,
        tax: inv.tax,
        total: inv.total,
        status: (inv.paid === 1 || inv.paid === true) ? 'COBRADA' : 'GENERADA',
        details: inv.details,
        createdAt: new Date(inv.createdAt),
        updatedAt: new Date(inv.updatedAt),
      },
    })
  }

  console.log(`Migrando ${items.length} líneas de factura...`)
  for (const item of items) {
    await prisma.invoiceItem.upsert({
      where: { id: item.id },
      update: {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        invoiceId: item.invoiceId,
      },
      create: {
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        invoiceId: item.invoiceId,
      },
    })
  }

  console.log(`Migrando ${expenses.length} gastos...`)
  for (const exp of expenses) {
    await prisma.expense.upsert({
      where: { id: exp.id },
      update: {
        description: exp.description,
        supplier: exp.supplier,
        category: exp.category,
        amount: exp.amount,
        tax: exp.tax,
        total: exp.total,
        date: new Date(exp.date),
        paid: exp.paid === 1 || exp.paid === true,
        createdAt: new Date(exp.createdAt),
        updatedAt: new Date(exp.updatedAt),
      },
      create: {
        id: exp.id,
        description: exp.description,
        supplier: exp.supplier,
        category: exp.category,
        amount: exp.amount,
        tax: exp.tax,
        total: exp.total,
        date: new Date(exp.date),
        paid: exp.paid === 1 || exp.paid === true,
        createdAt: new Date(exp.createdAt),
        updatedAt: new Date(exp.updatedAt),
      },
    })
  }

  console.log('Migración completada!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
