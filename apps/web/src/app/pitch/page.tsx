'use client';

import { colors, spacing, typography, borderRadius } from '@f5/ui/src/tokens';

export default function PitchPage() {
  return (
    <div style={{ fontFamily: typography.fontFamily.primary }}>
      {/* Hero Section */}
      <section
        style={{
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.blue} 100%)`,
          color: colors.white,
          padding: `${spacing[20]} ${spacing[8]}`,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: typography.fontSize['5xl'],
            fontWeight: typography.fontWeight.extraBold,
            margin: 0,
            marginBottom: spacing[4],
          }}
        >
          INDÚSTRIA NO DIGITAL
        </h1>
        <p
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.regular,
            margin: 0,
            marginBottom: spacing[8],
            opacity: 0.9,
          }}
        >
          Plataforma moderna para transformação operacional
        </p>
        <button
          style={{
            backgroundColor: colors.cyan,
            color: colors.navy,
            border: 'none',
            padding: `${spacing[3]} ${spacing[6]}`,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.bold,
            borderRadius: borderRadius.md,
            cursor: 'pointer',
          }}
        >
          Ver Apresentação Completa
        </button>
      </section>

      {/* Valor Section */}
      <section
        style={{
          padding: `${spacing[16]} ${spacing[8]}`,
          backgroundColor: colors.offWhite,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: typography.fontSize['4xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.navy,
              textAlign: 'center',
              marginBottom: spacing[12],
            }}
          >
            Por que F5?
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: spacing[8],
            }}
          >
            {[
              {
                title: '60% Menos Tempo',
                description: 'Em processos administrativos',
                icon: '⚡',
              },
              {
                title: 'Visibilidade 24/7',
                description: 'De todas as operações em tempo real',
                icon: '📊',
              },
              {
                title: '20-30% Economia',
                description: 'Em custos operacionais',
                icon: '💰',
              },
              {
                title: 'ROI em 6 meses',
                description: 'Retorno típico para clientes',
                icon: '📈',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: colors.white,
                  padding: spacing[6],
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.offWhite}`,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: typography.fontSize['4xl'],
                    marginBottom: spacing[4],
                  }}
                >
                  {item.icon}
                </div>
                <h3
                  style={{
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.navy,
                    marginBottom: spacing[2],
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.gray,
                    margin: 0,
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Identidade Visual */}
      <section
        style={{
          padding: `${spacing[16]} ${spacing[8]}`,
          backgroundColor: colors.white,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: typography.fontSize['4xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.navy,
              marginBottom: spacing[12],
            }}
          >
            Identidade Visual
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[8] }}>
            <div>
              <h3
                style={{
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.navy,
                  marginBottom: spacing[4],
                }}
              >
                Paleta de Cores
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                {[
                  { name: 'Navy (Primária)', color: colors.navy },
                  { name: 'Blue (Destaque)', color: colors.blue },
                  { name: 'Cyan (Acento)', color: colors.cyan },
                  { name: 'Off White (Fundo)', color: colors.offWhite },
                ].map((item) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: item.color,
                        borderRadius: borderRadius.md,
                        border: `1px solid ${colors.gray}`,
                      }}
                    />
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: typography.fontWeight.bold,
                          color: colors.navy,
                        }}
                      >
                        {item.name}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: typography.fontSize.sm,
                          color: colors.gray,
                        }}
                      >
                        {item.color}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3
                style={{
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.navy,
                  marginBottom: spacing[4],
                }}
              >
                Tipografia
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
                <div>
                  <h4
                    style={{
                      fontSize: typography.fontSize['2xl'],
                      fontWeight: typography.fontWeight.extraBold,
                      color: colors.navy,
                      margin: 0,
                    }}
                  >
                    Inter Extra Bold (48px)
                  </h4>
                  <p style={{ color: colors.gray, margin: 0, marginTop: spacing[1] }}>
                    Para títulos principais
                  </p>
                </div>

                <div>
                  <h4
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.regular,
                      color: colors.navy,
                      margin: 0,
                    }}
                  >
                    Inter Regular (18px)
                  </h4>
                  <p style={{ color: colors.gray, margin: 0, marginTop: spacing[1] }}>
                    Para corpo de texto
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.blue} 100%)`,
          color: colors.white,
          padding: `${spacing[16]} ${spacing[8]}`,
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: typography.fontSize['4xl'],
            fontWeight: typography.fontWeight.bold,
            marginBottom: spacing[4],
          }}
        >
          Pronto para transformar sua indústria?
        </h2>
        <p
          style={{
            fontSize: typography.fontSize.lg,
            marginBottom: spacing[8],
            opacity: 0.9,
          }}
        >
          Entre em contato para uma demo exclusiva
        </p>
        <button
          style={{
            backgroundColor: colors.cyan,
            color: colors.navy,
            border: 'none',
            padding: `${spacing[3]} ${spacing[6]}`,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.bold,
            borderRadius: borderRadius.md,
            cursor: 'pointer',
          }}
        >
          Agendar Demo
        </button>
      </section>
    </div>
  );
}
