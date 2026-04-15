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
      className={`paid-toggle ${isPaid ? 'is-paid' : ''}`}
      title={isPaid ? 'Marcada como pagada' : 'Marcar como pagada'}
      style={{
        width: '44px',
        height: '24px',
        background: isPaid ? '#10b981' : 'var(--border-color)',
        borderRadius: '12px',
        border: 'none',
        position: 'relative',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s',
        opacity: loading ? 0.6 : 1,
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          width: '18px',
          height: '18px',
          background: 'white',
          borderRadius: '50%',
          position: 'absolute',
          left: isPaid ? '22px' : '4px',
          transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}
      />
    </button>
  )
}
