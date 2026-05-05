import { getInvoices, getExpenses } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function ImpuestosPage() {
  const invoices = (await getInvoices()) || [];
  const expenses = (await getExpenses()) || [];
  const currentYear = new Date().getFullYear();

  const getQuarterData = (quarter: number) => {
    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 2;
    
    const qInvoices = invoices.filter(inv => {
      const d = new Date(inv.date);
      return d.getFullYear() === currentYear && d.getMonth() >= startMonth && d.getMonth() <= endMonth;
    });

    const qExpenses = expenses.filter(exp => {
      const d = new Date(exp.date);
      return d.getFullYear() === currentYear && d.getMonth() >= startMonth && d.getMonth() <= endMonth;
    });

    const ivaRepercutido = qInvoices.reduce((a, b) => a + b.tax, 0);
    const ivaSoportado = qExpenses.reduce((a, b) => a + b.tax, 0);
    const subtotalIngresos = qInvoices.reduce((a, b) => a + b.amount, 0);
    const subtotalGastos = qExpenses.reduce((a, b) => a + b.amount, 0);
    
    const profit = subtotalIngresos - subtotalGastos;
    const irpf = Math.max(0, profit * 0.20); // Estimation

    return {
      ivaRepercutido,
      ivaSoportado,
      ivaNeto: ivaRepercutido - ivaSoportado,
      profit,
      irpf,
      totalTaxes: (ivaRepercutido - ivaSoportado) + irpf
    };
  };

  const quarters = [1, 2, 3, 4].map(q => ({ q, ...getQuarterData(q) }));

  return (
    <div className="container pb-16">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Panel de Impuestos {currentYear}</h1>
        <p className="text-text-secondary mt-1 font-medium">Estimación de liquidaciones trimestrales (IVA e IRPF)</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quarters.map((data) => (
          <div key={data.q} className="bg-bg-secondary rounded-custom border border-border-base shadow-custom-sm overflow-hidden flex flex-col">
            <div className="bg-bg-primary px-6 py-4 border-b border-border-base flex justify-between items-center">
              <h2 className="font-black text-text-primary uppercase tracking-tighter">Trimestre {data.q}</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${data.totalTaxes > 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                {data.totalTaxes > 0 ? 'Pendiente' : 'A compensar'}
              </span>
            </div>
            
            <div className="p-6 flex-grow space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>IVA Repercutido (+)</span>
                  <span>€{data.ivaRepercutido.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>IVA Soportado (-)</span>
                  <span>€{data.ivaSoportado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-text-primary pt-1 border-t border-border-base/50">
                  <span>Saldo IVA</span>
                  <span className={data.ivaNeto > 0 ? 'text-orange-500' : 'text-green-500'}>
                    €{data.ivaNeto.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Beneficio Bruto</span>
                  <span>€{data.profit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Estimación IRPF (20%)</span>
                  <span>€{data.irpf.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-bg-primary/50 p-6 border-t border-border-base mt-auto">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Total a Reservar</span>
                <span className="text-xl font-black text-accent-primary">€{data.totalTaxes.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-accent-primary/5 rounded-custom border border-accent-primary/20">
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-xl">💡</span> Nota Informativa
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
          Estos cálculos son <strong>estimaciones automáticas</strong> basadas en los datos introducidos. 
          El IRPF se calcula como el 20% del beneficio neto trimestral (ingresos menos gastos, sin IVA). 
          Para una liquidación oficial, consulta siempre con tu gestor.
        </p>
      </div>
    </div>
  );
}
