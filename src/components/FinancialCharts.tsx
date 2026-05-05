'use client';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

interface FinancialChartsProps {
  invoices: any[];
  expenses: any[];
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const COLORS = ['#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export default function FinancialCharts({ invoices, expenses }: FinancialChartsProps) {
  const currentYear = new Date().getFullYear();

  // 1. Monthly data for Bar Chart
  const monthlyData = MONTHS.map((name, index) => {
    const monthInvoices = invoices.filter(inv => {
      const d = new Date(inv.date);
      return d.getFullYear() === currentYear && d.getMonth() === index;
    });
    const monthExpenses = expenses.filter(exp => {
      const d = new Date(exp.date);
      return d.getFullYear() === currentYear && d.getMonth() === index;
    });

    return {
      name,
      ingresos: monthInvoices.reduce((a, b) => a + b.total, 0),
      gastos: monthExpenses.reduce((a, b) => a + b.total, 0),
    };
  });

  // 2. Category data for Pie Chart
  const categoriesMap: Record<string, number> = {};
  expenses.forEach(exp => {
    const cat = exp.category || 'Otros';
    categoriesMap[cat] = (categoriesMap[cat] || 0) + exp.total;
  });

  const pieData = Object.entries(categoriesMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
      {/* Monthly Evolution */}
      <div className="lg:col-span-2 bg-bg-secondary p-8 rounded-custom border border-border-base shadow-custom-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-8">Evolución Ingresos vs Gastos {currentYear}</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
              <Bar dataKey="ingresos" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Ingresos (€)" />
              <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} name="Gastos (€)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-bg-secondary p-8 rounded-custom border border-border-base shadow-custom-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-8">Distribución de Gastos</h3>
        <div className="h-[350px] w-full flex flex-col items-center">
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-[10px] font-bold text-text-secondary uppercase">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
