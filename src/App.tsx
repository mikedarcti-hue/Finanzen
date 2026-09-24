/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Landmark,
  Sparkles,
  BookOpen,
  Plus,
  TrendingUp,
  AlertTriangle,
  Bell,
  Wallet,
  ShieldCheck,
} from 'lucide-react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { DashboardTab } from './components/DashboardTab';
import { ExpensesTab } from './components/ExpensesTab';
import { FinancingTab } from './components/FinancingTab';
import { AiAssistantTab } from './components/AiAssistantTab';
import { DevDocsTab } from './components/DevDocsTab';
import { ExpenseModal } from './components/ExpenseModal';
import { IncomeModal } from './components/IncomeModal';
import { FinancingModal } from './components/FinancingModal';
import { AmortizationModal } from './components/AmortizationModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Expense, IncomeSource, Financing } from './types/finance';

type TabType = 'dashboard' | 'expenses' | 'financings' | 'ai' | 'docs';

function MainAppContent() {
  const {
    data,
    addExpense,
    editExpense,
    addIncome,
    editIncome,
    addFinancing,
    editFinancing,
    registerAmortization,
    overdueExpensesCount,
    dueSoonExpensesCount,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeSource | null>(null);

  const [isFinancingModalOpen, setIsFinancingModalOpen] = useState(false);
  const [editingFinancing, setEditingFinancing] = useState<Financing | null>(null);

  const [isAmortizationModalOpen, setIsAmortizationModalOpen] = useState(false);
  const [amortizingFinancingId, setAmortizingFinancingId] = useState<string | null>(null);

  // Expense modal handlers
  const handleOpenNewExpense = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (expenseData: any) => {
    if (editingExpense) {
      editExpense(editingExpense.id, expenseData);
    } else {
      addExpense(expenseData);
    }
  };

  // Income modal handlers
  const handleOpenNewIncome = () => {
    setEditingIncome(null);
    setIsIncomeModalOpen(true);
  };

  const handleSaveIncome = (incomeData: any) => {
    if (editingIncome) {
      editIncome(editingIncome.id, incomeData);
    } else {
      addIncome(incomeData);
    }
  };

  // Financing modal handlers
  const handleOpenNewFinancing = () => {
    setEditingFinancing(null);
    setIsFinancingModalOpen(true);
  };

  const handleEditFinancing = (financing: Financing) => {
    setEditingFinancing(financing);
    setIsFinancingModalOpen(true);
  };

  const handleSaveFinancing = (financingData: any) => {
    if (editingFinancing) {
      editFinancing(editingFinancing.id, financingData);
    } else {
      addFinancing(financingData);
    }
  };

  // Amortization handler
  const handleOpenAmortizationModal = (financingId: string) => {
    setAmortizingFinancingId(financingId);
    setIsAmortizationModalOpen(true);
  };

  const selectedAmortizingFinancing = data.financings.find(
    (f) => f.id === amortizingFinancingId
  ) || data.financings[0];

  const totalUrgentAlerts = overdueExpensesCount + dueSoonExpensesCount;

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[1px] shadow-lg shadow-emerald-950/50 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  FinanZen
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Gestão Financeira & IA
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-1 rounded-2xl shadow-inner">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Painel</span>
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold relative transition ${
                activeTab === 'expenses'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Despesas & Avisos</span>
              {totalUrgentAlerts > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('financings')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'financings'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>Financiamentos</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-teal-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>IA Economia</span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'docs'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Arquitetura & Guia</span>
            </button>
          </nav>

          {/* Action CTAs & PWA Install Button */}
          <div className="flex items-center gap-2">
            <PWAInstallButton variant="compact" />

            <button
              onClick={handleOpenNewExpense}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-950/40 active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Despesa</span>
            </button>

            <button
              onClick={handleOpenNewIncome}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-950/40 active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Renda</span>
            </button>
          </div>
        </div>
      </header>

      {/* Urgent Due Dates Banner if overdue/due soon */}
      {totalUrgentAlerts > 0 && activeTab !== 'expenses' && (
        <div className="bg-gradient-to-r from-amber-950/40 via-rose-950/30 to-amber-950/40 border-b border-amber-500/20 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
              <span>
                <strong>Atenção com prazos:</strong>{' '}
                {overdueExpensesCount > 0 && (
                  <span className="text-rose-400 font-semibold mr-1">
                    {overdueExpensesCount} conta{overdueExpensesCount > 1 ? 's' : ''} em atraso!
                  </span>
                )}
                {dueSoonExpensesCount > 0 && (
                  <span className="text-amber-300">
                    {dueSoonExpensesCount} conta{dueSoonExpensesCount > 1 ? 's' : ''} vencendo nos próximos 3 dias.
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('expenses')}
              className="underline text-amber-200 hover:text-white font-medium ml-2 shrink-0"
            >
              Ver contas
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardTab
            onOpenNewExpense={handleOpenNewExpense}
            onOpenNewIncome={handleOpenNewIncome}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesTab
            onOpenNewExpense={handleOpenNewExpense}
            onEditExpense={handleEditExpense}
          />
        )}

        {activeTab === 'financings' && (
          <FinancingTab
            onOpenNewFinancing={handleOpenNewFinancing}
            onEditFinancing={handleEditFinancing}
            onOpenAmortizationModal={handleOpenAmortizationModal}
          />
        )}

        {activeTab === 'ai' && (
          <AiAssistantTab onNavigateToTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'docs' && <DevDocsTab />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090D16]/95 backdrop-blur-lg border-t border-slate-800/90 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="grid grid-cols-5 px-1 py-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'dashboard'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Painel</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl relative transition ${
              activeTab === 'expenses'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Receipt className="w-5 h-5 mb-0.5" />
              {totalUrgentAlerts > 0 && (
                <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-rose-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {totalUrgentAlerts}
                </span>
              )}
            </div>
            <span className="text-[10px]">Despesas</span>
          </button>

          <button
            onClick={() => setActiveTab('financings')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'financings'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Landmark className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Dívidas</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'ai'
                ? 'text-teal-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 mb-0.5 text-teal-400" />
            </div>
            <span className="text-[10px]">IA Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'docs'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Guia/PWA</span>
          </button>
        </div>
      </nav>

      {/* Global Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        initialData={editingExpense}
      />

      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onSave={handleSaveIncome}
        initialData={editingIncome}
      />

      <FinancingModal
        isOpen={isFinancingModalOpen}
        onClose={() => setIsFinancingModalOpen(false)}
        onSave={handleSaveFinancing}
        editingFinancing={editingFinancing}
      />

      <AmortizationModal
        isOpen={isAmortizationModalOpen}
        onClose={() => setIsAmortizationModalOpen(false)}
        financing={selectedAmortizingFinancing}
        onConfirmAmortization={(financingId, amortData) => {
          registerAmortization(financingId, amortData);
        }}
      />

      {/* Offline Toast Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <MainAppContent />
    </FinanceProvider>
  );
}
