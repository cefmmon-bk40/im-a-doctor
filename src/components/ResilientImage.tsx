import { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';
import { VerticalType } from '../types/clinic';

interface ResilientImageProps {
  src: string;
  alt: string;
  vertical: VerticalType;
  className?: string;
  priority?: boolean;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  vertical,
  className = '',
  priority = false,
  fallbackTitle,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src) {
    const gradient =
      vertical === 'laser'
        ? 'linear-gradient(135deg, #0B0B0E 0%, #3A2E1A 100%)'
        : vertical === 'dental'
        ? 'linear-gradient(135deg, #0F172A 0%, #0D9488 100%)'
        : vertical === 'derma'
        ? 'linear-gradient(135deg, #064E3B 0%, #047857 100%)'
        : 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)';

    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center p-4 text-white/90 text-center ${className}`}
        style={{ background: gradient }}
      >
        {vertical === 'laser' || vertical === 'derma' ? (
          <Sparkles className="w-7 h-7 mb-2 opacity-80" aria-hidden="true" />
        ) : vertical === 'dental' ? (
          <ShieldCheck className="w-7 h-7 mb-2 opacity-80" aria-hidden="true" />
        ) : (
          <Stethoscope className="w-7 h-7 mb-2 opacity-80" aria-hidden="true" />
        )}
        <span className="text-xs font-medium leading-snug max-w-[22ch] opacity-90">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading={priority ? 'eager' : 'lazy'}
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
