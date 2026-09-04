import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Requester } from '../types';

export default function Navbar() {
  const navigate = useNavigate();
  const [requester, setRequester] = useState<Requester | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('requester');
    if (saved) {
      setRequester(JSON.parse(saved));
    }
  }, []);

  const handleChangeUser = () => {
    localStorage.removeItem('requester');
    setRequester(null);
    navigate('/');
  };

  return (
    <nav style={{
      height: '60px',
      backgroundColor: 'var(--color-primary)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <Link to={requester ? '/my-tickets' : '/'} style={{ color: 'white', fontSize: '20px', fontWeight: 700 }}>
        TokTickIT
      </Link>
      {requester && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px' }}>{requester.name}</span>
          <button 
            onClick={handleChangeUser}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              border: 'none',
              padding: '4px 8px',
              fontSize: '12px'
            }}>
            Switch
          </button>
        </div>
      )}
    </nav>
  );
}
