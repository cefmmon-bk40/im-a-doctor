import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Search,
  Users,
  X,
} from 'lucide-react';
import {
  Appointment,
  AppointmentStatus,
  ClinicConfig,
  VerticalProfile,
} from '../types/clinic';
import {
  buildReceptionGpsWhatsAppUrl,
  buildReceptionReminderWhatsAppUrl,
  formatPriceDa,
} from '../utils/clinicLogic';

interface ReceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ClinicConfig;
  profile: VerticalProfile;
  appointments: Appointment[];
  todayIso: string;
  onToggleStatus: (appointmentId: string) => void;
}

export function ReceptionModal({
  isOpen,
  onClose,
  config,
  profile,
  appointments,
  todayIso,
  onToggleStatus,
}: ReceptionModalProps) {
  const { theme } = profile;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const verticalAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.vertical === config.type)
      .sort((a, b) => {
        if (a.dateIso !== b.dateIso) return a.dateIso.localeCompare(b.dateIso);
        return a.time.localeCompare(b.time);
      });
  }, [appointments, config.type]);

  const todayCount = useMemo(
    () => verticalAppointments.filter((a) => a.dateIso === todayIso).length,
    [verticalAppointments, todayIso]
  );

  const confirmedCount = useMemo(
    () => verticalAppointments.filter((a) => a.status === 'Confirmé').length,
    [verticalAppointments]
  );

  const filteredAppointments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return verticalAppointments.filter((appt) => {
      const matchesStatus = statusFilter === 'all' || appt.status === statusFilter;
      const matchesQuery =
        !q ||
        appt.patientName.toLowerCase().includes(q) ||
        appt.patientPhone.toLowerCase().includes(q) ||
        appt.serviceTitle.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [verticalAppointments, searchQuery, statusFilter]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reception-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] bg-white text-slate-900 sm:rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden"
      >
        {/* Top Drawer Bar */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500">
              Espace Réception &amp; Secrétariat · {config.name}
            </p>
            <h2
              id="reception-modal-title"
              className="text-lg sm:text-xl font-semibold text-slate-900 truncate"
            >
              Agenda &amp; Relances WhatsApp en 1 clic
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer l'espace réception"
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Live KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>RDV Aujourd’hui</span>
                <Users className="w-4 h-4 text-slate-400" aria-hidden="true" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {todayCount}
                </span>
                <span className="text-xs text-slate-500 tabular-nums">
                  sur {verticalAppointments.length} planifiés
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Taux de Confirmation</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">94%</span>
                <span className="text-xs text-emerald-700 font-medium tabular-nums">
                  {confirmedCount}/{verticalAppointments.length} confirmés
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>No-Shows Évités ce mois</span>
                <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {14 + verticalAppointments.length}
                </span>
                <span className="text-xs text-slate-500">via rappels WhatsApp</span>
              </div>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="search"
                aria-label="Rechercher un patient"
                placeholder="Rechercher patient, téléphone ou soin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
              />
            </div>

            <div
              role="group"
              aria-label="Filtrer par statut"
              className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200 self-start sm:self-auto"
            >
              {(['all', 'Confirmé', 'En attente'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status === 'all' ? 'Tous' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Structured Patient Agenda Table */}
          {filteredAppointments.length === 0 ? (
            <div className="py-12 px-4 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
              <p className="text-sm font-semibold text-slate-800">
                Aucun rendez-vous ne correspond à votre recherche
              </p>
              <p className="text-xs text-slate-500">
                Réinitialisez le filtre ou saisissez un autre nom de patient.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                      <th className="py-3 px-4 whitespace-nowrap">Heure</th>
                      <th className="py-3 px-4 whitespace-nowrap">Patient &amp; Téléphone</th>
                      <th className="py-3 px-4 whitespace-nowrap">Motif / Soin</th>
                      <th className="py-3 px-4 whitespace-nowrap">Statut</th>
                      <th className="py-3 px-4 text-right whitespace-nowrap">Actions Rapides</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {filteredAppointments.map((appt) => {
                      const reminderHref = buildReceptionReminderWhatsAppUrl({
                        patientPhone: appt.patientPhone,
                        patientName: appt.patientName,
                        clinicName: config.name,
                        dateLabel: appt.dateLabel,
                        time: appt.time,
                        serviceTitle: appt.serviceTitle,
                      });
                      const gpsHref = buildReceptionGpsWhatsAppUrl({
                        patientPhone: appt.patientPhone,
                        patientName: appt.patientName,
                        clinicName: config.name,
                        clinicCity: config.city,
                        hoursLabel: theme.hoursLabel,
                      });

                      return (
                        <tr
                          key={appt.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                            <div className="font-semibold text-slate-900 tabular-nums">
                              {appt.time}
                            </div>
                            <div className="text-xs text-slate-500">{appt.dateLabel}</div>
                          </td>

                          <td className="py-3.5 px-4 align-middle">
                            <div className="font-semibold text-slate-900">
                              {appt.patientName}
                            </div>
                            <div className="text-xs text-slate-500 tabular-nums">
                              {appt.patientPhone}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 align-middle">
                            <div className="font-medium text-slate-800">{appt.serviceTitle}</div>
                            <div className="text-xs text-slate-500 tabular-nums">
                              {appt.detailLabel ? `${appt.detailLabel} · ` : ''}
                              {formatPriceDa(appt.priceDa)}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onToggleStatus(appt.id)}
                              title="Cliquer pour basculer le statut"
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer transition-colors ${
                                appt.status === 'Confirmé'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              }`}
                            >
                              {appt.status}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <a
                                href={reminderHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Rappel RDV WhatsApp pour ${appt.patientName}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Rappel RDV</span>
                              </a>

                              <a
                                href={gpsHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Envoyer GPS WhatsApp pour ${appt.patientName}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] transition-colors"
                              >
                                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Envoyer GPS</span>
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
