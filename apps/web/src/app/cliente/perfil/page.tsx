'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from '@/styles/client.module.css';
import { ClientSkeleton } from '@/components/client/ClientSkeleton';
import { ClientPanelCard } from '@/components/client/ClientPanelCard';

interface ProfileData {
  company: {
    displayName: string;
    legalName: string;
    cnpj: string;
    segmentLabel: string;
    scenarioLabel: string;
    statusLabel: string;
    marketplacesLabels: string[];
    since: string;
  };
  contact: {
    name: string;
    manager: string;
    role: string;
    email: string;
    phone: string;
    whatsapp: string;
  };
}

export default function ClientePerfilPage() {
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);

  useEffect(() => {
    fetch('/api/client/profile', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/client/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
    router.refresh();
  };

  if (!data) {
    return <ClientSkeleton rows={2} />;
  }

  const { company, contact } = data;

  return (
    <div className={styles.page}>
      <div className={styles.pageIntro}>
        <h2 className={styles.pageTitle}>Dados da operação</h2>
        <p className={styles.pageSubtitle}>
          Informações da sua empresa na plataforma F5 e canal direto com a equipe
          de operação marketplace.
        </p>
      </div>

      <div className={styles.profileGrid}>
        <ClientPanelCard title="Empresa" defaultOpen={false}>
          <div className={styles.fieldList}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Nome comercial</span>
              <span className={styles.fieldValue}>{company.displayName}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Razão social</span>
              <span className={styles.fieldValue}>{company.legalName}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>CNPJ</span>
              <span className={styles.fieldValue}>{company.cnpj}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Segmento</span>
              <span className={styles.fieldValue}>{company.segmentLabel}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Modelo de operação F5</span>
              <span className={styles.fieldValue}>{company.scenarioLabel}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Status</span>
              <span className={styles.fieldValue}>
                <span className={`${styles.badge} ${styles.badgePositive}`}>
                  {company.statusLabel}
                </span>
              </span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Cliente desde</span>
              <span className={styles.fieldValue}>{company.since}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Marketplaces operados</span>
              <div className={styles.tagList}>
                {company.marketplacesLabels.map((m) => (
                  <span key={m} className={styles.tag}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ClientPanelCard>

        <ClientPanelCard title="Contato F5" defaultOpen={false}>
          <div className={styles.contactCard}>
            <div className={styles.contactRow}>
              <span className={styles.fieldLabel}>Equipe</span>
              <span className={styles.fieldValue}>{contact.name}</span>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.fieldLabel}>Responsável</span>
              <span className={styles.fieldValue}>
                {contact.manager} — {contact.role}
              </span>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.fieldLabel}>E-mail</span>
              <a href={`mailto:${contact.email}`} className={styles.contactLink}>
                {contact.email}
              </a>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.fieldLabel}>Telefone</span>
              <span className={styles.fieldValue}>{contact.phone}</span>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.fieldLabel}>WhatsApp</span>
              <a
                href={`https://wa.me/${contact.whatsapp}`}
                className={styles.contactLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Enviar mensagem
              </a>
            </div>
          </div>
        </ClientPanelCard>
      </div>

      <ClientPanelCard title="Sessão" collapsible={false} compact>
        <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
          Sair do portal
        </button>
      </ClientPanelCard>
    </div>
  );
}
