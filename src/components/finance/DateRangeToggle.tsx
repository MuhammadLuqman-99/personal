'use client';

interface DateRangeToggleProps {
  value: string;
  onChange: (value: string) => void;
  options?: { value: string; label: string }[];
}

export default function DateRangeToggle({ value, onChange, options }: DateRangeToggleProps) {
  const defaultOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  const items = options || defaultOptions;

  return (
    <div className="flex gap-2">
      {items.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
            value === opt.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
