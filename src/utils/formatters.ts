/**
 * Utilitários de formatação para moeda brasileira (BRL) e datas
 */

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function formatDateBR(dateString: string): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

export type DueStatus = 'overdue' | 'dueSoon' | 'today' | 'onTrack' | 'paid';

export interface DueInfo {
  status: DueStatus;
  daysDifference: number;
  label: string;
  badgeClass: string;
}

export function calculateDueInfo(dueDateStr: string, isPaid: boolean): DueInfo {
  if (isPaid) {
    return {
      status: 'paid',
      daysDifference: 0,
      label: 'Pago',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    };
  }

  if (!dueDateStr) {
    return {
      status: 'onTrack',
      daysDifference: 0,
      label: 'Sem data',
      badgeClass: 'bg-slate-700/40 text-slate-300 border-slate-700',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = dueDateStr.split('-').map(Number);
  const dueDate = new Date(year, month - 1, day);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      status: 'overdue',
      daysDifference: diffDays,
      label: absDays === 1 ? 'Atrasada (1 dia)' : `Atrasada (${absDays} dias)`,
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse',
    };
  }

  if (diffDays === 0) {
    return {
      status: 'today',
      daysDifference: 0,
      label: 'Vence Hoje!',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold',
    };
  }

  if (diffDays <= 3) {
    return {
      status: 'dueSoon',
      daysDifference: diffDays,
      label: `Vence em ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`,
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    };
  }

  return {
    status: 'onTrack',
    daysDifference: diffDays,
    label: `Vence em ${diffDays} dias`,
    badgeClass: 'bg-slate-700/50 text-slate-300 border-slate-600',
  };
}
