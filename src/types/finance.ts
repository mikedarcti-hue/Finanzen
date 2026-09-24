/**
 * Modelagem de Dados Completa - FinanZen
 * TypeScript Interfaces para Transações, Financiamentos e Perfil
 */

export type ExpenseCategory =
  | 'Moradia'
  | 'Alimentação'
  | 'Transporte'
  | 'Saúde'
  | 'Lazer'
  | 'Assinaturas'
  | 'Educação'
  | 'Cartão'
  | 'Outros';

export type ExpenseType = 'fixo' | 'variável';
export type ExpenseStatus = 'Pendente' | 'PAGO';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // Formato YYYY-MM-DD
  category: ExpenseCategory;
  type: ExpenseType;
  status: ExpenseStatus;
  paidDate?: string;
  notes?: string;
  recurrent?: boolean;
}

export type IncomeType = 'fixo' | 'variável';
export type IncomeFrequency = 'mensal' | 'quinzenal' | 'semanal' | 'esporádico';

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  type: IncomeType;
  frequency: IncomeFrequency;
  receivedDate?: string;
  notes?: string;
}

export interface Amortization {
  id: string;
  date: string;
  amount: number;
  type: 'reducao_prazo' | 'reducao_parcela';
  installmentsEliminated?: number;
  savedInterestEstimate?: number;
  notes?: string;
}

export type FinancingAssetType = 'Imóvel' | 'Veículo' | 'Empréstimo' | 'Educação' | 'Outro';

export interface Financing {
  id: string;
  title: string; // Ex: "Financiamento Imobiliário - Apto 302", "Carro Corolla"
  assetType: FinancingAssetType;
  totalAmount: number; // Valor financiado original
  interestRateAnnual: number; // Taxa de juros anual % (ex: 10.5)
  installmentAmount: number; // Valor da parcela atual
  totalInstallments: number; // Qtd total de parcelas (ex: 360, 48)
  paidInstallments: number; // Parcelas já pagas
  startDate: string; // YYYY-MM
  amortizations: Amortization[];
  notes?: string;
}

export interface PatternAlert {
  category: string;
  insight: string;
  percentageImpact?: number;
}

export interface CutRecommendation {
  title: string;
  description: string;
  monthlySavingEstimate: number;
  difficulty: 'Fácil' | 'Médio' | 'Avançado';
  category: string;
}

export interface DebtPayoffSimulation {
  targetFinancingTitle: string;
  extraMonthlyAmortization: number;
  estimatedMonthsReduced: number;
  estimatedInterestSaved?: number;
  conclusion: string;
}

export interface SavingsGoalPlan {
  recommendedMonthlySaving: number;
  threeStepsAction: string[];
}

export interface AIAnalysisResult {
  diagnosis: string;
  healthScore: number;
  healthStatus: string;
  patternAlerts: PatternAlert[];
  cutRecommendations: CutRecommendation[];
  debtPayoffSimulation?: DebtPayoffSimulation | null;
  savingsGoal: SavingsGoalPlan;
  generatedAt: string;
}

export interface UserFinancialProfile {
  name: string;
  email?: string;
  monthlyBudgetGoal?: number;
  primaryFinancingId?: string;
  currency: string; // Default: 'BRL'
}

export interface CloudBackupItem {
  id: string;
  name: string;
  createdAt: string;
  data: AppFinancialData;
  summary: {
    totalExpenses: number;
    totalIncome: number;
    balance: number;
    financingsCount: number;
  };
}

export interface AppFinancialData {
  profile: UserFinancialProfile;
  incomes: IncomeSource[];
  expenses: Expense[];
  financings: Financing[];
  lastAiAnalysis?: AIAnalysisResult | null;
}

