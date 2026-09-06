import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Requester, PaginatedTickets, Category } from '../types';
import Badge from '../components/Badge';

export default function MyTickets() {
  const navigate = useNavigate();
  const [requester, setRequester] = useState<Requester | null>(null);
  
  const [data, setData] = useState<PaginatedTickets | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
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
    fetch('http://localhost:3000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!requester) return;

    setLoading(true);
    const params = new URLSearchParams({
      requesterId: requester.id.toString(),
      page: page.toString(),
      limit: '8'
    });
    
    if (search) params.append('search', search);
    if (categoryFilter) params.append('categoryId', categoryFilter);
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
    }, 300);

    return () => clearTimeout(delay);
  }, [requester, search, categoryFilter, statusFilter, priorityFilter, page]);

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setStatusFilter('');
    setPriorityFilter('');
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0', color: '#111' }}>My Tickets</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>View and track all of your support requests.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={clearFilters}
            style={{ backgroundColor: '#fff', border: '1px solid #d0d0d0', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            ↻ Clear Filters
          </button>
          <button 
            onClick={() => navigate('/tickets/new')}
            style={{ backgroundColor: '#1b5e20', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            + Create Ticket
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px' }}>
        {/* Filters row */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <div style={{ flex: 2, minWidth: '250px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Search by ticket number or summary...</div>
            <input 
              type="text" 
              placeholder="🔍 Search..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Category</div>
            <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '14px' }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Requested Priority</div>
            <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '14px' }}>
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Current Status</div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '14px' }}>
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0', color: '#1b5e20' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Ticket No. ↕</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Created Date ↕</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Summary</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Priority</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Current Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Ticket Owner</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Last Updated ↕</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>Loading tickets...</td>
                </tr>
              ) : !data || data.data.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>No tickets found</td>
                </tr>
              ) : (
                data.data.map((ticket, index) => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    style={{ 
                      borderBottom: '1px solid #f0f0f0', 
                      cursor: 'pointer',
                      backgroundColor: index % 2 === 0 ? '#fcfcfc' : '#ffffff',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f8e9'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fcfcfc' : '#ffffff'}
                  >
                    <td style={{ padding: '16px', color: '#1b5e20', fontWeight: 600 }}>TKT-2026-{(ticket.id).toString().padStart(5, '0')}</td>
                    <td style={{ padding: '16px' }}>{formatDate(ticket.createdAt)}</td>
                    <td style={{ padding: '16px', fontWeight: 500, color: '#333' }}>{ticket.title}</td>
                    <td style={{ padding: '16px', color: '#666' }}>{ticket.category?.name || '-'}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <Badge type="priority" value={ticket.priority} />
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <Badge type="status" value={ticket.status} />
                    </td>
                    <td style={{ padding: '16px' }}>{requester?.name}</td>
                    <td style={{ padding: '16px', color: '#666' }}>{formatDate(ticket.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && data && data.totalPages > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: '13px', color: '#666' }}>
              Showing {((page - 1) * 8) + 1} to {Math.min(page * 8, data.total)} of {data.total} tickets
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                style={{ padding: '6px 12px', border: '1px solid #d0d0d0', backgroundColor: '#fff', borderRadius: '4px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}
              >
                &lt; Previous
              </button>
              
              {/* Simple page numbers */}
              {Array.from({ length: data.totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #d0d0d0',
                    backgroundColor: page === i + 1 ? '#1b5e20' : '#fff',
                    color: page === i + 1 ? 'white' : '#333',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                disabled={page === data.totalPages} 
                onClick={() => setPage(p => p + 1)}
                style={{ padding: '6px 12px', border: '1px solid #d0d0d0', backgroundColor: '#fff', borderRadius: '4px', cursor: page === data.totalPages ? 'not-allowed' : 'pointer', fontSize: '13px' }}
              >
                Next &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
