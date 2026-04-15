'use client'

import { useState } from 'react'
import { deleteInvoice, deleteClient } from '@/lib/actions'
import { useRouter } from 'next/navigation'

interface DeleteButtonProps {
  id: string
  type: 'invoice' | 'client'
  confirmMessage?: string
}

export default function DeleteButton({ id, type, confirmMessage }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const defaultMsg = type === 'invoice' 
      ? '¿Estás seguro de que deseas eliminar esta factura? Estás acción no se puede deshacer.' 
      : '¿Estás seguro de que deseas eliminar este cliente? Solo se puede eliminar si no tiene facturas asociadas.'
    
    if (!confirm(confirmMessage || defaultMsg)) return

    setLoading(true)
    try {
      if (type === 'invoice') {
        await deleteInvoice(id)
      } else {
        await deleteClient(id)
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
      className="btn-icon" 
      title="Eliminar"
      style={{ color: '#ef4444', borderColor: '#fee2e2' }}
    >
      {loading ? '...' : '🗑️'}
    </button>
  )
}
