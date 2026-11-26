import { GalleryItem, VerticalTheme, VerticalType } from '../types/clinic';
import { ResilientImage } from './ResilientImage';

interface TrustGallerySectionProps {
  vertical: VerticalType;
  theme: VerticalTheme;
  items: GalleryItem[];
}

export function TrustGallerySection({
  vertical,
  theme,
  items,
}: TrustGallerySectionProps) {
  return (
    <section
      aria-labelledby="trust-gallery-heading"
      className={`py-12 sm:py-16 border-t transition-colors duration-300 ${theme.borderHairline}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className={`text-xs font-semibold tracking-wide ${theme.accentText}`}>
              Infrastructures &amp; Standards Cliniques
            </p>
            <h2
              id="trust-gallery-heading"
              className={`text-2xl sm:text-3xl font-semibold tracking-tight text-balance ${
                theme.usesSerifDisplay ? 'font-display-serif text-3xl sm:text-4xl' : ''
              } ${theme.textPrimary}`}
            >
              Notre Établissement &amp; Plateau Technique
            </h2>
          </div>

          <p className={`text-xs sm:text-sm max-w-md ${theme.textMuted}`}>
            Des installations médicales certifiées pour garantir sécurité, confidentialité et confort à chaque consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {items.map((item, idx) => (
            <article
              key={item.id}
              className={`rounded-2xl border overflow-hidden flex flex-col transition-all duration-200 ${theme.bgSurface} ${theme.borderHairline}`}
            >
              <div className="h-52 w-full overflow-hidden bg-slate-100">
                <ResilientImage
                  src={item.imageUrl}
                  alt={item.title}
                  vertical={vertical}
                  fallbackTitle={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between gap-2">
                <div className="space-y-1.5">
                  <span className={`text-xs font-semibold font-mono-tabular ${theme.accentText}`}>
                    0{idx + 1}. {theme.shortLabel}
                  </span>
                  <h3 className={`text-base font-semibold ${theme.textPrimary}`}>
                    {item.title}
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed ${theme.textSecondary}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
