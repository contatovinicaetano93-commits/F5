'use client';

import { useState } from 'react';
import { AdminPanelCard } from '@/components/admin/AdminPanelCard';
import { adminStyles } from '@/lib/admin/styles';

const WEEKLY_TASKS = [
  { day: 'Segunda', tasks: ['Revisar KPIs da semana anterior', 'Verificar giro dos produtos', 'Checar posicionamento dos anúncios'] },
  { day: 'Terça', tasks: ['Ajustar preços conforme concorrência', 'Responder perguntas em aberto no ML/Amazon', 'Atualizar estoque disponível'] },
  { day: 'Quarta', tasks: ['Monitorar performance dos anúncios', 'Verificar reclamações e avaliações', 'Otimizar títulos de baixo CTR'] },
  { day: 'Quinta', tasks: ['Upload NF-e da semana', 'Import CSV de métricas', 'Registrar lançamentos manuais'] },
  { day: 'Sexta', tasks: ['Criar insight semanal para o cliente', 'Publicar insights aprovados', 'Planejar ações da próxima semana'] },
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
    } catch { return {}; }
  });

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(`${STORAGE_KEY}_${weekKey}`, JSON.stringify(next)); } catch {}
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
          Fluxo operador F5 — segunda a sexta. Progresso: {doneTasks}/{totalTasks} tarefas ({progressPct}%)
        </p>
        <div style={{ height: 8, background: '#1E2D3F', borderRadius: 4, margin: '8px 0 24px' }}>
          <div style={{ height: 8, background: '#0066FF', borderRadius: 4, width: `${progressPct}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {WEEKLY_TASKS.map(({ day, tasks }) => {
          const dayDone = tasks.filter((_, i) => checked[`${day}_${i}`]).length;
          return (
            <AdminPanelCard key={day} title={`${day} — ${dayDone}/${tasks.length}`} defaultOpen={dayDone < tasks.length}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tasks.map((task, i) => {
                  const key = `${day}_${i}`;
                  return (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={!!checked[key]}
                        onChange={() => toggle(key)}
                        style={{ width: 16, height: 16, accentColor: '#0066FF' }}
                      />
                      <span style={{ fontSize: 14, color: checked[key] ? '#8B9CB6' : '#E2E8F0', textDecoration: checked[key] ? 'line-through' : 'none' }}>
                        {task}
                      </span>
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
