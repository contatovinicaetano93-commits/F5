import React from 'react';
import { colors, spacing, borderRadius, shadows } from '../tokens';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  ...props
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.offWhite}`,
      boxShadow: shadows.sm,
    },
    elevated: {
      backgroundColor: colors.white,
      boxShadow: shadows.lg,
      border: 'none',
    },
    outlined: {
      backgroundColor: colors.offWhite,
      border: `2px solid ${colors.navy}`,
      boxShadow: 'none',
    },
  };

  return (
    <div
      style={{
        borderRadius: borderRadius.lg,
        padding: spacing[6],
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
