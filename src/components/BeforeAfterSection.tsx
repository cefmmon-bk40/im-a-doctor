import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { BeforeAfterCase, VerticalTheme, VerticalType } from '../types/clinic';
import { VERTICAL_PROFILES } from '../data/verticals';
import { calculateComparisonPercentFromPointer } from '../utils/clinicLogic';
import { renderClinicalRetouchLayers } from '../utils/clinicalRetouch';

export const CASES: Record<VerticalType, BeforeAfterCase[]> = {
  laser: VERTICAL_PROFILES.laser.beforeAfterCases,
  dental: VERTICAL_PROFILES.dental.beforeAfterCases,
  derma: VERTICAL_PROFILES.derma.beforeAfterCases,
  doctor: VERTICAL_PROFILES.doctor.beforeAfterCases,
};

interface BeforeAfterSectionProps {
  vertical: VerticalType;
  theme: VerticalTheme;
  cases?: BeforeAfterCase[];
  onStartBooking: () => void;
}

export function BeforeAfterSection({
  vertical,
  theme,
  cases,
  onStartBooking,
}: BeforeAfterSectionProps) {
  const profileCases = cases && cases.length > 0 ? cases : CASES[vertical];
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [retouchReadyKey, setRetouchReadyKey] = useState<string>('');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const beforeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const afterCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeCase = profileCases[activeCaseIndex] || profileCases[0];
  const usesDistinctPhotos = Boolean(
    activeCase && activeCase.beforeImage !== activeCase.afterImage
  );
  const usesLocalizedCanvas = Boolean(
    activeCase && !usesDistinctPhotos && activeCase.retouchPreset
  );

  useEffect(() => {
    if (!activeCase || !usesLocalizedCanvas || !activeCase.retouchPreset) {
      return;
    }

    let isCancelled = false;
    const preset = activeCase.retouchPreset;
    const renderKey = `${activeCase.id}:${activeCase.afterImage}:${preset}`;

    const img = new Image();
    if (/^https?:\/\//i.test(activeCase.afterImage)) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      if (isCancelled) return;
      const beforeCanvas = beforeCanvasRef.current;
      const afterCanvas = afterCanvasRef.current;
      if (!beforeCanvas || !afterCanvas) return;

      try {
        renderClinicalRetouchLayers(img, beforeCanvas, afterCanvas, preset);
        if (!isCancelled) {
          setRetouchReadyKey(renderKey);
        }
      } catch {
        if (!isCancelled) {
          setRetouchReadyKey('');
        }
      }
    };

    img.onerror = () => {
      if (!isCancelled) {
        setFailedImages((prev) => ({
          ...prev,
          [`${activeCase.id}-before`]: true,
          [`${activeCase.id}-after`]: true,
        }));
      }
    };

    img.src = activeCase.afterImage;

    return () => {
      isCancelled = true;
    };
  }, [activeCase, usesLocalizedCanvas]);

  if (!activeCase) return null;

  const updateFromPointer = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = calculateComparisonPercentFromPointer(clientX, rect.left, rect.width);
    setSliderPosition(next);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(5, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(95, prev + 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderPosition(5);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderPosition(95);
    }
  };

  const handleSelectCase = (index: number) => {
    setActiveCaseIndex(index);
    setSliderPosition(50);
  };

  const beforeImgFailed = Boolean(failedImages[`${activeCase.id}-before`]);
  const afterImgFailed = Boolean(failedImages[`${activeCase.id}-after`]);
  const expectedRenderKey = `${activeCase.id}:${activeCase.afterImage}:${activeCase.retouchPreset || ''}`;
  const isCanvasReady = usesLocalizedCanvas && retouchReadyKey === expectedRenderKey;

  return (
    <section
      id="resultats"
      data-testid="before-after-section"
      className={`py-12 sm:py-16 border-t transition-colors duration-300 ${theme.borderHairline}`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-7">
        {/* Section Heading + Pill Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold tracking-wide text-[#D4AF37]">
              Résultats Cliniques Documentés
            </p>
            <h2
              className={`text-2xl sm:text-3xl font-semibold tracking-tight text-balance ${
                theme.usesSerifDisplay ? 'font-display-serif text-3xl sm:text-4xl' : ''
              } ${theme.textPrimary}`}
            >
              Comparatif Avant / Après
            </h2>
          </div>

          {/* Case Switcher Pill Tabs */}
          <div
            role="tablist"
            aria-label="Cas cliniques Avant / Après"
            className="inline-flex flex-wrap gap-1.5 p-1.5 rounded-2xl sm:rounded-full border border-[#D4AF37]/35 bg-[#0B0B0D] self-start md:self-auto"
          >
            {profileCases.map((item, idx) => {
              const isSelected = idx === activeCaseIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectCase(idx)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] ${
                    isSelected
                      ? 'bg-[#D4AF37] text-[#0B0B0D] shadow-sm'
                      : 'text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  {item.tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Luxury Dark (#0B0B0D) & Warm Gold (#D4AF37) Comparison Card */}
        <div className="rounded-3xl border border-[#D4AF37]/35 bg-[#0B0B0D] text-[#F8FAFC] p-3 sm:p-4 shadow-2xl space-y-4">
          {/* Interactive Draggable Comparison Viewport */}
          <div
            ref={containerRef}
            data-testid="before-after-slider"
            data-retouch-mode={usesDistinctPhotos ? 'dual-image' : 'localized-canvas'}
            data-retouch-ready={usesDistinctPhotos || isCanvasReady ? 'true' : 'false'}
            data-retouch-preset={activeCase.retouchPreset || 'none'}
            role="slider"
            tabIndex={0}
            aria-label={`Curseur de comparaison Avant / Après pour ${activeCase.title}`}
            aria-valuemin={5}
            aria-valuemax={95}
            aria-valuenow={Math.round(sliderPosition)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={handleSliderKeyDown}
            style={{ touchAction: 'pan-y' }}
            className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden select-none cursor-ew-resize bg-[#0B0B0D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
          >
            {/* Base Layer: Après (Right Side — full size, inset-0) */}
            {afterImgFailed ? (
              <div
                aria-label={`${activeCase.title} — Après`}
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#141418] to-[#262013] text-sm font-medium text-[#E5C687]"
              >
                Après · {activeCase.title}
              </div>
            ) : (
              <>
                <img
                  src={activeCase.afterImage}
                  alt={`${activeCase.title} — Résultat Après`}
                  draggable={false}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedImages((prev) => ({ ...prev, [`${activeCase.id}-after`]: true }))
                  }
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                />
                {usesLocalizedCanvas && (
                  <canvas
                    ref={afterCanvasRef}
                    data-testid="after-retouch-canvas"
                    aria-hidden="true"
                    className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none ${
                      isCanvasReady ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )}
              </>
            )}

            {/* Clipped Overlay Layer: Avant (Left Side — clipped cleanly with clip-path inset) */}
            <div
              data-testid="before-clipped-layer"
              className="absolute inset-0 pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              {beforeImgFailed ? (
                <div
                  aria-label={`${activeCase.title} — Avant`}
                  className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0B0B0D] to-[#1A1A22] text-sm font-medium text-[#CBD5E1]"
                >
                  Avant · {activeCase.title}
                </div>
              ) : usesDistinctPhotos ? (
                <img
                  src={activeCase.beforeImage}
                  alt={`${activeCase.title} — État Avant`}
                  draggable={false}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedImages((prev) => ({ ...prev, [`${activeCase.id}-before`]: true }))
                  }
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                />
              ) : (
                <>
                  <img
                    src={activeCase.beforeImage}
                    alt={`${activeCase.title} — État Avant`}
                    draggable={false}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [`${activeCase.id}-before`]: true }))
                    }
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                  />
                  <canvas
                    ref={beforeCanvasRef}
                    data-testid="before-retouch-canvas"
                    aria-hidden="true"
                    className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none ${
                      isCanvasReady ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </>
              )}
            </div>

            {/* Subtle Top/Bottom Scrims for Badge Readability */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 to-transparent pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"
            />

            {/* Top-Left "Avant" Glassmorphism Badge */}
            <span className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-10 px-3.5 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/25 text-white text-xs font-semibold tracking-wide pointer-events-none">
              Avant
            </span>

            {/* Top-Right "Après" Glassmorphism Badge */}
            <span className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/92 backdrop-blur-md border border-[#FAF9F6]/45 text-[#0B0B0D] text-xs font-semibold tracking-wide pointer-events-none">
              Après
            </span>

            {/* Vertical Warm Gold (#D4AF37) Divider Line & Circular Handle (↔) */}
            <div
              aria-hidden="true"
              style={{ left: `${sliderPosition}%` }}
              className="absolute inset-y-0 -translate-x-1/2 z-20 flex flex-col items-center justify-center pointer-events-none"
            >
              <div className="w-[2px] h-full bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.8)]" />
              <div
                data-testid="before-after-handle"
                className={`absolute w-11 h-11 rounded-full bg-[#D4AF37] text-[#0B0B0D] border-2 border-[#FAF9F6] shadow-lg flex items-center justify-center text-base font-bold transition-transform duration-150 ${
                  isDragging ? 'scale-110' : 'scale-100'
                }`}
              >
                ↔
              </div>
            </div>
          </div>

          {/* Caption, Duration & CTA Bar below slider */}
          <div className="px-2 sm:px-3 pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="text-sm sm:text-base font-semibold text-[#F8FAFC]">
                {activeCase.title}
              </div>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                {activeCase.caption}{' '}
                <span aria-hidden="true" className="mx-1.5 text-[#D4AF37]">
                  ·
                </span>
                <span className="text-[#E8CC75] font-medium tabular-nums">
                  {activeCase.durationMeta}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={onStartBooking}
              data-vertical-cta={vertical}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold bg-[#D4AF37] hover:bg-[#DFBE52] text-[#0B0B0D] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
            >
              <span>Obtenir un résultat similaire</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Prendre RDV</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
