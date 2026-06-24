'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from '@/styles/client.module.css';
import { formatBRL } from '@/lib/admin/styles';

interface NfItem {
  id: string;
  nfNumber: string;
  nfSeries: string;
  nfDate: string;
  valorTotal: number;
  itemsCount: number;
  status: 'processed' | 'pending';
  marketplaceLabel: string;
}

interface CalendarEvent {
  id: string;
  date: string;
  amount: number;
  label: string;
  settlementDays: number;
  marketplaceLabel: string;
}

interface FinanceData {
  nfs: NfItem[];
  calendarEvents: CalendarEvent[];
  summary: {
    monthNfTotal: number;
    pendingCount: number;
    totalScheduled: number;
  };
  calendarMeta: { year: number; month: number; daysInMonth: number };
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function ClienteFinanceiroPage() {
  const [data, setData] = useState<FinanceData | null>(null);

  useEffect(() => {
    fetch('/api/client/finance', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const calendarCells = useMemo(() => {
    if (!data) return [];
    const { year, month, daysInMonth } = data.calendarMeta;
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();
    const eventDays = new Set(
      data.calendarEvents.map((e) => new Date(e.date).getDate()),
    );

    const cells: {
      day: number | null;
      isToday: boolean;
      hasEvent: boolean;
    }[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, isToday: false, hasEvent: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        isToday:
          today.getDate() === d &&
          today.getMonth() === month &&
          today.getFullYear() === year,
        hasEvent: eventDays.has(d),
      });
    }

    return cells;
  }, [data]);

  if (!data) {
    return <p className={styles.loading}>Carregando financeiro...</p>;
  }

  const monthLabel = new Date(
    data.calendarMeta.year,
    data.calendarMeta.month,
    1,
  ).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className={styles.page}>
      <div className={styles.pageIntro}>
        <h2 className={styles.pageTitle}>Financeiro e recebimentos</h2>
        <p className={styles.pageSubtitle}>
          Notas fiscais registradas e calendário de repasses com prazos D+15
          (Mercado Livre / Shopee) e D+60 (Amazon).
        </p>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.card}>
          <p className={styles.kpiLabel}>NF-e no mês</p>
          <p className={styles.kpiValue}>{formatBRL(data.summary.monthNfTotal)}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.kpiLabel}>A receber (agendado)</p>
          <p className={styles.kpiValue}>{formatBRL(data.summary.totalScheduled)}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.kpiLabel}>NF-e pendentes</p>
          <p className={styles.kpiValue}>{data.summary.pendingCount}</p>
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Calendário — {monthLabel}</h3>
          <div className={styles.calendarGrid}>
            {WEEKDAYS.map((d) => (
              <div key={d} className={styles.calendarDayLabel}>
                {d}
              </div>
            ))}
            {calendarCells.map((cell, i) => {
              if (cell.day === null) {
                return (
                  <div
                    key={`empty-${i}`}
                    className={`${styles.calendarCell} ${styles.calendarCellEmpty}`}
                  />
                );
              }
              return (
                <div
                  key={cell.day}
                  className={[
                    styles.calendarCell,
                    cell.isToday ? styles.calendarCellToday : '',
                    cell.hasEvent ? styles.calendarCellEvent : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className={styles.calendarDayNum}>{cell.day}</span>
                  {cell.hasEvent && <span className={styles.calendarDot} />}
                </div>
              );
            })}
          </div>
          <div className={styles.calendarLegend}>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendDotToday}`} />
              Hoje
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendDotEvent}`} />
              Recebimento previsto
            </span>
          </div>

          <div className={styles.eventList}>
            {data.calendarEvents.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyStateTitle}>Sem recebimentos neste mês</p>
                <p className={styles.emptyStateBody}>
                  Datas de repasse aparecem após o processamento das NF-e pela operação F5.
                </p>
              </div>
            ) : (
              data.calendarEvents.map((e) => (
                <div key={e.id} className={styles.eventItem}>
                  <span className={styles.eventDate}>
                    {new Date(e.date).toLocaleDateString('pt-BR')}
                  </span>
                  <span className={styles.eventLabel}>
                    {e.label} — D+{e.settlementDays}
                  </span>
                  <span className={styles.eventAmount}>{formatBRL(e.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Notas fiscais (NF-e)</h3>
          {data.nfs.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateTitle}>Nenhuma NF-e registrada</p>
              <p className={styles.emptyStateBody}>
                As notas fiscais das vendas nos marketplaces são importadas pela equipe F5.
              </p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Data</th>
                  <th>Canal</th>
                  <th>Itens</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.nfs.map((nf) => (
                  <tr key={nf.id}>
                    <td className={styles.cellSku}>
                      {nf.nfNumber}/{nf.nfSeries}
                    </td>
                    <td>{new Date(nf.nfDate).toLocaleDateString('pt-BR')}</td>
                    <td className={styles.cellMuted}>{nf.marketplaceLabel}</td>
                    <td>{nf.itemsCount}</td>
                    <td>{formatBRL(nf.valorTotal)}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          nf.status === 'processed'
                            ? styles.badgePositive
                            : styles.badgeNeutral
                        }`}
                      >
                        {nf.status === 'processed' ? 'Processada' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
