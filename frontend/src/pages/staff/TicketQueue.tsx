import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PaginatedTickets } from '../../types';
import Badge from '../../components/Badge';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function TicketQueue() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [data, setData] = useState<PaginatedTickets | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [itPriorityFilter, setItPriorityFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Basic setup if needed
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '15'
    });
    
    if (search) params.append('search', search);
    if (statusFilter) params.append('status', statusFilter);
    if (priorityFilter) params.append('priority', priorityFilter);
    if (itPriorityFilter) params.append('itPriority', itPriorityFilter);
    if (ownerFilter) {
      if (ownerFilter === 'me') params.append('ownerId', user.id.toString());
      else if (ownerFilter === 'unassigned') params.append('ownerId', 'unassigned');
    }

    const delay = setTimeout(() => {
      fetchApi(`/tickets?${params.toString()}`)
        .then(resData => {
          console.log('TicketQueue fetched data:', resData);
          setData(resData);
          setLoading(false);
        })
        .catch((e) => {
          console.error('TicketQueue fetch error:', e);
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(delay);
  }, [user, search, statusFilter, priorityFilter, itPriorityFilter, ownerFilter, page]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setItPriorityFilter('');
    setOwnerFilter('');
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ margin: '0 auto', padding: '16px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0', color: '#111' }}>IT Staff Ticket Queue</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Manage and resolve user requests.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={clearFilters}
            style={{ backgroundColor: '#fff', border: '1px solid #d0d0d0', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            ↻ Clear Filters
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px' }}>
        {/* Filters row */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <div style={{ flex: 2, minWidth: '250px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Search Tickets</div>
            <input 
              type="text" 
              placeholder="🔍 Search title..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Assignment</div>
            <select value={ownerFilter} onChange={e => { setOwnerFilter(e.target.value); setPage(1); }} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '14px' }}>
              <option value="">All Tickets</option>
              <option value="me">Assigned to Me</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Current Status</div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '14px' }}>
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_FOR_REQUESTER">Waiting on User</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>IT Priority</div>
            <select value={itPriorityFilter} onChange={e => { setItPriorityFilter(e.target.value); setPage(1); }} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d0d0', borderRadius: '6px', fontSize: '14px' }}>
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0', color: '#1b5e20' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, width: '100px' }}>Ticket No.</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Summary</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Requester</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Req. Pri</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>IT Pri</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Owner</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Created Date</th>
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
                    onClick={() => navigate(`/staff/tickets/${ticket.id}`)}
                    style={{ 
                      borderBottom: '1px solid #f0f0f0', 
                      cursor: 'pointer',
                      backgroundColor: index % 2 === 0 ? '#fcfcfc' : '#ffffff',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f8e9'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fcfcfc' : '#ffffff'}
                  >
                    <td style={{ padding: '16px', color: '#1b5e20', fontWeight: 600 }}>TKT-{(ticket.id).toString().padStart(4, '0')}</td>
                    <td style={{ padding: '16px', fontWeight: 500, color: '#333' }}>
                      <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ticket.title}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#666' }}>{ticket.requester?.name}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <Badge type="priority" value={ticket.priority} />
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <Badge type="priority" value={ticket.itPriority} />
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <Badge type="status" value={ticket.status} />
                    </td>
                    <td style={{ padding: '16px' }}>
                      {ticket.ticketOwner ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#e3f2fd', color: '#1565c0', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                          {ticket.ticketOwner.id === user?.id ? 'Me' : ticket.ticketOwner.name.split(' ')[0]}
                        </span>
                      ) : (
                        <span style={{ color: '#999', fontStyle: 'italic', fontSize: '12px' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: '16px', color: '#666' }}>{formatDate(ticket.createdAt)}</td>
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
              Showing {((page - 1) * data.limit) + 1} to {Math.min(page * data.limit, data.total)} of {data.total} tickets
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                style={{ padding: '6px 12px', border: '1px solid #d0d0d0', backgroundColor: '#fff', borderRadius: '4px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}
              >
                Previous
              </button>
              
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
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
