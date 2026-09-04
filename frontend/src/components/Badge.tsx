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
      case 'OPEN': bg = '#D8F3DC'; color = '#1B4332'; break;
      case 'IN_PROGRESS': bg = '#FEF3CD'; color = '#856404'; break;
      case 'RESOLVED': bg = '#D1ECF1'; color = '#0C5460'; break;
      case 'CLOSED': bg = '#E2E3E5'; color = '#383D41'; break;
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
      {value.replace('_', ' ')}
    </span>
  );
}
