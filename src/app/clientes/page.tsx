import { getClients } from '@/lib/actions'
import ClientList from '@/components/ClientList'

export const dynamic = 'force-dynamic';

export default async function ClientesPage() {
  const clients = await getClients();

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header className="header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Mis Clientes</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Directorio de clientes recurrentes</p>
        </div>
      </header>
      
      <ClientList initialClients={clients} />
    </div>
  );
}
