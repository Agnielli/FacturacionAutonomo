'use client'

import { useState } from 'react'
import { toggleInvoicePaid } from '@/lib/actions'
import { useRouter } from 'next/navigation'

interface PaidToggleProps {
  id: string
  initialStatus: boolean
}

export default function PaidToggle({ id, initialStatus }: PaidToggleProps) {
  const [isPaid, setIsPaid] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setLoading(true)
    const newStatus = !isPaid
    // Optimistic update
    setIsPaid(newStatus)
    
    try {
      await toggleInvoicePaid(id, newStatus)
      router.refresh()
    } catch (error) {
      console.error('Error toggling paid status:', error)
      // Rollback
      setIsPaid(!newStatus)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 ${
        isPaid ? 'bg-emerald-500' : 'bg-border-base'
      } ${loading ? 'opacity-60 cursor-not-allowed' : 'opacity-100'}`}
      title={isPaid ? 'Marcada como pagada' : 'Marcar como pagada'}
    >
      <span
        className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${
          isPaid ? 'translate-x-5.5' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
