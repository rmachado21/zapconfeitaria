// Phone mask for Brazilian format: (11) 99999-9999
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  
  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : '';
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

// Unformat phone to get only digits
export function unformatPhone(value: string): string {
  return value.replace(/\D/g, '');
}

// Currency mask for BRL format: R$ 1.234,56
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' 
    ? parseFloat(value.replace(/\D/g, '')) / 100 
    : value;
  
  if (isNaN(numValue)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

// Parse currency input to number
export function parseCurrencyInput(value: string): number {
  const digits = value.replace(/\D/g, '');
  return parseFloat(digits) / 100 || 0;
}

// Format currency for input (as user types)
export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  const numValue = parseFloat(digits) / 100 || 0;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}
