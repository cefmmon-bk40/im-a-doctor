import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FaqItem, VerticalTheme } from '../types/clinic';

interface FaqSectionProps {
  theme: VerticalTheme;
  faqs: FaqItem[];
}

export function FaqSection({ theme, faqs }: FaqSectionProps) {
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
        <div className="lg:col-span-4 space-y-2">
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

        <div className="lg:col-span-8 space-y-3">
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
