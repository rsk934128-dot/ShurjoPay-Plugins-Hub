import React, { useEffect } from 'react';
import { X, ZoomIn, ExternalLink, Download } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  title: string;
  description?: string;
  badge?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  title,
  description,
  badge
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="image-lightbox-overlay"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 transition-all animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="image-lightbox-container"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5 min-w-0">
            {badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full shrink-0">
                {badge}
              </span>
            )}
            <h3 className="text-sm sm:text-base font-semibold text-white truncate">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={imageSrc}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Open full resolution in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image View */}
        <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-2 sm:p-4">
          <img
            src={imageSrc}
            alt={title}
            className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg border border-slate-800"
            loading="lazy"
          />
        </div>

        {/* Footer Details */}
        {description && (
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-300 flex items-center justify-between gap-4">
            <p className="line-clamp-2">{description}</p>
            <span className="text-[11px] text-slate-400 font-mono shrink-0 hidden sm:inline">
              ESC চাপলে বন্ধ হবে
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
