import { Award, HeartHandshake, ShieldCheck } from 'lucide-react';
import { TrustPillar, VerticalTheme } from '../types/clinic';

interface MedicalCommitmentsSectionProps {
  theme: VerticalTheme;
  pillars: TrustPillar[];
}

export function MedicalCommitmentsSection({
  theme,
  pillars,
}: MedicalCommitmentsSectionProps) {
  const icons = [Award, ShieldCheck, HeartHandshake];

  return (
    <section
      id="engagements"
      className={`py-12 sm:py-16 border-t transition-colors duration-300 ${theme.borderHairline}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="max-w-2xl space-y-1.5">
          <p className={`text-xs font-semibold tracking-wide ${theme.accentText}`}>
            Charte Qualité Clinique
          </p>
          <h2
            className={`text-2xl sm:text-3xl font-semibold tracking-tight text-balance ${
              theme.usesSerifDisplay ? 'font-display-serif text-3xl sm:text-4xl' : ''
            } ${theme.textPrimary}`}
          >
            Direction Médicale &amp; Engagements
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((pillar, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div
                key={pillar.id}
                className={`p-6 rounded-2xl border flex flex-col justify-between gap-4 transition-colors duration-300 ${theme.bgSurface} ${theme.borderHairline}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${theme.accentSoftBg}`}
                    >
                      <Icon className={`w-5 h-5 ${theme.accentText}`} aria-hidden="true" />
                    </div>
                    <span
                      className={`text-xs font-semibold tracking-wide ${theme.accentSoftText}`}
                    >
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className={`text-base font-semibold ${theme.textPrimary}`}>
                    {pillar.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${theme.textSecondary}`}>
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
