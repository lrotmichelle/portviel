export interface FinanceState {
  accountBalance: number;
  reservedFee: number;
  managerBalance: number;
  due: number;
  settled: number;
}

export const FINANCE_STORAGE_KEY = 'buyercard-finance';

export const defaultFinanceState: FinanceState = {
  accountBalance: 1000000000,
  reservedFee: 1000,
  managerBalance: 0,
  due: 32000,
  settled: 67000,
};

export function getFinanceState(): FinanceState {
  if (typeof window === 'undefined') {
    return defaultFinanceState;
  }

  const stored = window.localStorage.getItem(FINANCE_STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(defaultFinanceState));
    return defaultFinanceState;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<FinanceState>;
    const normalizedState: FinanceState = {
      ...defaultFinanceState,
      ...parsed,
      accountBalance: parsed.accountBalance && parsed.accountBalance >= defaultFinanceState.accountBalance ? parsed.accountBalance : defaultFinanceState.accountBalance,
    };
    window.localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(normalizedState));
    return normalizedState;
  } catch {
    window.localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(defaultFinanceState));
    return defaultFinanceState;
  }
}

export function setFinanceState(state: FinanceState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event('financeStateChanged'));
}
