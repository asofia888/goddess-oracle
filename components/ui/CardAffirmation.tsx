import React from 'react';

interface CardAffirmationProps {
  affirmation: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const CardAffirmation: React.FC<CardAffirmationProps> = ({
  affirmation,
  size = 'md',
  label = 'アファメーション'
}) => {
  const sizeClasses = {
    sm: {
      container: 'p-2',
      title: 'text-sm font-semibold',
      text: 'text-xs'
    },
    md: {
      container: 'p-3',
      title: 'text-lg font-semibold',
      text: 'text-base'
    },
    lg: {
      container: 'p-4',
      title: 'text-xl font-semibold',
      text: 'text-lg'
    }
  };

  return (
    <div className={`bg-yellow-50/50 ${sizeClasses[size].container} rounded-lg border border-yellow-200/50`}>
      <h3 className={`${sizeClasses[size].title} text-yellow-800 mb-2`}>
        {label}
      </h3>
      <p className={`${sizeClasses[size].text} text-stone-700 italic leading-relaxed`}>
        "{affirmation}"
      </p>
    </div>
  );
};

export default CardAffirmation;