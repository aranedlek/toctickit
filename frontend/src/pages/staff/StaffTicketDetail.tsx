import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Ticket } from '../../types';
import AttachmentItem from '../../components/AttachmentItem';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

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

  // Comm/Note state
  const [activeTab, setActiveTab] = useState<'PUBLIC' | 'INTERNAL'>('PUBLIC');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
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
  }, [id]);

  const handleUpdateOperations = async () => {
    setSavingOps(true);
    setOpsMessage('');
    try {
      const updated = await fetchApi(`/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          itPriority,
          ticketOwnerId: ownerId === 'unassigned' ? null : parseInt(ownerId)
        })
      });
      setTicket(updated);
      setOpsMessage('Updated successfully');
      setTimeout(() => setOpsMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update ticket');
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
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Status</label>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d0d0d0', fontSize: '13px' }}
            >
              <option value="NEW">New</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_FOR_REQUESTER">Waiting on User</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REOPENED">Reopened</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
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
