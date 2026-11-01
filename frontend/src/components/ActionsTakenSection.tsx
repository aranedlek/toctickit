import React, { useState, useEffect } from 'react';
import type { ActionTaken } from '../types';
import { fetchApi } from '../lib/api';

interface ActionsTakenSectionProps {
  ticketId: number;
  actions: ActionTaken[];
  onActionSaved: (action: ActionTaken) => void;
  canManage: boolean;
  currentUserName?: string;
}

export default function ActionsTakenSection({
  ticketId,
  actions,
  onActionSaved,
  canManage,
  currentUserName,
}: ActionsTakenSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionTaken | null>(null);

  // Form states
  const [actionDateTime, setActionDateTime] = useState('');
  const [actionDescription, setActionDescription] = useState('');
  const [result, setResult] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpNote, setFollowUpNote] = useState('');
  const [attachmentNotes, setAttachmentNotes] = useState('');

  // UI / validation states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  // Format local date for datetime-local input
  const getLocalIsoString = (d: Date = new Date()) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openCreateModal = () => {
    setEditingAction(null);
    setActionDateTime(getLocalIsoString());
    setActionDescription('');
    setResult('');
    setFollowUpRequired(false);
    setFollowUpNote('');
    setAttachmentNotes('');
    setErrors({});
    setApiError('');
    setModalOpen(true);
  };

  const openEditModal = (action: ActionTaken) => {
    setEditingAction(action);
    const d = new Date(action.actionDateTime);
    setActionDateTime(!isNaN(d.getTime()) ? getLocalIsoString(d) : getLocalIsoString());
    setActionDescription(action.actionDescription);
    setResult(action.result);
    setFollowUpRequired(action.followUpRequired);
    setFollowUpNote(action.followUpNote || '');
    setAttachmentNotes(action.attachmentNotes || '');
    setErrors({});
    setApiError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAction(null);
    setErrors({});
    setApiError('');
  };

  // Keyboard navigation & accessibility: Close modal on Escape
  useEffect(() => {
    if (!modalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!actionDescription || actionDescription.trim().length < 5) {
      newErrors.actionDescription = 'Action description is required (min 5 characters).';
    }

    if (!result || result.trim().length < 3) {
      newErrors.result = 'Result is required (min 3 characters).';
    }

    if (followUpRequired && (!followUpNote || followUpNote.trim().length === 0)) {
      newErrors.followUpNote = 'Follow-up note is required when follow-up is needed.';
    }

    if (attachmentNotes && attachmentNotes.length > 255) {
      newErrors.attachmentNotes = 'Attachment notes must not exceed 255 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setApiError('');

    const payload = {
      actionDateTime: actionDateTime ? new Date(actionDateTime).toISOString() : new Date().toISOString(),
      actionDescription: actionDescription.trim(),
      result: result.trim(),
      followUpRequired,
      followUpNote: followUpRequired ? followUpNote.trim() : null,
      attachmentNotes: attachmentNotes.trim() ? attachmentNotes.trim() : null,
    };

    try {
      let savedAction: ActionTaken;
      if (editingAction) {
        savedAction = await fetchApi(`/tickets/${ticketId}/actions/${editingAction.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        savedAction = await fetchApi(`/tickets/${ticketId}/actions`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      onActionSaved(savedAction);
      closeModal();
    } catch (err: any) {
      setApiError(err.message || 'Failed to save action taken. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--color-primary, #2D6A4F)' }}>
            Actions Taken
          </h2>
          <span
            style={{
              backgroundColor: 'var(--color-primary-light, #D8F3DC)',
              color: 'var(--color-primary, #2D6A4F)',
              fontSize: '12px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
            }}
          >
            {actions.length}
          </span>
        </div>

        {canManage && (
          <button
            type="button"
            id="record-action-btn"
            data-testid="record-action-btn"
            onClick={openCreateModal}
            style={{
              backgroundColor: 'var(--color-primary, #2D6A4F)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span>+</span> Record Action Taken
          </button>
        )}
      </div>

      {/* Body: Empty State or Table */}
      {actions.length === 0 ? (
        <div
          data-testid="actions-empty-state"
          style={{
            padding: '32px 16px',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface, #F0F7F4)',
            borderRadius: '8px',
            border: '1px dashed var(--color-border-dark, #B7E4C7)',
          }}
        >
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text, #1B4332)', marginBottom: '4px' }}>
            No actions taken recorded yet
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted, #52796F)' }}>
            {canManage
              ? 'Click "+ Record Action Taken" above to log work done on this ticket.'
              : 'Work logged by IT Staff will appear here in chronological order.'}
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-surface, #F0F7F4)',
                  borderBottom: '2px solid var(--color-border, #D8F3DC)',
                  color: 'var(--color-text-muted, #52796F)',
                }}
              >
                <th style={{ padding: '10px 12px', fontWeight: 600, width: '160px' }}>Date / Time</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Action Description</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Result</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, width: '150px' }}>Performed By</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, width: '160px' }}>Follow-Up</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, width: '130px' }}>Attachment</th>
                {canManage && <th style={{ padding: '10px 12px', fontWeight: 600, width: '70px', textAlign: 'center' }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {actions.map((act) => (
                <tr
                  key={act.id}
                  data-testid={`action-row-${act.id}`}
                  style={{
                    borderBottom: '1px solid var(--color-border, #D8F3DC)',
                    verticalAlign: 'top',
                  }}
                >
                  <td style={{ padding: '12px', whiteSpace: 'nowrap', color: 'var(--color-text-muted, #52796F)' }}>
                    {new Date(act.actionDateTime).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--color-text, #1B4332)', whiteSpace: 'pre-wrap' }}>
                    <strong>{act.actionDescription}</strong>
                  </td>
                  <td style={{ padding: '12px', color: '#2B2D42', whiteSpace: 'pre-wrap' }}>
                    {act.result}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text, #1B4332)' }}>
                      {act.performedBy?.name || 'Staff Member'}
                    </div>
                    {act.performedBy?.role && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-text-muted, #52796F)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {act.performedBy.role.replace('_', ' ')}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {act.followUpRequired ? (
                      <div>
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#FEF3C7',
                            color: '#B45309',
                            border: '1px solid #FDE68A',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            fontSize: '11px',
                            marginBottom: '4px',
                          }}
                        >
                          ⚠️ Follow-up Required
                        </span>
                        {act.followUpNote && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#92400E',
                              backgroundColor: '#FFFBEB',
                              padding: '6px 8px',
                              borderRadius: '4px',
                              marginTop: '4px',
                              lineHeight: '1.4',
                            }}
                          >
                            {act.followUpNote}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#F3F4F6',
                          color: '#6B7280',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 500,
                        }}
                      >
                        None
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--color-text-muted, #52796F)' }}>
                    {act.attachmentNotes ? (
                      <div
                        title={act.attachmentNotes}
                        style={{
                          fontSize: '12px',
                          backgroundColor: '#F0F9FF',
                          color: '#0369A1',
                          border: '1px solid #BAE6FD',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          wordBreak: 'break-word',
                        }}
                      >
                        📎 {act.attachmentNotes}
                      </div>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>—</span>
                    )}
                  </td>
                  {canManage && (
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        type="button"
                        data-testid={`edit-action-${act.id}`}
                        onClick={() => openEditModal(act)}
                        style={{
                          backgroundColor: 'transparent',
                          color: 'var(--color-primary, #2D6A4F)',
                          border: '1px solid var(--color-border-dark, #B7E4C7)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record / Edit Action Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="action-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid var(--color-border, #D8F3DC)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border, #D8F3DC)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-surface, #F0F7F4)',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
              }}
            >
              <h3
                id="action-modal-title"
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--color-primary, #2D6A4F)',
                }}
              >
                {editingAction ? 'Edit Action Taken' : 'Record Action Taken'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  color: 'var(--color-text-muted, #52796F)',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              {apiError && (
                <div
                  role="alert"
                  style={{
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FECACA',
                    color: '#B91C1C',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px',
                  }}
                >
                  {apiError}
                </div>
              )}

              {/* Performed By (Read-only) */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="action-performer"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text, #1B4332)', marginBottom: '6px' }}
                >
                  Performed By
                </label>
                <input
                  id="action-performer"
                  type="text"
                  readOnly
                  value={editingAction?.performedBy?.name || currentUserName || 'Current User'}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#F9FAFB',
                    fontSize: '13px',
                    color: '#6B7280',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Action Date & Time */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="action-datetime"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text, #1B4332)', marginBottom: '6px' }}
                >
                  Action Date & Time <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  id="action-datetime"
                  type="datetime-local"
                  required
                  value={actionDateTime}
                  onChange={(e) => setActionDateTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Action Description */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="action-description"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text, #1B4332)', marginBottom: '6px' }}
                >
                  Action Description <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  id="action-description"
                  required
                  rows={3}
                  placeholder="Describe the technical action or troubleshooting step executed (min 5 chars)..."
                  value={actionDescription}
                  onChange={(e) => {
                    setActionDescription(e.target.value);
                    if (errors.actionDescription) setErrors((prev) => ({ ...prev, actionDescription: '' }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${errors.actionDescription ? '#EF4444' : '#D1D5DB'}`,
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    lineHeight: '1.5',
                  }}
                />
                {errors.actionDescription && (
                  <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.actionDescription}
                  </div>
                )}
              </div>

              {/* Result */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="action-result"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text, #1B4332)', marginBottom: '6px' }}
                >
                  Result <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  id="action-result"
                  required
                  rows={2}
                  placeholder="Outcome of the action, test outcome, or device response (min 3 chars)..."
                  value={result}
                  onChange={(e) => {
                    setResult(e.target.value);
                    if (errors.result) setErrors((prev) => ({ ...prev, result: '' }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${errors.result ? '#EF4444' : '#D1D5DB'}`,
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    lineHeight: '1.5',
                  }}
                />
                {errors.result && (
                  <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.result}
                  </div>
                )}
              </div>

              {/* Follow-Up Required Toggle & Note */}
              <div
                style={{
                  marginBottom: '16px',
                  backgroundColor: followUpRequired ? '#FFFBEB' : '#F9FAFB',
                  border: `1px solid ${followUpRequired ? '#FDE68A' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: followUpRequired ? '10px' : 0 }}>
                  <input
                    id="action-follow-up-toggle"
                    type="checkbox"
                    checked={followUpRequired}
                    onChange={(e) => {
                      setFollowUpRequired(e.target.checked);
                      if (!e.target.checked) {
                        setErrors((prev) => ({ ...prev, followUpNote: '' }));
                      }
                    }}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-primary, #2D6A4F)' }}
                  />
                  <label
                    htmlFor="action-follow-up-toggle"
                    style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text, #1B4332)', cursor: 'pointer' }}
                  >
                    Further Follow-Up Required?
                  </label>
                </div>

                {followUpRequired && (
                  <div>
                    <label
                      htmlFor="action-follow-up-note"
                      style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#92400E', marginBottom: '4px' }}
                    >
                      Follow-Up Note <span style={{ color: '#EF4444' }}>* (Mandatory when follow-up is required)</span>
                    </label>
                    <textarea
                      id="action-follow-up-note"
                      rows={2}
                      placeholder="Specify next action required, scheduled time, or colleague to contact..."
                      value={followUpNote}
                      onChange={(e) => {
                        setFollowUpNote(e.target.value);
                        if (errors.followUpNote) setErrors((prev) => ({ ...prev, followUpNote: '' }));
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${errors.followUpNote ? '#EF4444' : '#D1D5DB'}`,
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                    {errors.followUpNote && (
                      <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                        {errors.followUpNote}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Attachment Notes */}
              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="action-attachment-notes"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text, #1B4332)', marginBottom: '6px' }}
                >
                  Attachment Notes <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #52796F)', fontWeight: 400 }}>(Optional file / image references)</span>
                </label>
                <input
                  id="action-attachment-notes"
                  type="text"
                  placeholder="e.g., photo_motherboard.jpg, network_trace.pcap"
                  value={attachmentNotes}
                  onChange={(e) => {
                    setAttachmentNotes(e.target.value);
                    if (errors.attachmentNotes) setErrors((prev) => ({ ...prev, attachmentNotes: '' }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${errors.attachmentNotes ? '#EF4444' : '#D1D5DB'}`,
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.attachmentNotes && (
                  <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.attachmentNotes}
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  id="cancel-action-btn"
                  onClick={closeModal}
                  disabled={saving}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-action-btn"
                  data-testid="save-action-btn"
                  disabled={saving}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--color-primary, #2D6A4F)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Saving...' : editingAction ? 'Update Action' : 'Save Action Taken'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
