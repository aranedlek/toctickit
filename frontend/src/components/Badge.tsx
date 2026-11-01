import type { Priority, TicketStatus } from '../types';

interface BadgeProps {
  type: 'status' | 'priority';
  value: TicketStatus | Priority;
}

export default function Badge({ type, value }: BadgeProps) {
  let bg = '#E2E3E5';
  let color = '#383D41';
  let icon = '';

  if (type === 'status') {
    switch (value) {
      case 'NEW': bg = '#E0F2FE'; color = '#0369A1'; icon = '✨'; break;
      case 'OPEN': bg = '#E0E7FF'; color = '#4338CA'; icon = '📂'; break;
      case 'IN_PROGRESS': bg = '#FEF3C7'; color = '#B45309'; icon = '⏳'; break;
      case 'WAITING_FOR_REQUESTER': bg = '#FEE2E2'; color = '#B91C1C'; icon = '⏸️'; break;
      case 'RESOLVED': bg = '#D1FAE5'; color = '#065F46'; icon = '✅'; break;
      case 'CLOSED': bg = '#F3F4F6'; color = '#4B5563'; icon = '🔒'; break;
      case 'REOPENED': bg = '#FDE68A'; color = '#92400E'; icon = '🔄'; break;
      case 'CANCELLED': bg = '#F1F5F9'; color = '#64748B'; icon = '🚫'; break;
    }
  } else {
    switch (value) {
      case 'LOW': bg = '#EBF5FB'; color = '#1A5276'; icon = '↓'; break;
      case 'MEDIUM': bg = '#FEF9E7'; color = '#7D6608'; icon = '→'; break;
      case 'HIGH': bg = '#FDEBD0'; color = '#784212'; icon = '↑'; break;
      case 'URGENT': bg = '#FDEDEC'; color = '#922B21'; icon = '⚡'; break;
    }
  }

  const formattedText = value ? value.replace(/_/g, ' ') : 'UNKNOWN';

  return (
    <span
      data-testid={`badge-${type}-${value}`}
      style={{
        backgroundColor: bg,
        color,
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        lineHeight: 1.4,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '11px' }}>{icon}</span>
      <span>{formattedText}</span>
    </span>
  );
}
