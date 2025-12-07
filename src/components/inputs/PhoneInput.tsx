import React from 'react';
import { PhoneInput as ReactPhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  className?: string;
  hasError?: boolean;
  disabled?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ 
  value, 
  onChange, 
  className = '', 
  hasError = false,
  disabled = false
}) => {
  return (
    <div className={`phone-input-wrapper w-full ${className}`}>
      <ReactPhoneInput
        defaultCountry="us"
        value={value}
        onChange={onChange}
        disabled={disabled}
        inputClassName={`input-field rounded-l-none border-l-0 ${hasError ? 'border-red-500' : ''}`}
        inputStyle={{
          fontSize: '16px',
          lineHeight: '26px',
          borderRadius: '0 8px  8px 0',
          width: '100%',
          height: '42px' // Match the input-field height (py-2.5 = 10px top + 10px bottom + line-height)
        }}
        countrySelectorStyleProps={{
          buttonClassName: `input-field ${hasError ? 'border-red-500' : ''} rounded-r-none border-r-0`,
          buttonStyle: {
            fontSize: '18px',
            lineHeight: '26px',
            borderRadius: '8px 0 0 8px',
            height: '42px', // Match the input-field height
            minWidth: '80px' // Ensure consistent country selector width
          },
          dropdownStyleProps: {
            className: 'bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-auto z-50'
          }
        }}
        style={{
          width: '100%' // Ensure the entire component takes full width
        }}
        placeholder="Enter phone number"
      />
    </div>
  );
};

export { PhoneInput }; 