'use client'

import { useState } from 'react'
import { deleteInvoice, deleteClient, deleteExpense } from '@/lib/actions'
import { useRouter } from 'next/navigation'

interface DeleteButtonProps {
  id: string
  type: 'invoice' | 'client' | 'expense'
  confirmMessage?: string
}

export default function DeleteButton({ id, type, confirmMessage }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    let defaultMsg = ''
    if (type === 'invoice') defaultMsg = '¿Estás seguro de que deseas eliminar esta factura?';
    else if (type === 'client') defaultMsg = '¿Estás seguro de que deseas eliminar este cliente? Solo se puede eliminar si no tiene facturas asociadas.';
    else if (type === 'expense') defaultMsg = '¿Estás seguro de que deseas eliminar este gasto?';
    
    if (!confirm(confirmMessage || defaultMsg)) return

    setLoading(true)
    try {
      if (type === 'invoice') {
        await deleteInvoice(id)
      } else if (type === 'client') {
        await deleteClient(id)
      } else if (type === 'expense') {
        await deleteExpense(id)
      }
      router.refresh()
    } catch (error: any) {
      console.error(`Error deleting ${type}:`, error)
      alert(error.message || `Error al eliminar el ${type === 'invoice' ? 'factura' : 'cliente'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className="btn-icon text-red-500 border-red-100 font-normal hover:bg-red-50 hover:border-red-200" 
      title="Eliminar"
    >
      {loading ? (
        <span className="text-xs animate-pulse">...</span>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      )}
    </button>
  )
}
