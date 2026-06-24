'use client';

import React, { useState } from 'react';
import { colors, spacing, typography, borderRadius } from '@f5/ui';

const defaultInputStyle: React.CSSProperties = {
  width: '100%',
  padding: spacing[3],
  paddingRight: '5.5rem',
  border: `1px solid ${colors.offWhite}`,
  borderRadius: borderRadius.md,
  fontSize: 14,
  fontFamily: typography.fontFamily.primary,
  boxSizing: 'border-box',
};

export type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  inputStyle?: React.CSSProperties;
};

export function PasswordInput({
  inputStyle,
  style,
  id,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const toggleId = id ? `${id}-toggle` : undefined;

  return (
    <div style={{ position: 'relative', width: '100%', ...style }}>
      <input
        {...props}
        id={id}
        type={visible ? 'text' : 'password'}
        style={{ ...defaultInputStyle, ...inputStyle }}
      />
      <button
        id={toggleId}
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar senha' : 'Visualizar senha'}
        aria-pressed={visible}
        style={{
          position: 'absolute',
          right: spacing[2],
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          padding: `${spacing[1]} ${spacing[2]}`,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
          color: colors.blue,
          cursor: 'pointer',
          fontFamily: typography.fontFamily.primary,
        }}
      >
        {visible ? 'Ocultar' : 'Visualizar'}
      </button>
    </div>
  );
}
