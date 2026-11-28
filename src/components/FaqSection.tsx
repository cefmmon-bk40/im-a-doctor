import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FaqItem, VerticalTheme } from '../types/clinic';

interface FaqSectionProps {
  theme: VerticalTheme;
  faqs: FaqItem[];
  prepProtocolTitle?: string;
  prepChecklist?: string[];
}

export function FaqSection({
  theme,
  faqs,
  prepProtocolTitle,
  prepChecklist,
}: FaqSectionProps) {
  const [openId, setOpenId] = useState<string>(faqs[0]?.id || '');

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? '' : id));
  };

  return (
    <section
      id="faq"
      className={`py-12 sm:py-16 border-t transition-colors duration-300 ${theme.borderHairline}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <p className={`text-xs font-semibold tracking-wide ${theme.accentText}`}>
              Réponses pratiques
            </p>
            <h2
              className={`text-2xl sm:text-3xl font-semibold tracking-tight text-balance ${
                theme.usesSerifDisplay ? 'font-display-serif text-3xl sm:text-4xl' : ''
              } ${theme.textPrimary}`}
            >
              Questions Fréquentes
            </h2>
            <p className={`text-sm leading-relaxed ${theme.textSecondary}`}>
              Tout ce qu’il faut savoir avant votre venue au cabinet : protocoles, tarifs et
              organisation de votre prise en charge.
            </p>
          </div>

          {prepProtocolTitle && prepChecklist && prepChecklist.length > 0 && (
            <div
              id="preparation"
              className={`p-5 rounded-2xl border space-y-3.5 ${theme.bgSurface} ${theme.borderHairline}`}
            >
              <div className="space-y-0.5">
                <p className={`text-xs font-semibold tracking-wide ${theme.accentText}`}>
                  Préparation clinique
                </p>
                <h3 className={`text-base font-semibold ${theme.textPrimary}`}>
                  {prepProtocolTitle}
                </h3>
              </div>

              <ul
                className={`space-y-2.5 pt-3 border-t text-xs sm:text-sm ${theme.borderHairline} ${theme.textSecondary}`}
              >
                {prepChecklist.map((item, idx) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-md text-[11px] font-semibold font-mono-tabular flex items-center justify-center shrink-0 mt-0.5 ${theme.accentSoftBg} ${theme.accentSoftText}`}
                    >
                      0{idx + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-3">
          {faqs.map((item) => {
            const isOpen = openId === item.id;
            const panelId = `faq-panel-${item.id}`;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border overflow-hidden transition-colors duration-200 ${theme.bgSurface} ${
                  isOpen ? theme.accentBorder : theme.borderHairline
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-5 py-4 sm:px-6 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                >
                  <span className={`text-sm sm:text-base font-semibold ${theme.textPrimary}`}>
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${theme.accentText} ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div
                    id={panelId}
                    className={`px-5 pb-5 sm:px-6 sm:pb-6 pt-3 border-t text-sm leading-relaxed ${theme.borderHairline} ${theme.textSecondary}`}
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
