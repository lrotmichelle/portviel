const formatWithSuffix = (value: number, digits = 2) => {
  const absValue = Math.abs(value);
  const suffixes = [
    { limit: 1e12, label: 't' },
    { limit: 1e9, label: 'b' },
    { limit: 1e6, label: 'm' },
    { limit: 1e3, label: 'k' },
  ];

  let scaledValue = absValue;
  let suffix = '';

  for (const entry of suffixes) {
    if (absValue >= entry.limit) {
      scaledValue = absValue / entry.limit;
      suffix = entry.label;
      break;
    }
  }

  const formatted = scaledValue.toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  return `${value < 0 ? '-' : ''}${formatted}${suffix}`;
};

export function formatToUGX(valueInShillings: number): string {
  return formatWithSuffix(valueInShillings, 1);
}

export function formatCompactValue(value: number): string {
  return formatWithSuffix(value, 2);
}

export function formatMetricValue(value: number): string {
  return formatWithSuffix(value, 2);
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
