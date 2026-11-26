import {
  ArrowRight,
  CalendarCheck,
  Phone,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { ClinicConfig, VerticalProfile } from '../types/clinic';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  config: ClinicConfig;
  profile: VerticalProfile;
  onStartBooking: () => void;
}

export function HeroSection({ config, profile, onStartBooking }: HeroSectionProps) {
  const { theme } = profile;
  const telHref = `tel:${config.phone.replace(/\s+/g, '')}`;

  return (
    <section id="top" className="py-10 sm:py-16 lg:py-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Core Clinical Proposition */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="space-y-5">
              {/* Unboxed Metadata Line */}
              <div
                className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm font-medium ${theme.textMuted}`}
              >
                <span className={`inline-flex items-center gap-1.5 font-semibold ${theme.accentText}`}>
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  Cabinet Vérifié
                </span>
                <span aria-hidden="true">·</span>
                <span>{config.city}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{theme.hoursLabel}</span>
              </div>

              {/* Exclusive Doctor Waiting-Room Status Indicator */}
              {config.type === 'doctor' && (
                <div
                  className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg border text-xs sm:text-sm font-medium w-fit ${theme.accentSoftBg} ${theme.borderHairline} ${theme.accentSoftText}`}
                >
                  <Activity className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Flux fluide</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">Temps d’attente estimé : ~10 min</span>
                </div>
              )}

              <div className="space-y-3">
                <p className={`text-sm font-semibold tracking-wide ${theme.accentText}`}>
                  {theme.specialtyTitle}
                </p>
                <h1
                  className={`text-3xl sm:text-4xl lg:text-[3.1rem] leading-[1.12] tracking-tight font-semibold text-balance transition-colors duration-300 ${
                    theme.usesSerifDisplay ? 'font-display-serif font-semibold lg:text-[3.4rem]' : ''
                  } ${theme.textPrimary}`}
                >
                  {theme.heroTitle}
                </h1>
              </div>

              <p className={`text-base sm:text-lg leading-relaxed max-w-2xl ${theme.textSecondary}`}>
                {theme.heroSubtitle}
              </p>

              {/* Primary CTA + Click-to-Call */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={onStartBooking}
                  className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.accentBg} ${theme.accentHoverBg}`}
                >
                  <CalendarCheck className="w-4 h-4" aria-hidden="true" />
                  <span>Prendre Rendez-vous en 30 sec</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <a
                  href={telHref}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg text-sm font-semibold border transition-colors duration-200 whitespace-nowrap shrink-0 ${theme.bgSurface} ${theme.borderHairline} ${theme.textPrimary} hover:opacity-85`}
                >
                  <Phone className={`w-4 h-4 ${theme.accentText}`} aria-hidden="true" />
                  <span className="tabular-nums">{config.phone}</span>
                </a>
              </div>
            </div>

            {/* Trust Highlights Strip */}
            <div className={`pt-6 border-t grid grid-cols-1 sm:grid-cols-3 gap-4 ${theme.borderHairline}`}>
              {profile.trustHighlights.map((item) => (
                <div key={item.metric} className="space-y-0.5">
                  <div className={`text-sm font-semibold tabular-nums ${theme.textPrimary}`}>
                    {item.metric}
                  </div>
                  <div className={`text-xs leading-snug ${theme.textMuted}`}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Large Rounded-3xl Framed Feature Photo with Glassmorphic Overlay */}
          <div className="lg:col-span-5 flex">
            <div
              className={`w-full min-h-[320px] sm:min-h-[380px] lg:h-full rounded-3xl border overflow-hidden relative shadow-lg transition-all duration-300 ${theme.borderHairline}`}
            >
              <ResilientImage
                src={profile.heroImageUrl}
                alt={`${config.name} — ${profile.heroImageAlt}`}
                vertical={config.type}
                priority
                fallbackTitle={`${config.name} · ${theme.specialtyTitle}`}
                className="w-full h-full object-cover min-h-[320px] sm:min-h-[380px]"
              />

              {/* Measured bottom gradient scrim for WCAG AA contrast */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/75 via-black/35 to-transparent pointer-events-none"
              />

              {/* Floating Glassmorphic Badge on bottom-left */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto max-w-full">
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950/65 backdrop-blur-md border border-white/20 text-white shadow-md">
                  <span className="text-xs sm:text-sm font-medium leading-snug tabular-nums">
                    Prochain créneau disponible : Aujourd’hui • 4.9★ Avis Patients
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
