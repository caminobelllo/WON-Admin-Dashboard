import { getStatusBadgeClass, getStatusLabel } from '@/lib/formatters';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={getStatusBadgeClass(status)}>
      {getStatusLabel(status)}
    </span>
  );
}
