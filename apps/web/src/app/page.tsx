import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import {
  IconArrow,
  IconChart,
  IconPackage,
  IconReceipt,
  IconShield,
  IconTrend,
  IconWallet,
} from '@/components/landing/icons';
import styles from '@/styles/landing.module.css';

const MARKETPLACES = [
  'Mercado Livre',
  'Amazon',
  'Shopee',
  'TikTok Shop',
  'Magalu',
  'B2B Digital',
];

const FEATURES = [
  {
    icon: <IconChart />,
    title: 'KPIs em tempo real',
    desc: 'Vendas, variação mensal e distribuição por canal — tudo consolidado para a indústria enxergar resultado.',
    large: true,
  },
  {
    icon: <IconWallet />,
    title: 'Contador digital',
    desc: 'Recebimentos D+15 e D+60, pagamentos pendentes e visão financeira clara.',
    large: false,
  },
  {
    icon: <IconPackage />,
    title: 'Performance por SKU',
    desc: 'Receita, unidades, conversão e giro por produto — sem precisar abrir o painel do marketplace.',
    large: false,
  },
  {
    icon: <IconReceipt />,
    title: 'NF-e integrada',
    desc: 'Upload de XML alimenta vendas, itens e calendário de recebimentos automaticamente.',
    large: false,
  },
  {
    icon: <IconTrend />,
    title: 'Insights de giro',
    desc: 'Recomendações semanais da operação F5 traduzidas em ações para o cliente.',
    large: false,
  },
  {
    icon: <IconShield />,
    title: 'Transparência total',
    desc: 'A indústria vê números e confia. A F5 opera. Divisão clara de papéis.',
    large: true,
  },
];

const MODELS = [
  {
    num: '01',
    title: 'Braço do online',
    desc: 'F5 opera a conta do cliente nos marketplaces. Indústria fabrica; F5 vende online em nome dela.',
    tag: 'Comissão sobre vendas',
    featured: false,
  },
  {
    num: '02',
    title: 'Sócio digital',
    desc: 'Parceria em operação 100% focada no online. Nova estrutura com split de resultado.',
    tag: 'Split da operação',
    featured: true,
  },
  {
    num: '03',
    title: 'Comprar e revender',
    desc: 'F5 compra, estoca e revende. Margem na operação com capital de giro da F5.',
    tag: 'Margem compra → venda',
    featured: false,
  },
  {
    num: '04',
    title: 'Amazon 1P',
    desc: 'Cadastro para venda direta Amazon. F5 intermedia operação e ganha comissão.',
    tag: 'Comissão na intermediação',
    featured: false,
  },
];

const PROCESS = [
  { step: '1', title: 'Diagnóstico', desc: 'Mapeamos catálogo, margem e fit por canal' },
  { step: '2', title: 'Piloto', desc: 'Operação manual com KPIs na plataforma' },
  { step: '3', title: 'Escala', desc: 'Expansão de SKUs e canais com dados' },
  { step: '4', title: 'Prestação de contas', desc: 'Indústria acompanha; F5 executa' },
];

const BAR_HEIGHTS = [35, 55, 42, 70, 58, 82, 65, 90, 75, 88];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGrid} />
        <div className={styles.heroOrb1} />
        <div className={styles.heroOrb2} />

        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              Operação + tecnologia
            </div>

            <h1 className={styles.heroTitle}>
              A indústria fabrica.
              <br />
              A F5 <span className={styles.heroTitleAccent}>opera o digital</span>
              <br />
              e presta contas.
            </h1>

            <p className={styles.heroSubtitle}>
              Consultoria estratégica e operação 360 em marketplaces.
              Você vê vendas, performance e recebimentos — nós fazemos o resto.
            </p>

            <div className={styles.heroActions}>
              <Link href="/login" className={styles.btnPrimary}>
                Falar com a F5
                <IconArrow />
              </Link>
              <Link href="#plataforma" className={styles.btnSecondary}>
                Conhecer a plataforma
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div>
                <div className={styles.statValue}>D+15</div>
                <div className={styles.statLabel}>Recebimento Mercado Livre</div>
              </div>
              <div>
                <div className={styles.statValue}>D+60</div>
                <div className={styles.statLabel}>Recebimento Amazon</div>
              </div>
              <div>
                <div className={styles.statValue}>4</div>
                <div className={styles.statLabel}>Modelos de parceria</div>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.dashboardMock}>
              <div className={styles.mockHeader}>
                <div className={styles.mockDots}>
                  <span className={styles.mockDot} />
                  <span className={styles.mockDot} />
                  <span className={styles.mockDot} />
                </div>
                <span className={styles.mockTitle}>Painel F5</span>
              </div>

              <div className={styles.mockKpis}>
                <div className={styles.mockKpi}>
                  <div className={styles.mockKpiLabel}>Vendas do mês</div>
                  <div className={styles.mockKpiValue}>R$ 284k</div>
                  <div className={styles.mockKpiChange}>+18,4% vs anterior</div>
                </div>
                <div className={styles.mockKpi}>
                  <div className={styles.mockKpiLabel}>A receber</div>
                  <div className={styles.mockKpiValue}>R$ 42k</div>
                  <div className={styles.mockKpiChange}>3 repasses pendentes</div>
                </div>
              </div>

              <div className={styles.mockChart}>
                {BAR_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className={styles.mockBar}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className={styles.marquee}>
        <div className={styles.marqueeTrack}>
          {[...MARKETPLACES, ...MARKETPLACES].map((name, i) => (
            <span key={i} className={styles.marqueeItem}>
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Platform */}
      <section id="plataforma" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionHeader} ${styles.sectionHeaderCenter}`}>
            <div className={styles.sectionLabel}>Plataforma</div>
            <h2 className={styles.sectionTitle}>
              O contador digital da sua indústria no marketplace
            </h2>
            <p className={styles.sectionDesc}>
              Sem painel técnico, sem sync confuso. A indústria enxerga resultado.
              A operação F5 registra, analisa e recomenda.
            </p>
          </div>

          <div className={styles.bento}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`${styles.bentoCard} ${f.large ? styles.bentoLarge : ''}`}
              >
                <div className={styles.bentoIcon}>{f.icon}</div>
                <h3 className={styles.bentoTitle}>{f.title}</h3>
                <p className={styles.bentoDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="processo" className={styles.section} style={{ background: 'var(--surface-elevated)' }}>
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionHeader} ${styles.sectionHeaderCenter}`}>
            <div className={styles.sectionLabel}>Processo</div>
            <h2 className={styles.sectionTitle}>Do diagnóstico à escala</h2>
            <p className={styles.sectionDesc}>
              Entendemos o caminho do cliente antes de fechar o modelo.
              Cada indústria tem o cenário certo.
            </p>
          </div>

          <div className={styles.process}>
            {PROCESS.map((p) => (
              <div key={p.step} className={styles.processStep}>
                <div className={styles.processNum}>{p.step}</div>
                <h3 className={styles.processTitle}>{p.title}</h3>
                <p className={styles.processDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Models */}
      <section id="modelos" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>Parceria</div>
            <h2 className={styles.sectionTitle}>
              Quatro formas de operar.
              <br />
              Uma escolhida para você.
            </h2>
            <p className={styles.sectionDesc}>
              Para cada cliente, a F5 identifica o melhor cenário —
              braço online, sócio digital, revenda ou Amazon 1P.
            </p>
          </div>

          <div className={styles.modelsGrid}>
            {MODELS.map((m) => (
              <div
                key={m.num}
                className={`${styles.modelCard} ${m.featured ? styles.modelCardFeatured : ''}`}
              >
                <div className={styles.modelNum}>Cenário {m.num}</div>
                <h3 className={styles.modelTitle}>{m.title}</h3>
                <p className={styles.modelDesc}>{m.desc}</p>
                <span className={styles.modelTag}>{m.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Segments */}
      <section className={styles.section} style={{ background: 'var(--surface-elevated)', paddingTop: 80, paddingBottom: 80 }}>
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionHeader} ${styles.sectionHeaderCenter}`}>
            <div className={styles.sectionLabel}>Segmentos</div>
            <h2 className={styles.sectionTitle}>Indústrias que atendemos</h2>
          </div>

          <div className={styles.segments}>
            {[
              { name: 'Pet', hint: 'Alimentação e acessórios' },
              { name: 'Saúde', hint: 'EPI e equipamentos' },
              { name: 'Papel', hint: 'Papelaria e escritório' },
              { name: 'Ferramentas', hint: 'Parafuso e hardware' },
            ].map((s) => (
              <div key={s.name} className={styles.segmentCard}>
                <div className={styles.segmentName}>{s.name}</div>
                <div className={styles.segmentHint}>{s.hint}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaOrb} />
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>
            Pronto para ver seu digital com clareza de contador?
          </h2>
          <p className={styles.ctaDesc}>
            Diagnóstico sem compromisso. Piloto com KPIs reais.
            Escala quando os números fecharem.
          </p>
          <Link href="/login" className={styles.btnPrimary}>
            Iniciar conversa
            <IconArrow />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <div className={styles.footerBrandName}>F5</div>
              <p className={styles.footerBrandDesc}>
                Indústria no digital. Operação completa de marketplaces
                para fabricantes brasileiros.
              </p>
            </div>

            <div className={styles.footerLinks}>
              <div className={styles.footerCol}>
                <h4>Plataforma</h4>
                <Link href="#plataforma">KPIs e financeiro</Link>
                <Link href="/login">Área do cliente</Link>
              </div>
              <div className={styles.footerCol}>
                <h4>Empresa</h4>
                <Link href="#modelos">Modelos de parceria</Link>
                <Link href="/pitch">Apresentação</Link>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <span>© 2026 F5 — Indústria no Digital</span>
            <span>Consultoria + operação + software</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
