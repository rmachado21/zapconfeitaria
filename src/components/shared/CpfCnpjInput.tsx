import { forwardRef, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { formatCpfCnpj } from '@/lib/masks';

interface CpfCnpjInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const CpfCnpjInput = forwardRef<HTMLInputElement, CpfCnpjInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCpfCnpj(e.target.value);
      onChange(formatted);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

CpfCnpjInput.displayName = 'CpfCnpjInput';
