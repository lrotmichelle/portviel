const formatWithSuffix = (value: number, digits = 1) => {
  const absValue = Math.abs(value);

  if (absValue < 1000) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value);
  }

  const suffixes = [
    { limit: 1e12, label: 't' },
    { limit: 1e9, label: 'b' },
    { limit: 1e6, label: 'm' },
    { limit: 1e3, label: 'k' },
  ];

  for (const entry of suffixes) {
    if (absValue >= entry.limit) {
      const scaledValue = absValue / entry.limit;
      const formatted = scaledValue.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: scaledValue >= 100 ? 0 : digits,
      });
      return `${value < 0 ? '-' : ''}${formatted}${entry.label}`;
    }
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);
};

export function formatToUGX(valueInShillings: number): string {
  return formatWithSuffix(valueInShillings, 1);
}

export function formatCompactValue(value: number): string {
  return formatWithSuffix(value, 1);
}

export function formatMetricValue(value: number): string {
  return formatWithSuffix(value, 1);
}

export function formatCompactNumber(value: number): string {
  return formatWithSuffix(value, 1);
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
