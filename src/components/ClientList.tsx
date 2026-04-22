'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ClientForm from './ClientForm'
import DeleteButton from './DeleteButton'

export default function ClientList({ initialClients }: { initialClients: any[] }) {
  const [showForm, setShowForm] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const router = useRouter()

  const handleEdit = (client: any) => {
    setSelectedClient(client)
    setShowForm(true)
  }

  const handleNew = () => {
    setSelectedClient(null)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setSelectedClient(null)
    router.refresh()
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <button onClick={handleNew} className="btn-primary">
          <span className="mr-2">+</span> Nuevo Cliente
        </button>
      </div>

      <div className="bg-bg-secondary rounded-custom shadow-custom-sm border border-border-base overflow-hidden">
        <div className="px-8 py-6 border-b border-border-base">
          <h2 className="text-xl font-semibold text-text-primary">Directorio de Clientes</h2>
        </div>
        
        {initialClients.length === 0 ? (
          <div className="px-8 py-16 text-center text-text-secondary">
            <div className="text-5xl mb-4 opacity-50">👥</div>
            <p className="text-lg font-medium">No tienes clientes guardados todavía.</p>
            <p className="text-sm mt-2">Crear una factura con un cliente nuevo lo guardará aquí automáticamente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-primary">
                  <th className="px-8 py-4 font-semibold text-sm text-text-secondary border-b border-border-base">Nombre</th>
                  <th className="px-8 py-4 font-semibold text-sm text-text-secondary border-b border-border-base">NIF</th>
                  <th className="px-8 py-4 font-semibold text-sm text-text-secondary border-b border-border-base">Email</th>
                  <th className="px-8 py-4 font-semibold text-sm text-text-secondary border-b border-border-base">Dirección</th>
                  <th className="px-8 py-4 font-semibold text-sm text-text-secondary border-b border-border-base text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {initialClients.map((client: any) => (
                  <tr key={client.id} className="hover:bg-bg-primary/50 transition-colors">
                    <td className="px-8 py-4 font-medium text-text-primary">{client.name}</td>
                    <td className="px-8 py-4 text-text-secondary text-sm">{client.nif || '—'}</td>
                    <td className="px-8 py-4 text-text-secondary text-sm">{client.email || '—'}</td>
                    <td className="px-8 py-4 text-text-secondary text-sm max-w-xs truncate">{client.address || '—'}</td>
                    <td className="px-8 py-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(client)} 
                          className="btn-icon hover:text-accent-primary" 
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                          </svg>
                        </button>
                        <DeleteButton id={client.id} type="client" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <ClientForm 
          client={selectedClient} 
          onClose={() => setShowForm(false)} 
          onSuccess={handleSuccess} 
        />
      )}
    </>
  )
}
