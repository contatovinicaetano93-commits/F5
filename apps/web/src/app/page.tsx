'use client';

import Link from 'next/link';
import { colors, spacing, typography, borderRadius } from '@f5/ui/src/tokens';

export default function LandingPage() {
  return (
    <div style={{ fontFamily: typography.fontFamily.primary }}>
      {/* Navigation */}
      <nav
        style={{
          backgroundColor: colors.white,
          padding: `${spacing[4]} ${spacing[8]}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800, color: colors.navy }}>
            🚀 F5
          </div>
          <div style={{ display: 'flex', gap: spacing[6], alignItems: 'center' }}>
            <Link href="#features" style={{ color: colors.darkGray, textDecoration: 'none' }}>
              Features
            </Link>
            <Link href="#pricing" style={{ color: colors.darkGray, textDecoration: 'none' }}>
              Pricing
            </Link>
            <Link href="/login" style={{ color: colors.white, backgroundColor: colors.blue, padding: `${spacing[2]} ${spacing[4]}`, borderRadius: borderRadius.md, textDecoration: 'none', fontWeight: 600 }}>
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.blue} 100%)`,
          color: colors.white,
          padding: `${spacing[20]} ${spacing[8]}`,
          textAlign: 'center',
          minHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            marginBottom: spacing[4],
            textAlign: 'center',
          }}
        >
          INDÚSTRIA NO DIGITAL
        </h1>
        <p
          style={{
            fontSize: 28,
            marginBottom: spacing[8],
            maxWidth: '800px',
            opacity: 0.95,
          }}
        >
          Acompanhe suas vendas, custos e pagamentos em um só lugar
        </p>
        <div style={{ display: 'flex', gap: spacing[4], justifyContent: 'center' }}>
          <Link
            href="/login"
            style={{
              backgroundColor: colors.cyan,
              color: colors.navy,
              padding: `${spacing[3]} ${spacing[6]}`,
              fontSize: 18,
              fontWeight: 700,
              borderRadius: borderRadius.md,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            Começar Agora
          </Link>
          <Link
            href="#features"
            style={{
              backgroundColor: 'transparent',
              color: colors.cyan,
              padding: `${spacing[3]} ${spacing[6]}`,
              fontSize: 18,
              fontWeight: 700,
              border: `2px solid ${colors.cyan}`,
              borderRadius: borderRadius.md,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            Saber Mais
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        style={{
          backgroundColor: colors.offWhite,
          padding: `${spacing[16]} ${spacing[8]}`,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: colors.navy,
              textAlign: 'center',
              marginBottom: spacing[12],
            }}
          >
            Seu Dashboard Operacional
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: spacing[8],
            }}
          >
            {[
              {
                icon: '📊',
                title: 'Vendas em Tempo Real',
                description: 'Acompanhe todas as suas vendas por marketplace em um dashboard unificado',
              },
              {
                icon: '💰',
                title: 'Custos Operacionais',
                description: 'Registre e acompanhe todos os seus custos de forma organizada',
              },
              {
                icon: '📦',
                title: 'Controle de Estoque',
                description: 'Gerencie seu inventário e receba alertas de reposição',
              },
              {
                icon: '💳',
                title: 'Pagamentos a Receber',
                description: 'Acompanhe prazos e status de pagamentos dos marketplaces',
              },
              {
                icon: '📈',
                title: 'Relatórios Detalhados',
                description: 'Gere relatórios de performance e análises de rentabilidade',
              },
              {
                icon: '📄',
                title: 'Integração com NF',
                description: 'Importe dados de notas fiscais automaticamente',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: colors.white,
                  padding: spacing[6],
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.offWhite}`,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 48, marginBottom: spacing[4] }}>
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: colors.navy,
                    marginBottom: spacing[2],
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: 16,
                    color: colors.gray,
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section
        style={{
          backgroundColor: colors.white,
          padding: `${spacing[16]} ${spacing[8]}`,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: colors.navy,
              textAlign: 'center',
              marginBottom: spacing[12],
            }}
          >
            Como Funciona
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: spacing[6],
              alignItems: 'start',
            }}
          >
            {[
              { step: '1', title: 'Cadastre-se', desc: 'Crie sua conta em minutos' },
              { step: '2', title: 'Conecte Dados', desc: 'Importe suas notas fiscais' },
              { step: '3', title: 'Acompanhe', desc: 'Visualize vendas e custos' },
              { step: '4', title: 'Otimize', desc: 'Tome decisões com dados' },
            ].map((item, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    backgroundColor: colors.blue,
                    color: colors.white,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    fontWeight: 700,
                    margin: '0 auto',
                    marginBottom: spacing[4],
                  }}
                >
                  {item.step}
                </div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: colors.navy,
                    marginBottom: spacing[2],
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ color: colors.gray, fontSize: 14 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        style={{
          backgroundColor: colors.offWhite,
          padding: `${spacing[16]} ${spacing[8]}`,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: colors.navy,
              textAlign: 'center',
              marginBottom: spacing[12],
            }}
          >
            Modelos de Negócio
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: spacing[8],
            }}
          >
            {[
              {
                name: 'Marca do Parceiro',
                desc: 'White Label',
                price: '5%',
                detail: 'das vendas',
                features: [
                  'Sua marca nos marketplaces',
                  'F5 gerencia tudo',
                  'Você recebe 95%',
                  'Risco zero operacional',
                ],
              },
              {
                name: 'Produto Conjunto',
                desc: 'Co-Creation',
                price: '40-60%',
                detail: 'split customizado',
                features: [
                  'Nova marca/linha',
                  'Co-criação com F5',
                  'Split de receita',
                  'Crescimento agressivo',
                ],
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: colors.white,
                  padding: spacing[8],
                  borderRadius: borderRadius.lg,
                  border: `2px solid ${colors.blue}`,
                  textAlign: 'center',
                }}
              >
                <h3
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: colors.navy,
                    marginBottom: spacing[2],
                  }}
                >
                  {plan.name}
                </h3>
                <p style={{ color: colors.blue, fontWeight: 600, marginBottom: spacing[4] }}>
                  {plan.desc}
                </p>
                <div style={{ marginBottom: spacing[6] }}>
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: 800,
                      color: colors.blue,
                    }}
                  >
                    {plan.price}
                  </div>
                  <p style={{ color: colors.gray, fontSize: 14 }}>
                    {plan.detail}
                  </p>
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    marginBottom: spacing[6],
                    textAlign: 'left',
                  }}
                >
                  {plan.features.map((f, i) => (
                    <li
                      key={i}
                      style={{
                        padding: `${spacing[2]} 0`,
                        borderBottom: `1px solid ${colors.offWhite}`,
                        color: colors.darkGray,
                      }}
                    >
                      ✅ {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  style={{
                    display: 'inline-block',
                    backgroundColor: colors.blue,
                    color: colors.white,
                    padding: `${spacing[3]} ${spacing[6]}`,
                    borderRadius: borderRadius.md,
                    textDecoration: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Começar Agora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.blue} 100%)`,
          color: colors.white,
          padding: `${spacing[16]} ${spacing[8]}`,
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: 48, fontWeight: 700, marginBottom: spacing[4] }}>
          Pronto para transformar sua operação?
        </h2>
        <p
          style={{
            fontSize: 20,
            marginBottom: spacing[8],
            maxWidth: '600px',
            margin: '0 auto',
            marginBottom: spacing[8],
          }}
        >
          Comece a acompanhar suas vendas, custos e pagamentos hoje mesmo
        </p>
        <Link
          href="/login"
          style={{
            display: 'inline-block',
            backgroundColor: colors.cyan,
            color: colors.navy,
            padding: `${spacing[3]} ${spacing[8]}`,
            fontSize: 18,
            fontWeight: 700,
            borderRadius: borderRadius.md,
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Acessar Platform
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: colors.darkGray,
          color: colors.white,
          padding: `${spacing[8]} ${spacing[8]}`,
          textAlign: 'center',
          fontSize: 14,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ marginBottom: spacing[2] }}>
            © 2026 F5 — INDÚSTRIA NO DIGITAL. Todos os direitos reservados.
          </p>
          <p style={{ opacity: 0.8 }}>
            Conectando indústrias ao mercado digital
          </p>
        </div>
      </footer>
    </div>
  );
}
