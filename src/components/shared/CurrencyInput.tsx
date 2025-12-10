import { forwardRef, ChangeEvent, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/masks';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(() => 
      formatCurrencyInput((value * 100).toString())
    );

    useEffect(() => {
      setDisplayValue(formatCurrencyInput((value * 100).toString()));
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formatted = formatCurrencyInput(rawValue);
      setDisplayValue(formatted);
      
      const numericValue = parseCurrencyInput(rawValue);
      onChange(numericValue);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
