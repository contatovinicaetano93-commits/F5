/** Formatação monetária e percentual — compartilhada web/mobile. */

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatDatePtBr(iso: string | Date): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}
