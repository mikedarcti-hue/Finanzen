import React, { useState, useEffect } from 'react';
import { X, Building2, Car, GraduationCap, DollarSign, Calendar, Percent } from 'lucide-react';
import { Financing, FinancingAssetType } from '../types/finance';

interface FinancingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (financingData: any) => void;
  editingFinancing?: Financing | null;
}

export const FinancingModal: React.FC<FinancingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingFinancing,
}) => {
  const [title, setTitle] = useState('');
  const [assetType, setAssetType] = useState<FinancingAssetType>('Imóvel');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [interestRateAnnual, setInterestRateAnnual] = useState<string>('9.5');
  const [installmentAmount, setInstallmentAmount] = useState<string>('');
  const [totalInstallments, setTotalInstallments] = useState<string>('360');
  const [paidInstallments, setPaidInstallments] = useState<string>('0');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 7));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingFinancing) {
      setTitle(editingFinancing.title);
      setAssetType(editingFinancing.assetType);
      setTotalAmount(editingFinancing.totalAmount.toString());
      setInterestRateAnnual(editingFinancing.interestRateAnnual.toString());
      setInstallmentAmount(editingFinancing.installmentAmount.toString());
      setTotalInstallments(editingFinancing.totalInstallments.toString());
      setPaidInstallments(editingFinancing.paidInstallments.toString());
      setStartDate(editingFinancing.startDate || new Date().toISOString().slice(0, 7));
      setNotes(editingFinancing.notes || '');
    } else {
      setTitle('');
      setAssetType('Imóvel');
      setTotalAmount('');
      setInterestRateAnnual('9.5');
      setInstallmentAmount('');
      setTotalInstallments('360');
      setPaidInstallments('0');
      setStartDate(new Date().toISOString().slice(0, 7));
      setNotes('');
    }
  }, [editingFinancing, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !totalAmount || !installmentAmount) return;

    onSave({
      title: title.trim(),
      assetType,
      totalAmount: parseFloat(totalAmount) || 0,
      interestRateAnnual: parseFloat(interestRateAnnual) || 0,
      installmentAmount: parseFloat(installmentAmount) || 0,
      totalInstallments: parseInt(totalInstallments, 10) || 1,
      paidInstallments: parseInt(paidInstallments, 10) || 0,
      startDate,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">
          {editingFinancing ? 'Editar Financiamento' : 'Novo Financiamento'}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Cadastre seu financiamento ou dívida de longo prazo para acompanhamento de amortizações.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Título / Bem Financiado
            </label>
            <input
              type="text"
              required
              placeholder="ex: Apartamento Residencial, Carro Honda Civic"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tipo do Bem
              </label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value as FinancingAssetType)}
                className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="Imóvel">🏠 Imóvel</option>
                <option value="Veículo">🚗 Veículo</option>
                <option value="Empréstimo">💳 Empréstimo</option>
                <option value="Educação">🎓 Educação</option>
                <option value="Outro">📦 Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Início (Mês/Ano)
              </label>
              <input
                type="month"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Valor Total Financiado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="ex: 250000"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Taxa Juros Anual (% a.a.)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="ex: 9.8"
                value={interestRateAnnual}
                onChange={(e) => setInterestRateAnnual(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Valor da Parcela (R$)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="ex: 1850"
                value={installmentAmount}
                onChange={(e) => setInstallmentAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Total de Parcelas
              </label>
              <input
                type="number"
                required
                placeholder="ex: 360"
                value={totalInstallments}
                onChange={(e) => setTotalInstallments(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Já Pagas
              </label>
              <input
                type="number"
                placeholder="ex: 24"
                value={paidInstallments}
                onChange={(e) => setPaidInstallments(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Observações (opcional)
            </label>
            <input
              type="text"
              placeholder="ex: Banco Caixa, tabela SAC, seguro incluso"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-950/50 active:scale-95 transition"
            >
              {editingFinancing ? 'Salvar Alterações' : 'Cadastrar Financiamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
