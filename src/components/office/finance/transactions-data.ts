export type TransactionType = 'campaign_payout' | 'campaign_income' | 'purchase' | 'sale' | 'deposit' | 'withdrawal';

export interface Transaction {
  id: number;
  date: string;
  time: string;
  details: string;
  amount: number;
  method: string;
  type: TransactionType;
}

const STORAGE_KEY = 'transactions';

const sampleTransactions: Transaction[] = [
  { id: 1, date: '26|08|26', time: '09:30', details: 'Campaign payout', amount: 450000, method: 'office', type: 'campaign_payout' },
  { id: 2, date: '25|08|26', time: '16:10', details: 'Market purchase', amount: 120000, method: 'office', type: 'purchase' },
  { id: 3, date: '24|08|26', time: '11:45', details: 'Account deposit', amount: 800000, method: 'bank', type: 'deposit' },
  { id: 4, date: '22|08|26', time: '14:20', details: 'Withdrawal', amount: 200000, method: 'mobile money', type: 'withdrawal' },
  { id: 5, date: '20|08|26', time: '08:15', details: 'Campaign income', amount: 320000, method: 'office', type: 'campaign_income' },
  { id: 6, date: '18|08|26', time: '13:05', details: 'Campaign payout', amount: 150000, method: 'office', type: 'campaign_payout' },
];

export const loadTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return sampleTransactions;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Transaction[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return sampleTransactions;
};

export const saveTransactions = (items: Transaction[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const addTransaction = (item: Omit<Transaction, 'id'>): Transaction => {
  const items = loadTransactions();
  const maxId = items.reduce((max, t) => (t.id > max ? t.id : max), 0);
  const newTransaction: Transaction = { ...item, id: maxId + 1 };
  const updated = [newTransaction, ...items];
  saveTransactions(updated);
  return newTransaction;
};

export const formatAmount = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    const suffix = abs >= 1_000_000_000_000 ? 't' : 'b';
    const divisor = suffix === 't' ? 1_000_000_000_000 : 1_000_000_000;
    return `UGX ${(value / divisor).toFixed(1).replace(/\.0$/, '')}${suffix}`;
  }
  if (abs >= 1_000_000) {
    return `UGX ${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`;
  }
  if (abs >= 1_000) {
    return `UGX ${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `UGX ${value}`;
};

export const detailColor = (type: TransactionType) => {
  if (type === 'deposit') return 'text-amber-300';
  if (type === 'withdrawal') return 'text-sky-300';
  if (type === 'purchase') return 'text-emerald-300';
  if (type === 'sale') return 'text-emerald-300';
  return 'text-white';
};

export const methodColor = (method: string) => {
  if (method === 'mobile money') return 'text-amber-300';
  if (method === 'bank') return 'text-sky-300';
  return 'text-zinc-400';
};
