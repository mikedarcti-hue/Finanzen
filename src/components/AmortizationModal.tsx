import React, { useState } from 'react';
import { X, Zap, Calendar, DollarSign, TrendingDown } from 'lucide-react';
import { Financing } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface AmortizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  financing?: Financing | null;
  onConfirmAmortization: (
    financingId: string,
    data: {
      amount: number;
      type: 'reducao_prazo' | 'reducao_parcela';
      date: string;
      notes?: string;
    }
  ) => void;
}

export const AmortizationModal: React.FC<AmortizationModalProps> = ({
  isOpen,
  onClose,
  financing,
  onConfirmAmortization,
}) => {
  const [amount, setAmount] = useState<string>('3000');
  const [type, setType] = useState<'reducao_prazo' | 'reducao_parcela'>('reducao_prazo');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  if (!isOpen || !financing) return null;

  const numAmount = parseFloat(amount) || 0;
  // Estimate installments eliminated or reduction
  const estInstallments =
    financing.installmentAmount > 0
      ? Math.max(1, Math.round((numAmount * 1.5) / financing.installmentAmount))
      : 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    onConfirmAmortization(financing.id, {
      amount: numAmount,
      type,
      date,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-cyan-500/30 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Registrar Amortização</h3>
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Abater valor principal de <strong className="text-slate-200">{financing.title}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Valor Extra Amortizado (R$)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="ex: 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-base font-semibold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Modalidade de Amortização
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('reducao_prazo')}
                className={`p-3 rounded-xl border text-left text-xs font-medium transition ${
                  type === 'reducao_prazo'
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-white mb-0.5">Redução de Prazo</div>
                <div className="text-[11px] text-slate-400">Elimina parcelas do final (Economiza mais juros)</div>
              </button>

              <button
                type="button"
                onClick={() => setType('reducao_parcela')}
                className={`p-3 rounded-xl border text-left text-xs font-medium transition ${
                  type === 'reducao_parcela'
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-white mb-0.5">Redução de Parcela</div>
                <div className="text-[11px] text-slate-400">Diminui a prestação mensal (Alivia orçamento)</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Data do Pagamento
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Origem dos Recursos / Nota
            </label>
            <input
              type="text"
              placeholder="ex: Rendimento de bônus, economia do mês"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Quick estimation highlight */}
          {numAmount > 0 && (
            <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl text-xs text-cyan-200">
              ⚡ Impacto estimado: {type === 'reducao_prazo' ? `Aproximadamente ~${estInstallments} parcelas a menos no financiamento` : `Redução imediata na parcela do próximo mês`}!
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 shadow-lg shadow-cyan-950/40 active:scale-95 transition"
            >
              Confirmar Amortização
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
