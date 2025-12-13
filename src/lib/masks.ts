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

// CPF mask: 123.456.789-00
export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

// CNPJ mask: 12.345.678/0001-00
export function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

// CPF/CNPJ mask: auto-detect based on length
export function formatCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 11) return formatCpf(digits);
  return formatCnpj(digits);
}

// Unformat CPF/CNPJ
export function unformatCpfCnpj(value: string): string {
  return value.replace(/\D/g, '');
}

// Mask CPF: ***.***. 789-00 (show only last 5 digits for privacy)
export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 11) return formatCpf(digits);
  return `***.***. ${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

// Mask CNPJ: **.***.***/ 0001-00 (show only last 7 digits for privacy)
export function maskCnpj(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 14) return formatCnpj(digits);
  return `**.***.***/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

// Mask CPF/CNPJ: auto-detect and mask for privacy
export function maskCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 11) return maskCpf(digits);
  return maskCnpj(digits);
}
