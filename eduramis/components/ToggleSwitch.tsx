'use client';

import { useState } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}: ToggleSwitchProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {(label || description) && (
        <div className="flex-1 mr-4">
          {label && (
            <label className="text-sm font-medium text-gray-900 block">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${checked 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gray-200 hover:bg-gray-300'
          }
          ${isPressed ? 'scale-95' : 'scale-100'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
            shadow-lg ring-0
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
}
