import { Lock } from 'lucide-react';
import { ClinicConfig, VerticalTheme } from '../types/clinic';

interface HeaderProps {
  config: ClinicConfig;
  theme: VerticalTheme;
  onOpenReception: () => void;
}

export function Header({ config, theme, onOpenReception }: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors duration-300 ${theme.headerBg} ${theme.borderHairline}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className={`text-base sm:text-xl font-semibold tracking-tight whitespace-nowrap truncate min-w-0 max-w-[165px] sm:max-w-none transition-colors duration-300 ${
            theme.usesSerifDisplay ? 'font-display-serif text-lg sm:text-2xl' : ''
          } ${theme.textPrimary}`}
        >
          {config.name}
        </a>

        {/* Zone 2: 4 concise single-line text nav links */}
        <nav
          aria-label="Navigation principale"
          className={`hidden md:flex items-center gap-6 text-sm font-medium ${theme.textSecondary}`}
        >
          <a
            href="#prestations"
            className="hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Prestations
          </a>
          <a
            href="#engagements"
            className="hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Engagements
          </a>
          <a
            href="#faq"
            className="hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            FAQ
          </a>
          <a
            href="#acces"
            className="hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Horaires &amp; Accès
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenReception}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold border transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.bgSurface} ${theme.borderHairline} ${theme.textPrimary} hover:opacity-90`}
          >
            <Lock className={`w-3.5 h-3.5 ${theme.accentText}`} aria-hidden="true" />
            <span>Espace Réception (Démo)</span>
          </button>
        </div>
      </div>
    </header>
  );
}
