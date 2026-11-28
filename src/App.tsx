import { useEffect, useMemo, useState } from 'react';
import { VERTICAL_PROFILES } from './data/verticals';
import { Appointment, ClinicConfig, VerticalType } from './types/clinic';
import {
  generateWorkingDays,
  loadStoredAppointments,
  parseClinicConfigFromSearch,
  saveStoredAppointments,
} from './utils/clinicLogic';
import { AgencySwitcherBar } from './components/AgencySwitcherBar';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { BookingFlow } from './components/BookingFlow';
import { MedicalCommitmentsSection } from './components/MedicalCommitmentsSection';
import { PatientReviewsSection } from './components/PatientReviewsSection';
import { FaqSection } from './components/FaqSection';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { ReceptionModal } from './components/ReceptionModal';

export default function App() {
  const [config, setConfig] = useState<ClinicConfig>(() =>
    parseClinicConfigFromSearch(
      typeof window !== 'undefined' ? window.location.search : ''
    )
  );

  const workingDays = useMemo(() => generateWorkingDays(new Date(), 7), []);

  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadStoredAppointments(VERTICAL_PROFILES, workingDays)
  );

  const [isReceptionOpen, setIsReceptionOpen] = useState(false);

  const profile = VERTICAL_PROFILES[config.type];
  const { theme } = profile;

  // Keep document title in sync with active clinic name
  useEffect(() => {
    document.title = `${config.name} — ${theme.specialtyTitle}`;
  }, [config.name, theme.specialtyTitle]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      setConfig(parseClinicConfigFromSearch(window.location.search));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectAgencyType = (nextType: VerticalType) => {
    setConfig((prev) => ({ ...prev, type: nextType }));
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('profile')) {
        params.set('profile', nextType);
      }
      if (params.has('type') || !params.has('profile')) {
        params.set('type', nextType);
      }
      const nextUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', nextUrl);
    }
  };

  const handleConfirmAppointment = (newAppointment: Appointment) => {
    setAppointments((prev) => {
      const updated = [...prev, newAppointment];
      saveStoredAppointments(updated);
      return updated;
    });
  };

  const handleToggleAppointmentStatus = (appointmentId: string) => {
    setAppointments((prev) => {
      const updated = prev.map((appt) =>
        appt.id === appointmentId
          ? {
              ...appt,
              status:
                appt.status === 'Confirmé'
                  ? ('En attente' as const)
                  : ('Confirmé' as const),
            }
          : appt
      );
      saveStoredAppointments(updated);
      return updated;
    });
  };

  const scrollToBooking = () => {
    const el = document.getElementById('rendez-vous');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      data-vertical={config.type}
      className={`min-h-screen flex flex-col overflow-x-clip transition-colors duration-300 ${theme.bgCanvas} ${theme.textPrimary}`}
    >
      {config.isAgencyDemo && (
        <AgencySwitcherBar
          activeType={config.type}
          onSelectType={handleSelectAgencyType}
        />
      )}

      <Header
        config={config}
        theme={theme}
        onOpenReception={() => setIsReceptionOpen(true)}
      />

      <main className="flex-1">
        <HeroSection
          config={config}
          profile={profile}
          onStartBooking={scrollToBooking}
        />

        {/* Key by config.type so switching vertical in Agency mode cleanly initializes Step 1 */}
        <BookingFlow
          key={config.type}
          config={config}
          profile={profile}
          workingDays={workingDays}
          appointments={appointments}
          onConfirmAppointment={handleConfirmAppointment}
          isReceptionOpen={isReceptionOpen}
        />

        <MedicalCommitmentsSection
          theme={theme}
          pillars={profile.trustPillars}
        />

        <PatientReviewsSection
          key={`reviews-${config.type}`}
          reviews={profile.reviews}
          onStartBooking={scrollToBooking}
        />

        <FaqSection
          key={`faq-${config.type}`}
          theme={theme}
          faqs={profile.faqs}
          prepProtocolTitle={profile.prepProtocolTitle}
          prepChecklist={profile.prepChecklist}
        />

        <LocationSection config={config} />
      </main>

      <Footer config={config} theme={theme} />

      <ReceptionModal
        isOpen={isReceptionOpen}
        onClose={() => setIsReceptionOpen(false)}
        config={config}
        profile={profile}
        appointments={appointments}
        todayIso={workingDays[0].isoDate}
        onToggleStatus={handleToggleAppointmentStatus}
      />
    </div>
  );
}
