import React from 'react';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'pink' | 'green' | 'purple';
  fullWidth?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({ 
  children, 
  variant = 'blue', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const colorMap = {
    blue: 'border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 hover:shadow-neon-blue',
    pink: 'border-fuchsia-400 text-fuchsia-400 hover:bg-fuchsia-400/10 hover:shadow-neon-pink',
    green: 'border-green-400 text-green-400 hover:bg-green-400/10 hover:shadow-neon-green',
    purple: 'border-purple-400 text-purple-400 hover:bg-purple-400/10 hover:shadow-[0_0_10px_#bc13fe]',
  };

  return (
    <button
      className={`
        relative px-6 py-3 font-bold border-2 rounded transition-all duration-300 ease-in-out
        uppercase tracking-wider text-sm sm:text-base
        disabled:opacity-50 disabled:cursor-not-allowed
        ${colorMap[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};