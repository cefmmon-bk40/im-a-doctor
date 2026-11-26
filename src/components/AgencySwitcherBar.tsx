import { Sparkles, Stethoscope, ShieldCheck, Smile } from 'lucide-react';
import { VerticalType } from '../types/clinic';

interface AgencySwitcherBarProps {
  activeType: VerticalType;
  onSelectType: (type: VerticalType) => void;
}

const AGENCY_TABS: Array<{
  id: VerticalType;
  label: string;
  shortLabel: string;
  icon: typeof Sparkles;
}> = [
  { id: 'laser', label: 'Laser & Esthétique', shortLabel: 'Laser', icon: Sparkles },
  { id: 'dental', label: 'Cabinet Dentaire', shortLabel: 'Dentaire', icon: Smile },
  { id: 'derma', label: 'Dermatologie', shortLabel: 'Derma', icon: ShieldCheck },
  { id: 'doctor', label: 'Cabinet Spécialisé', shortLabel: 'Médecin', icon: Stethoscope },
];

export function AgencySwitcherBar({
  activeType,
  onSelectType,
}: AgencySwitcherBarProps) {
  return (
    <aside
      aria-label="Sélecteur de spécialité agence"
      className="bg-[#111827] text-white border-b border-white/10 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-300 shrink-0">
          <span className="font-medium text-white">Mode Démo Agence</span>
          <span aria-hidden="true">·</span>
          <span className="hidden sm:inline">Changement de spécialité en direct</span>
        </div>

        <div
          role="tablist"
          aria-label="Spécialités cliniques"
          className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full md:w-auto min-w-0 py-0.5"
        >
          {AGENCY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectType(tab.id)}
                className={`inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap min-w-0 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#111827] shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden truncate">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
