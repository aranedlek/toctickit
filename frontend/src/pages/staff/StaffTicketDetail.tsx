import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Ticket, ActionTaken } from '../../types';
import AttachmentItem from '../../components/AttachmentItem';
import ActionsTakenSection from '../../components/ActionsTakenSection';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const PERMITTED_STATUS_TRANSITIONS: Record<string, string[]> = {
  NEW: ['OPEN', 'CANCELLED'],
  OPEN: ['IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_FOR_REQUESTER', 'RESOLVED', 'CANCELLED'],
  WAITING_FOR_REQUESTER: ['IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  REOPENED: ['IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'CANCELLED'],
  CLOSED: ['REOPENED'], // Allowed for Administrator only
  CANCELLED: [],
};

const STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  WAITING_FOR_REQUESTER: 'Waiting on User',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
  CANCELLED: 'Cancelled',
};

export default function StaffTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Operational state
  const [status, setStatus] = useState('');
  const [itPriority, setItPriority] = useState('');
  const [ownerId, setOwnerId] = useState<string>('');
  const [savingOps, setSavingOps] = useState(false);
  const [opsMessage, setOpsMessage] = useState('');
  const [conflictMessage, setConflictMessage] = useState('');
  const [statusError, setStatusError] = useState('');

  // Comm/Note state
  const [activeTab, setActiveTab] = useState<'PUBLIC' | 'INTERNAL'>('PUBLIC');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadTicket = () => {
    setLoading(true);
    setConflictMessage('');
    setStatusError('');
    fetchApi(`/tickets/${id}`)
      .then(data => {
        setTicket(data);
        setStatus(data.status);
        setItPriority(data.itPriority);
        setOwnerId(data.ticketOwnerId ? data.ticketOwnerId.toString() : 'unassigned');
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Ticket not found');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleUpdateOperations = async () => {
    if (!ticket) return;
    setSavingOps(true);
    setOpsMessage('');
    setConflictMessage('');
    setStatusError('');

    try {
      let currentTicket = ticket;

      // BR-08 & BR-10: If status changed, transition via status endpoint with OCC version
      if (status !== ticket.status) {
        const statusRes = await fetchApi(`/tickets/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({
            status,
            version: ticket.version ?? 1,
          }),
        });
        currentTicket = { ...currentTicket, ...statusRes, version: statusRes.version };
        setTicket(currentTicket);
        setStatus(statusRes.status);
      }

      // If priority or ticketOwner changed, update ticket metadata
      const nextOwnerId = ownerId === 'unassigned' ? null : parseInt(ownerId, 10);
      if (itPriority !== currentTicket.itPriority || nextOwnerId !== currentTicket.ticketOwnerId) {
        const metaRes = await fetchApi(`/tickets/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            itPriority,
            ticketOwnerId: nextOwnerId,
          }),
        });
        currentTicket = { ...currentTicket, ...metaRes };
        setTicket(currentTicket);
      }

      setOpsMessage('Updated successfully');
      setTimeout(() => setOpsMessage(''), 3000);
    } catch (err: any) {
      if (err.status === 409 || err.data?.error === 'CONFLICT') {
        setConflictMessage(
          err.message || 'This ticket was modified by another user while you were editing. Please refresh and review before retrying.'
        );
      } else if (err.status === 422 || err.data?.error === 'INVALID_TRANSITION') {
        setStatusError(err.message || 'Cannot perform this status transition.');
      } else {
        alert(err.message || 'Failed to update ticket');
      }
    } finally {
      setSavingOps(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    try {
      const endpoint = activeTab === 'PUBLIC' ? `/tickets/${id}/public-comments` : `/tickets/${id}/internal-notes`;
      const comment = await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify({ content: commentText })
      });
      
      setTicket(prev => {
        if (!prev) return prev;
        if (activeTab === 'PUBLIC') {
          return { ...prev, publicComments: [...(prev.publicComments || []), comment] };
        } else {
          return { ...prev, internalNotes: [...(prev.internalNotes || []), comment] };
        }
      });
      setCommentText('');
    } catch (err: any) {
      alert(err.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleActionSaved = (savedAction: ActionTaken) => {
    setTicket(prev => {
      if (!prev) return prev;
      const existing = prev.actionsTaken || [];
      const index = existing.findIndex(a => a.id === savedAction.id);
      let updatedActions: ActionTaken[];
      if (index >= 0) {
        updatedActions = [...existing];
        updatedActions[index] = savedAction;
      } else {
        updatedActions = [...existing, savedAction];
      }
      return { ...prev, actionsTaken: updatedActions };
    });
  };

  if (loading) return <div className="skeleton" style={{ height: '500px' }} />;
  if (error) return <div className="card" style={{ color: 'var(--color-error)' }}>{error}</div>;
  if (!ticket) return null;

  // Combine and sort activity
  const allActivity = [
    ...(ticket.publicComments || []).map(c => ({ ...c, type: 'PUBLIC' })),
    ...(ticket.internalNotes || []).map(n => ({ ...n, type: 'INTERNAL' }))
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      
      {/* Main Column */}
      <div style={{ flex: 1 }}>
        <button onClick={() => navigate('/staff/tickets')} style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', marginBottom: '16px', border: '1px solid var(--color-border)' }}>
          ← Back to Queue
        </button>

        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                Ticket #{ticket.id} · Created {new Date(ticket.createdAt).toLocaleString()}
              </div>
              <h1 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>{ticket.title}</h1>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Requester</div>
              <div>{ticket.requester?.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Requester Contact</div>
              <div>{ticket.requester?.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Category</div>
              <div>{ticket.category?.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Related System</div>
              <div>{ticket.relatedSystem?.name || 'None'}</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '20px', paddingTop: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Description</div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '14px' }}>{ticket.description}</div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '20px', paddingTop: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '16px', fontWeight: 600 }}>
              Attachments ({ticket.attachments?.length || 0})
            </div>
            {(!ticket.attachments || ticket.attachments.length === 0) ? (
              <div style={{ fontSize: '13px', color: 'var(--color-text-disabled)' }}>No attachments found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {ticket.attachments.map(att => (
                  <AttachmentItem key={att.id} attachment={att} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions Taken Section */}
        <ActionsTakenSection
          ticketId={ticket.id}
          actions={ticket.actionsTaken || []}
          onActionSaved={handleActionSaved}
          canManage={user?.role === 'IT_STAFF' || user?.role === 'ADMINISTRATOR'}
          currentUserName={user?.name}
        />

        {/* Activity Feed */}
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0' }}>Activity & Notes</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {allActivity.length === 0 ? (
              <div style={{ fontSize: '14px', color: 'var(--color-text-disabled)', textAlign: 'center', padding: '24px 0' }}>No activity yet.</div>
            ) : (
              allActivity.map((activity, idx) => {
                const isInternal = activity.type === 'INTERNAL';
                return (
                  <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      backgroundColor: activity.author?.role === 'REQUESTER' ? '#e8f5e9' : (isInternal ? '#fff3e0' : '#e3f2fd'), 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      color: activity.author?.role === 'REQUESTER' ? '#2e7d32' : (isInternal ? '#e65100' : '#1565c0'), 
                      fontWeight: 600, fontSize: '12px' 
                    }}>
                      {activity.author?.name?.substring(0, 2).toUpperCase() || '??'}
                    </div>
                    <div style={{ 
                      flex: 1, 
                      backgroundColor: isInternal ? '#fff8e1' : '#f9f9f9', 
                      padding: '12px 16px', 
                      borderRadius: '8px', 
                      border: `1px solid ${isInternal ? '#ffe082' : '#eaeaea'}` 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{activity.author?.name}</span>
                          {isInternal && <span style={{ marginLeft: '8px', fontSize: '10px', backgroundColor: '#ffe082', color: '#8d6e63', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>INTERNAL NOTE</span>}
                        </div>
                        <span style={{ fontSize: '12px', color: '#888' }}>{new Date(activity.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#333', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                        {activity.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button 
                onClick={() => setActiveTab('PUBLIC')}
                style={{ 
                  padding: '6px 12px', fontSize: '13px', fontWeight: 600, borderRadius: '4px', cursor: 'pointer',
                  backgroundColor: activeTab === 'PUBLIC' ? '#2e7d32' : 'transparent',
                  color: activeTab === 'PUBLIC' ? 'white' : '#555',
                  border: activeTab === 'PUBLIC' ? 'none' : '1px solid #d0d0d0'
                }}>
                Public Comment
              </button>
              <button 
                onClick={() => setActiveTab('INTERNAL')}
                style={{ 
                  padding: '6px 12px', fontSize: '13px', fontWeight: 600, borderRadius: '4px', cursor: 'pointer',
                  backgroundColor: activeTab === 'INTERNAL' ? '#f57f17' : 'transparent',
                  color: activeTab === 'INTERNAL' ? 'white' : '#555',
                  border: activeTab === 'INTERNAL' ? 'none' : '1px solid #d0d0d0'
                }}>
                Internal Note
              </button>
            </div>
            
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder={activeTab === 'PUBLIC' ? "Type a reply to the requester..." : "Type an internal note for staff..."}
              style={{ 
                width: '100%', padding: '12px', borderRadius: '8px', minHeight: '80px', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box',
                border: `1px solid ${activeTab === 'INTERNAL' ? '#ffe082' : '#d0d0d0'}`,
                backgroundColor: activeTab === 'INTERNAL' ? '#fffde7' : '#fff'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleAddComment} 
                disabled={submittingComment || !commentText.trim()}
                style={{ 
                  backgroundColor: activeTab === 'INTERNAL' ? '#f57f17' : '#2e7d32', 
                  color: 'white', border: 'none', fontWeight: 600, opacity: (submittingComment || !commentText.trim()) ? 0.7 : 1 
                }}
              >
                {submittingComment ? 'Saving...' : (activeTab === 'INTERNAL' ? 'Save Note' : 'Send Message')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Operations */}
      <div style={{ width: '300px', flexShrink: 0 }}>
        <div className="card" style={{ position: 'sticky', top: '88px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', paddingBottom: '12px', borderBottom: '1px solid #eaeaea' }}>Ticket Details</h2>
          
          {/* Concurrency Conflict Banner (UI-06 / AC-08) */}
          {conflictMessage && (
            <div 
              role="alert"
              data-testid="concurrency-conflict-banner"
              style={{ 
                backgroundColor: '#FEF2F2', 
                border: '1px solid #F87171', 
                color: '#991B1B', 
                padding: '12px', 
                borderRadius: '6px', 
                marginBottom: '16px',
                fontSize: '13px'
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>⚠️ Concurrency Conflict</div>
              <div style={{ marginBottom: '8px' }}>{conflictMessage}</div>
              <button 
                type="button"
                data-testid="refresh-ticket-button"
                onClick={loadTicket}
                style={{
                  backgroundColor: '#DC2626',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Refresh Ticket
              </button>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Status</label>
            {(() => {
              const currentStatus = ticket.status;
              const permittedNext = PERMITTED_STATUS_TRANSITIONS[currentStatus] || [];
              const filteredNext = user?.role === 'ADMINISTRATOR'
                ? permittedNext
                : permittedNext.filter(s => !(currentStatus === 'CLOSED' && s === 'REOPENED'));
              const availableStatuses = Array.from(new Set([currentStatus, ...filteredNext]));
              const isTerminal = availableStatuses.length === 1 && (currentStatus === 'CLOSED' || currentStatus === 'CANCELLED');

              return (
                <>
                  <select 
                    data-testid="ticket-status-select"
                    value={status} 
                    disabled={isTerminal}
                    onChange={e => setStatus(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px' }}
                  >
                    {availableStatuses.map(s => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s] || s}{s === currentStatus ? ' (Current)' : ''}
                      </option>
                    ))}
                  </select>
                  {isTerminal && (
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                      Terminal state · No transitions permitted
                    </div>
                  )}
                  {statusError && (
                    <div role="alert" style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>
                      {statusError}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>IT Priority</label>
            <select 
              value={itPriority} 
              onChange={e => setItPriority(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px' }}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Requested: {ticket.priority}</div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Assigned To</label>
            <select 
              value={ownerId} 
              onChange={e => setOwnerId(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px' }}
            >
              <option value="unassigned">Unassigned</option>
              <option value={user!.id.toString()}>Assign to Me</option>
              {/* If we had a list of all staff, map them here. We'll just show 'Me' or current owner if it's someone else for now */}
              {ticket.ticketOwnerId && ticket.ticketOwnerId !== user!.id && (
                <option value={ticket.ticketOwnerId.toString()}>{ticket.ticketOwner?.name}</option>
              )}
            </select>
          </div>

          <button 
            onClick={handleUpdateOperations}
            disabled={savingOps}
            style={{ width: '100%', backgroundColor: '#111', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 600, cursor: savingOps ? 'not-allowed' : 'pointer' }}
          >
            {savingOps ? 'Saving...' : 'Update Ticket'}
          </button>
          
          {opsMessage && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#2e7d32', textAlign: 'center', fontWeight: 600 }}>{opsMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}
