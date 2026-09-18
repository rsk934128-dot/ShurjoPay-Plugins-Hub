import React from 'react';
import { Code2 } from 'lucide-react';

interface ConceptBrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
}

export const ConceptBrandLogo: React.FC<ConceptBrandLogoProps> = ({ size = 'md', showBadge = false }) => {
  const sizeMap = {
    sm: 'w-6 h-6 rounded-md',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-11 h-11 rounded-xl',
    xl: 'w-20 h-20 rounded-2xl'
  };

  const iconSizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-10 h-10'
  };

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <div 
        className={`${sizeMap[size]} bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 p-1 flex items-center justify-center shadow-md shadow-amber-500/10`}
      >
        <Code2 className={`${iconSizeMap[size]} text-amber-400`} />
      </div>
      {showBadge && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px] text-slate-950 font-black">
          c
        </div>
      )}
    </div>
  );
};
