import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Requester, PaginatedTickets } from '../types';
import Badge from '../components/Badge';

export default function MyTickets() {
  const navigate = useNavigate();
  const [requester, setRequester] = useState<Requester | null>(null);
  
  const [data, setData] = useState<PaginatedTickets | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem('requester');
    if (!saved) {
      navigate('/');
    } else {
      setRequester(JSON.parse(saved));
    }
  }, [navigate]);

  useEffect(() => {
    if (!requester) return;

    setLoading(true);
    const params = new URLSearchParams({
      requesterId: requester.id.toString(),
      page: page.toString(),
      limit: '10'
    });
    
    if (search) params.append('search', search);
    if (statusFilter) params.append('status', statusFilter);
    if (priorityFilter) params.append('priority', priorityFilter);

    const delay = setTimeout(() => {
      fetch(`http://localhost:3000/api/tickets?${params.toString()}`)
        .then(res => res.json())
        .then(resData => {
          setData(resData);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 300); // debounce search slightly

    return () => clearTimeout(delay);
  }, [requester, search, statusFilter, priorityFilter, page]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>My Tickets</h1>
        <button onClick={() => navigate('/tickets/new')}>+ Create Ticket</button>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="🔍 Search by title..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}>
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {loading && <div className="skeleton" style={{ height: '400px' }} />}

      {!loading && data && data.data.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <h3>No tickets found</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>Try adjusting your filters or creating a new ticket.</p>
          <button onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); }} style={{ marginTop: '16px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
            Clear Filters
          </button>
        </div>
      )}

      {!loading && data && data.data.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.data.map(ticket => (
              <div 
                key={ticket.id} 
                className="card" 
                style={{ padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    #{ticket.id} · {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{ticket.title}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    Category: {ticket.category?.name}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Badge type="priority" value={ticket.priority} />
                  <Badge type="status" value={ticket.status} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            >
              ← Previous
            </button>
            <span style={{ fontSize: '14px' }}>Page {data.page} of {data.totalPages}</span>
            <button 
              disabled={page === data.totalPages} 
              onClick={() => setPage(p => p + 1)}
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
