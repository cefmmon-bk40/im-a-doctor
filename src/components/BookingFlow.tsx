import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  MessageCircle,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  Appointment,
  ClinicConfig,
  ServiceOption,
  VerticalProfile,
  WorkingDay,
} from '../types/clinic';
import {
  TIME_SLOTS,
  buildPatientConfirmationWhatsAppUrl,
  calculateLaserPrice,
  formatPriceDa,
  generateAppointmentReference,
  isSlotBooked,
  isValidAlgerianPhone,
} from '../utils/clinicLogic';
import { ExclusiveNicheWidget } from './ExclusiveNicheWidget';

interface BookingFlowProps {
  config: ClinicConfig;
  profile: VerticalProfile;
  workingDays: WorkingDay[];
  appointments: Appointment[];
  onConfirmAppointment: (appointment: Appointment) => void;
  isReceptionOpen: boolean;
}

type BookingStep = 1 | 2 | 3;

export function BookingFlow({
  config,
  profile,
  workingDays,
  appointments,
  onConfirmAppointment,
  isReceptionOpen,
}: BookingFlowProps) {
  const { theme, services } = profile;

  const [step, setStep] = useState<BookingStep>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0].id);
  const [showPrices, setShowPrices] = useState<boolean>(true);

  // Niche-specific states
  const [isLaserPack6, setIsLaserPack6] = useState<boolean>(false);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState<string>(
    profile.practitioners?.[0]?.id || 'dr-titulaire'
  );
  const [dermaVisitType, setDermaVisitType] = useState<'bilan' | 'suivi'>('bilan');

  // Step 2: Date & Time
  const [selectedDateIso, setSelectedDateIso] = useState<string>(workingDays[0].isoDate);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [slotError, setSlotError] = useState<string>('');

  // Step 3: Patient Form
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [medicalNote, setMedicalNote] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});

  // Ticket State
  const [confirmedTicket, setConfirmedTicket] = useState<Appointment | null>(null);

  const activeService: ServiceOption = useMemo(
    () => services.find((s) => s.id === selectedServiceId) || services[0],
    [services, selectedServiceId]
  );

  const activeDay: WorkingDay = useMemo(
    () => workingDays.find((d) => d.isoDate === selectedDateIso) || workingDays[0],
    [workingDays, selectedDateIso]
  );

  const effectivePriceDa = useMemo(() => {
    if (config.type === 'laser') {
      return calculateLaserPrice(activeService.priceDa, isLaserPack6).totalDa;
    }
    return activeService.priceDa;
  }, [config.type, activeService.priceDa, isLaserPack6]);

  const detailLabel = useMemo(() => {
    if (config.type === 'laser') {
      return isLaserPack6 ? 'Pack 6 Séances (-20%)' : '1 Séance';
    }
    if (config.type === 'dental' && profile.practitioners) {
      const prac = profile.practitioners.find((p) => p.id === selectedPractitionerId);
      return `${prac?.name || 'Dr. Titulaire'}${activeService.isUrgent ? ' · Prioritaire' : ''}`;
    }
    if (config.type === 'derma') {
      return dermaVisitType === 'bilan'
        ? 'Premier bilan dermatologique'
        : 'Suivi traitement en cours';
    }
    return activeService.category || 'Consultation';
  }, [
    config.type,
    isLaserPack6,
    profile.practitioners,
    selectedPractitionerId,
    activeService,
    dermaVisitType,
  ]);

  const handleSelectDate = (isoDate: string) => {
    setSelectedDateIso(isoDate);
    setSlotError('');
    if (selectedTime && isSlotBooked(appointments, config.type, isoDate, selectedTime)) {
      setSelectedTime('');
    }
  };

  const handleGoToStep2 = () => {
    setSlotError('');
    setStep(2);
  };

  const handleGoToStep3 = () => {
    if (!selectedTime) {
      setSlotError('Veuillez sélectionner un créneau horaire disponible.');
      return;
    }
    if (isSlotBooked(appointments, config.type, selectedDateIso, selectedTime)) {
      setSlotError('Ce créneau vient d’être réservé. Merci d’en choisir un autre.');
      setSelectedTime('');
      return;
    }
    setSlotError('');
    setStep(3);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; phone?: string } = {};

    if (patientName.trim().length < 2) {
      errors.name = 'Veuillez saisir votre nom et prénom complets.';
    }
    if (!isValidAlgerianPhone(patientPhone)) {
      errors.phone =
        'Numéro algérien invalide. Format attendu : 05, 06 ou 07 suivi de 8 chiffres (ex. 0550 42 18 90).';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!selectedTime || isSlotBooked(appointments, config.type, selectedDateIso, selectedTime)) {
      setStep(2);
      setSlotError('Ce créneau n’est plus disponible. Veuillez en sélectionner un autre.');
      return;
    }

    const newAppointment: Appointment = {
      id: `rdv-${Date.now()}`,
      reference: generateAppointmentReference(selectedDateIso, appointments.length + 1),
      vertical: config.type,
      dateIso: selectedDateIso,
      dateLabel: activeDay.label,
      time: selectedTime,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      serviceId: activeService.id,
      serviceTitle: activeService.title,
      priceDa: effectivePriceDa,
      detailLabel,
      medicalNote: medicalNote.trim() || undefined,
      status: 'Confirmé',
      createdAt: new Date().toISOString(),
    };

    onConfirmAppointment(newAppointment);
    setConfirmedTicket(newAppointment);
    setSelectedTime('');
    setFormErrors({});
    document.getElementById('rendez-vous')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleResetBooking = () => {
    setConfirmedTicket(null);
    setStep(1);
    setPatientName('');
    setPatientPhone('');
    setMedicalNote('');
    setSelectedTime('');
    setFormErrors({});
    setSlotError('');
  };

  const handleMobilePrimaryAdvance = () => {
    if (step === 1) {
      handleGoToStep2();
    } else if (step === 2) {
      handleGoToStep3();
    } else {
      const formEl = document.getElementById('patient-booking-form') as HTMLFormElement | null;
      formEl?.requestSubmit();
    }
  };

  return (
    <section
      id="rendez-vous"
      className={`py-10 sm:py-14 border-t transition-colors duration-300 ${theme.borderHairline}`}
    >
      <div id="prestations" className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1.5">
            <p className={`text-xs font-semibold tracking-wide ${theme.accentText}`}>
              Prise de rendez-vous en ligne
            </p>
            <h2
              className={`text-2xl sm:text-3xl font-semibold tracking-tight text-balance ${
                theme.usesSerifDisplay ? 'font-display-serif text-3xl sm:text-4xl' : ''
              } ${theme.textPrimary}`}
            >
              Réservez votre créneau en 3 étapes
            </h2>
          </div>

          {!confirmedTicket && (
            <button
              type="button"
              role="switch"
              aria-checked={showPrices}
              onClick={() => setShowPrices((prev) => !prev)}
              className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg border text-xs font-medium self-start sm:self-auto cursor-pointer transition-colors ${theme.bgSurface} ${theme.borderHairline} ${theme.textSecondary}`}
            >
              <span>Afficher les tarifs (DA)</span>
              <span
                className={`w-8 h-4.5 rounded-full p-0.5 transition-colors flex items-center ${
                  showPrices ? theme.accentBg : theme.isDark ? 'bg-[#2A2A35]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                    showPrices ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          )}
        </div>

        {/* Instant Confirmation Ticket */}
        {confirmedTicket ? (
          <div
            data-testid="booking-confirmation-ticket"
            className={`max-w-3xl mx-auto rounded-2xl border p-6 sm:p-8 space-y-6 ${theme.bgSurface} ${theme.borderHairline} shadow-sm`}
          >
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-dashed ${theme.borderHairline}`}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${theme.accentBg} ${theme.accentButtonText}`}
                >
                  <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <p className={`text-xs font-semibold ${theme.accentText}`}>
                    Rendez-vous confirmé
                  </p>
                  <h3 className={`text-xl font-semibold ${theme.textPrimary}`}>
                    Votre passage est réservé
                  </h3>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className={`block text-xs ${theme.textMuted}`}>Référence dossier</span>
                <span
                  className={`text-base font-semibold font-mono-tabular ${theme.textPrimary}`}
                >
                  {confirmedTicket.reference}
                </span>
              </div>
            </div>

            {/* Ticket Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className={`p-4 rounded-xl ${theme.bgSubtle}`}>
                <span className={`block text-xs ${theme.textMuted}`}>Établissement &amp; Lieu</span>
                <span className={`font-semibold block mt-1 ${theme.textPrimary}`}>
                  {config.name}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-xs mt-1 ${theme.textSecondary}`}>
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  {config.city}
                </span>
              </div>

              <div className={`p-4 rounded-xl ${theme.bgSubtle}`}>
                <span className={`block text-xs ${theme.textMuted}`}>Date &amp; Heure</span>
                <span className={`font-semibold block mt-1 tabular-nums ${theme.textPrimary}`}>
                  {confirmedTicket.dateLabel} à {confirmedTicket.time}
                </span>
                <span className={`text-xs mt-1 block ${theme.textSecondary}`}>
                  Patient : {confirmedTicket.patientName} ({confirmedTicket.patientPhone})
                </span>
              </div>

              <div className={`p-4 rounded-xl sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border ${theme.borderHairline}`}>
                <div>
                  <span className={`block text-xs ${theme.textMuted}`}>Prestation sélectionnée</span>
                  <span className={`font-semibold ${theme.textPrimary}`}>
                    {confirmedTicket.serviceTitle}
                  </span>
                  {confirmedTicket.detailLabel && (
                    <span className={`text-xs ml-2 ${theme.textMuted}`}>
                      · {confirmedTicket.detailLabel}
                    </span>
                  )}
                </div>
                {showPrices && (
                  <span className={`text-base font-bold tabular-nums ${theme.textPrimary}`}>
                    {formatPriceDa(confirmedTicket.priceDa)}
                  </span>
                )}
              </div>
            </div>

            {/* Niche-Specific Pre-Session Protocol Card */}
            <div
              className={`p-4 sm:p-5 rounded-xl border ${
                config.type === 'laser'
                  ? 'bg-[#C5A059]/15 border-[#C5A059]/60 text-[#F8FAFC]'
                  : `${theme.accentSoftBg} ${theme.borderHairline} ${theme.textPrimary}`
              }`}
            >
              <div className="flex items-start gap-3">
                <Sparkles
                  className={`w-5 h-5 shrink-0 mt-0.5 ${theme.accentText}`}
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{profile.prepProtocolTitle}</p>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {profile.prepProtocolBody.replace(/^Protocole avant séance\s*:\s*/i, '')}
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <a
                href={buildPatientConfirmationWhatsAppUrl({
                  clinicPhone: config.phone,
                  clinicName: config.name,
                  clinicCity: config.city,
                  appointment: confirmedTicket,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>Ajouter / Confirmer via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleResetBooking}
                className={`inline-flex items-center justify-center px-5 py-3 rounded-lg text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap ${theme.bgSurface} ${theme.borderHairline} ${theme.textPrimary}`}
              >
                Prendre un autre rendez-vous
              </button>
            </div>
          </div>
        ) : (
          /* 3-Step Booking Container */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 min-w-0 space-y-6">
              {/* Step Progress Bar */}
              <nav
                aria-label="Étapes de réservation"
                className={`grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 rounded-xl border ${theme.bgSurface} ${theme.borderHairline}`}
              >
                {[
                  { num: 1 as BookingStep, label: '1. Motif & Soin' },
                  { num: 2 as BookingStep, label: '2. Date & Heure' },
                  { num: 3 as BookingStep, label: '3. Coordonnées' },
                ].map((item) => {
                  const isCurrent = step === item.num;
                  const isCompleted = step > item.num;
                  const canJump = item.num <= step || (item.num === 2 && Boolean(activeService));
                  return (
                    <button
                      key={item.num}
                      type="button"
                      disabled={!canJump}
                      onClick={() => {
                        if (canJump) {
                          setStep(item.num);
                        }
                      }}
                      className={`py-2.5 px-1.5 sm:px-4 rounded-lg text-[11px] sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1 min-w-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        isCurrent
                          ? `${theme.accentBg} ${theme.accentButtonText}`
                          : isCompleted
                          ? `${theme.accentSoftBg} ${theme.accentSoftText}`
                          : `${theme.textMuted} hover:opacity-90`
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* STEP 1: Motif / Prestation */}
              {step === 1 && (
                <div className="space-y-6">
                  <ExclusiveNicheWidget
                    vertical={config.type}
                    profile={profile}
                    selectedServiceId={activeService.id}
                    onSelectService={(svc) => setSelectedServiceId(svc.id)}
                    showPrices={showPrices}
                    isLaserPack6={isLaserPack6}
                    onToggleLaserPack6={setIsLaserPack6}
                    selectedPractitionerId={selectedPractitionerId}
                    onSelectPractitioner={setSelectedPractitionerId}
                    dermaVisitType={dermaVisitType}
                    onChangeDermaVisitType={setDermaVisitType}
                  />

                  <div className="hidden md:flex justify-end">
                    <button
                      type="button"
                      onClick={handleGoToStep2}
                      className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${theme.accentBg} ${theme.accentHoverBg} ${theme.accentButtonText}`}
                    >
                      <span>Choisir la date et l’heure</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Date & Time Slot */}
              {step === 2 && (
                <div
                  className={`p-5 sm:p-6 rounded-2xl border space-y-6 ${theme.bgSurface} ${theme.borderHairline}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-base font-semibold flex items-center gap-2 ${theme.textPrimary}`}>
                        <Calendar className={`w-4 h-4 ${theme.accentText}`} aria-hidden="true" />
                        <span>Sélectionnez un jour (hors vendredi)</span>
                      </h3>
                      <span className={`text-xs ${theme.textMuted}`}>Sam – Jeu</span>
                    </div>

                    {/* Horizontal Working Day Picker */}
                    <div
                      role="radiogroup"
                      aria-label="Jours disponibles"
                      className="flex gap-2.5 overflow-x-auto pb-2"
                    >
                      {workingDays.map((day) => {
                        const isSelected = day.isoDate === selectedDateIso;
                        return (
                          <button
                            key={day.isoDate}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => handleSelectDate(day.isoDate)}
                            className={`shrink-0 min-w-[100px] sm:flex-1 p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? `${theme.accentBg} ${theme.accentButtonText} border-transparent shadow-sm`
                                : `${theme.bgCanvas} ${theme.borderHairline} ${theme.textPrimary} hover:opacity-85`
                            }`}
                          >
                            <span
                              className={`block text-xs font-medium ${
                                isSelected ? 'opacity-80' : theme.textMuted
                              }`}
                            >
                              {day.shortDay}
                            </span>
                            <span className="block text-lg font-bold tabular-nums my-0.5">
                              {day.dayNumber}
                            </span>
                            <span
                              className={`block text-[11px] font-medium whitespace-nowrap ${
                                isSelected ? 'opacity-95' : theme.textSecondary
                              }`}
                            >
                              {day.label === "Aujourd'hui" || day.label === 'Demain'
                                ? day.label
                                : day.monthShort}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-base font-semibold flex items-center gap-2 ${theme.textPrimary}`}>
                        <Clock className={`w-4 h-4 ${theme.accentText}`} aria-hidden="true" />
                        <span>Créneaux disponibles · {activeDay.label}</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {TIME_SLOTS.map((slot) => {
                        const booked = isSlotBooked(
                          appointments,
                          config.type,
                          selectedDateIso,
                          slot
                        );
                        const isSelected = selectedTime === slot && !booked;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={booked}
                            aria-pressed={isSelected}
                            onClick={() => {
                              setSelectedTime(slot);
                              setSlotError('');
                            }}
                            className={`py-3.5 px-4 rounded-xl border text-sm font-semibold tabular-nums transition-all duration-200 flex items-center justify-between gap-2 ${
                              booked
                                ? theme.bookedSlotClass
                                : isSelected
                                ? `${theme.accentBg} ${theme.accentButtonText} border-transparent shadow-sm cursor-pointer`
                                : `${theme.bgCanvas} ${theme.borderHairline} ${theme.textPrimary} hover:opacity-85 cursor-pointer`
                            }`}
                          >
                            <span>{slot}</span>
                            {booked ? (
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-medium ${
                                  theme.isDark ? 'text-[#64748B]' : 'text-slate-500'
                                }`}
                              >
                                <Lock className="w-3 h-3" aria-hidden="true" />
                                Complet
                              </span>
                            ) : (
                              <span
                                className={`text-xs font-medium ${
                                  isSelected ? 'opacity-90' : theme.accentText
                                }`}
                              >
                                {isSelected ? 'Choisi' : 'Libre'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {slotError && (
                      <p
                        role="alert"
                        className={`text-xs font-medium pt-1 ${
                          theme.isDark ? 'text-rose-400' : 'text-rose-700'
                        }`}
                      >
                        {slotError}
                      </p>
                    )}
                  </div>

                  <div className="hidden md:flex items-center justify-between gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold border cursor-pointer ${theme.bgSurface} ${theme.borderHairline} ${theme.textSecondary}`}
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Retour</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGoToStep3}
                      className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${theme.accentBg} ${theme.accentHoverBg} ${theme.accentButtonText}`}
                    >
                      <span>Continuer vers vos coordonnées</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Patient Details */}
              {step === 3 && (
                <form
                  id="patient-booking-form"
                  onSubmit={handleSubmitBooking}
                  noValidate
                  className={`p-5 sm:p-6 rounded-2xl border space-y-5 ${theme.bgSurface} ${theme.borderHairline}`}
                >
                  <div className="space-y-1">
                    <h3 className={`text-lg font-semibold ${theme.textPrimary}`}>
                      Vos coordonnées patient
                    </h3>
                    <p className={`text-xs ${theme.textMuted}`}>
                      Votre numéro sert uniquement à confirmer votre passage et envoyer votre
                      rappel WhatsApp.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="patient-name"
                        className={`block text-xs font-semibold ${theme.textPrimary}`}
                      >
                        Nom &amp; Prénom *
                      </label>
                      <input
                        id="patient-name"
                        type="text"
                        required
                        placeholder="Ex : Amel Benali"
                        value={patientName}
                        onChange={(e) => {
                          setPatientName(e.target.value);
                          if (formErrors.name) {
                            setFormErrors((prev) => ({ ...prev, name: undefined }));
                          }
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-colors ${theme.inputBg} ${
                          formErrors.name ? 'border-rose-500' : theme.borderHairline
                        } ${theme.textPrimary} placeholder:text-[#64748B]`}
                      />
                      {formErrors.name && (
                        <p
                          role="alert"
                          className={`text-xs font-medium ${
                            theme.isDark ? 'text-rose-400' : 'text-rose-700'
                          }`}
                        >
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="patient-phone"
                        className={`block text-xs font-semibold ${theme.textPrimary}`}
                      >
                        Numéro de téléphone (05 / 06 / 07) *
                      </label>
                      <input
                        id="patient-phone"
                        type="tel"
                        required
                        placeholder="Ex : 0550 42 18 90"
                        value={patientPhone}
                        onChange={(e) => {
                          setPatientPhone(e.target.value);
                          if (formErrors.phone) {
                            setFormErrors((prev) => ({ ...prev, phone: undefined }));
                          }
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm tabular-nums outline-none transition-colors ${theme.inputBg} ${
                          formErrors.phone ? 'border-rose-500' : theme.borderHairline
                        } ${theme.textPrimary} placeholder:text-[#64748B]`}
                      />
                      {formErrors.phone && (
                        <p
                          role="alert"
                          className={`text-xs font-medium ${
                            theme.isDark ? 'text-rose-400' : 'text-rose-700'
                          }`}
                        >
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="patient-note"
                      className={`block text-xs font-semibold ${theme.textPrimary}`}
                    >
                      Note médicale optionnelle
                    </label>
                    <textarea
                      id="patient-note"
                      rows={3}
                      placeholder="Précisez une allergie, un traitement en cours ou une demande particulière..."
                      value={medicalNote}
                      onChange={(e) => setMedicalNote(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-colors ${theme.inputBg} ${theme.borderHairline} ${theme.textPrimary} placeholder:text-[#64748B]`}
                    />
                  </div>

                  <div className="hidden md:flex items-center justify-between gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold border cursor-pointer ${theme.bgSurface} ${theme.borderHairline} ${theme.textSecondary}`}
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Modifier l’horaire</span>
                    </button>

                    <button
                      type="submit"
                      className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${theme.accentBg} ${theme.accentHoverBg} ${theme.accentButtonText}`}
                    >
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      <span>Confirmer le rendez-vous</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Desktop Right Summary Sidebar */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24">
              <div
                className={`p-5 sm:p-6 rounded-2xl border space-y-5 ${theme.bgSurface} ${theme.borderHairline}`}
              >
                <div className="space-y-1">
                  <p className={`text-xs font-semibold ${theme.accentText}`}>
                    Récapitulatif du rendez-vous
                  </p>
                  <h3 className={`text-lg font-semibold ${theme.textPrimary}`}>
                    {config.name}
                  </h3>
                  <p className={`text-xs ${theme.textMuted}`}>{config.city}</p>
                </div>

                <div className={`py-4 border-y space-y-3 text-sm ${theme.borderHairline}`}>
                  <div className="flex items-start justify-between gap-3">
                    <span className={theme.textMuted}>Prestation</span>
                    <span className={`font-semibold text-right ${theme.textPrimary}`}>
                      {activeService.title}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className={theme.textMuted}>Détail</span>
                    <span className={`text-xs font-medium text-right ${theme.textSecondary}`}>
                      {detailLabel}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className={theme.textMuted}>Date</span>
                    <span className={`font-medium tabular-nums text-right ${theme.textPrimary}`}>
                      {activeDay.label}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className={theme.textMuted}>Heure</span>
                    <span className={`font-medium tabular-nums text-right ${theme.textPrimary}`}>
                      {selectedTime || 'À sélectionner'}
                    </span>
                  </div>

                  {showPrices && (
                    <div
                      className={`flex items-baseline justify-between gap-3 pt-2 border-t border-dashed ${theme.borderHairline}`}
                    >
                      <span className={`font-medium ${theme.textSecondary}`}>Tarif indicatif</span>
                      <span className={`text-lg font-bold tabular-nums ${theme.textPrimary}`}>
                        {formatPriceDa(effectivePriceDa)}
                      </span>
                    </div>
                  )}
                </div>

                <div className={`text-xs leading-relaxed flex items-start gap-2 ${theme.textMuted}`}>
                  <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${theme.accentText}`} aria-hidden="true" />
                  <span>
                    Aucun prépaiement en ligne requis. Le règlement s’effectue sur place au cabinet.
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Summary Bar (<= 15% mobile viewport height) */}
      {!confirmedTicket && !isReceptionOpen && (
        <div
          className={`md:hidden fixed bottom-0 inset-x-0 z-20 border-t px-4 py-2.5 backdrop-blur-md flex items-center justify-between gap-3 ${theme.headerBg} ${theme.borderHairline}`}
        >
          <div className="min-w-0">
            <div className={`text-xs font-semibold truncate ${theme.textPrimary}`}>
              {activeService.title}
            </div>
            <div className={`text-[11px] tabular-nums truncate ${theme.textMuted}`}>
              {selectedTime ? `${activeDay.label} · ${selectedTime}` : activeDay.label}
              {showPrices ? ` · ${formatPriceDa(effectivePriceDa)}` : ''}
            </div>
          </div>

          <button
            type="button"
            onClick={handleMobilePrimaryAdvance}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${theme.accentBg} ${theme.accentButtonText}`}
          >
            {step === 1 ? 'Date & Heure' : step === 2 ? 'Coordonnées' : 'Confirmer RDV'}
          </button>
        </div>
      )}
    </section>
  );
}
