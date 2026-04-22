'use client'

import { useState } from 'react'
import { createClient, updateClient } from '@/lib/actions'

interface ClientFormProps {
  client?: any
  onClose: () => void
  onSuccess: () => void
}

export default function ClientForm({ client, onClose, onSuccess }: ClientFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    nif: client?.nif || '',
    address: client?.address || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (client?.id) {
        await updateClient(client.id, formData)
      } else {
        await createClient(formData)
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving client:', error)
      alert('Error al guardar el cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary p-8 rounded-custom w-full max-w-[500px] shadow-2xl border border-border-base animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold mb-6 text-text-primary">
          {client ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Nombre *</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">NIF/CIF</label>
            <input
              type="text"
              className="form-input"
              value={formData.nif}
              onChange={e => setFormData({ ...formData, nif: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Dirección</label>
            <textarea
              className="form-input min-h-[100px] resize-y"
              rows={3}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2 border border-border-base rounded-custom text-text-secondary hover:bg-bg-primary hover:text-text-primary transition-all duration-200"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary"
            >
              {loading ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
