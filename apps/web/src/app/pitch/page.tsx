import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { IconArrow } from '@/components/landing/icons';
import styles from '@/styles/landing.module.css';

export const metadata: Metadata = {
  title: 'Apresentação — F5 | Indústria no Digital',
  description:
    'Conheça como a F5 conecta indústrias brasileiras ao mercado digital — operação, controle e parceria sob medida.',
};

const PLATFORM = [
  {
    title: 'Vendas e recebimentos',
    desc: 'Quanto vendeu, quanto evoluiu e quando o dinheiro entra na conta.',
  },
  {
    title: 'Performance por produto',
    desc: 'O que gira, o que trava — por SKU e por canal.',
  },
  {
    title: 'Visão consolidada',
    desc: 'Mercado Livre, Amazon, Shopee e outros — um só lugar.',
  },
  {
    title: 'Transparência',
    desc: 'Você vê. Nós operamos. Sem surpresa no fechamento.',
  },
];

const OPERATION = [
  'Estruturamos sua presença nos marketplaces',
  'Acompanhamos preço e posicionamento',
  'Identificamos oportunidades de giro',
  'Organizamos a operação digital ponta a ponta',
  'Consultoria com clareza e regularidade',
  'Escalamos catálogo e canais conforme resultado',
];

const SEGMENTS = [
  { name: 'Pet', types: 'Alimentação, higiene, acessórios' },
  { name: 'Saúde', types: 'EPIs, descartáveis, materiais hospitalares' },
  { name: 'Papel', types: 'Papelaria industrial, embalagens' },
  { name: 'Ferramentas', types: 'Parafusos, fixadores, hardware industrial' },
];

const MODELS = [
  {
    num: '1',
    title: 'Operação do seu canal',
    desc: 'F5 opera sua loja nos marketplaces. Você mantém sua marca e foca na fábrica.',
  },
  {
    num: '2',
    title: 'Parceria digital',
    desc: 'Sociedade focada 100% no online, com estrutura dedicada ao crescimento digital.',
  },
  {
    num: '3',
    title: 'Distribuição',
    desc: 'Compra, estoque e revenda — quando faz sentido para o seu catálogo e volume.',
  },
  {
    num: '4',
    title: 'Grande marketplace',
    desc: 'Venda direta em programas das grandes plataformas, conforme fit do produto.',
  },
];

const PROCESS = [
  { step: '1', title: 'Diagnóstico', desc: 'Catálogo, margem e objetivo' },
  { step: '2', title: 'Modelo', desc: 'Forma de parceria ideal' },
  { step: '3', title: 'Piloto', desc: 'Primeiros indicadores na plataforma' },
  { step: '4', title: 'Escala', desc: 'Giro e novos canais com dados' },
];

const DIFFERENTIALS = [
  { title: 'Operação real', desc: 'Não entregamos só relatório — operamos o canal.' },
  { title: 'Controle claro', desc: 'KPIs objetivos, sem jargão de marketplace.' },
  { title: 'Flexibilidade', desc: 'Quatro modelos; um escolhido para você.' },
  { title: 'Foco em giro', desc: 'Produto que vende — não só publicado.' },
];

const CHANNELS = ['Mercado Livre', 'Amazon', 'Shopee', 'TikTok Shop'];

export default function PitchPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      {/* Hero */}
      <section className={styles.pitchHero}>
        <div className={styles.heroGrid} />
        <div className={styles.heroOrb1} />
        <div className={styles.heroOrb2} />
        <div className={styles.pitchHeroInner}>
          <div className={styles.pitchBadge}>Apresentação comercial</div>
          <h1 className={styles.pitchTitle}>
            INDÚSTRIA
            <br />
            <span className={styles.heroTitleAccent}>NO DIGITAL</span>
          </h1>
          <p className={styles.pitchSubtitle}>
            Seu braço digital nos marketplaces. Controle e clareza para quem fabrica.
          </p>
          <div className={styles.pitchActions}>
            <Link href="/login" className={styles.btnPrimary}>
              Falar com a F5
              <IconArrow />
            </Link>
            <a href="#plataforma" className={styles.btnSecondary}>
              Ver a plataforma
            </a>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className={styles.pitchSlide}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>O cenário</div>
            <h2 className={styles.sectionTitle}>
              A indústria fabrica bem.
              <br />O digital não acompanha.
            </h2>
          </div>
          <ul className={styles.pitchList}>
            <li>Vendas ainda concentradas em offline e B2B</li>
            <li>Marketplaces fragmentados, sem visão unificada</li>
            <li>Tempo da fábrica consumido com anúncio, preço e logística</li>
            <li>Dificuldade em saber o que gira e o que trava</li>
            <li>Números espalhados entre planilhas, NF e painéis de plataforma</li>
          </ul>
        </div>
      </section>

      {/* Solution */}
      <section className={`${styles.pitchSlide} ${styles.pitchSlideAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>A solução</div>
            <h2 className={styles.sectionTitle}>O que é a F5</h2>
            <p className={styles.sectionDesc}>
              Conectamos indústrias brasileiras ao mercado digital. Não somos só software.
              Não somos só consultoria. Somos operação + controle.
            </p>
          </div>
          <div className={styles.pitchSplit}>
            <div className={styles.pitchSplitCol}>
              <h3>Você — Indústria</h3>
              <ul className={styles.pitchList}>
                <li>Fabrica</li>
                <li>Mantém qualidade e marca</li>
                <li>Foca na produção</li>
              </ul>
            </div>
            <div className={styles.pitchSplitPlus}>+</div>
            <div className={styles.pitchSplitCol} style={{ borderColor: 'rgba(0, 102, 255, 0.25)' }}>
              <h3>F5</h3>
              <ul className={styles.pitchList}>
                <li>Opera o digital</li>
                <li>Consultoria com dados claros</li>
                <li>Cuida de marketplace e giro</li>
              </ul>
            </div>
          </div>
          <p
            style={{
              marginTop: 32,
              textAlign: 'center',
              fontWeight: 600,
              color: 'var(--navy)',
              fontSize: 17,
            }}
          >
            Você vê o resultado. Nós fazemos acontecer.
          </p>
        </div>
      </section>

      {/* Platform */}
      <section id="plataforma" className={`${styles.pitchSlide} ${styles.pitchSlideNavy}`}>
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionHeader} ${styles.sectionHeaderCenter}`}>
            <div className={styles.sectionLabel} style={{ color: 'var(--cyan)' }}>
              Plataforma
            </div>
            <h2 className={styles.sectionTitle}>Sua plataforma de controle</h2>
            <p className={styles.sectionDesc}>
              Simples como um extrato — completo como uma operação profissional.
            </p>
          </div>
          <div className={styles.pitchCards}>
            {PLATFORM.map((item) => (
              <div key={item.title} className={styles.pitchCard}>
                <h3 className={styles.pitchCardTitle}>{item.title}</h3>
                <p className={styles.pitchCardDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operation */}
      <section className={styles.pitchSlide}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>Operação</div>
            <h2 className={styles.sectionTitle}>O que fazemos por você</h2>
          </div>
          <div className={styles.pitchOperationGrid}>
            <ul className={styles.pitchList}>
              {OPERATION.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <ul className={styles.pitchList}>
              {OPERATION.slice(3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <p className={styles.pitchNote} style={{ textAlign: 'center', marginTop: 32 }}>
            A metodologia e a experiência são nossas. O resultado é seu.
          </p>
        </div>
      </section>

      {/* Segments */}
      <section className={`${styles.pitchSlide} ${styles.pitchSlideAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>Segmentos</div>
            <h2 className={styles.sectionTitle}>Indústrias que atendemos</h2>
          </div>
          <table className={styles.pitchTable}>
            <thead>
              <tr>
                <th>Segmento</th>
                <th>Tipos de produto</th>
              </tr>
            </thead>
            <tbody>
              {SEGMENTS.map((s) => (
                <tr key={s.name}>
                  <td>
                    <strong>{s.name}</strong>
                  </td>
                  <td>{s.types}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.pitchNote}>
            Trabalhamos com o seu catálogo. Por confidencialidade, não divulgamos nomes de parceiros.
          </p>
        </div>
      </section>

      {/* Models */}
      <section id="modelos" className={styles.pitchSlide}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>Parceria</div>
            <h2 className={styles.sectionTitle}>Formas de parceria</h2>
            <p className={styles.sectionDesc}>
              Para cada indústria, o modelo mais adequado — não existe receita única.
            </p>
          </div>
          <table className={styles.pitchTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Modelo</th>
                <th>Em resumo</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m) => (
                <tr key={m.num}>
                  <td>
                    <strong>{m.num}</strong>
                  </td>
                  <td>
                    <strong>{m.title}</strong>
                  </td>
                  <td>{m.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Channels */}
      <section className={`${styles.pitchSlide} ${styles.pitchSlideAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>Canais</div>
            <h2 className={styles.sectionTitle}>Onde sua indústria pode estar</h2>
          </div>
          <div className={styles.pitchChannels}>
            {CHANNELS.map((c) => (
              <span key={c} className={styles.pitchChannel}>
                {c}
              </span>
            ))}
          </div>
          <p className={styles.pitchNote} style={{ marginTop: 28 }}>
            Atuamos em venda intermediada e venda direta, conforme o perfil do seu produto.
            Todos os canais consolidados na plataforma F5 — uma visão só para você.
          </p>
        </div>
      </section>

      {/* Differentials */}
      <section className={`${styles.pitchSlide} ${styles.pitchSlideNavy}`}>
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionHeader} ${styles.sectionHeaderCenter}`}>
            <div className={styles.sectionLabel} style={{ color: 'var(--cyan)' }}>
              Diferenciais
            </div>
            <h2 className={styles.sectionTitle}>Por que a F5</h2>
          </div>
          <div className={styles.pitchCards}>
            {DIFFERENTIALS.map((d) => (
              <div key={d.title} className={styles.pitchCard}>
                <h3 className={styles.pitchCardTitle}>{d.title}</h3>
                <p className={styles.pitchCardDesc}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="processo" className={styles.pitchSlide}>
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionHeader} ${styles.sectionHeaderCenter}`}>
            <div className={styles.sectionLabel}>Processo</div>
            <h2 className={styles.sectionTitle}>Como começamos</h2>
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
          <p className={styles.pitchCtaBox}>
            Próximo passo: conversa com seu catálogo em mãos
          </p>
        </div>
      </section>

      {/* Closing */}
      <section className={styles.pitchClosing}>
        <div className={styles.ctaOrb} />
        <div className={styles.sectionInner} style={{ position: 'relative', zIndex: 1 }}>
          <h2 className={styles.pitchClosingTitle}>
            Sua fábrica.
            <br />
            Nosso digital.
          </h2>
          <p className={styles.pitchClosingDesc}>
            Você fabrica com excelência. A F5 leva isso ao mercado — com controle e clareza.
          </p>
          <p className={styles.pitchTagline}>INDÚSTRIA NO DIGITAL</p>
          <p style={{ marginTop: 32, color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>
            F5 — Parceria sob medida para indústrias brasileiras
          </p>
          <div style={{ marginTop: 40 }}>
            <Link href="/login" className={styles.btnPrimary}>
              Iniciar conversa
              <IconArrow />
            </Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBottom} style={{ borderTop: 'none', paddingTop: 0 }}>
            <span>© 2026 F5 — Indústria no Digital</span>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}>
              Voltar ao site
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
