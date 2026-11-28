import { ShieldCheck, Star } from 'lucide-react';
import { PatientReview } from '../types/clinic';

interface PatientReviewsSectionProps {
  reviews: PatientReview[];
  onStartBooking: () => void;
}

export function PatientReviewsSection({
  reviews,
  onStartBooking,
}: PatientReviewsSectionProps) {
  return (
    <section
      id="avis"
      aria-labelledby="reviews-heading"
      className="bg-[#0B0B0D] text-[#F8FAFC] py-14 sm:py-20 border-t border-white/10"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Header & Trust Strip */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-xs font-semibold tracking-wide text-[#D4AF37]">
              Satisfaction &amp; Confiance
            </span>
            <h2
              id="reviews-heading"
              className="font-display-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-[#F8FAFC] text-balance leading-tight"
            >
              Ce que disent nos patients
            </h2>
            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              Avis Patients &amp; Résultats Cliniques recueillis à l’issue des consultations et protocoles de soins.
            </p>
          </div>

          {/* Google-style rating summary pill */}
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#141418] border border-[#D4AF37]/30 self-start lg:self-auto shrink-0">
            <span
              className="text-sm tracking-tight text-[#D4AF37] shrink-0"
              aria-hidden="true"
            >
              ★★★★★
            </span>
            <span className="text-xs sm:text-sm text-[#CBD5E1] tabular-nums">
              <strong className="font-semibold text-[#F8FAFC] mr-1">4.9/5</strong>
              <span>basé sur +320 avis patients vérifiés</span>
            </span>
          </div>
        </div>

        {/* Dynamic Testimonials Grid (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl bg-[#141418] border border-white/10 p-6 flex flex-col justify-between gap-6 transition-colors duration-200 hover:border-[#D4AF37]/40"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="inline-flex items-center gap-1 text-[#D4AF37]"
                    aria-label="Note de 5 sur 5"
                  >
                    {Array.from({ length: review.rating }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-[#D4AF37] truncate">
                    {review.treatmentTag}
                  </span>
                </div>

                <blockquote className="text-sm leading-relaxed text-[#CBD5E1]">
                  {`«\u00A0${review.quote}\u00A0»`}
                </blockquote>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] text-xs font-semibold flex items-center justify-center shrink-0"
                    aria-hidden="true"
                  >
                    {review.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#F8FAFC] truncate">
                      {review.patientName}
                    </div>
                    <div className="text-xs text-[#94A3B8] truncate">
                      {review.verifiedLabel}
                    </div>
                  </div>
                </div>
                <ShieldCheck
                  className="w-4 h-4 text-[#D4AF37]/80 shrink-0"
                  aria-hidden="true"
                />
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Conversion Strip */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={onStartBooking}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#D4AF37]/45 bg-[#141418] text-sm font-semibold text-[#F8FAFC] hover:bg-[#D4AF37] hover:text-[#0B0B0D] hover:border-[#D4AF37] transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
          >
            <span>Rejoindre nos patients satisfaits → Prendre Rendez-vous</span>
          </button>
        </div>
      </div>
    </section>
  );
}
