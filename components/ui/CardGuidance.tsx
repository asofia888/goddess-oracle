import React from 'react';

interface CardGuidanceProps {
  guidance: string[];
  size?: 'sm' | 'md' | 'lg';
}

const CardGuidance: React.FC<CardGuidanceProps> = ({
  guidance,
  size = 'md'
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
      text: 'text-sm'
    },
    lg: {
      container: 'p-4',
      title: 'text-xl font-semibold',
      text: 'text-base'
    }
  };

  return (
    <div className={`bg-teal-50/50 ${sizeClasses[size].container} rounded-lg border border-teal-200/50`}>
      <h3 className={`${sizeClasses[size].title} text-teal-800 mb-2`}>
        日常のガイダンス
      </h3>
      <ul className="space-y-1 text-left">
        {guidance.map((item, index) => (
          <li key={index} className={`${sizeClasses[size].text} text-stone-700 flex items-start`}>
            <span className="text-teal-600 mr-2">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CardGuidance;