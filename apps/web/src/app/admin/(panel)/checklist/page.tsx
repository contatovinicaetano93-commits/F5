'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AdminPanelCard } from '@/components/admin/AdminPanelCard';
import { adminStyles } from '@/lib/admin/styles';

const WEEKLY_TASKS: {
  day: string;
  tasks: { label: string; href?: string }[];
}[] = [
  {
    day: 'Segunda',
    tasks: [
      { label: 'Revisar KPIs da semana anterior', href: '/admin' },
      { label: 'Verificar giro dos produtos', href: '/admin/lancamentos' },
      { label: 'Checar posicionamento dos anúncios' },
    ],
  },
  {
    day: 'Terça',
    tasks: [
      { label: 'Ajustar preços conforme concorrência' },
      { label: 'Responder perguntas em aberto no ML/Amazon' },
      { label: 'Atualizar estoque disponível' },
    ],
  },
  {
    day: 'Quarta',
    tasks: [
      { label: 'Monitorar performance dos anúncios', href: '/admin/lancamentos' },
      { label: 'Verificar reclamações e avaliações' },
      { label: 'Otimizar títulos de baixo CTR' },
    ],
  },
  {
    day: 'Quinta',
    tasks: [
      { label: 'Upload NF-e da semana', href: '/admin/nfe' },
      { label: 'Import CSV de métricas', href: '/admin/lancamentos' },
      { label: 'Registrar lançamentos manuais', href: '/admin/lancamentos' },
    ],
  },
  {
    day: 'Sexta',
    tasks: [
      { label: 'Criar insight semanal para o cliente', href: '/admin/insights' },
      { label: 'Publicar insights aprovados', href: '/admin/insights' },
      { label: 'Planejar ações da próxima semana', href: '/admin' },
    ],
  },
];

const STORAGE_KEY = 'f5_checklist_week';

function getWeekKey() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return start.toISOString().slice(0, 10);
}

export default function ChecklistPage() {
  const weekKey = getWeekKey();
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${weekKey}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(`${STORAGE_KEY}_${weekKey}`, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const totalTasks = WEEKLY_TASKS.reduce((acc, d) => acc + d.tasks.length, 0);
  const doneTasks = Object.values(checked).filter(Boolean).length;
  const progressPct = Math.round((doneTasks / totalTasks) * 100);

  return (
    <div style={adminStyles.page}>
      <div>
        <h1 style={adminStyles.pageTitle}>Checklist semanal</h1>
        <p style={adminStyles.pageSubtitle}>
          Fluxo operador F5 (SIPOC seg→sex). Progresso: {doneTasks}/{totalTasks} tarefas (
          {progressPct}%)
        </p>
        <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, margin: '8px 0 24px' }}>
          <div
            style={{
              height: 8,
              background: '#0066FF',
              borderRadius: 4,
              width: `${progressPct}%`,
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {WEEKLY_TASKS.map(({ day, tasks }) => {
          const dayDone = tasks.filter((_, i) => checked[`${day}_${i}`]).length;
          return (
            <AdminPanelCard
              key={day}
              title={`${day} — ${dayDone}/${tasks.length}`}
              defaultOpen={dayDone < tasks.length}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tasks.map((task, i) => {
                  const key = `${day}_${i}`;
                  return (
                    <label
                      key={key}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={!!checked[key]}
                        onChange={() => toggle(key)}
                        style={{ width: 16, height: 16, accentColor: '#0066FF' }}
                      />
                      <span
                        style={{
                          fontSize: 14,
                          color: checked[key] ? '#8B9CB6' : '#1a2332',
                          textDecoration: checked[key] ? 'line-through' : 'none',
                          flex: 1,
                        }}
                      >
                        {task.label}
                      </span>
                      {task.href && !checked[key] && (
                        <Link href={task.href} style={{ ...adminStyles.link, fontSize: 13 }}>
                          Abrir →
                        </Link>
                      )}
                    </label>
                  );
                })}
              </div>
            </AdminPanelCard>
          );
        })}
      </div>
    </div>
  );
}
