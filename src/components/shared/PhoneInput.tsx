import { forwardRef, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { formatPhone } from '@/lib/masks';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value);
      onChange(formatted);
    };

    return (
      <Input
        ref={ref}
        type="tel"
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
