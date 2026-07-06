'use client'

import { useState } from 'react'
import { updateInvoiceStatus } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { CaretDown } from '@phosphor-icons/react'

interface InvoiceStatusSelectProps {
  id: string
  initialStatus: string
}

export default function InvoiceStatusSelect({ id, initialStatus }: InvoiceStatusSelectProps) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setLoading(true)
    const oldStatus = status
    setStatus(newStatus)
    
    try {
      await updateInvoiceStatus(id, newStatus)
      router.refresh()
    } catch (error) {
      console.error('Error actualizando estado:', error)
      setStatus(oldStatus)
    } finally {
      setLoading(false)
    }
  }

  const getStatusClasses = (s: string) => {
    switch(s) {
      case 'GENERADA': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'ENVIADA': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'PAGADA': return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full border transition-colors duration-200 ${getStatusClasses(status)} ${loading ? 'opacity-60 cursor-not-allowed' : 'opacity-100'}`}>
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={loading}
        className="appearance-none bg-transparent w-full text-center px-8 py-1 text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent rounded-full"
      >
        <option value="GENERADA">Generada</option>
        <option value="ENVIADA">Enviada</option>
        <option value="PAGADA">Pagada</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-inherit opacity-70">
        <CaretDown weight='bold' className='h-3 w-3' />
      </div>
    </div>
  )
}