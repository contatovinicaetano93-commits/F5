'use client';

import { colors, spacing, typography, borderRadius } from '@f5/ui/src/tokens';

export default function DashboardPage() {
  // Mock data - será substituído por API calls
  const kpis = [
    {
      title: 'Vendas Este Mês',
      value: 'R$ 50.000',
      change: '+15%',
      icon: '📊',
      color: colors.blue,
    },
    {
      title: 'Custos Operacionais',
      value: 'R$ 8.500',
      change: '-5%',
      icon: '💰',
      color: colors.cyan,
    },
    {
      title: 'Estoque Total',
      value: '1.250 un',
      change: '+45 un',
      icon: '📦',
      color: colors.navy,
    },
    {
      title: 'Pagamentos a Receber',
      value: 'R$ 35.000',
      change: '-R$ 5.000',
      icon: '💳',
      color: colors.darkGray,
    },
  ];

  const recentSales = [
    {
      id: 1,
      nf: 'NF-001',
      date: '22/06/2026',
      amount: 'R$ 5.000',
      status: 'Pago',
      marketplace: 'ML',
    },
    {
      id: 2,
      nf: 'NF-002',
      date: '21/06/2026',
      amount: 'R$ 3.500',
      status: 'Pendente',
      marketplace: 'Amazon',
    },
    {
      id: 3,
      nf: 'NF-003',
      date: '20/06/2026',
      amount: 'R$ 8.200',
      status: 'Processando',
      marketplace: 'Shopee',
    },
  ];

  return (
    <div
      style={{
        fontFamily: typography.fontFamily.primary,
        backgroundColor: colors.offWhite,
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: colors.white,
          padding: `${spacing[6]} ${spacing[8]}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: colors.navy,
              margin: 0,
            }}
          >
            Dashboard
          </h1>
          <p style={{ color: colors.gray, margin: '5px 0 0 0', fontSize: 14 }}>
            Bem-vindo ao seu painel de operações
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: spacing[8],
        }}
      >
        {/* KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: spacing[6],
            marginBottom: spacing[8],
          }}
        >
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: colors.white,
                padding: spacing[6],
                borderRadius: borderRadius.lg,
                border: `1px solid ${colors.offWhite}`,
                borderLeft: `4px solid ${kpi.color}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: spacing[4],
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    color: colors.gray,
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {kpi.title}
                </h3>
                <span style={{ fontSize: 28 }}>{kpi.icon}</span>
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: colors.navy,
                  marginBottom: spacing[2],
                }}
              >
                {kpi.value}
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: kpi.change.includes('-') ? colors.blue : colors.cyan,
                  fontWeight: 600,
                }}
              >
                {kpi.change}
              </span>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: spacing[6],
            marginBottom: spacing[8],
          }}
        >
          {/* Sales Chart */}
          <div
            style={{
              backgroundColor: colors.white,
              padding: spacing[6],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.offWhite}`,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: colors.navy,
                marginBottom: spacing[4],
                margin: '0 0 20px 0',
              }}
            >
              Vendas (Últimos 30 dias)
            </h2>
            <div
              style={{
                height: '300px',
                backgroundColor: colors.offWhite,
                borderRadius: borderRadius.md,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                padding: spacing[4],
              }}
            >
              {/* Chart bars (mock) */}
              {[1, 0.8, 0.6, 0.9, 0.7, 1.0].map((height, i) => (
                <div
                  key={i}
                  style={{
                    width: '12%',
                    height: `${height * 200}px`,
                    backgroundColor: colors.blue,
                    borderRadius: borderRadius.md,
                    opacity: 0.8,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Top Marketplaces */}
          <div
            style={{
              backgroundColor: colors.white,
              padding: spacing[6],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.offWhite}`,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: colors.navy,
                marginBottom: spacing[4],
                margin: '0 0 20px 0',
              }}
            >
              Top Marketplaces
            </h2>
            {['Mercado Livre', 'Amazon', 'Shopee'].map((mp, i) => (
              <div
                key={i}
                style={{
                  padding: spacing[3],
                  borderBottom: i < 2 ? `1px solid ${colors.offWhite}` : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ color: colors.darkGray, fontWeight: 500 }}>
                  {mp}
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    color: colors.blue,
                  }}
                >
                  {[60, 25, 15][i]}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales Table */}
        <div
          style={{
            backgroundColor: colors.white,
            padding: spacing[6],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.offWhite}`,
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: colors.navy,
              marginBottom: spacing[4],
              margin: '0 0 20px 0',
            }}
          >
            Últimas Vendas
          </h2>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 14,
            }}
          >
            <thead>
              <tr style={{ borderBottom: `2px solid ${colors.offWhite}` }}>
                <th
                  style={{
                    textAlign: 'left',
                    padding: spacing[3],
                    color: colors.gray,
                    fontWeight: 600,
                  }}
                >
                  NF
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: spacing[3],
                    color: colors.gray,
                    fontWeight: 600,
                  }}
                >
                  Data
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: spacing[3],
                    color: colors.gray,
                    fontWeight: 600,
                  }}
                >
                  Marketplace
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: spacing[3],
                    color: colors.gray,
                    fontWeight: 600,
                  }}
                >
                  Valor
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: spacing[3],
                    color: colors.gray,
                    fontWeight: 600,
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale, idx) => (
                <tr
                  key={idx}
                  style={{ borderBottom: `1px solid ${colors.offWhite}` }}
                >
                  <td
                    style={{
                      padding: spacing[3],
                      color: colors.navy,
                      fontWeight: 600,
                    }}
                  >
                    {sale.nf}
                  </td>
                  <td style={{ padding: spacing[3], color: colors.darkGray }}>
                    {sale.date}
                  </td>
                  <td style={{ padding: spacing[3], color: colors.darkGray }}>
                    {sale.marketplace}
                  </td>
                  <td
                    style={{
                      padding: spacing[3],
                      color: colors.blue,
                      fontWeight: 600,
                    }}
                  >
                    {sale.amount}
                  </td>
                  <td style={{ padding: spacing[3] }}>
                    <span
                      style={{
                        backgroundColor:
                          sale.status === 'Pago'
                            ? '#D1FAE5'
                            : sale.status === 'Pendente'
                              ? '#FEF3C7'
                              : '#E0E7FF',
                        color:
                          sale.status === 'Pago'
                            ? '#065F46'
                            : sale.status === 'Pendente'
                              ? '#92400E'
                              : '#3730A3',
                        padding: `${spacing[1]} ${spacing[2]}`,
                        borderRadius: borderRadius.md,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
