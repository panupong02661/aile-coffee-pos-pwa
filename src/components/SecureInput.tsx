
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateInput } from '@/utils/inputValidation';
import { AlertTriangle, Check } from 'lucide-react';

interface SecureInputProps {
  id: string;
  label: string;
  type?: 'text' | 'password' | 'email' | 'tel' | 'number';
  value: string;
  onChange: (value: string) => void;
  validationType?: 'general' | 'username' | 'email' | 'phone' | 'number';
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  validationType = 'general',
  required = false,
  placeholder,
  disabled = false,
  className = ''
}) => {
  const [touched, setTouched] = useState(false);
  const [validation, setValidation] = useState<{ isValid: boolean; error?: string }>({ isValid: true });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (touched || newValue.length > 0) {
      const result = validateInput(newValue, validationType);
      setValidation(result);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const result = validateInput(value, validationType);
    setValidation(result);
  };

  const showError = touched && !validation.isValid;
  const showSuccess = touched && validation.isValid && value.length > 0;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-coffee-700 font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            ${showError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
            ${showSuccess ? 'border-green-500 focus:border-green-500 focus:ring-green-200' : ''}
            pr-10
          `}
        />
        
        {showError && (
          <AlertTriangle className="absolute right-3 top-3 w-4 h-4 text-red-500" />
        )}
        
        {showSuccess && (
          <Check className="absolute right-3 top-3 w-4 h-4 text-green-500" />
        )}
      </div>
      
      {showError && (
        <p className="text-sm text-red-600 mt-1">
          {validation.error}
        </p>
      )}
    </div>
  );
};
