import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchApi } from '../../lib/api';
import type { StaffDashboardData } from '../../types';
import Badge from '../../components/Badge';

export default function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<StaffDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = () => {
    setLoading(true);
    setError('');
    fetchApi('/dashboard/staff')
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load dashboard metrics');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  if (loading) {
    return <div className="skeleton" style={{ height: '500px' }} />;
  }

  if (error) {
    return (
      <div className="card" style={{ color: 'var(--color-error, #b91c1c)', textAlign: 'center', padding: '32px' }}>
        <h3>Error loading dashboard</h3>
        <p>{error}</p>
        <button
          onClick={loadDashboard}
          style={{
            marginTop: '16px',
            backgroundColor: 'var(--color-primary, #2D6A4F)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const metrics = data?.metrics ?? {
    unassignedCount: 0,
    openCount: 0,
    inProgressCount: 0,
    waitingForRequesterCount: 0,
    assignedToMeCount: 0,
    totalActiveTickets: 0,
  };

  const priorityBreakdown = data?.priorityBreakdown ?? {
    URGENT: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  const recentTickets = data?.recentTickets ?? [];

  const cards = [
    {
      id: 'unassigned',
      testId: 'metric-card-unassigned',
      drillTestId: 'drilldown-unassigned',
      label: 'Unassigned',
      count: metrics.unassignedCount,
      link: '/staff/tickets?assigned=unassigned',
      accent: '#0284C7',
      bg: '#E0F2FE',
    },
    {
      id: 'open',
      testId: 'metric-card-open',
      drillTestId: 'drilldown-open',
      label: 'Open',
      count: metrics.openCount,
      link: '/staff/tickets?status=OPEN',
      accent: '#4F46E5',
      bg: '#E0E7FF',
    },
    {
      id: 'in-progress',
      testId: 'metric-card-in-progress',
      drillTestId: 'drilldown-in-progress',
      label: 'In Progress',
      count: metrics.inProgressCount,
      link: '/staff/tickets?status=IN_PROGRESS',
      accent: '#D97706',
      bg: '#FEF3C7',
    },
    {
      id: 'waiting',
      testId: 'metric-card-waiting',
      drillTestId: 'drilldown-waiting',
      label: 'Waiting on User',
      count: metrics.waitingForRequesterCount,
      link: '/staff/tickets?status=WAITING_FOR_REQUESTER',
      accent: '#DC2626',
      bg: '#FEE2E2',
    },
    {
      id: 'assigned-to-me',
      testId: 'metric-card-assigned-to-me',
      drillTestId: 'drilldown-assigned-to-me',
      label: 'My Assigned',
      count: metrics.assignedToMeCount,
      link: '/staff/tickets?assigned=me',
      accent: '#2D6A4F',
      bg: '#D8F3DC',
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--color-border, #D8F3DC)',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', color: 'var(--color-text, #1B4332)' }}>
            Welcome back, {user?.name}!
          </h1>
          <div style={{ fontSize: '14px', color: 'var(--color-text-muted, #52796F)' }}>
            {todayStr} · Here's what's happening with your queue today.
          </div>
        </div>
        <button
          data-testid="refresh-dashboard-btn"
          onClick={loadDashboard}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-surface, #F0F7F4)',
            color: 'var(--color-text, #1B4332)',
            border: '1px solid var(--color-border, #D8F3DC)',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Metric Cards Row */}
      <div
        data-testid="metric-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {cards.map(card => (
          <div
            key={card.id}
            data-testid={card.testId}
            className="card"
            style={{
              padding: '20px',
              borderTop: `4px solid ${card.accent}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '130px',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted, #52796F)', marginBottom: '8px' }}>
                {card.label}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text, #1B4332)', lineHeight: 1 }}>
                {card.count}
              </div>
            </div>
            <Link
              to={card.link}
              data-testid={card.drillTestId}
              style={{
                marginTop: '16px',
                fontSize: '12px',
                fontWeight: 600,
                color: card.accent,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              View queue →
            </Link>
          </div>
        ))}
      </div>

      {/* 2-Column Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left Column: Recent Tickets */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text, #1B4332)' }}>
              Recent Active Tickets
            </h2>
            <Link
              to="/staff/tickets"
              style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary, #2D6A4F)', textDecoration: 'none' }}
            >
              View All Tickets →
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <div
              data-testid="staff-recent-tickets-empty"
              style={{
                padding: '32px',
                textAlign: 'center',
                color: 'var(--color-text-muted, #52796F)',
                backgroundColor: 'var(--color-surface, #F0F7F4)',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              No tickets found matching your queue.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border, #D8F3DC)', color: 'var(--color-text-muted, #52796F)' }}>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>Ticket</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>Title</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>Priority</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map(ticket => (
                    <tr
                      key={ticket.id}
                      onClick={() => navigate(`/staff/tickets/${ticket.id}`)}
                      style={{
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface, #F0F7F4)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--color-primary, #2D6A4F)' }}>
                        #{ticket.id}
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 500, color: 'var(--color-text, #1B4332)' }}>
                        {ticket.title}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <Badge type="priority" value={ticket.itPriority || ticket.priority} />
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <Badge type="status" value={ticket.status} />
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--color-text-muted, #52796F)' }}>
                        {ticket.ticketOwner?.name || 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions & Priority Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Actions Card */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--color-text, #1B4332)' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                to="/tickets/new"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-surface, #F0F7F4)',
                  borderRadius: '6px',
                  color: 'var(--color-text, #1B4332)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid var(--color-border, #D8F3DC)',
                }}
              >
                <span>➕</span> Create Ticket
              </Link>
              <Link
                to="/staff/tickets"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-surface, #F0F7F4)',
                  borderRadius: '6px',
                  color: 'var(--color-text, #1B4332)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid var(--color-border, #D8F3DC)',
                }}
              >
                <span>🔍</span> Search Tickets
              </Link>
              <Link
                to="/staff/tickets?assigned=me"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-surface, #F0F7F4)',
                  borderRadius: '6px',
                  color: 'var(--color-text, #1B4332)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid var(--color-border, #D8F3DC)',
                }}
              >
                <span>📋</span> My Assigned Queue
              </Link>
            </div>
          </div>

          {/* Priority Breakdown Card */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--color-text, #1B4332)' }}>
              Active Priority Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
                  Urgent
                </span>
                <span style={{ fontWeight: 700 }}>{priorityBreakdown.URGENT}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#D97706', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }} />
                  High
                </span>
                <span style={{ fontWeight: 700 }}>{priorityBreakdown.HIGH}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0284C7', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284C7' }} />
                  Medium
                </span>
                <span style={{ fontWeight: 700 }}>{priorityBreakdown.MEDIUM}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#52796F', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#52796F' }} />
                  Low
                </span>
                <span style={{ fontWeight: 700 }}>{priorityBreakdown.LOW}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
