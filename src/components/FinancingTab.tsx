import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Calculator,
  TrendingDown,
  Clock,
  Calendar,
  DollarSign,
  ChevronRight,
  Sparkles,
  Zap,
  Trash2,
  Edit2,
  CheckCircle2,
  History,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { Financing, Amortization } from '../types/finance';

interface FinancingTabProps {
  onOpenNewFinancing: () => void;
  onEditFinancing: (financing: Financing) => void;
  onOpenAmortizationModal: (financingId: string) => void;
}

export const FinancingTab: React.FC<FinancingTabProps> = ({
  onOpenNewFinancing,
  onEditFinancing,
  onOpenAmortizationModal,
}) => {
  const {
    data,
    deleteFinancing,
    calculateFinancingProgress,
    simulateAmortization,
  } = useFinance();

  // Selected financing for interactive simulation
  const [selectedFinancingId, setSelectedFinancingId] = useState<string>(
    data.financings[0]?.id || ''
  );
  const [simExtraAmount, setSimExtraAmount] = useState<number>(1000);
  const [simType, setSimType] = useState<'reducao_prazo' | 'reducao_parcela'>('reducao_prazo');

  const selectedFinancing = data.financings.find((f) => f.id === selectedFinancingId);

  const simulationResult = selectedFinancing
    ? simulateAmortization(selectedFinancing.id, simExtraAmount, simType)
    : null;

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Header & New Financing Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>Financiamentos & Dívidas de Longo Prazo</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-medium border border-cyan-500/20">
              {data.financings.length} ativo(s)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitore saldo devedor, parcelas quitadas e simule amortizações antecipadas para economizar juros.
          </p>
        </div>

        <button
          onClick={onOpenNewFinancing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-cyan-950/40 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Financiamento</span>
        </button>
      </div>

      {/* Financings Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.financings.map((financing) => {
          const prog = calculateFinancingProgress(financing);
          const isSelected = selectedFinancingId === financing.id;

          return (
            <div
              key={financing.id}
              className={`rounded-2xl border p-5 transition-all relative ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/50 shadow-xl shadow-cyan-950/20'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Row: Title, Asset Type, Actions */}
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 font-medium">
                      {financing.assetType}
                    </span>
                    <span className="text-xs text-slate-500">
                      Taxa: {financing.interestRateAnnual}% a.a.
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{financing.title}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditFinancing(financing)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Editar Financiamento"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Deseja remover o financiamento "${financing.title}"?`)) {
                        deleteFinancing(financing.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Excluir Financiamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar & Percentage */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Progresso de Quitação</span>
                  <span className="text-sm font-bold text-cyan-400">{prog.percentagePaid}%</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${prog.percentagePaid}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {financing.paidInstallments} de {financing.totalInstallments} parcelas pagas
                  </span>
                  <span>Restam {prog.remainingInstallments} parcelas</span>
                </div>
              </div>

              {/* Key Figures: Pago vs Saldo Devedor vs Tempo Restante */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center mb-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Já Pago</p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5">
                    {formatCurrency(prog.totalPaidAmount)}
                  </p>
                </div>
                <div className="border-x border-slate-800/80 px-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Saldo Devedor</p>
                  <p className="text-xs sm:text-sm font-bold text-rose-400 mt-0.5">
                    {formatCurrency(prog.remainingBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Tempo Restante</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-200 mt-0.5">
                    {prog.remainingYearsFormatted}
                  </p>
                </div>
              </div>

              {/* Installment details and Amortization button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-400">
                  <span>Parcela mensal: </span>
                  <strong className="text-slate-100 text-sm">
                    {formatCurrency(financing.installmentAmount)}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedFinancingId(financing.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    Selecionar p/ Simular
                  </button>

                  <button
                    onClick={() => onOpenAmortizationModal(financing.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Amortizar</span>
                  </button>
                </div>
              </div>

              {/* History of Amortizations (if any) */}
              {financing.amortizations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <History className="w-3 h-3 text-cyan-400" />
                    <span>Amortizações Extraordinárias Feitas ({financing.amortizations.length})</span>
                  </p>
                  <div className="space-y-1.5">
                    {financing.amortizations.map((am) => (
                      <div
                        key={am.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 text-xs text-slate-300"
                      >
                        <div>
                          <span className="font-semibold text-emerald-400">{formatCurrency(am.amount)}</span>
                          <span className="text-[10px] text-slate-500 ml-2">({formatDateBR(am.date)})</span>
                          {am.notes && <p className="text-[10px] text-slate-400 mt-0.5">{am.notes}</p>}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {am.installmentsEliminated ? `-${am.installmentsEliminated} parcelas` : 'Reduziu valor'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Amortization Simulator Section */}
      {selectedFinancing && simulationResult && (
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 p-5 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Simulador de Amortização Antecipada</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                    {selectedFinancing.title}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Veja na prática o impacto de injetar sobras financeiras diretamente no saldo devedor.
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenAmortizationModal(selectedFinancing.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all shrink-0"
            >
              <span>Efetivar Amortização</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Simulator Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Input Extra Value */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Valor do Aporte Extra (Amortização):</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {formatCurrency(simExtraAmount)}
                </span>
              </label>

              <input
                type="range"
                min="200"
                max="30000"
                step="200"
                value={simExtraAmount}
                onChange={(e) => setSimExtraAmount(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="flex items-center gap-2 pt-1">
                {[500, 1000, 2500, 5000, 10000].map((quickVal) => (
                  <button
                    key={quickVal}
                    onClick={() => setSimExtraAmount(quickVal)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      simExtraAmount === quickVal
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    R$ {quickVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Amortization Strategy (Prazo vs Parcela) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Modalidade de Amortização:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSimType('reducao_prazo')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    simType === 'reducao_prazo'
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-white shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Redução de Prazo</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Elimina parcelas do final do contrato (máxima economia de juros).
                  </p>
                </button>

                <button
                  onClick={() => setSimType('reducao_parcela')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    simType === 'reducao_parcela'
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-white shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Redução de Parcela</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Alivia o fluxo mensal reduzindo o valor das próximas parcelas.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/80 border border-cyan-500/20">
            {simType === 'reducao_prazo' ? (
              <>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Parcelas Eliminadas</p>
                  <p className="text-xl font-bold text-cyan-400 mt-1">
                    -{simulationResult.installmentsReduced} parcelas
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    De {simulationResult.monthsRemainingBefore} para {simulationResult.monthsRemainingAfter} meses
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Economia de Juros Futuros</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">
                    ~{formatCurrency(simulationResult.interestSaved)}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Dinheiro que deixa de ir para o banco</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Antecipação do Término</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {Math.floor(simulationResult.installmentsReduced / 12)}a {simulationResult.installmentsReduced % 12}m
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Quitado meses antes do prazo</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Nova Parcela Mensal</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">
                    {formatCurrency(simulationResult.newInstallmentAmount)}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Redução de {formatCurrency(selectedFinancing.installmentAmount - simulationResult.newInstallmentAmount)}/mês
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Economia Total Acumulada</p>
                  <p className="text-xl font-bold text-cyan-400 mt-1">
                    ~{formatCurrency(simulationResult.interestSaved)}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Ao longo de todo o contrato</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Alívio no Orçamento</p>
                  <p className="text-xl font-bold text-white mt-1">
                    +{formatCurrency(selectedFinancing.installmentAmount - simulationResult.newInstallmentAmount)}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Livre a cada 30 dias</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
