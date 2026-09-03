import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { validateAttachment, formatBytes } from '../utils';
import type { Category, RelatedSystem, Priority, PendingAttachment } from '../types';

interface Props {
  requesterId: number;
  onSuccess: (ticketId: number) => void;
  onBack: () => void;
}

interface FormErrors {
  title?: string;
  description?: string;
  categoryId?: string;
}

export default function CreateTicket({ requesterId, onSuccess, onBack }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [relatedSystems, setRelatedSystems] = useState<RelatedSystem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [relatedSystemId, setRelatedSystemId] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [attachmentErrors, setAttachmentErrors] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getRelatedSystems()]).then(([cats, sys]) => {
      setCategories(cats);
      setRelatedSystems(sys);
    });
  }, []);

  function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files);
    const newErrors: string[] = [];

    for (const file of incoming) {
      const result = validateAttachment(file, attachments.length);
      if (!result.valid) {
        newErrors.push(`${file.name}: ${result.error}`);
      } else {
        setAttachments((a) => [...a, { file, id: crypto.randomUUID() }]);
      }
    }
    setAttachmentErrors(newErrors);
  }

  function removeAttachment(id: string) {
    setAttachments((a) => a.filter((f) => f.id !== id));
    setAttachmentErrors([]);
  }

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (!categoryId) errs.categoryId = 'Category is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setGlobalError(null);

    try {
      const ticket = await api.createTicket({
        title: title.trim(),
        description: description.trim(),
        categoryId: categoryId!,
        priority,
        requesterId,
        relatedSystemId,
      });

      // Upload attachments sequentially
      for (const { file } of attachments) {
        await api.uploadAttachment(ticket.id, file).catch(console.error);
      }

      onSuccess(ticket.id);
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Failed to create ticket');
      setSubmitting(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <div className="flex items-center gap-3 mb-4">
        <button
          id="back-btn"
          className="btn btn-secondary btn-sm"
          onClick={onBack}
          aria-label="Back to My Tickets"
        >
          ← Back
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>
          Create New Ticket
        </h1>
      </div>

      <div className="card">
        <form className="card-body" onSubmit={handleSubmit} noValidate>
          {globalError && (
            <div
              style={{
                background: '#FDEDEC',
                color: 'var(--color-error)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 20,
                fontSize: 13,
              }}
              role="alert"
            >
              ⚠️ {globalError}
            </div>
          )}

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="ticket-title">
              Title <span className="required">*</span>
            </label>
            <input
              id="ticket-title"
              className={`form-control ${errors.title ? 'error' : ''}`}
              type="text"
              placeholder="Brief summary of your issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p className="form-error" id="title-error" role="alert">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="ticket-description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="ticket-description"
              className={`form-control ${errors.description ? 'error' : ''}`}
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              aria-describedby={errors.description ? 'desc-error' : undefined}
            />
            {errors.description && (
              <p className="form-error" id="desc-error" role="alert">
                {errors.description}
              </p>
            )}
          </div>

          {/* Category + Priority row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="ticket-category">
                Category <span className="required">*</span>
              </label>
              <select
                id="ticket-category"
                className={`form-control ${errors.categoryId ? 'error' : ''}`}
                value={categoryId ?? ''}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                aria-describedby={errors.categoryId ? 'cat-error' : undefined}
              >
                <option value="">Select category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="form-error" id="cat-error" role="alert">
                  {errors.categoryId}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ticket-priority">
                Priority
              </label>
              <select
                id="ticket-priority"
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Related System */}
          <div className="form-group">
            <label className="form-label" htmlFor="ticket-system">
              Related System{' '}
              <span style={{ color: 'var(--color-text-disabled)', fontWeight: 400 }}>(optional)</span>
            </label>
            <select
              id="ticket-system"
              className="form-control"
              value={relatedSystemId ?? ''}
              onChange={(e) => setRelatedSystemId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">No related system</option>
              {relatedSystems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Attachments */}
          <div className="form-group">
            <label className="form-label">
              Attachments{' '}
              <span style={{ color: 'var(--color-text-disabled)', fontWeight: 400 }}>(optional)</span>
            </label>
            <div
              id="dropzone"
              className={`dropzone ${dragging ? 'drag-over' : ''}`}
              role="button"
              tabIndex={0}
              aria-label="Upload attachments"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                addFiles(e.dataTransfer.files);
              }}
            >
              <div className="dropzone-icon">☁</div>
              <div>Drag & drop files here or click to browse</div>
              <div className="dropzone-hint">JPG, PNG, WEBP, PDF · Max 5 MB per file · Up to 5 files</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && addFiles(e.target.files)}
              aria-label="File input"
            />

            {attachmentErrors.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {attachmentErrors.map((err, i) => (
                  <p key={i} className="form-error">{err}</p>
                ))}
              </div>
            )}

            {attachments.length > 0 && (
              <div className="attachment-list" role="list" aria-label="Pending attachments">
                {attachments.map(({ file, id }) => (
                  <div key={id} className="attachment-chip" role="listitem">
                    <span>📄</span>
                    <span>{file.name}</span>
                    <span style={{ color: 'var(--color-text-disabled)' }}>
                      ({formatBytes(file.size)})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(id)}
                      aria-label={`Remove ${file.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              id="submit-ticket-btn"
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? '⏳ Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
