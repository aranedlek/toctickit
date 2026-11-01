import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '../lib/api';
import type { RequesterDashboardData } from '../types';
import Badge from '../components/Badge';

export default function RequesterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<RequesterDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = () => {
    setLoading(true);
    setError('');
    fetchApi('/dashboard/requester')
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load support metrics');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="skeleton" style={{ height: '400px' }} />;
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
    myOpenTicketsCount: 0,
    inProgressCount: 0,
    waitingForRequesterCount: 0,
    resolvedCount: 0,
    closedCount: 0,
  };

  const recentTickets = data?.recentTickets ?? [];

  const cards = [
    {
      id: 'my-open',
      testId: 'metric-card-my-open',
      drillTestId: 'drilldown-my-open',
      label: 'My Open Requests',
      count: metrics.myOpenTicketsCount,
      link: '/my-tickets',
      accent: '#0284C7',
    },
    {
      id: 'in-progress',
      testId: 'metric-card-in-progress',
      drillTestId: 'drilldown-in-progress',
      label: 'In Progress',
      count: metrics.inProgressCount,
      link: '/my-tickets?status=IN_PROGRESS',
      accent: '#D97706',
    },
    {
      id: 'waiting-on-me',
      testId: 'metric-card-waiting-on-me',
      drillTestId: 'drilldown-waiting-on-me',
      label: 'Waiting on Me',
      count: metrics.waitingForRequesterCount,
      link: '/my-tickets?status=WAITING_FOR_REQUESTER',
      accent: '#DC2626',
    },
    {
      id: 'resolved',
      testId: 'metric-card-resolved',
      drillTestId: 'drilldown-resolved',
      label: 'Recently Resolved',
      count: metrics.resolvedCount,
      link: '/my-tickets?status=RESOLVED',
      accent: '#2D6A4F',
    },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
            Welcome, {user?.name}!
          </h1>
          <div style={{ fontSize: '14px', color: 'var(--color-text-muted, #52796F)' }}>
            Here's the latest on your support requests.
          </div>
        </div>
        <button
          data-testid="refresh-requester-dashboard-btn"
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
        data-testid="requester-metric-cards-grid"
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
              minHeight: '120px',
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
              }}
            >
              View requests →
            </Link>
          </div>
        ))}
      </div>

      {/* 2-Column Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left Column: My Recent Tickets */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text, #1B4332)' }}>
              My Recent Requests
            </h2>
            <Link
              to="/my-tickets"
              style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary, #2D6A4F)', textDecoration: 'none' }}
            >
              View All My Tickets →
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <div
              data-testid="requester-recent-tickets-empty"
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                color: 'var(--color-text-muted, #52796F)',
                backgroundColor: 'var(--color-surface, #F0F7F4)',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
              <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--color-text, #1B4332)' }}>
                You haven't submitted any support requests yet.
              </div>
              <div style={{ fontSize: '13px', marginBottom: '16px' }}>
                Need help with hardware, network, or software? Submit a ticket anytime.
              </div>
              <Link
                to="/tickets/new"
                style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--color-primary, #2D6A4F)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  textDecoration: 'none',
                }}
              >
                Submit a New Request
              </Link>
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
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map(ticket => (
                    <tr
                      key={ticket.id}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
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
                        <Badge type="priority" value={ticket.priority} />
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <Badge type="status" value={ticket.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions & Help */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--color-text, #1B4332)' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                to="/tickets/new"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: 'var(--color-primary, #2D6A4F)',
                  color: 'white',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(45, 106, 79, 0.2)',
                }}
              >
                <span>➕</span> Submit a New Request
              </Link>
              <Link
                to="/my-tickets"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  backgroundColor: 'var(--color-surface, #F0F7F4)',
                  color: 'var(--color-text, #1B4332)',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid var(--color-border, #D8F3DC)',
                }}
              >
                View All My Tickets →
              </Link>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '20px',
              backgroundColor: 'var(--color-surface, #F0F7F4)',
              border: '1px solid var(--color-border, #D8F3DC)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-primary, #2D6A4F)', marginBottom: '8px' }}>
              💡 IT Support Hours
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #52796F)', lineHeight: 1.6 }}>
              Our IT Staff operates Monday – Friday, 8:30 AM – 5:30 PM. Urgent tickets are actively monitored during business hours.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
