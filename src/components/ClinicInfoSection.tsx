import { Clock, ExternalLink, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { ClinicConfig, VerticalProfile } from '../types/clinic';

interface ClinicInfoSectionProps {
  config: ClinicConfig;
  profile: VerticalProfile;
}

export function ClinicInfoSection({ config, profile }: ClinicInfoSectionProps) {
  const { theme } = profile;
  const telHref = `tel:${config.phone.replace(/\s+/g, '')}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${config.name} ${config.city} Algérie`
  )}`;

  return (
    <section
      id="acces"
      className={`py-12 sm:py-16 border-t transition-colors duration-300 ${theme.borderHairline}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Preparation Guidelines */}
        <div id="preparation" className="lg:col-span-6 space-y-5">
          <div className="space-y-1.5">
            <p className={`text-xs font-semibold tracking-wide ${theme.accentText}`}>
              Préparation clinique
            </p>
            <h2
              className={`text-2xl sm:text-3xl font-semibold tracking-tight ${
                theme.usesSerifDisplay ? 'font-display-serif text-3xl sm:text-4xl' : ''
              } ${theme.textPrimary}`}
            >
              {profile.prepProtocolTitle}
            </h2>
          </div>

          <div
            className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${theme.bgSurface} ${theme.borderHairline}`}
          >
            <p className={`text-sm font-medium leading-relaxed ${theme.textPrimary}`}>
              {profile.prepProtocolBody}
            </p>

            <ul
              className={`space-y-3 pt-3 border-t text-sm ${theme.borderHairline} ${theme.textSecondary}`}
            >
              {profile.prepChecklist.map((item, idx) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className={`w-6 h-6 rounded-md text-xs font-semibold font-mono-tabular flex items-center justify-center shrink-0 ${theme.accentSoftBg} ${theme.accentSoftText}`}
                  >
                    0{idx + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sleek Horaires, Accès & Localisation Card */}
        <div className="lg:col-span-6 space-y-5">
          <div className="space-y-1.5">
            <p className={`text-xs font-semibold tracking-wide ${theme.accentText}`}>
              Localisation &amp; Contact
            </p>
            <h2
              className={`text-2xl sm:text-3xl font-semibold tracking-tight ${
                theme.usesSerifDisplay ? 'font-display-serif text-3xl sm:text-4xl' : ''
              } ${theme.textPrimary}`}
            >
              Horaires, Accès &amp; Localisation
            </h2>
          </div>

          <div
            className={`p-5 sm:p-6 rounded-2xl border space-y-5 ${theme.bgSurface} ${theme.borderHairline}`}
          >
            <div className="flex items-start gap-3">
              <MapPin className={`w-5 h-5 shrink-0 mt-0.5 ${theme.accentText}`} aria-hidden="true" />
              <div>
                <div className={`text-base font-semibold ${theme.textPrimary}`}>{config.name}</div>
                <div className={`text-sm mt-0.5 ${theme.textSecondary}`}>
                  {config.city}, Algérie
                </div>
              </div>
            </div>

            <div className={`pt-4 border-t flex items-start gap-3 ${theme.borderHairline}`}>
              <Clock className={`w-5 h-5 shrink-0 mt-0.5 ${theme.accentText}`} aria-hidden="true" />
              <div className="text-sm space-y-1">
                <div className={`font-semibold tabular-nums ${theme.textPrimary}`}>
                  Samedi - Jeudi : 08h30 - 17h30
                </div>
                <div className={theme.textMuted}>
                  Fermé le vendredi · Accueil sans interruption
                </div>
              </div>
            </div>

            {/* Interactive Actions: Click-to-Call + Open on Google Maps */}
            <div
              className={`pt-4 border-t flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ${theme.borderHairline}`}
            >
              <a
                href={telHref}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-colors whitespace-nowrap ${theme.bgSubtle} ${theme.borderHairline} ${theme.textPrimary} hover:opacity-90`}
              >
                <Phone className={`w-4 h-4 shrink-0 ${theme.accentText}`} aria-hidden="true" />
                <span className="tabular-nums">{config.phone}</span>
              </a>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${theme.accentBg} ${theme.accentHoverBg} ${theme.accentButtonText}`}
              >
                <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Ouvrir sur Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden="true" />
              </a>
            </div>

            <div
              className={`pt-3 border-t flex items-center gap-2 text-xs ${theme.borderHairline} ${theme.textMuted}`}
            >
              <ShieldCheck className={`w-4 h-4 shrink-0 ${theme.accentText}`} aria-hidden="true" />
              <span>Respect strict du secret médical &amp; des normes d’hygiène</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
