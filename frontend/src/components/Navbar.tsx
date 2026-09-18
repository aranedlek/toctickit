import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import type { Requester } from '../types';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [requester, setRequester] = useState<Requester | null>(null);
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('requester');
    if (saved) {
      setRequester(JSON.parse(saved));
      fetch('/api/requesters')
        .then(res => res.json())
        .then(data => setRequesters(data))
        .catch(console.error);
    } else {
      setRequester(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChangeUser = () => {
    localStorage.removeItem('requester');
    setRequester(null);
    setDropdownOpen(false);
    navigate('/');
  };

  const selectUser = (req: Requester) => {
    localStorage.setItem('requester', JSON.stringify(req));
    setRequester(req);
    setDropdownOpen(false);
    if (location.pathname === '/my-tickets') {
      window.location.reload();
    } else {
      navigate('/my-tickets');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getDept = (name: string) => {
    if (name.includes('David')) return 'HR';
    if (name.includes('Jennifer')) return 'Finance';
    if (name.includes('Michael')) return 'Engineering';
    if (name.includes('Sarah')) return 'Marketing';
    return 'IT';
  };

  return (
    <nav style={{
      height: '64px',
      backgroundColor: '#fff',
      borderBottom: '1px solid #eaeaea',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Left Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '32px', height: '32px', backgroundColor: '#2e7d32', borderRadius: '8px',
          color: 'white', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '-0.5px'
        }}>
          TT
        </div>
        <Link to={requester ? '/my-tickets' : '/'} style={{ color: '#111', fontSize: '18px', fontWeight: 700, textDecoration: 'none' }}>
          TokTickIT
        </Link>
      </div>

      {/* Center Links */}
      {requester && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/my-tickets" style={{ color: location.pathname === '/my-tickets' ? '#111' : '#555', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>My Tickets</Link>
          <Link to="/tickets/new" style={{ color: '#888', fontSize: '14px', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>+</span> New Ticket
          </Link>
        </div>
      )}

      {/* Right User Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px', justifyContent: 'flex-end' }}>
        {requester && (
          <>
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <div 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  backgroundColor: '#e8f5e9', padding: '4px 12px 4px 4px', 
                  borderRadius: '24px', cursor: 'pointer', border: '1px solid #c8e6c9'
                }}
              >
                <div style={{ width: '24px', height: '24px', backgroundColor: '#2e7d32', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>
                  {getInitials(requester.name)}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#2e7d32' }}>{requester.name}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  border: '1px solid #eaeaea', width: '260px', overflow: 'hidden', padding: '8px 0'
                }}>
                  <div style={{ padding: '4px 16px 8px 16px', fontSize: '10px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Acting As
                  </div>
                  
                  {requesters.map(req => (
                    <div 
                      key={req.id}
                      onClick={() => selectUser(req)}
                      style={{
                        padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                        backgroundColor: req.id === requester.id ? '#e8f5e9' : 'transparent',
                        cursor: 'pointer', transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => { if (req.id !== requester.id) e.currentTarget.style.backgroundColor = '#f5f5f5' }}
                      onMouseLeave={e => { if (req.id !== requester.id) e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <div style={{ width: '28px', height: '28px', backgroundColor: req.id === requester.id ? '#2e7d32' : '#e0e0e0', color: req.id === requester.id ? 'white' : '#666', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                        {getInitials(req.name)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: req.id === requester.id ? 700 : 500, color: req.id === requester.id ? '#2e7d32' : '#333' }}>
                          {req.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#888' }}>{getDept(req.name)}</div>
                      </div>
                      {req.id === requester.id && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      )}
                    </div>
                  ))}
                  
                  <div style={{ borderTop: '1px solid #eaeaea', margin: '8px 0', padding: '0 16px' }} />
                  <div 
                    onClick={handleChangeUser}
                    style={{ padding: '8px 16px', fontSize: '13px', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#111'}
                    onMouseLeave={e => e.currentTarget.style.color = '#555'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Switch Requester Screen...
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleChangeUser}
              style={{ 
                backgroundColor: '#e8f5e9', 
                color: '#2e7d32',
                border: '1px solid #c8e6c9',
                borderRadius: '24px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"></path><path d="M4 21v-5h5"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
              Change Requester
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
