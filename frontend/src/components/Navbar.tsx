import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatRole = (role: string) => {
    if (role === 'IT_STAFF') return 'IT Staff';
    if (role === 'ADMINISTRATOR') return 'Admin';
    return 'Requester';
  };

  const isStaff = user?.role === 'IT_STAFF' || user?.role === 'ADMINISTRATOR';

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
        <Link to="/" style={{ color: '#111', fontSize: '18px', fontWeight: 700, textDecoration: 'none' }}>
          TokTickIT
        </Link>
      </div>

      {/* Center Links */}
      {user && !user.requiresPasswordChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {isStaff ? (
            <>
              <Link to="/staff/tickets" style={{ color: location.pathname === '/staff/tickets' ? '#111' : '#555', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Ticket Queue</Link>
              <Link to="/staff/settings" style={{ color: location.pathname === '/staff/settings' ? '#111' : '#555', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Settings</Link>
              {user.role === 'ADMINISTRATOR' && (
                <Link to="/admin/users" style={{ color: location.pathname === '/admin/users' ? '#111' : '#555', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>User Management</Link>
              )}
            </>
          ) : (
            <>
              <Link to="/my-tickets" style={{ color: location.pathname === '/my-tickets' ? '#111' : '#555', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>My Tickets</Link>
              <Link to="/tickets/new" style={{ color: '#888', fontSize: '14px', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>+</span> New Ticket
              </Link>
            </>
          )}
        </div>
      )}

      {/* Right User Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px', justifyContent: 'flex-end' }}>
        {user ? (
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
                {getInitials(user.name)}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#2e7d32' }}>{user.name} <span style={{fontWeight: 400, opacity: 0.8}}>({formatRole(user.role)})</span></span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>

            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '1px solid #eaeaea', width: '200px', overflow: 'hidden', padding: '8px 0'
              }}>
                <div style={{ padding: '8px 16px', fontSize: '13px', color: '#111', fontWeight: 600, borderBottom: '1px solid #eaeaea', marginBottom: '4px' }}>
                  {user.email}
                </div>
                
                <div 
                  onClick={() => { setDropdownOpen(false); navigate('/change-password'); }}
                  style={{ padding: '8px 16px', fontSize: '13px', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Change Password
                </div>
                
                <div 
                  onClick={handleLogout}
                  style={{ padding: '8px 16px', fontSize: '13px', color: '#d32f2f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Sign Out
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" style={{ fontSize: '14px', fontWeight: 600, color: '#2e7d32', textDecoration: 'none' }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
