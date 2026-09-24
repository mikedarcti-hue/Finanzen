import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  AppFinancialData,
  Expense,
  IncomeSource,
  Financing,
  Amortization,
  AIAnalysisResult,
  ExpenseCategory,
  UserFinancialProfile,
  CloudBackupItem,
} from '../types/finance';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  type User,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';

const GUEST_STORAGE_KEY = 'finanzen_guest_v1';

export const INITIAL_FINANCIAL_DATA: AppFinancialData = {
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
      dueDate: '2026-09-24',
      category: 'Moradia',
      type: 'fixo',
      status: 'Pendente',
      recurrent: true,
    },
    {
      id: 'exp-4',
      name: 'Plano de Saúde Familiar',
      amount: 510,
      dueDate: '2026-09-20',
      category: 'Saúde',
      type: 'fixo',
      status: 'Pendente',
    },
    {
      id: 'exp-5',
      name: 'Academia & Crossfit',
      amount: 140,
      dueDate: '2026-09-25',
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

  // Auth & Cloud state
  user: User | null;
  isAuthLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncStatus: 'synced' | 'saving' | 'offline' | 'guest';
  cloudBackups: CloudBackupItem[];
  isLoadingBackups: boolean;

  // Auth methods
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;

  // Data Actions
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

  // Cloud Snapshots / Backups per user
  saveCloudBackup: (label: string) => Promise<void>;
  restoreCloudBackup: (backup: CloudBackupItem) => Promise<void>;
  deleteCloudBackup: (backupId: string) => Promise<void>;
  refreshCloudBackups: () => Promise<void>;
  forceCloudSync: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline' | 'guest'>('guest');
  const [cloudBackups, setCloudBackups] = useState<CloudBackupItem[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);

  const [data, setData] = useState<AppFinancialData>(() => {
    if (typeof window === 'undefined') return INITIAL_FINANCIAL_DATA;
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load guest data', e);
    }
    return INITIAL_FINANCIAL_DATA;
  });

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Avoid saving to cloud before user's cloud data has been loaded
  const isInitialCloudLoadDone = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch backups for the authenticated user
  const fetchUserBackups = async (uid: string) => {
    setIsLoadingBackups(true);
    try {
      const backupsCol = collection(db, 'users', uid, 'backups');
      const snap = await getDocs(backupsCol);
      const items: CloudBackupItem[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          name: d.name || 'Backup',
          createdAt: d.createdAt || new Date().toISOString(),
          data: d.data,
          summary: d.summary || {
            totalExpenses: 0,
            totalIncome: 0,
            balance: 0,
            financingsCount: 0,
          },
        });
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCloudBackups(items);
    } catch (e) {
      console.warn('Failed to load user backups from Firestore', e);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsAuthLoading(true);
      setUser(currentUser);

      if (currentUser) {
        setSyncStatus('saving');
        const userStorageKey = `finanzen_user_${currentUser.uid}`;
        try {
          // 1. Try to read from Firestore
          const stateDocRef = doc(db, 'users', currentUser.uid, 'state', 'current');
          const docSnap = await getDoc(stateDocRef);

          if (docSnap.exists()) {
            const cloudData = docSnap.data() as AppFinancialData;
            setData(cloudData);
            localStorage.setItem(userStorageKey, JSON.stringify(cloudData));
            setLastSyncedAt(new Date());
            setSyncStatus('synced');
          } else {
            // First time this user logs in: check if local copy exists or use guest data
            let initialUserState: AppFinancialData;
            const localUserCopy = localStorage.getItem(userStorageKey);
            if (localUserCopy) {
              initialUserState = JSON.parse(localUserCopy);
            } else {
              initialUserState = {
                ...data,
                profile: {
                  ...data.profile,
                  name: currentUser.displayName || data.profile.name,
                  email: currentUser.email || undefined,
                },
              };
            }
            setData(initialUserState);

            // Save to Firestore so it's initialized on the cloud
            await setDoc(stateDocRef, initialUserState);
            // Save User Profile doc
            await setDoc(doc(db, 'users', currentUser.uid), {
              userId: currentUser.uid,
              displayName: currentUser.displayName || 'Usuário FinanZen',
              email: currentUser.email || '',
              currency: initialUserState.profile.currency || 'BRL',
              monthlyBudgetGoal: initialUserState.profile.monthlyBudgetGoal || 5000,
              updatedAt: new Date().toISOString(),
            });

            localStorage.setItem(userStorageKey, JSON.stringify(initialUserState));
            setLastSyncedAt(new Date());
            setSyncStatus('synced');
          }

          // Fetch cloud backups for this user
          await fetchUserBackups(currentUser.uid);
        } catch (err) {
          console.error('Error fetching user cloud data:', err);
          // Fallback to local storage for this user
          const localUserCopy = localStorage.getItem(userStorageKey);
          if (localUserCopy) {
            setData(JSON.parse(localUserCopy));
          }
          setSyncStatus('offline');
        } finally {
          isInitialCloudLoadDone.current = true;
          setIsAuthLoading(false);
        }
      } else {
        // User logged out: clear backups list and revert to guest data
        setCloudBackups([]);
        setSyncStatus('guest');
        isInitialCloudLoadDone.current = false;
        try {
          const guestStored = localStorage.getItem(GUEST_STORAGE_KEY);
          if (guestStored) {
            setData(JSON.parse(guestStored));
          } else {
            setData(INITIAL_FINANCIAL_DATA);
          }
        } catch (e) {
          setData(INITIAL_FINANCIAL_DATA);
        }
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save changes to LocalStorage and debounce-sync to Firestore for the authenticated user
  useEffect(() => {
    if (user) {
      const userKey = `finanzen_user_${user.uid}`;
      try {
        localStorage.setItem(userKey, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }

      // If initial cloud load has completed, sync to Firestore
      if (isInitialCloudLoadDone.current) {
        setSyncStatus('saving');
        setIsSyncing(true);

        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = setTimeout(async () => {
          try {
            const stateRef = doc(db, 'users', user.uid, 'state', 'current');
            await setDoc(stateRef, data);
            setLastSyncedAt(new Date());
            setSyncStatus('synced');
          } catch (e) {
            console.error('Failed to sync data to Firestore', e);
            setSyncStatus('offline');
          } finally {
            setIsSyncing(false);
          }
        }, 1200); // 1.2s debounce to save writes
      }
    } else {
      // Guest mode
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to save guest data', e);
      }
      setSyncStatus('guest');
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [data, user]);

  // Force cloud sync now
  const forceCloudSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    setSyncStatus('saving');
    try {
      const stateRef = doc(db, 'users', user.uid, 'state', 'current');
      await setDoc(stateRef, data);
      setLastSyncedAt(new Date());
      setSyncStatus('synced');
    } catch (e) {
      console.error('Force sync error', e);
      setSyncStatus('offline');
    } finally {
      setIsSyncing(false);
    }
  };

  // Auth Actions
  const loginWithGoogle = async () => {
    try {
      setIsAuthLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In failed', err);
      setIsAuthLoading(false);
      throw err;
    }
  };

  const loginAsGuest = async () => {
    try {
      setIsAuthLoading(true);
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error('Anonymous Sign-In failed', err);
      setIsAuthLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Flush current data before logging out so nothing is lost
      if (user) {
        try {
          const stateRef = doc(db, 'users', user.uid, 'state', 'current');
          await setDoc(stateRef, data);
        } catch (e) {
          console.warn('Could not flush state to firestore on logout', e);
        }
      }
      await signOut(auth);
    } catch (err) {
      console.error('Sign Out failed', err);
    }
  };

  // Cloud Snapshots / Backups ("arquivos para cada usuário sejam guardados")
  const saveCloudBackup = async (label: string) => {
    if (!user) {
      throw new Error('É necessário estar conectado com sua conta para salvar arquivos na nuvem.');
    }

    const backupId = `bkp_${Date.now()}`;
    const newBackup: CloudBackupItem = {
      id: backupId,
      name: label.trim() || `Arquivo ${new Date().toLocaleDateString('pt-BR')}`,
      createdAt: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(data)),
      summary: {
        totalExpenses,
        totalIncome,
        balance: monthlyBalance,
        financingsCount: data.financings.length,
      },
    };

    try {
      const backupRef = doc(db, 'users', user.uid, 'backups', backupId);
      await setDoc(backupRef, {
        ...newBackup,
        userId: user.uid,
      });
      setCloudBackups((prev) => [newBackup, ...prev]);
    } catch (err) {
      console.error('Failed to save cloud backup', err);
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/backups/${backupId}`);
    }
  };

  const restoreCloudBackup = async (backup: CloudBackupItem) => {
    if (!backup?.data) return;
    setData(backup.data);
    if (user) {
      const userKey = `finanzen_user_${user.uid}`;
      localStorage.setItem(userKey, JSON.stringify(backup.data));
      try {
        const stateRef = doc(db, 'users', user.uid, 'state', 'current');
        await setDoc(stateRef, backup.data);
        setLastSyncedAt(new Date());
        setSyncStatus('synced');
      } catch (e) {
        console.error('Failed to sync restored backup', e);
      }
    }
  };

  const deleteCloudBackup = async (backupId: string) => {
    if (!user) return;
    try {
      const backupRef = doc(db, 'users', user.uid, 'backups', backupId);
      await deleteDoc(backupRef);
      setCloudBackups((prev) => prev.filter((b) => b.id !== backupId));
    } catch (err) {
      console.error('Failed to delete backup', err);
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/backups/${backupId}`);
    }
  };

  const refreshCloudBackups = async () => {
    if (user) {
      await fetchUserBackups(user.uid);
    }
  };

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
    const extraAmortized = f.amortizations.reduce((acc, a) => acc + a.amount, 0);
    const installmentsEliminatedByAmortization = f.amortizations.reduce(
      (acc, a) => acc + (a.installmentsEliminated || 0),
      0
    );

    const effectivePaidInstallments = f.paidInstallments + installmentsEliminatedByAmortization;
    const remainingInstallments = Math.max(0, f.totalInstallments - effectivePaidInstallments);
    const percentagePaid = Math.min(100, Math.round((effectivePaidInstallments / f.totalInstallments) * 100));

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

  // Simulate amortization
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
      const approxPrincipalPerInstallment = f.installmentAmount * 0.65;
      const installmentsReduced = Math.min(
        remainingInstallments - 1,
        Math.max(1, Math.round(extraAmount / approxPrincipalPerInstallment))
      );
      const interestSaved = Math.max(0, installmentsReduced * f.installmentAmount - extraAmount);

      return {
        installmentsReduced,
        newInstallmentAmount: f.installmentAmount,
        interestSaved: Math.round(interestSaved),
        monthsRemainingBefore: remainingInstallments,
        monthsRemainingAfter: Math.max(1, remainingInstallments - installmentsReduced),
      };
    } else {
      const newPrincipal = Math.max(1000, remainingBalance - extraAmount);
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
    if (user) {
      localStorage.removeItem(`finanzen_user_${user.uid}`);
    } else {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    }
  };

  const exportDataAsJSON = () => {
    return JSON.stringify(data, null, 2);
  };

  const importDataFromJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && (parsed.incomes || parsed.expenses || parsed.financings)) {
        setData({
          profile: parsed.profile || data.profile,
          incomes: parsed.incomes || [],
          expenses: parsed.expenses || [],
          financings: parsed.financings || [],
          lastAiAnalysis: parsed.lastAiAnalysis || null,
        });
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
        user,
        isAuthLoading,
        isSyncing,
        lastSyncedAt,
        syncStatus,
        cloudBackups,
        isLoadingBackups,
        loginWithGoogle,
        loginAsGuest,
        logout,
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
        saveCloudBackup,
        restoreCloudBackup,
        deleteCloudBackup,
        refreshCloudBackups,
        forceCloudSync,
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
