import { colors, spacing, typography, borderRadius } from '@f5/ui';

export const adminStyles = {
  page: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing[6],
  },
  pageTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    margin: 0,
  },
  pageSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.gray,
    margin: 0,
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: spacing[4],
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: spacing[4],
  },
  kpiValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    margin: `${spacing[2]} 0 0`,
  },
  kpiLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    margin: 0,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: typography.fontSize.sm,
  },
  th: {
    textAlign: 'left' as const,
    padding: spacing[3],
    borderBottom: `2px solid ${colors.offWhite}`,
    color: colors.gray,
    fontWeight: typography.fontWeight.semibold,
  },
  td: {
    padding: spacing[3],
    borderBottom: `1px solid ${colors.offWhite}`,
    color: colors.darkGray,
  },
  badge: (color: string, bg: string) => ({
    display: 'inline-block',
    padding: `${spacing[1]} ${spacing[2]}`,
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color,
    backgroundColor: bg,
  }),
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing[4],
  },
  label: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing[1],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.darkGray,
  },
  input: {
    padding: spacing[2],
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.gray}`,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
  },
  select: {
    padding: spacing[2],
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.gray}`,
    fontSize: typography.fontSize.base,
    backgroundColor: colors.white,
  },
  textarea: {
    padding: spacing[2],
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.gray}`,
    fontSize: typography.fontSize.base,
    minHeight: '100px',
    fontFamily: typography.fontFamily.primary,
    resize: 'vertical' as const,
  },
  link: {
    color: colors.blue,
    textDecoration: 'none',
    fontWeight: typography.fontWeight.semibold,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
};

export { formatBRL, formatPct } from '@f5/core';

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}
