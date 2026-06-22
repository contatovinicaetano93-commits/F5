import React from 'react';
import { colors, typography, spacing, borderRadius, shadows } from '../tokens';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: colors.blue,
    color: colors.white,
    border: 'none',
  },
  secondary: {
    backgroundColor: colors.navy,
    color: colors.white,
    border: 'none',
  },
  outline: {
    backgroundColor: 'transparent',
    color: colors.blue,
    border: `2px solid ${colors.blue}`,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.darkGray,
    border: 'none',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: `${spacing[1]} ${spacing[3]}`,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  md: {
    padding: `${spacing[2]} ${spacing[4]}`,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  lg: {
    padding: `${spacing[3]} ${spacing[6]}`,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  style,
  ...props
}) => {
  return (
    <button
      style={{
        fontFamily: typography.fontFamily.primary,
        borderRadius: borderRadius.md,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: shadows.md,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};
