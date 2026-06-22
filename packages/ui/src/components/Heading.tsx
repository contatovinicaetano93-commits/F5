import React from 'react';
import { colors, textStyles, typography } from '../tokens';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  children: React.ReactNode;
  color?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  level = 'h1',
  children,
  color = colors.navy,
  style,
  ...props
}) => {
  const HeadingTag = level as keyof JSX.IntrinsicElements;
  
  return React.createElement(
    HeadingTag,
    {
      style: {
        fontFamily: typography.fontFamily.primary,
        color,
        margin: 0,
        ...textStyles[level],
        ...style,
      },
      ...props,
    },
    children
  );
};
