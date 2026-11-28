import { Clock, MapPin, Phone } from 'lucide-react';
import { ClinicConfig } from '../types/clinic';

interface LocationSectionProps {
  config: ClinicConfig;
}

export function LocationSection({ config }: LocationSectionProps) {
  const isDefaultCity = config.city.trim().toLowerCase() === 'hydra, alger';
  const addressText = isDefaultCity
    ? 'Quartier des Affaires / Hydra, Alger (Accès facile & Parking)'
    : `${config.city} (Accès facile & Parking)`;

  const mapsDirectionUrl = isDefaultCity
    ? 'https://www.google.com/maps/search/?api=1&query=Hydra+Alger'
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.city)}`;

  const mapEmbedUrl = isDefaultCity
    ? 'https://maps.google.com/maps?q=Hydra,%20Alger&t=&z=15&ie=UTF8&iwloc=&output=embed'
    : `https://maps.google.com/maps?q=${encodeURIComponent(config.city)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const telHref = `tel:${config.phone.replace(/\s+/g, '')}`;

  return (
    <section
      id="localisation"
      aria-labelledby="location-heading"
      className="bg-[#0B0B0D] text-[#F8FAFC] py-14 sm:py-20 border-t border-white/10"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-[#141418] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Info Panel (4 columns) */}
          <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between gap-7 border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="space-y-5">
              <div className="space-y-2.5">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-xs font-semibold tracking-wide text-[#D4AF37]">
                  Accès &amp; Localisation
                </span>
                <h2
                  id="location-heading"
                  className="font-display-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#F8FAFC] text-balance"
                >
                  {config.name}
                </h2>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  Horaires &amp; Localisation
                </p>
              </div>

              <div className="space-y-4 pt-2 border-t border-white/10">
                <div className="flex items-start gap-3">
                  <MapPin
                    className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="text-sm space-y-0.5">
                    <div className="text-xs font-semibold text-[#94A3B8]">Adresse</div>
                    <div className="text-[#F8FAFC] leading-relaxed">{addressText}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-white/10">
                  <Clock
                    className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="text-sm space-y-0.5">
                    <div className="text-xs font-semibold text-[#94A3B8]">Horaires</div>
                    <div className="text-[#F8FAFC] font-medium tabular-nums">
                      Samedi – Jeudi : 08h30 – 17h30
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-white/10">
                  <Phone
                    className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="text-sm space-y-0.5">
                    <div className="text-xs font-semibold text-[#94A3B8]">Téléphone</div>
                    <a
                      href={telHref}
                      className="inline-block text-[#F8FAFC] font-semibold tabular-nums hover:text-[#D4AF37] transition-colors"
                    >
                      {config.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <a
              href={mapsDirectionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#D4AF37] text-sm font-semibold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B0B0D] transition-all duration-200 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
            >
              <span>Ouvrir l&apos;itinéraire GPS →</span>
            </a>
          </div>

          {/* Right Large Interactive Google Map (8 columns) */}
          <div className="lg:col-span-8 bg-[#0B0B0D]">
            <iframe
              title={`Carte Google Maps — ${config.name}`}
              src={mapEmbedUrl}
              className="w-full h-[380px] md:h-[450px] lg:h-full border-0 brightness-95 contrast-105 block"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
