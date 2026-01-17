import { ReactNode } from 'react';

type StatusType = 'success' | 'warning' | 'danger' | 'neutral';

interface StatusBadgeProps {
  status: StatusType;
  children: ReactNode;
  className?: string;
}

const statusClasses = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  neutral: 'bg-gray-100 text-gray-700',
};

export default function StatusBadge({ status, children, className = '' }: StatusBadgeProps) {
  return (
    <span className={`badge ${statusClasses[status]} ${className}`}>
      {children}
    </span>
  );
}
