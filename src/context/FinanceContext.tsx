import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppFinancialData,
  Expense,
  IncomeSource,
  Financing,
  Amortization,
  AIAnalysisResult,
  ExpenseCategory,
  UserFinancialProfile,
} from '../types/finance';

const STORAGE_KEY = 'finanzen_data_v1';

const INITIAL_FINANCIAL_DATA: AppFinancialData = {
  profile: {
    name: 'Carlos Silva',
    currency: 'BRL',
    monthlyBudgetGoal: 5000,
  },
  incomes: [
    {
      id: 'inc-1',
      name: 'Salário Líquido (CLT)',
      amount: 6800,
      type: 'fixo',
      frequency: 'mensal',
      receivedDate: '2026-09-05',
    },
    {
      id: 'inc-2',
      name: 'Freelancer / Consultoria',
      amount: 1450,
      type: 'variável',
      frequency: 'mensal',
      receivedDate: '2026-09-18',
    },
  ],
  expenses: [
    {
      id: 'exp-1',
      name: 'Condomínio & Manutenção',
      amount: 650,
      dueDate: '2026-09-10',
      category: 'Moradia',
      type: 'fixo',
      status: 'PAGO',
      paidDate: '2026-09-09',
    },
    {
      id: 'exp-2',
      name: 'Internet Fibra 600MB',
      amount: 129.9,
      dueDate: '2026-09-15',
      category: 'Moradia',
      type: 'fixo',
      status: 'PAGO',
      paidDate: '2026-09-14',
    },
    {
      id: 'exp-3',
      name: 'Parcela Financiamento Apto',
      amount: 2450,
      dueDate: '2026-09-24', // Vence amanhã!
      category: 'Moradia',
      type: 'fixo',
      status: 'Pendente',
      recurrent: true,
    },
    {
      id: 'exp-4',
      name: 'Plano de Saúde Familiar',
      amount: 510,
      dueDate: '2026-09-20', // Atrasada!
      category: 'Saúde',
      type: 'fixo',
      status: 'Pendente',
    },
    {
      id: 'exp-5',
      name: 'Academia & Crossfit',
      amount: 140,
      dueDate: '2026-09-25', // Vence em 2 dias!
      category: 'Saúde',
      type: 'fixo',
      status: 'Pendente',
    },
    {
      id: 'exp-6',
      name: 'Supermercado Mensal',
      amount: 1350,
      dueDate: '2026-09-28',
      category: 'Alimentação',
      type: 'variável',
      status: 'Pendente',
    },
    {
      id: 'exp-7',
      name: 'Delivery & Restaurantes (iFood)',
      amount: 720,
      dueDate: '2026-09-29',
      category: 'Alimentação',
      type: 'variável',
      status: 'Pendente',
    },
    {
      id: 'exp-8',
      name: 'Combustível & Estacionamento',
      amount: 380,
      dueDate: '2026-09-30',
      category: 'Transporte',
      type: 'variável',
      status: 'Pendente',
    },
    {
      id: 'exp-9',
      name: 'Assinaturas (Netflix, Spotify, Cloud)',
      amount: 124.9,
      dueDate: '2026-09-12',
      category: 'Assinaturas',
      type: 'fixo',
      status: 'PAGO',
      paidDate: '2026-09-12',
    },
  ],
  financings: [
    {
      id: 'fin-1',
      title: 'Apto Residencial Reserva',
      assetType: 'Imóvel',
      totalAmount: 380000,
      interestRateAnnual: 9.8,
      installmentAmount: 2450,
      totalInstallments: 360,
      paidInstallments: 48,
      startDate: '2022-09',
      amortizations: [
        {
          id: 'am-1',
          date: '2025-12-15',
          amount: 12000,
          type: 'reducao_prazo',
          installmentsEliminated: 18,
          savedInterestEstimate: 28500,
          notes: 'Amortização extraordinária com 13º salário',
        },
      ],
    },
    {
      id: 'fin-2',
      title: 'Jeep Compass Longitude',
      assetType: 'Veículo',
      totalAmount: 85000,
      interestRateAnnual: 15.2,
      installmentAmount: 1480,
      totalInstallments: 48,
      paidInstallments: 26,
      startDate: '2024-07',
      amortizations: [],
    },
  ],
  lastAiAnalysis: null,
};

interface FinanceContextType {
  data: AppFinancialData;
  totalIncome: number;
  totalExpenses: number;
  totalPaid: number;
  totalPending: number;
  monthlyBalance: number;
  expensesByCategory: Record<ExpenseCategory, number>;
  expensesByType: { fixo: number; variável: number };
  overdueExpensesCount: number;
  dueSoonExpensesCount: number;
  isAiLoading: boolean;
  aiError: string | null;
  addIncome: (income: Omit<IncomeSource, 'id'>) => void;
  editIncome: (id: string, income: Partial<IncomeSource>) => void;
  deleteIncome: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  editExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  toggleExpenseStatus: (id: string) => void;
  addFinancing: (financing: Omit<Financing, 'id' | 'amortizations'>) => void;
  editFinancing: (id: string, financing: Partial<Financing>) => void;
  deleteFinancing: (id: string) => void;
  registerAmortization: (
    financingId: string,
    amortization: Omit<Amortization, 'id'>
  ) => void;
  calculateFinancingProgress: (f: Financing) => {
    percentagePaid: number;
    totalPaidAmount: number;
    remainingBalance: number;
    remainingInstallments: number;
    remainingMonths: number;
    remainingYearsFormatted: string;
  };
  simulateAmortization: (
    financingId: string,
    extraAmount: number,
    type: 'reducao_prazo' | 'reducao_parcela'
  ) => {
    installmentsReduced: number;
    newInstallmentAmount: number;
    interestSaved: number;
    monthsRemainingBefore: number;
    monthsRemainingAfter: number;
  };
  runAiAnalysis: (notes?: string) => Promise<void>;
  resetToDefaultData: () => void;
  exportDataAsJSON: () => string;
  importDataFromJSON: (jsonStr: string) => boolean;
  updateProfile: (profile: Partial<UserFinancialProfile>) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<AppFinancialData>(() => {
    if (typeof window === 'undefined') return INITIAL_FINANCIAL_DATA;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load financial data from storage', e);
    }
    return INITIAL_FINANCIAL_DATA;
  });

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist financial data', e);
    }
  }, [data]);

  // Financial calculations
  const totalIncome = data.incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = data.expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = data.expenses
    .filter((e) => e.status === 'PAGO')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = data.expenses
    .filter((e) => e.status === 'Pendente')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const monthlyBalance = totalIncome - totalExpenses;

  // Breakdown by category
  const expensesByCategory = data.expenses.reduce(
    (acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    },
    {} as Record<ExpenseCategory, number>
  );

  // Breakdown by type
  const expensesByType = data.expenses.reduce(
    (acc, curr) => {
      if (curr.type === 'fixo') acc.fixo += curr.amount;
      else acc.variável += curr.amount;
      return acc;
    },
    { fixo: 0, variável: 0 }
  );

  // Count alerts
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let overdueExpensesCount = 0;
  let dueSoonExpensesCount = 0;

  data.expenses.forEach((e) => {
    if (e.status !== 'PAGO' && e.dueDate) {
      const [year, month, day] = e.dueDate.split('-').map(Number);
      const dueDate = new Date(year, month - 1, day);
      dueDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) overdueExpensesCount++;
      else if (diffDays <= 3) dueSoonExpensesCount++;
    }
  });

  // Financing calculator with amortization adjustments
  const calculateFinancingProgress = (f: Financing) => {
    // Total extra amortized
    const extraAmortized = f.amortizations.reduce((acc, a) => acc + a.amount, 0);
    const installmentsEliminatedByAmortization = f.amortizations.reduce(
      (acc, a) => acc + (a.installmentsEliminated || 0),
      0
    );

    const effectivePaidInstallments = f.paidInstallments + installmentsEliminatedByAmortization;
    const remainingInstallments = Math.max(0, f.totalInstallments - effectivePaidInstallments);
    const percentagePaid = Math.min(100, Math.round((effectivePaidInstallments / f.totalInstallments) * 100));

    // Approximate remaining principal
    const paidPrincipalRatio = effectivePaidInstallments / f.totalInstallments;
    const remainingBalance = Math.max(0, (f.totalAmount - extraAmortized) * (1 - paidPrincipalRatio * 0.75));
    const totalPaidAmount = f.paidInstallments * f.installmentAmount + extraAmortized;

    const remainingYears = Math.floor(remainingInstallments / 12);
    const remMonths = remainingInstallments % 12;
    const remainingYearsFormatted =
      remainingYears > 0 ? `${remainingYears}a ${remMonths}m` : `${remMonths} meses`;

    return {
      percentagePaid,
      totalPaidAmount,
      remainingBalance,
      remainingInstallments,
      remainingMonths: remainingInstallments,
      remainingYearsFormatted,
    };
  };

  // Simulate extra amortization (reduction of term vs reduction of monthly payment)
  const simulateAmortization = (
    financingId: string,
    extraAmount: number,
    type: 'reducao_prazo' | 'reducao_parcela'
  ) => {
    const f = data.financings.find((item) => item.id === financingId);
    if (!f || extraAmount <= 0) {
      return {
        installmentsReduced: 0,
        newInstallmentAmount: f?.installmentAmount || 0,
        interestSaved: 0,
        monthsRemainingBefore: 0,
        monthsRemainingAfter: 0,
      };
    }

    const { remainingInstallments, remainingBalance } = calculateFinancingProgress(f);
    const monthlyRate = (f.interestRateAnnual || 10) / 100 / 12;

    if (type === 'reducao_prazo') {
      // In amortizing from the tail (SAC/PRICE): each extra payment clears future installments without future interest!
      // Principal portion per installment is approximately installmentAmount / (1 + interestFactor)
      const approxPrincipalPerInstallment = f.installmentAmount * 0.65;
      const installmentsReduced = Math.min(
        remainingInstallments - 1,
        Math.max(1, Math.round(extraAmount / approxPrincipalPerInstallment))
      );
      // Interest saved = total payments saved minus extra amount paid
      const interestSaved = Math.max(0, installmentsReduced * f.installmentAmount - extraAmount);

      return {
        installmentsReduced,
        newInstallmentAmount: f.installmentAmount,
        interestSaved: Math.round(interestSaved),
        monthsRemainingBefore: remainingInstallments,
        monthsRemainingAfter: Math.max(1, remainingInstallments - installmentsReduced),
      };
    } else {
      // Reduction of installment amount
      const newPrincipal = Math.max(1000, remainingBalance - extraAmount);
      // Recalculate PMT
      const factor = Math.pow(1 + monthlyRate, remainingInstallments);
      const newPMT = (newPrincipal * (monthlyRate * factor)) / (factor - 1);
      const interestSaved = Math.max(0, (f.installmentAmount - newPMT) * remainingInstallments);

      return {
        installmentsReduced: 0,
        newInstallmentAmount: Math.round(newPMT),
        interestSaved: Math.round(interestSaved),
        monthsRemainingBefore: remainingInstallments,
        monthsRemainingAfter: remainingInstallments,
      };
    }
  };

  // Actions
  const addIncome = (income: Omit<IncomeSource, 'id'>) => {
    const newInc: IncomeSource = {
      ...income,
      id: `inc-${Date.now()}`,
    };
    setData((prev) => ({ ...prev, incomes: [newInc, ...prev.incomes] }));
  };

  const editIncome = (id: string, updated: Partial<IncomeSource>) => {
    setData((prev) => ({
      ...prev,
      incomes: prev.incomes.map((inc) => (inc.id === id ? { ...inc, ...updated } : inc)),
    }));
  };

  const deleteIncome = (id: string) => {
    setData((prev) => ({
      ...prev,
      incomes: prev.incomes.filter((inc) => inc.id !== id),
    }));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
    };
    setData((prev) => ({ ...prev, expenses: [newExp, ...prev.expenses] }));
  };

  const editExpense = (id: string, updated: Partial<Expense>) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((exp) => (exp.id === id ? { ...exp, ...updated } : exp)),
    }));
  };

  const deleteExpense = (id: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((exp) => exp.id !== id),
    }));
  };

  const toggleExpenseStatus = (id: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((exp) => {
        if (exp.id === id) {
          const newStatus = exp.status === 'PAGO' ? 'Pendente' : 'PAGO';
          return {
            ...exp,
            status: newStatus,
            paidDate: newStatus === 'PAGO' ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return exp;
      }),
    }));
  };

  const addFinancing = (financing: Omit<Financing, 'id' | 'amortizations'>) => {
    const newFin: Financing = {
      ...financing,
      id: `fin-${Date.now()}`,
      amortizations: [],
    };
    setData((prev) => ({ ...prev, financings: [...prev.financings, newFin] }));
  };

  const editFinancing = (id: string, updated: Partial<Financing>) => {
    setData((prev) => ({
      ...prev,
      financings: prev.financings.map((f) => (f.id === id ? { ...f, ...updated } : f)),
    }));
  };

  const deleteFinancing = (id: string) => {
    setData((prev) => ({
      ...prev,
      financings: prev.financings.filter((f) => f.id !== id),
    }));
  };

  const registerAmortization = (
    financingId: string,
    amortization: Omit<Amortization, 'id'>
  ) => {
    const newAmortization: Amortization = {
      ...amortization,
      id: `am-${Date.now()}`,
    };

    setData((prev) => ({
      ...prev,
      financings: prev.financings.map((f) => {
        if (f.id === financingId) {
          return {
            ...f,
            amortizations: [newAmortization, ...f.amortizations],
          };
        }
        return f;
      }),
    }));
  };

  const updateProfile = (profileUpdate: Partial<UserFinancialProfile>) => {
    setData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profileUpdate },
    }));
  };

  const runAiAnalysis = async (notes: string = '') => {
    setIsAiLoading(true);
    setAiError(null);

    try {
      const financingsPayload = data.financings.map((f) => {
        const prog = calculateFinancingProgress(f);
        return {
          ...f,
          remainingBalance: prog.remainingBalance,
          remainingInstallments: prog.remainingInstallments,
        };
      });

      const response = await fetch('/api/ai/analyze-finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomes: data.incomes,
          expenses: data.expenses,
          financings: financingsPayload,
          totalIncome,
          totalExpenses,
          totalPaid,
          totalPending,
          balance: monthlyBalance,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta do servidor: ${response.statusText}`);
      }

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Falha ao analisar finanças.');
      }

      const aiResult: AIAnalysisResult = {
        ...resData.data,
        generatedAt: new Date().toISOString(),
      };

      setData((prev) => ({
        ...prev,
        lastAiAnalysis: aiResult,
      }));
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setAiError(err.message || 'Não foi possível completar a análise de IA.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetToDefaultData = () => {
    setData(INITIAL_FINANCIAL_DATA);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportDataAsJSON = () => {
    return JSON.stringify(data, null, 2);
  };

  const importDataFromJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.incomes && parsed.expenses && parsed.financings) {
        setData(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to parse imported json', e);
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
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
        isAiLoading,
        aiError,
        addIncome,
        editIncome,
        deleteIncome,
        addExpense,
        editExpense,
        deleteExpense,
        toggleExpenseStatus,
        addFinancing,
        editFinancing,
        deleteFinancing,
        registerAmortization,
        calculateFinancingProgress,
        simulateAmortization,
        runAiAnalysis,
        resetToDefaultData,
        exportDataAsJSON,
        importDataFromJSON,
        updateProfile,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
