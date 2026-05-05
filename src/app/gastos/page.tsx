import { getExpenses, deleteExpense } from '@/lib/actions';
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function GastosPage() {
  const expenses = (await getExpenses()) || [];
  const currentYear = new Date().getFullYear();
  
  const totalExpenses = expenses.reduce((acc, exp) => acc + (exp.total || 0), 0);
  const totalTax = expenses.reduce((acc, exp) => acc + (exp.tax || 0), 0);

  return (
    <div className="container pb-16">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Mis Gastos</h1>
          <p className="text-text-secondary mt-1 font-medium">
            Control de facturas recibidas y proveedores
          </p>
        </div>
        <Link href="/gastos/nuevo" className="btn-primary px-6 py-3">
          <span className="mr-2 text-xl">+</span> Nuevo Gasto
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-bg-secondary p-6 rounded-custom border border-border-base shadow-custom-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Total Gastado (incl. IVA)</h3>
          <p className="text-2xl font-bold text-text-primary">
            €{totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-bg-secondary p-6 rounded-custom border border-border-base shadow-custom-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">IVA Soportado</h3>
          <p className="text-2xl font-bold text-accent-primary">
            €{totalTax.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-bg-secondary p-6 rounded-custom border border-border-base shadow-custom-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Nº Facturas</h3>
          <p className="text-2xl font-bold text-text-primary">{expenses.length}</p>
        </div>
      </div>

      <main>
        {expenses.length === 0 ? (
          <div className="py-20 text-center bg-bg-secondary rounded-custom border border-border-base border-dashed">
            <div className="text-6xl mb-4 opacity-20">💸</div>
            <p className="text-xl font-medium text-text-secondary">No hay gastos registrados todavía.</p>
            <p className="text-sm text-text-secondary/60 mt-2">Registra tu primer gasto para empezar el seguimiento.</p>
          </div>
        ) : (
          <div className="bg-bg-secondary rounded-custom shadow-custom-sm border border-border-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-primary/50">
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border-base">Fecha</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border-base">Descripción / Proveedor</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border-base">Categoría</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border-base text-right">Total</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border-base text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-bg-primary/30 transition-colors">
                      <td className="px-8 py-4 text-sm text-text-secondary">
                        {new Date(exp.date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-8 py-4">
                        <div className="font-bold text-text-primary">{exp.description}</div>
                        <div className="text-xs text-text-secondary">{exp.supplier}</div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 bg-bg-primary border border-border-base rounded-full text-[10px] font-bold uppercase text-text-secondary">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-8 py-4 font-bold text-right text-text-primary">
                        €{exp.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex justify-end gap-2">
                          <DeleteButton id={exp.id} type="expense" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
