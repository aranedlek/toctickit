import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Requester, Category, RelatedSystem } from '../types';
import { validateAttachment } from '../utils/validateAttachment';

export default function CreateTicket() {
  const navigate = useNavigate();
  const [requester, setRequester] = useState<Requester | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [systems, setSystems] = useState<RelatedSystem[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [relatedSystemId, setRelatedSystemId] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('requester');
    if (!saved) {
      navigate('/');
    } else {
      setRequester(JSON.parse(saved));
    }

    Promise.all([
      fetch('http://localhost:3000/api/categories').then(r => r.json()),
      fetch('http://localhost:3000/api/related-systems').then(r => r.json())
    ]).then(([cats, sys]) => {
      setCategories(cats.categories ? cats.categories : cats);
      setSystems(sys);
    });
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      
      const validFiles = selectedFiles.filter(f => {
        const result = validateAttachment({ type: f.type, size: f.size }, files.length);
        if (!result.valid) {
          alert(`File error (${f.name}): ${result.error}`);
          return false;
        }
        return true;
      });

      if (files.length + validFiles.length > 5) {
        alert('You can only attach a maximum of 5 files.');
        return;
      }

      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!categoryId) newErrors.categoryId = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !requester) return;

    setIsSubmitting(true);

    try {
      // 1. Create ticket
      const ticketRes = await fetch('http://localhost:3000/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          categoryId: parseInt(categoryId),
          priority,
          relatedSystemId: relatedSystemId ? parseInt(relatedSystemId) : null,
          requesterId: requester.id
        })
      });

      if (!ticketRes.ok) throw new Error('Failed to create ticket');
      const ticket = await ticketRes.json();

      // 2. Upload attachments
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        await fetch(`http://localhost:3000/api/tickets/${ticket.id}/attachments`, {
          method: 'POST',
          body: formData
        });
      }

      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      alert('Error submitting ticket');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/my-tickets')} style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', marginBottom: '16px', border: '1px solid var(--color-border)' }}>
        ← Back
      </button>
      
      <div className="card">
        <h1>Create New Ticket</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Brief summary of the issue"
              maxLength={200}
              style={{ borderColor: errors.title ? 'var(--color-error)' : 'var(--color-border)' }}
            />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea 
              rows={4}
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Detailed description..."
              style={{ borderColor: errors.description ? 'var(--color-error)' : 'var(--color-border)' }}
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Category *</label>
              <select 
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)}
                style={{ borderColor: errors.categoryId ? 'var(--color-error)' : 'var(--color-border)' }}
              >
                <option value="">Select a category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <div className="form-error">{errors.categoryId}</div>}
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Related System (optional)</label>
            <select value={relatedSystemId} onChange={e => setRelatedSystemId(e.target.value)}>
              <option value="">None</option>
              {systems.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Attachments ({files.length}/5)</label>
            <div style={{
              border: '2px dashed var(--color-border)',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: 'var(--color-primary-pale)',
              marginBottom: '16px'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>☁ Drag & drop or click</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>JPG, PNG, WEBP, PDF · Max 5MB</p>
              <input 
                type="file" 
                multiple 
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
                style={{ opacity: 0, position: 'absolute', cursor: 'pointer', width: '200px', marginLeft: '-100px' }} 
              />
            </div>

            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {files.map((file, index) => (
                  <div key={index} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '14px' }}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    <button type="button" onClick={() => removeFile(index)} style={{ padding: '4px 8px', backgroundColor: 'var(--color-error)' }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: '32px', textAlign: 'right' }}>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
