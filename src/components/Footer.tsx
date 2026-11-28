import { ClinicConfig, VerticalTheme } from '../types/clinic';

interface FooterProps {
  config: ClinicConfig;
  theme: VerticalTheme;
}

export function Footer({ config, theme }: FooterProps) {
  return (
    <footer
      className={`border-t py-8 pb-24 md:pb-8 transition-colors duration-300 ${theme.bgCanvas} ${theme.borderHairline}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className={`font-semibold text-sm ${theme.textPrimary}`}>{config.name}</div>
          <div className={theme.textMuted}>
            {theme.specialtyTitle} · {config.city}
          </div>
        </div>

        <div className={`flex flex-wrap items-center gap-5 ${theme.textSecondary}`}>
          <a href="#prestations" className="hover:underline">
            Prestations
          </a>
          <a href="#engagements" className="hover:underline">
            Engagements
          </a>
          <a href="#faq" className="hover:underline">
            FAQ
          </a>
          <a href="#localisation" className="hover:underline">
            Horaires &amp; Accès
          </a>
        </div>
      </div>
    </footer>
  );
}
