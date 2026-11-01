import type { Priority, TicketStatus } from '../types';

interface BadgeProps {
  type: 'status' | 'priority';
  value: TicketStatus | Priority;
}

export default function Badge({ type, value }: BadgeProps) {
  let bg = '#E2E3E5';
  let color = '#383D41';

  if (type === 'status') {
    switch (value) {
      case 'NEW': bg = '#E0F2FE'; color = '#0369A1'; break;
      case 'OPEN': bg = '#E0E7FF'; color = '#4338CA'; break;
      case 'IN_PROGRESS': bg = '#FEF3C7'; color = '#B45309'; break;
      case 'WAITING_FOR_REQUESTER': bg = '#FEE2E2'; color = '#B91C1C'; break;
      case 'RESOLVED': bg = '#D1FAE5'; color = '#065F46'; break;
      case 'CLOSED': bg = '#F3F4F6'; color = '#4B5563'; break;
      case 'REOPENED': bg = '#FDE68A'; color = '#92400E'; break;
      case 'CANCELLED': bg = '#F1F5F9'; color = '#64748B'; break;
    }
  } else {
    switch (value) {
      case 'LOW': bg = '#EBF5FB'; color = '#1A5276'; break;
      case 'MEDIUM': bg = '#FEF9E7'; color = '#7D6608'; break;
      case 'HIGH': bg = '#FDEBD0'; color = '#784212'; break;
      case 'URGENT': bg = '#FDEDEC'; color = '#922B21'; break;
    }
  }

  return (
    <span style={{
      backgroundColor: bg,
      color,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      display: 'inline-block'
    }}>
      {value ? value.replace('_', ' ') : 'UNKNOWN'}
    </span>
  );
}
