import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Category, RelatedSystem } from '../types';
import { validateAttachment } from '../utils/validateAttachment';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '../lib/api';

export default function CreateTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
    Promise.all([
      fetchApi('/categories'),
      fetchApi('/related-systems')
    ]).then(([cats, sys]) => {
      setCategories(cats.categories ? cats.categories : cats);
      setSystems(sys);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
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
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!categoryId) newErrors.categoryId = 'Please select a category.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;

    setIsSubmitting(true);

    try {
      const ticket = await fetchApi('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          categoryId: parseInt(categoryId),
          priority,
          relatedSystemId: relatedSystemId ? parseInt(relatedSystemId) : null,
        })
      });

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        await fetchApi(`/tickets/${ticket.id}/attachments`, {
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

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Function to mock department since it's not in our type
  const getDept = (name: string) => {
    if (name.includes('David')) return 'HR';
    if (name.includes('Jennifer')) return 'Finance';
    if (name.includes('Michael')) return 'Engineering';
    if (name.includes('Sarah')) return 'Marketing';
    return 'IT';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', sans-serif", paddingBottom: '40px' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0', color: '#111' }}>New Ticket</h1>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Describe your IT issue and our team will help you out.</p>
        </div>
        <button 
          onClick={() => navigate('/my-tickets')} 
          style={{ 
            backgroundColor: '#fff', 
            color: '#555', 
            border: '1px solid #e0e0e0', 
            borderRadius: '24px', 
            padding: '6px 16px', 
            fontSize: '13px', 
            fontWeight: 600, 
            cursor: 'pointer' 
          }}
        >
          ← Back
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Ticket Details Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          border: '1px solid #eaeaea',
          padding: '32px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111', margin: '0 0 24px 0' }}>Ticket Details</h2>
          
          {/* Row 1: Requester & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                Requester (Auto-populated)
              </label>
              <input 
                type="text" 
                value={user ? `${user.name} (${getDept(user.name)})` : ''} 
                disabled
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #eaeaea', backgroundColor: '#fafafa', color: '#333', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                Ticket Date
              </label>
              <input 
                type="text" 
                value={currentDate}
                disabled
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #eaeaea', backgroundColor: '#fafafa', color: '#333', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Row 2: Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
              Title (Summary) <span style={{color: 'red'}}>*</span>
            </label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Brief description of the issue"
              maxLength={200}
              style={{ 
                width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px',
                border: `1px solid ${errors.title ? '#d32f2f' : '#d0d0d0'}`,
                backgroundColor: '#fff', color: '#111'
              }}
            />
            {errors.title && (
              <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px' }}>⚠</span> {errors.title}
              </div>
            )}
          </div>

          {/* Row 3: Category, System, Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                Category <span style={{color: 'red'}}>*</span>
              </label>
              <select 
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)}
                style={{ 
                  width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px',
                  border: `1px solid ${errors.categoryId ? '#d32f2f' : '#d0d0d0'}`,
                  backgroundColor: '#fff', color: categoryId ? '#111' : '#666', appearance: 'auto'
                }}
              >
                <option value="" disabled>Select a category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && (
                <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '14px' }}>⚠</span> {errors.categoryId}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                Related System
              </label>
              <select 
                value={relatedSystemId} 
                onChange={e => setRelatedSystemId(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d0d0d0', backgroundColor: '#fff', color: relatedSystemId ? '#111' : '#666', fontSize: '14px', appearance: 'auto' }}
              >
                <option value="">None</option>
                {systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                Requested Priority
              </label>
              <select 
                value={priority} 
                onChange={e => setPriority(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d0d0d0', backgroundColor: '#fff', color: '#111', fontSize: '14px', appearance: 'auto' }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Row 4: Description */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
              Description <span style={{color: 'red'}}>*</span>
            </label>
            <textarea 
              rows={4}
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Please describe the issue in detail — include steps to reproduce, error messages, etc."
              style={{ 
                width: '100%', padding: '12px 14px', borderRadius: '8px', fontSize: '14px', resize: 'vertical',
                border: `1px solid ${errors.description ? '#d32f2f' : '#d0d0d0'}`,
                backgroundColor: '#fff', color: '#111', fontFamily: 'inherit'
              }}
            />
            {errors.description && (
              <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px' }}>⚠</span> {errors.description}
              </div>
            )}
          </div>
        </div>

        {/* Attachments Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          border: '1px solid #eaeaea',
          padding: '32px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111', margin: 0 }}>Attachments</h2>
            <span style={{ fontSize: '13px', color: '#666' }}>{files.length}/5 files</span>
          </div>

          <div style={{
            border: '2px dashed #d0d0d0',
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center',
            backgroundColor: '#fafafa',
            position: 'relative'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: '#333' }}>Drag & drop or click</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>JPG, PNG, WEBP, PDF · Max 5MB</p>
            <input 
              type="file" 
              multiple 
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleFileChange}
              style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }} 
            />
          </div>

          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              {files.map((file, index) => (
                <div key={index} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', border: '1px solid #eaeaea', borderRadius: '8px',
                  backgroundColor: '#fff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                      <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                    <span style={{ fontSize: '13px', color: '#333', fontWeight: 500 }}>{file.name}</span>
                    <span style={{ fontSize: '12px', color: '#888' }}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button type="button" onClick={() => removeFile(index)} style={{ border: 'none', background: 'transparent', color: '#d32f2f', cursor: 'pointer', padding: '4px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" onClick={() => navigate('/my-tickets')} style={{ padding: '10px 24px', backgroundColor: '#fff', color: '#333', border: '1px solid #e0e0e0', borderRadius: '24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} style={{ padding: '10px 24px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '14px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
