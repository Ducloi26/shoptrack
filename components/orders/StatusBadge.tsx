'use client';

import { Badge } from '../ui/Badge';
import { STATUS_LABELS, STATUS_COLORS, STATUS_ICONS } from '../../lib/constants';
import type { NormalizedStatus } from '../../types';

interface StatusBadgeProps {
  status: NormalizedStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  const icon = STATUS_ICONS[status];

  return (
    <Badge
      color={colors.bg}
      textColor={colors.text}
      dot={colors.dot}
      size={size}
    >
      {showIcon && <span className="badge-icon">{icon}</span>}
      {label}
    </Badge>
  );
}
