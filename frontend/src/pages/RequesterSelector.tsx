import { useEffect, useState } from 'react';

import type { Requester } from '../types';

export default function RequesterSelector() {
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    fetch('http://localhost:3000/api/requesters')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load requesters');
        return res.json();
      })
      .then((data) => {
        setRequesters(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSelect = (requester: Requester) => {
    localStorage.setItem('requester', JSON.stringify(requester));
    // force a full reload so the Navbar picks up the new user
    window.location.href = '/my-tickets';
  };

  if (loading) {
    return <div className="skeleton" style={{ width: '100%', height: '200px' }} />;
  }

  if (error) {
    return <div style={{ color: 'var(--color-error)' }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1>Who are you today?</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
        Select a Development Requester to test requester-specific ticket behavior. This is not a login screen. Authentication and role-based access will be introduced in Lab 3.
      </p>

      {requesters.length === 0 ? (
        <div className="card">No active requesters found in database.</div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px' 
        }}>
          {requesters.map((r) => (
            <div 
              key={r.id} 
              className="card" 
              style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onClick={() => handleSelect(r)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--color-primary-pale)', 
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 600,
                margin: '0 auto 16px auto'
              }}>
                {r.name.charAt(0)}
              </div>
              <h3 style={{ margin: '0 0 4px 0' }}>{r.name}</h3>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{r.email}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
