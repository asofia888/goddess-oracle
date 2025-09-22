import React from 'react';

interface CardThemeProps {
  theme: string;
  size?: 'sm' | 'md' | 'lg';
  alignment?: 'left' | 'center' | 'right';
}

const CardTheme: React.FC<CardThemeProps> = ({
  theme,
  size = 'md',
  alignment = 'center'
}) => {
  const sizeClasses = {
    sm: {
      container: 'p-2',
      title: 'text-sm font-semibold',
      text: 'text-sm'
    },
    md: {
      container: 'p-3',
      title: 'text-lg font-semibold',
      text: 'text-md'
    },
    lg: {
      container: 'p-4',
      title: 'text-xl font-semibold',
      text: 'text-lg'
    }
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <div className={`bg-amber-50/50 ${sizeClasses[size].container} rounded-lg border border-amber-200/50`}>
      <h3 className={`${sizeClasses[size].title} text-orange-800 mb-1 ${alignmentClasses[alignment]}`}>
        テーマ
      </h3>
      <p className={`${sizeClasses[size].text} text-stone-700 font-medium ${alignmentClasses[alignment]}`}>
        {theme}
      </p>
    </div>
  );
};

export default CardTheme;