import React from 'react';

interface SuspenseLoaderProps {
  variant?: 'modal' | 'inline' | 'minimal';
  message?: string;
}

const SuspenseLoader: React.FC<SuspenseLoaderProps> = ({
  variant = 'modal',
  message
}) => {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        {message && (
          <p className="text-amber-800/80 text-sm animate-pulse">{message}</p>
        )}
      </div>
    );
  }

  // Modal variant (default)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4 shadow-2xl">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600"></div>
        {message && (
          <p className="text-amber-800 text-base font-medium animate-pulse">{message}</p>
        )}
      </div>
    </div>
  );
};

export default SuspenseLoader;
