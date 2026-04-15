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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button onClick={handleNew} className="btn btn-primary">+ Nuevo Cliente</button>
      </div>

      <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
      }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Directorio</h2>
        </div>
        
        {initialClients.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>👥</div>
            <p style={{ fontSize: '1.1rem' }}>No tienes clientes guardados todavía.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Crear una factura con un cliente nuevo lo guardará aquí automáticamente.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <th style={{ padding: '1rem 2rem', fontWeight: '500', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>Nombre</th>
                  <th style={{ padding: '1rem 2rem', fontWeight: '500', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>NIF</th>
                  <th style={{ padding: '1rem 2rem', fontWeight: '500', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>Email</th>
                  <th style={{ padding: '1rem 2rem', fontWeight: '500', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>Dirección</th>
                  <th style={{ padding: '1rem 2rem', fontWeight: '500', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {initialClients.map((client: any) => (
                  <tr key={client.id} className="table-row" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 2rem', fontWeight: '500' }}>{client.name}</td>
                    <td style={{ padding: '1rem 2rem', color: 'var(--text-secondary)' }}>{client.nif || '-'}</td>
                    <td style={{ padding: '1rem 2rem', color: 'var(--text-secondary)' }}>{client.email || '-'}</td>
                    <td style={{ padding: '1rem 2rem', color: 'var(--text-secondary)' }}>{client.address || '-'}</td>
                    <td style={{ padding: '1rem 2rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEdit(client)} className="btn-icon" title="Editar">✏️</button>
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
