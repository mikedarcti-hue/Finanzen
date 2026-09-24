import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PieChart,
  Layers,
  Wallet,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDateBR, calculateDueInfo } from '../utils/formatters';
import { ExpenseCategory } from '../types/finance';

const CATEGORY_COLORS: Record<ExpenseCategory, { bg: string; text: string; bar: string }> = {
  Moradia: { bg: 'bg-blue-500/10', text: 'text-blue-400', bar: 'bg-blue-500' },
  Alimentação: { bg: 'bg-amber-500/10', text: 'text-amber-400', bar: 'bg-amber-500' },
  Transporte: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', bar: 'bg-cyan-500' },
  Saúde: { bg: 'bg-rose-500/10', text: 'text-rose-400', bar: 'bg-rose-500' },
  Lazer: { bg: 'bg-purple-500/10', text: 'text-purple-400', bar: 'bg-purple-500' },
  Assinaturas: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', bar: 'bg-indigo-500' },
  Educação: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  Cartão: { bg: 'bg-orange-500/10', text: 'text-orange-400', bar: 'bg-orange-500' },
  Outros: { bg: 'bg-slate-500/10', text: 'text-slate-400', bar: 'bg-slate-500' },
};

interface DashboardTabProps {
  onOpenNewExpense: () => void;
  onOpenNewIncome: () => void;
  onNavigateToTab: (tab: 'expenses' | 'financings' | 'ai' | 'docs') => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  onOpenNewExpense,
  onOpenNewIncome,
  onNavigateToTab,
}) => {
  const {
    data,
    totalIncome,
    totalExpenses,
    totalPaid,
    totalPending,
    monthlyBalance,
    expensesByCategory,
    expensesByType,
    overdueExpensesCount,
    dueSoonExpensesCount,
    toggleExpenseStatus,
    calculateFinancingProgress,
  } = useFinance();

  const [filterIncomeView, setFilterIncomeView] = useState(false);

  // Top pending urgent expenses
  const urgentExpenses = data.expenses
    .filter((e) => e.status !== 'PAGO')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Financial health ratio
  const committedRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const fixedRatio =
    totalExpenses > 0 ? (expensesByType.fixo / totalExpenses) * 100 : 0;
  const variableRatio =
    totalExpenses > 0 ? (expensesByType.variável / totalExpenses) * 100 : 0;

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Alert Header if Overdue or Due Soon */}
      {(overdueExpensesCount > 0 || dueSoonExpensesCount > 0) && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-slate-900 border border-amber-500/30 p-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <span>Atenção aos Vencimentos Deste Mês</span>
                  {overdueExpensesCount > 0 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      {overdueExpensesCount} atrasada(s)
                    </span>
                  )}
                  {dueSoonExpensesCount > 0 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      {dueSoonExpensesCount} vence(m) logo
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Evite multas e juros mantendo a quitação em dia.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('expenses')}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-colors shrink-0"
            >
              <span>Ver pendências</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Saldo Líquido Previsto */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-4 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span>Saldo Líquido Previsto</span>
            <div className={`p-1.5 rounded-lg ${monthlyBalance >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold tracking-tight ${monthlyBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(monthlyBalance)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
            <span>{committedRatio.toFixed(0)}% da renda comprometida</span>
          </div>
        </div>

        {/* Total Receitas */}
        <div className="rounded-2xl bg-slate-900/90 p-4 border border-slate-800/80 shadow-lg relative hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span>Total Receitas</span>
            <button
              onClick={onOpenNewIncome}
              className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
              title="Registrar Nova Renda"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-100">
            {formatCurrency(totalIncome)}
          </div>
          <div className="text-[11px] text-emerald-400/90 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" />
            <span>{data.incomes.length} fonte(s) ativa(s)</span>
          </div>
        </div>

        {/* Total a Pagar no Mês */}
        <div className="rounded-2xl bg-slate-900/90 p-4 border border-slate-800/80 shadow-lg relative hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span>Total a Pagar</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400">
            {formatCurrency(totalPending)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            <span>{data.expenses.filter((e) => e.status === 'Pendente').length} conta(s) pendente(s)</span>
          </div>
        </div>

        {/* Total Pago no Mês */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl bg-slate-900/90 p-4 border border-slate-800/80 shadow-lg relative hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span>Despesas Pagas</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-200">
            {formatCurrency(totalPaid)}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{
                width: `${totalExpenses > 0 ? Math.min(100, (totalPaid / totalExpenses) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Middle Row: Quick Actions & Incomes Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rendas Cadastradas Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fontes de Renda</span>
            </h3>
            <button
              onClick={onOpenNewIncome}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Adicionar</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {data.incomes.map((inc) => (
              <div
                key={inc.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-200">{inc.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="capitalize px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {inc.type}
                    </span>
                    <span>{inc.frequency}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400">{formatCurrency(inc.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proporção Fixo vs Variável */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Estrutura de Gastos</span>
            </h3>
            <span className="text-xs text-slate-400">{formatCurrency(totalExpenses)} total</span>
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Gastos Fixos (Compromissos)</span>
                <span className="text-slate-200 font-bold">{fixedRatio.toFixed(0)}% ({formatCurrency(expensesByType.fixo)})</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all"
                  style={{ width: `${fixedRatio}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Gastos Variáveis (Otimizáveis)</span>
                <span className="text-amber-400 font-bold">{variableRatio.toFixed(0)}% ({formatCurrency(expensesByType.variável)})</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${variableRatio}%` }}
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300">
              💡 <strong>Regra 50-30-20</strong>: Seus gastos fixos estão em {fixedRatio.toFixed(0)}%. O ideal recomendado por especialistas é manter fixos abaixo de 55% da renda líquida.
            </div>
          </div>
        </div>

        {/* Assistente IA Teaser Card */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Copilot Gasto Inteligente IA</span>
            </div>
            <h4 className="text-sm font-semibold text-white mb-1.5">
              Descubra onde cortar gastos e quitar financiamentos antes
            </h4>
            <p className="text-xs text-slate-400">
              Nossa inteligência artificial analisa seus padrões de consumo deste mês, aponta excessos em categorias e simula economia real.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('ai')}
            className="mt-4 flex items-center justify-between w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-semibold text-white shadow-lg shadow-emerald-950/50 transition-all active:scale-[0.98]"
          >
            <span>Analisar Gastos com IA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Grid: Category Distribution & Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gastos por Categoria */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gastos por Categoria</span>
            </h3>
            <span className="text-xs text-slate-500">Mês Atual</span>
          </div>

          <div className="space-y-3">
            {Object.entries(expensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                const cat = category as ExpenseCategory;
                const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS['Outros'];
                const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors.bar}`} />
                        <span className="font-medium text-slate-300">{cat}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{formatCurrency(amount)}</span>
                        <span className="text-[10px] text-slate-500 w-10 text-right">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`${colors.bar} h-full rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Próximos Vencimentos & Atrasadas */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Próximas Contas a Vencer</span>
            </h3>
            <button
              onClick={() => onNavigateToTab('expenses')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {urgentExpenses.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                <span>Nenhuma conta pendente para os próximos dias! Parabéns.</span>
              </div>
            ) : (
              urgentExpenses.map((expense) => {
                const dueInfo = calculateDueInfo(expense.dueDate, expense.status === 'PAGO');

                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-slate-200">{expense.name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${dueInfo.badgeClass}`}>
                          {dueInfo.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Vencimento: {formatDateBR(expense.dueDate)}</span>
                        <span>•</span>
                        <span className="text-slate-500">{expense.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-100">
                        {formatCurrency(expense.amount)}
                      </span>
                      <button
                        onClick={() => toggleExpenseStatus(expense.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors"
                        title="Marcar como Pago"
                      >
                        Pagar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Financiamentos Resumo no Dashboard */}
      {data.financings.length > 0 && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dívidas de Longo Prazo & Financiamentos</span>
            </h3>
            <button
              onClick={() => onNavigateToTab('financings')}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Simular Amortizações</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.financings.map((f) => {
              const prog = calculateFinancingProgress(f);
              return (
                <div
                  key={f.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{f.title}</h4>
                      <p className="text-[11px] text-slate-400">
                        {f.assetType} • Parcela: {formatCurrency(f.installmentAmount)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-cyan-400">{prog.percentagePaid}% quitado</span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${prog.percentagePaid}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Saldo restante: <strong className="text-slate-200">{formatCurrency(prog.remainingBalance)}</strong></span>
                    <span>Restam: <strong className="text-slate-200">{prog.remainingYearsFormatted}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
