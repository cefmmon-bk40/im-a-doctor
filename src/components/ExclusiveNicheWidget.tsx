import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { ServiceOption, VerticalProfile, VerticalType } from '../types/clinic';
import { calculateLaserPrice, formatPriceDa } from '../utils/clinicLogic';
import { ResilientImage } from './ResilientImage';

interface ExclusiveNicheWidgetProps {
  vertical: VerticalType;
  profile: VerticalProfile;
  selectedServiceId: string;
  onSelectService: (service: ServiceOption) => void;
  showPrices: boolean;
  // Laser specific
  isLaserPack6: boolean;
  onToggleLaserPack6: (isPack6: boolean) => void;
  // Dental specific
  selectedPractitionerId: string;
  onSelectPractitioner: (id: string) => void;
  // Derma specific
  dermaVisitType: 'bilan' | 'suivi';
  onChangeDermaVisitType: (visitType: 'bilan' | 'suivi') => void;
}

export function ExclusiveNicheWidget({
  vertical,
  profile,
  selectedServiceId,
  onSelectService,
  showPrices,
  isLaserPack6,
  onToggleLaserPack6,
  selectedPractitionerId,
  onSelectPractitioner,
  dermaVisitType,
  onChangeDermaVisitType,
}: ExclusiveNicheWidgetProps) {
  const { theme, services } = profile;
  const activeService =
    services.find((s) => s.id === selectedServiceId) || services[0];

  return (
    <div className="space-y-6">
      {/* Niche-Specific Top Controls */}
      {vertical === 'laser' && (
        <div
          className={`p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${theme.bgSubtle} ${theme.borderHairline}`}
        >
          <div className="space-y-1">
            <div className={`text-sm font-semibold flex items-center gap-2 ${theme.textPrimary}`}>
              <Sparkles className={`w-4 h-4 ${theme.accentText}`} aria-hidden="true" />
              <span>Formule de séances</span>
            </div>
            <p className={`text-xs ${theme.textMuted}`}>
              Comparez le tarif à la séance ou économisez 20% avec le protocole complet.
            </p>
          </div>

          <div
            role="group"
            aria-label="Choisir entre 1 séance ou Pack 6 séances"
            className={`inline-flex w-fit self-start sm:self-auto p-1 rounded-lg border shrink-0 ${theme.bgSurface} ${theme.borderHairline}`}
          >
            <button
              type="button"
              onClick={() => onToggleLaserPack6(false)}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                !isLaserPack6
                  ? `${theme.accentBg} ${theme.accentButtonText} shadow-sm`
                  : `${theme.textSecondary} hover:opacity-90`
              }`}
            >
              1 Séance
            </button>
            <button
              type="button"
              onClick={() => onToggleLaserPack6(true)}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                isLaserPack6
                  ? `${theme.accentBg} ${theme.accentButtonText} shadow-sm`
                  : `${theme.textSecondary} hover:opacity-90`
              }`}
            >
              Pack 6 Séances (-20% Offert)
            </button>
          </div>
        </div>
      )}

      {vertical === 'dental' && profile.practitioners && (
        <div
          className={`p-4 sm:p-5 rounded-xl border space-y-3 ${theme.bgSubtle} ${theme.borderHairline}`}
        >
          <div className={`text-sm font-semibold flex items-center gap-2 ${theme.textPrimary}`}>
            <UserCheck className={`w-4 h-4 ${theme.accentText}`} aria-hidden="true" />
            <span>Sélection du praticien</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.practitioners.map((prac) => {
              const isSelected = selectedPractitionerId === prac.id;
              return (
                <button
                  key={prac.id}
                  type="button"
                  onClick={() => onSelectPractitioner(prac.id)}
                  className={`text-left p-3.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? `${theme.bgSurface} ${theme.accentBorder} ring-1 ring-[#0D9488]`
                      : `${theme.bgSurface} ${theme.borderHairline} hover:border-[#0D9488]/50`
                  }`}
                >
                  <div className={`text-sm font-semibold ${theme.textPrimary}`}>{prac.name}</div>
                  <div className={`text-xs mt-0.5 ${theme.textMuted}`}>{prac.role}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {vertical === 'derma' && (
        <div
          className={`p-4 sm:p-5 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${theme.bgSubtle} ${theme.borderHairline}`}
        >
          <div className="space-y-1">
            <div className={`text-sm font-semibold ${theme.textPrimary}`}>
              Contexte de votre visite
            </div>
            <p className={`text-xs ${theme.textMuted}`}>
              Permet au dermatologue de préparer votre dossier avant l’entrée en salle.
            </p>
          </div>
          <div
            role="group"
            aria-label="Type de visite dermatologique"
            className="grid grid-cols-1 sm:inline-flex p-1 rounded-lg bg-white border border-[#D1FAE5] shrink-0 gap-1 sm:gap-0"
          >
            <button
              type="button"
              onClick={() => onChangeDermaVisitType('bilan')}
              className={`px-3 py-2 rounded-md text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                dermaVisitType === 'bilan'
                  ? 'bg-[#047857] text-white'
                  : 'text-[#1F3A32] hover:text-[#064E3B]'
              }`}
            >
              Premier bilan dermatologique
            </button>
            <button
              type="button"
              onClick={() => onChangeDermaVisitType('suivi')}
              className={`px-3 py-2 rounded-md text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                dermaVisitType === 'suivi'
                  ? 'bg-[#047857] text-white'
                  : 'text-[#1F3A32] hover:text-[#064E3B]'
              }`}
            >
              Suivi traitement en cours
            </button>
          </div>
        </div>
      )}

      {/* Service / Motif Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {services.map((service) => {
          const isSelected = service.id === activeService.id;
          const laserPricing =
            vertical === 'laser' ? calculateLaserPrice(service.priceDa, isLaserPack6) : null;

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelectService(service)}
              aria-pressed={isSelected}
              className={`text-left rounded-2xl border overflow-hidden transition-all duration-200 flex flex-col justify-between cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isSelected
                  ? `${theme.bgSurface} ${theme.accentBorder} shadow-sm ring-1`
                  : `${theme.bgSurface} ${theme.borderHairline} hover:shadow-sm`
              }`}
              style={
                isSelected
                  ? ({ '--tw-ring-color': theme.accentHex } as React.CSSProperties)
                  : undefined
              }
            >
              <div className="w-full">
                <div className={`h-40 w-full overflow-hidden rounded-t-2xl ${theme.imagePlaceholderBg}`}>
                  <ResilientImage
                    src={service.imageUrl}
                    alt={service.title}
                    vertical={vertical}
                    fallbackTitle={service.title}
                    className="h-40 w-full object-cover rounded-t-2xl transition-transform duration-300 hover:scale-[1.03]"
                  />
                </div>

                <div className="p-4 sm:p-5 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`text-xs font-medium ${theme.textMuted}`}>
                      {service.isUrgent ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                          {service.category}
                        </span>
                      ) : (
                        <span>{service.category || theme.shortLabel}</span>
                      )}
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span className="tabular-nums">{service.durationMin} min</span>
                    </div>

                    {isSelected && (
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${theme.accentText}`}
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div className={`text-base font-semibold ${theme.textPrimary}`}>
                    {service.title}
                  </div>
                  <p className={`text-xs leading-relaxed ${theme.textSecondary}`}>
                    {service.subtitle}
                  </p>
                </div>
              </div>

              {showPrices && (
                <div
                  className={`mx-4 sm:mx-5 mb-4 sm:mb-5 pt-3 border-t flex items-baseline justify-between gap-2 ${theme.borderHairline}`}
                >
                  {vertical === 'laser' && laserPricing ? (
                    isLaserPack6 ? (
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={`text-sm font-bold tabular-nums ${theme.textPrimary}`}>
                          {formatPriceDa(laserPricing.totalDa)}
                        </span>
                        <span className={`text-xs line-through tabular-nums ${theme.textMuted}`}>
                          {formatPriceDa(laserPricing.originalDa)}
                        </span>
                        <span className={`text-xs font-semibold tabular-nums ${theme.accentSoftText}`}>
                          ({formatPriceDa(laserPricing.perSessionDa)} / séance)
                        </span>
                      </div>
                    ) : (
                      <span className={`text-sm font-bold tabular-nums ${theme.textPrimary}`}>
                        {formatPriceDa(laserPricing.totalDa)}
                      </span>
                    )
                  ) : (
                    <span className={`text-sm font-bold tabular-nums ${theme.textPrimary}`}>
                      {formatPriceDa(service.priceDa)}
                    </span>
                  )}

                  <span className={`text-xs font-medium ${theme.accentText}`}>
                    {isSelected ? 'Sélectionné' : 'Choisir'}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Doctor Automated Document Checklist */}
      {vertical === 'doctor' && (
        <div
          className={`p-4 sm:p-5 rounded-xl border space-y-2.5 ${theme.bgSubtle} ${theme.borderHairline}`}
        >
          <div className={`text-sm font-semibold flex items-center gap-2 ${theme.textPrimary}`}>
            <ClipboardList className={`w-4 h-4 ${theme.accentText}`} aria-hidden="true" />
            <span>Checklist automatique · {activeService.title}</span>
          </div>
          <p className={`text-xs sm:text-sm font-medium ${theme.textSecondary}`}>
            {profile.prepProtocolBody}
          </p>
          <ul className={`space-y-1.5 text-xs ${theme.textMuted}`}>
            {profile.prepChecklist.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${theme.accentBg}`} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
