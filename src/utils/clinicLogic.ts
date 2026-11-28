import {
  Appointment,
  ClinicConfig,
  VerticalProfile,
  VerticalType,
  WorkingDay,
} from '../types/clinic';

export const TIME_SLOTS = ['09:00', '10:00', '11:30', '14:00', '15:30', '16:30'] as const;

export const VALID_VERTICALS: VerticalType[] = ['laser', 'dental', 'derma', 'doctor'];

const FRENCH_SHORT_DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'] as const;
const FRENCH_SHORT_MONTHS = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Juin',
  'Juil',
  'Août',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
] as const;

export const DEFAULT_CLINIC_CONFIG: ClinicConfig = {
  name: 'Clinique El Yasmine',
  type: 'laser',
  city: 'Hydra, Alger',
  phone: '0550 42 18 90',
  isAgencyDemo: false,
};

export function parseClinicConfigFromSearch(search: string): ClinicConfig {
  const params = new URLSearchParams(search);
  const rawType = (params.get('profile') || params.get('type') || '').trim().toLowerCase();
  const type: VerticalType = VALID_VERTICALS.includes(rawType as VerticalType)
    ? (rawType as VerticalType)
    : DEFAULT_CLINIC_CONFIG.type;

  const rawName = (params.get('clinic') || params.get('name') || '').trim();
  const rawCity = (params.get('city') || '').trim();
  const rawPhone = (params.get('phone') || '').trim();
  const rawDemo = (params.get('demo') || '').trim().toLowerCase();

  return {
    name: rawName || DEFAULT_CLINIC_CONFIG.name,
    type,
    city: rawCity || DEFAULT_CLINIC_CONFIG.city,
    phone: rawPhone || DEFAULT_CLINIC_CONFIG.phone,
    isAgencyDemo: rawDemo === 'agency',
  };
}

export function normalizeAlgerianDigits(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+213')) {
    return '0' + cleaned.slice(4);
  }
  if (cleaned.startsWith('00213')) {
    return '0' + cleaned.slice(5);
  }
  return cleaned;
}

export function isValidAlgerianPhone(phone: string): boolean {
  if (!phone || /[a-zA-Z]/.test(phone)) {
    return false;
  }
  const normalized = normalizeAlgerianDigits(phone);
  return /^0[567]\d{8}$/.test(normalized);
}

export function formatPhoneForWhatsApp(phone: string): string {
  const normalized = normalizeAlgerianDigits(phone);
  if (/^0\d{9}$/.test(normalized)) {
    return '213' + normalized.slice(1);
  }
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.startsWith('213')) {
    return digitsOnly;
  }
  return '213' + digitsOnly;
}

export function formatPriceDa(amount: number): string {
  const rounded = Math.round(amount);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' DA';
}

export interface LaserPriceCalculation {
  totalDa: number;
  originalDa: number;
  savingsDa: number;
  perSessionDa: number;
}

export function calculateLaserPrice(
  unitPriceDa: number,
  isPack6: boolean
): LaserPriceCalculation {
  if (!isPack6) {
    return {
      totalDa: unitPriceDa,
      originalDa: unitPriceDa,
      savingsDa: 0,
      perSessionDa: unitPriceDa,
    };
  }
  const originalDa = unitPriceDa * 6;
  const totalDa = Math.round(originalDa * 0.8);
  return {
    totalDa,
    originalDa,
    savingsDa: originalDa - totalDa,
    perSessionDa: Math.round(totalDa / 6),
  };
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateWorkingDays(
  referenceDate: Date = new Date(),
  totalDays: number = 7
): WorkingDay[] {
  const base = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  const days: WorkingDay[] = [];
  let offset = 0;

  while (days.length < totalDays && offset < 30) {
    const candidate = new Date(base);
    candidate.setDate(base.getDate() + offset);
    const dayOfWeek = candidate.getDay();

    // Clinics in Algeria are closed on Friday (5)
    if (dayOfWeek !== 5) {
      const shortDay = FRENCH_SHORT_DAYS[dayOfWeek];
      const dayNumber = String(candidate.getDate());
      const monthShort = FRENCH_SHORT_MONTHS[candidate.getMonth()];

      let label = `${shortDay} ${dayNumber} ${monthShort}`;
      if (offset === 0) {
        label = "Aujourd'hui";
      } else if (offset === 1) {
        label = 'Demain';
      }

      days.push({
        isoDate: toIsoDate(candidate),
        label,
        shortDay,
        dayNumber,
        monthShort,
      });
    }

    offset += 1;
  }

  return days;
}

export function isSlotBooked(
  appointments: Appointment[],
  vertical: VerticalType,
  dateIso: string,
  time: string
): boolean {
  return appointments.some(
    (appt) =>
      appt.vertical === vertical && appt.dateIso === dateIso && appt.time === time
  );
}

export function generateAppointmentReference(
  dateIso: string,
  sequenceIndex: number
): string {
  const year = dateIso.slice(0, 4) || '2026';
  const dayPart = dateIso.slice(8, 10) || '01';
  const seq = String(100 + sequenceIndex).padStart(3, '0');
  return `#RDV-${year}-${dayPart}${seq}`;
}

export function buildPatientConfirmationWhatsAppUrl(params: {
  clinicPhone: string;
  clinicName: string;
  clinicCity: string;
  appointment: Appointment;
}): string {
  const target = formatPhoneForWhatsApp(params.clinicPhone);
  const lines = [
    `Bonjour ${params.clinicName},`,
    `Je confirme mon rendez-vous ${params.appointment.reference} :`,
    `- Patient : ${params.appointment.patientName}`,
    `- Prestation : ${params.appointment.serviceTitle}${
      params.appointment.detailLabel ? ` (${params.appointment.detailLabel})` : ''
    }`,
    `- Date : ${params.appointment.dateLabel} à ${params.appointment.time}`,
    `- Lieu : ${params.clinicCity}`,
  ];
  return `https://wa.me/${target}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function buildReceptionReminderWhatsAppUrl(params: {
  patientPhone: string;
  patientName: string;
  clinicName: string;
  dateLabel: string;
  time: string;
  serviceTitle: string;
}): string {
  const target = formatPhoneForWhatsApp(params.patientPhone);
  const message =
    `Bonjour ${params.patientName}, ici le secrétariat de ${params.clinicName}. ` +
    `Nous vous rappelons votre rendez-vous pour « ${params.serviceTitle} » prévu le ${params.dateLabel} à ${params.time}. ` +
    `Merci de nous confirmer votre présence par retour de message. À très bientôt !`;
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}

export function buildReceptionGpsWhatsAppUrl(params: {
  patientPhone: string;
  patientName: string;
  clinicName: string;
  clinicCity: string;
  hoursLabel: string;
}): string {
  const target = formatPhoneForWhatsApp(params.patientPhone);
  const mapsQuery = encodeURIComponent(`${params.clinicName}, ${params.clinicCity}, Algérie`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const message =
    `Bonjour ${params.patientName}, voici la localisation exacte de ${params.clinicName} (${params.clinicCity}) :\n` +
    `📍 Itinéraire Google Maps : ${mapsUrl}\n` +
    `🕒 Horaires d'ouverture : ${params.hoursLabel}\n` +
    `Nous restons à votre disposition pour vous guider.`;
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}

const STORAGE_KEY = 'dz_medsaas_appointments_v1';

export function buildSeedAppointmentsForVertical(
  profile: VerticalProfile,
  workingDays: WorkingDay[]
): Appointment[] {
  const today = workingDays[0];
  const tomorrow = workingDays[1] || workingDays[0];

  return profile.seedAppointments.map((seed, index) => {
    const day = index < 3 ? today : tomorrow;
    return {
      ...seed,
      dateIso: day.isoDate,
      dateLabel: day.label,
    };
  });
}

export function loadStoredAppointments(
  profiles: Record<VerticalType, VerticalProfile>,
  workingDays: WorkingDay[]
): Appointment[] {
  const allSeeds = VALID_VERTICALS.flatMap((v) =>
    buildSeedAppointmentsForVertical(profiles[v], workingDays)
  );

  if (typeof window === 'undefined' || !window.localStorage) {
    return allSeeds;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(allSeeds));
      return allSeeds;
    }
    const parsed = JSON.parse(raw) as Appointment[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(allSeeds));
      return allSeeds;
    }
    return parsed;
  } catch {
    return allSeeds;
  }
}

export function saveStoredAppointments(appointments: Appointment[]): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  } catch {
    // Ignore quota errors in restricted preview contexts
  }
}
