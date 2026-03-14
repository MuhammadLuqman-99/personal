import { formatStatus, getStatusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
    >
      {formatStatus(status)}
    </span>
  );
}
