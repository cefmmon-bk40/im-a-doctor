import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { BeforeAfterCase, CropRect, VerticalTheme, VerticalType } from '../types/clinic';
import { calculateComparisonPercentFromPointer } from '../utils/clinicLogic';

export interface CroppedProfileCase {
  id: VerticalType;
  tabLabel: string;
  title: string;
  subtitle: string;
  duration: string;
  image: string;
  beforeCrop: CropRect;
  afterCrop: CropRect;
}

export const CASES_DATA: Record<VerticalType, CroppedProfileCase> = {
  dental: {
    id: 'dental',
    tabLabel: 'Esthétique Dentaire',
    title: 'Blanchiment & Esthétique Dentaire',
    subtitle: "Éclaircissement naturel de l'émail et harmonisation du sourire.",
    duration: 'Séance : 45 min • Résultat immédiat',
    image: '/images/dentist.webp',
    beforeCrop: { x: 0, y: 0.04, w: 1, h: 0.45 },
    afterCrop: { x: 0, y: 0.51, w: 1, h: 0.29 },
  },
  laser: {
    id: 'laser',
    tabLabel: 'Laser Vasculaire',
    title: 'Traitement Laser Vasculaire & Éclat',
    subtitle: 'Atténuation visible des rougeurs et unification du teint.',
    duration: 'Protocole : 3 séances • Peau apaisée',
    image: '/images/laser.webp',
    beforeCrop: { x: 0, y: 0, w: 0.495, h: 1 },
    afterCrop: { x: 0.505, y: 0, w: 0.495, h: 1 },
  },
  derma: {
    id: 'derma',
    tabLabel: 'Acné & Cicatrices',
    title: "Traitement de l'Acné & Cicatrices",
    subtitle: 'Réduction des imperfections inflammatoires et lissage du grain de peau.',
    duration: 'Protocole : 3 à 4 séances • Peau nette',
    image: '/images/acne.webp',
    beforeCrop: { x: 0, y: 0, w: 0.488, h: 1 },
    afterCrop: { x: 0.512, y: 0, w: 0.488, h: 1 },
  },
  doctor: {
    id: 'doctor',
    tabLabel: 'Suivi Dermatologique',
    title: 'Suivi Dermatologique & Soins Ciblés',
    subtitle: "Résorption de l'inflammation cutanée après protocole médical personnalisé.",
    duration: 'Suivi : 2 semaines • Résultat clinique',
    image: '/images/laser.webp',
    beforeCrop: { x: 0, y: 0, w: 0.495, h: 1 },
    afterCrop: { x: 0.505, y: 0, w: 0.495, h: 1 },
  },
};

const PROFILE_ORDER: VerticalType[] = ['laser', 'dental', 'derma', 'doctor'];

interface CroppedLayerProps {
  src: string;
  alt: string;
  crop: CropRect;
  onError?: () => void;
}

export function CroppedLayer({ src, alt, crop, onError }: CroppedLayerProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        onError={onError}
        style={{
          position: 'absolute',
          maxWidth: 'none',
          objectFit: 'cover',
          width: `${(1 / crop.w) * 100}%`,
          height: `${(1 / crop.h) * 100}%`,
          left: `${-(crop.x / crop.w) * 100}%`,
          top: `${-(crop.y / crop.h) * 100}%`,
        }}
        className="pointer-events-none select-none"
      />
    </div>
  );
}

interface BeforeAfterSectionProps {
  vertical?: VerticalType;
  theme?: VerticalTheme;
  cases?: BeforeAfterCase[];
  onStartBooking?: () => void;
}

export function BeforeAfterSection({
  vertical,
  theme,
  onStartBooking,
}: BeforeAfterSectionProps = {}) {
  const [selectedProfile, setSelectedProfile] = useState<VerticalType>(() => {
    if (vertical) return vertical;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const p = (params.get('profile') || params.get('type') || '').trim().toLowerCase();
      if (p && ['dental', 'laser', 'derma', 'doctor'].includes(p)) {
        return p as VerticalType;
      }
    }
    return 'laser';
  });

  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (vertical) {
      setSelectedProfile(vertical);
      setSliderPosition(50);
    }
  }, [vertical]);

  useEffect(() => {
    if (vertical || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const p = (params.get('profile') || params.get('type') || '').trim().toLowerCase();
    if (p && ['dental', 'laser', 'derma', 'doctor'].includes(p)) {
      setSelectedProfile(p as VerticalType);
    }
  }, [vertical]);

  const currentCase = CASES_DATA[selectedProfile] || CASES_DATA.laser;

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const position = calculateComparisonPercentFromPointer(
      clientX,
      rect.left,
      rect.width,
      2,
      98
    );
    setSliderPosition(position);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.clientX);
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
      setSliderPosition((prev) => Math.max(2, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(98, prev + 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderPosition(2);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderPosition(98);
    }
  };

  const handleSelectProfile = (nextProfile: VerticalType) => {
    setSelectedProfile(nextProfile);
    setSliderPosition(50);
  };

  const scrollToBooking = () => {
    if (onStartBooking) {
      onStartBooking();
      return;
    }
    const bookingSection = document.getElementById('rendez-vous');
    bookingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const imageFailed = Boolean(failedImages[currentCase.id]);

  return (
    <section
      id="resultats"
      data-testid="before-after-section"
      className="py-16 px-4 bg-[#0B0B0D] text-[#F8FAFC] border-t border-[#1a1a1f] select-none"
    >
      <div className="max-w-4xl mx-auto text-center mb-8">
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full mb-3">
          Résultats Cliniques Documentés
        </span>
        <h2
          className={`text-3xl sm:text-4xl font-semibold tracking-tight text-[#F8FAFC] mb-3 ${
            theme?.usesSerifDisplay ? 'font-display-serif' : ''
          }`}
        >
          Comparatif Avant / Après
        </h2>
        <p className="text-sm sm:text-base text-[#CBD5E1] max-w-2xl mx-auto mb-6">
          Faites glisser le curseur pour comparer l’évolution clinique réelle avant et après protocole.
        </p>

        {/* Profile Switcher Tabs */}
        <div
          role="tablist"
          aria-label="Spécialités cliniques Avant / Après"
          className="inline-flex flex-wrap justify-center gap-1.5 p-1.5 rounded-2xl sm:rounded-full border border-[#D4AF37]/30 bg-[#121216]"
        >
          {PROFILE_ORDER.map((profileKey) => {
            const item = CASES_DATA[profileKey];
            const isSelected = selectedProfile === profileKey;
            return (
              <button
                key={profileKey}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleSelectProfile(profileKey)}
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

      <div className="max-w-3xl mx-auto rounded-3xl border border-[#D4AF37]/30 bg-[#121216] p-3 sm:p-4 shadow-2xl space-y-4">
        <div
          ref={containerRef}
          data-testid="before-after-slider"
          data-active-profile={selectedProfile}
          role="slider"
          tabIndex={0}
          aria-label={`Curseur de comparaison Avant / Après pour ${currentCase.title}`}
          aria-valuemin={2}
          aria-valuemax={98}
          aria-valuenow={Math.round(sliderPosition)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleSliderKeyDown}
          className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden touch-none select-none cursor-ew-resize bg-[#0B0B0D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
        >
          {/* Base Layer: Après (Right Side) */}
          <div className="absolute inset-0 pointer-events-none">
            {imageFailed ? (
              <div className="w-full h-full flex items-center justify-center bg-[#141418] text-sm font-medium text-[#D4AF37]">
                Après · {currentCase.title}
              </div>
            ) : (
              <CroppedLayer
                src={currentCase.image}
                alt={`${currentCase.title} — Résultat Après`}
                crop={currentCase.afterCrop}
                onError={() =>
                  setFailedImages((prev) => ({ ...prev, [currentCase.id]: true }))
                }
              />
            )}
          </div>

          {/* Clipped Top Layer: Avant (Left Side) */}
          <div
            data-testid="before-clipped-layer"
            className="absolute inset-0 pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            {imageFailed ? (
              <div className="w-full h-full flex items-center justify-center bg-[#0B0B0D] text-sm font-medium text-[#CBD5E1]">
                Avant · {currentCase.title}
              </div>
            ) : (
              <CroppedLayer
                src={currentCase.image}
                alt={`${currentCase.title} — État Avant`}
                crop={currentCase.beforeCrop}
                onError={() =>
                  setFailedImages((prev) => ({ ...prev, [currentCase.id]: true }))
                }
              />
            )}
          </div>

          {/* Subtle Top/Bottom Scrims for Pill Contrast */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 to-transparent pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"
          />

          {/* Top-Left "Avant" Glassmorphism Pill */}
          <span className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-10 px-3.5 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/25 text-white text-xs font-semibold tracking-wide pointer-events-none">
            Avant
          </span>

          {/* Top-Right "Après" Glassmorphism Pill */}
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

        {/* Caption, Duration & Gold CTA */}
        <div className="px-2 sm:px-3 pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0 text-left">
            <h3 className="text-sm sm:text-base font-semibold text-[#F8FAFC]">
              {currentCase.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              {currentCase.subtitle}
            </p>
            <p className="text-xs font-medium text-[#E8CC75]">{currentCase.duration}</p>
          </div>

          <button
            type="button"
            onClick={scrollToBooking}
            data-vertical-cta={selectedProfile}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold bg-[#D4AF37] hover:bg-[#DFBE52] text-[#0B0B0D] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
          >
            <span>Obtenir un résultat similaire</span>
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Prendre RDV</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default BeforeAfterSection;
