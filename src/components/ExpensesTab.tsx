import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Edit2,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDateBR, calculateDueInfo } from '../utils/formatters';
import { Expense, ExpenseCategory } from '../types/finance';

interface ExpensesTabProps {
  onOpenNewExpense: () => void;
  onEditExpense: (expense: Expense) => void;
}

type FilterStatus = 'all' | 'pending' | 'dueSoon' | 'overdue' | 'paid';

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  onOpenNewExpense,
  onEditExpense,
}) => {
  const { data, toggleExpenseStatus, deleteExpense } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return data.expenses.filter((exp) => {
      // Search term
      if (
        searchTerm &&
        !exp.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !exp.category.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Category
      if (selectedCategory !== 'all' && exp.category !== selectedCategory) {
        return false;
      }

      // Status & Due conditions
      const dueInfo = calculateDueInfo(exp.dueDate, exp.status === 'PAGO');

      if (statusFilter === 'pending') {
        return exp.status === 'Pendente';
      }
      if (statusFilter === 'paid') {
        return exp.status === 'PAGO';
      }
      if (statusFilter === 'overdue') {
        return dueInfo.status === 'overdue';
      }
      if (statusFilter === 'dueSoon') {
        return dueInfo.status === 'dueSoon' || dueInfo.status === 'today';
      }

      return true;
    }).sort((a, b) => {
      // Unpaid first, then by due date
      if (a.status !== b.status) {
        return a.status === 'Pendente' ? -1 : 1;
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [data.expenses, searchTerm, selectedCategory, statusFilter]);

  // Statistics for badges
  const stats = useMemo(() => {
    let overdue = 0;
    let dueSoon = 0;
    let pendingTotal = 0;
    let paidTotal = 0;

    data.expenses.forEach((e) => {
      const info = calculateDueInfo(e.dueDate, e.status === 'PAGO');
      if (info.status === 'overdue') overdue++;
      if (info.status === 'dueSoon' || info.status === 'today') dueSoon++;
      if (e.status === 'Pendente') pendingTotal += e.amount;
      if (e.status === 'PAGO') paidTotal += e.amount;
    });

    return { overdue, dueSoon, pendingTotal, paidTotal };
  }, [data.expenses]);

  return (
    <div className="space-y-5 pb-24 sm:pb-8">
      {/* Top Banner & Quick Add */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>Gestão de Gastos & Vencimentos</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
              {data.expenses.length} contas
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhe prazos com alertas automáticos para nunca pagar juros ou multas.
          </p>
        </div>

        <button
          onClick={onOpenNewExpense}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-950/40 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Despesa</span>
        </button>
      </div>

      {/* Filter Status Tabs (Mobile Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all border ${
            statusFilter === 'all'
              ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Todas ({data.expenses.length})
        </button>

        <button
          onClick={() => setStatusFilter('overdue')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all border ${
            statusFilter === 'overdue'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-rose-300'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Atrasadas</span>
          {stats.overdue > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {stats.overdue}
            </span>
          )}
        </button>

        <button
          onClick={() => setStatusFilter('dueSoon')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all border ${
            statusFilter === 'dueSoon'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-amber-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Próximas (≤ 3 dias)</span>
          {stats.dueSoon > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
              {stats.dueSoon}
            </span>
          )}
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all border ${
            statusFilter === 'pending'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-blue-300'
          }`}
        >
          Pendentes ({data.expenses.filter((e) => e.status === 'Pendente').length})
        </button>

        <button
          onClick={() => setStatusFilter('paid')}
          className={`flex items-center gap-1 px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all border ${
            statusFilter === 'paid'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-emerald-300'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pagas ({data.expenses.filter((e) => e.status === 'PAGO').length})</span>
        </button>
      </div>

      {/* Search & Category Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
          >
            <option value="all">Todas as categorias</option>
            <option value="Moradia">Moradia</option>
            <option value="Alimentação">Alimentação</option>
            <option value="Transporte">Transporte</option>
            <option value="Saúde">Saúde</option>
            <option value="Lazer">Lazer</option>
            <option value="Assinaturas">Assinaturas</option>
            <option value="Educação">Educação</option>
            <option value="Cartão">Cartão de Crédito</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-slate-900/40 border border-slate-800 p-6">
            <Tag className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Nenhuma despesa encontrada</p>
            <p className="text-xs text-slate-500 mt-1">
              Tente alterar os filtros ou cadastre um novo gasto.
            </p>
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const isPaid = expense.status === 'PAGO';
            const dueInfo = calculateDueInfo(expense.dueDate, isPaid);

            return (
              <div
                key={expense.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border transition-all ${
                  isPaid
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-80'
                    : dueInfo.status === 'overdue'
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-sm'
                    : dueInfo.status === 'dueSoon' || dueInfo.status === 'today'
                    ? 'bg-amber-950/15 border-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Left: Info */}
                <div className="flex items-start gap-3 w-full sm:w-auto">
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => toggleExpenseStatus(expense.id)}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                      isPaid
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'border-slate-600 hover:border-emerald-400 text-transparent hover:text-emerald-400/50'
                    }`}
                    title={isPaid ? 'Desmarcar pagamento' : 'Marcar como PAGO'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm font-bold ${
                          isPaid ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {expense.name}
                      </h4>

                      {/* Due Alert Badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${dueInfo.badgeClass}`}>
                        {dueInfo.label}
                      </span>

                      {/* Type Badge */}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 uppercase font-mono">
                        {expense.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Vence: {formatDateBR(expense.dueDate)}</span>
                      </span>
                      <span>•</span>
                      <span className="text-slate-300 font-medium">{expense.category}</span>
                      {expense.paidDate && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">Pago em {formatDateBR(expense.paidDate)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Value and Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  <div className="text-left sm:text-right">
                    <span
                      className={`text-base font-bold ${
                        isPaid ? 'text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {formatCurrency(expense.amount)}
                    </span>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                      {expense.status}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditExpense(expense)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Editar Despesa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Deseja realmente excluir a despesa "${expense.name}"?`)) {
                          deleteExpense(expense.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Excluir Despesa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
