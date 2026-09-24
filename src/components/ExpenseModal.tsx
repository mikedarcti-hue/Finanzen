import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, CheckCircle2 } from 'lucide-react';
import { Expense, ExpenseCategory, ExpenseType, ExpenseStatus } from '../types/finance';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'> | Expense) => void;
  initialData?: Expense | null;
}

const CATEGORIES: ExpenseCategory[] = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Lazer',
  'Assinaturas',
  'Educação',
  'Cartão',
  'Outros',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Moradia');
  const [type, setType] = useState<ExpenseType>('fixo');
  const [status, setStatus] = useState<ExpenseStatus>('Pendente');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAmount(String(initialData.amount));
      setDueDate(initialData.dueDate);
      setCategory(initialData.category);
      setType(initialData.type);
      setStatus(initialData.status);
      setNotes(initialData.notes || '');
    } else {
      // Defaults for a new expense
      setName('');
      setAmount('');
      // Default due date: tomorrow or in 5 days
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setDueDate(d.toISOString().split('T')[0]);
      setCategory('Moradia');
      setType('fixo');
      setStatus('Pendente');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount || Number(amount) <= 0 || !dueDate) {
      alert('Por favor preencha nome, valor válido e data de vencimento.');
      return;
    }

    const payload = {
      ...(initialData ? { id: initialData.id } : {}),
      name: name.trim(),
      amount: parseFloat(amount),
      dueDate,
      category,
      type,
      status,
      paidDate: status === 'PAGO' ? new Date().toISOString().split('T')[0] : undefined,
      notes: notes.trim() || undefined,
    };

    onSave(payload as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-4">
          {initialData ? 'Editar Despesa' : 'Cadastrar Nova Despesa'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome da Despesa / Conta *
            </label>
            <input
              type="text"
              placeholder="Ex: Condomínio, Parcela Financiamento, Supermercado..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          {/* Valor & Vencimento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data de Vencimento *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>

          {/* Categoria & Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500/60"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Gasto
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ExpenseType)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500/60"
              >
                <option value="fixo">Fixo (Recorrente)</option>
                <option value="variável">Variável (Esporádico)</option>
              </select>
            </div>
          </div>

          {/* Status Inicial */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Status da Conta
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('Pendente')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  status === 'Pendente'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Pendente (A Pagar)
              </button>
              <button
                type="button"
                onClick={() => setStatus('PAGO')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  status === 'PAGO'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                PAGO
              </button>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observações (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Pagar pelo app do banco X..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all"
            >
              {initialData ? 'Salvar Alterações' : 'Cadastrar Despesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
