import { getClients } from '@/lib/actions'
import ClientList from '@/components/ClientList'

export const dynamic = 'force-dynamic';

export default async function ClientesPage() {
  const clients = await getClients();

  return (
    <div className="container pb-16">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Mis Clientes</h1>
          <p className="text-text-secondary mt-1 font-medium">Directorio de clientes recurrentes</p>
        </div>
      </header>
      
      <ClientList initialClients={clients} />
    </div>
  );
}
