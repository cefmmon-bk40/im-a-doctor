export type VerticalType = 'laser' | 'dental' | 'derma' | 'doctor';

export type AppointmentStatus = 'Confirmé' | 'En attente';

export interface ClinicConfig {
  name: string;
  type: VerticalType;
  city: string;
  phone: string;
  isAgencyDemo: boolean;
}

export interface ServiceOption {
  id: string;
  title: string;
  subtitle: string;
  durationMin: number;
  priceDa: number;
  imageUrl: string;
  category?: string;
  isUrgent?: boolean;
  prepNote?: string;
}

export interface TrustPillar {
  id: string;
  badge: string;
  title: string;
  description: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface WorkingDay {
  isoDate: string; // YYYY-MM-DD
  label: string; // "Aujourd'hui", "Demain", or "Sam 28 Nov"
  shortDay: string; // "Mer", "Jeu", "Sam"
  dayNumber: string; // "25"
  monthShort: string; // "Nov"
}

export interface Appointment {
  id: string;
  reference: string;
  vertical: VerticalType;
  dateIso: string;
  dateLabel: string;
  time: string;
  patientName: string;
  patientPhone: string;
  serviceId: string;
  serviceTitle: string;
  priceDa: number;
  detailLabel?: string;
  medicalNote?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface VerticalTheme {
  id: VerticalType;
  shortLabel: string;
  specialtyTitle: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  hoursLabel: string;
  isDark: boolean;
  bgCanvas: string;
  bgSurface: string;
  bgSubtle: string;
  inputBg: string;
  bookedSlotClass: string;
  imagePlaceholderBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentBg: string;
  accentHoverBg: string;
  accentButtonText: string;
  accentText: string;
  accentBorder: string;
  accentSoftBg: string;
  accentSoftText: string;
  borderHairline: string;
  headerBg: string;
  usesSerifDisplay: boolean;
  accentHex: string;
  darkSurfaceHex: string;
  canvasHex: string;
}

export interface VerticalProfile {
  theme: VerticalTheme;
  heroImageUrl: string;
  heroImageAlt: string;
  services: ServiceOption[];
  trustPillars: TrustPillar[];
  faqs: FaqItem[];
  prepProtocolTitle: string;
  prepProtocolBody: string;
  prepChecklist: string[];
  trustHighlights: Array<{
    metric: string;
    label: string;
  }>;
  practitioners?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  seedAppointments: Omit<Appointment, 'dateIso' | 'dateLabel'>[];
}
