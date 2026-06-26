'use client';

interface MonthData { month: string; revenue: number; }

interface RevenueChartProps { data: MonthData[]; }

export function RevenueChart({ data }: RevenueChartProps) {
  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 4px' }}>
      {data.map((d) => {
        const pct = (d.revenue / max) * 100;
        return (
          <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              title={`R$ ${d.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              style={{
                width: '100%',
                height: `${pct}%`,
                minHeight: 4,
                background: 'linear-gradient(to top, #0066FF, #00D4FF)',
                borderRadius: '3px 3px 0 0',
                transition: 'height 0.4s',
              }}
            />
            <span style={{ fontSize: 10, color: '#8B9CB6', textAlign: 'center' }}>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}
