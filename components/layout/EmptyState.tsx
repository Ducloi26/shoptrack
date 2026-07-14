interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

import React from 'react';

export function EmptyState({ icon = '📦', title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status" aria-label={title}>
      <div className="empty-icon" aria-hidden="true">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-description">{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
