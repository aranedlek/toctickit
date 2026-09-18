import { useEffect, useState } from 'react';
import type { User } from '../../types';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import UserFormModal from './UserFormModal';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const loadUsers = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10'
    });
    
    if (search) params.append('search', search);
    if (roleFilter) params.append('role', roleFilter);

    fetchApi(`/users?${params.toString()}`)
      .then((resData: any) => {
        setUsers(resData.data);
        setTotal(resData.total);
        setTotalPages(resData.totalPages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const delay = setTimeout(loadUsers, 300);
    return () => clearTimeout(delay);
  }, [search, roleFilter, page]);

  const handleSaveUser = async (data: any) => {
    if (editingUser) {
      await fetchApi(`/users/${editingUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    } else {
      await fetchApi('/users', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
    loadUsers();
  };

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'ADMINISTRATOR': return { bg: '#e8eaf6', color: '#3949ab' };
      case 'IT_STAFF': return { bg: '#e3f2fd', color: '#1565c0' };
      default: return { bg: '#f5f5f5', color: '#616161' };
    }
  };

  return (
    <div style={{ margin: '0 auto', padding: '16px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0', color: '#111' }}>User Management</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Manage system access and roles.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          style={{ backgroundColor: '#111', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
        >
          + Add New User
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 2, maxWidth: '400px' }}>
            <input 
              type="text" 
              placeholder="🔍 Search name or email..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ flex: 1, maxWidth: '200px' }}>
            <select 
              value={roleFilter} 
              onChange={e => { setRoleFilter(e.target.value); setPage(1); }} 
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
            >
              <option value="">All Roles</option>
              <option value="REQUESTER">Requester</option>
              <option value="IT_STAFF">IT Staff</option>
              <option value="ADMINISTRATOR">Administrator</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eaeaea', color: '#555' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No users found</td>
                </tr>
              ) : (
                users.map((user) => {
                  const roleStyle = getRoleBadgeColor(user.role);
                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f5f5f5', backgroundColor: '#fff' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}>
                      <td style={{ padding: '16px', fontWeight: 600, color: '#333' }}>
                        {user.name} {user.id === currentUser?.id && <span style={{ fontSize: '11px', backgroundColor: '#eee', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: 500 }}>You</span>}
                      </td>
                      <td style={{ padding: '16px', color: '#666' }}>{user.email}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          backgroundColor: roleStyle.bg, color: roleStyle.color, 
                          padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, display: 'inline-block'
                        }}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {user.isActive ? (
                          <span style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>Active</span>
                        ) : (
                          <span style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>Inactive</span>
                        )}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button 
                          onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                          style={{ backgroundColor: 'transparent', border: '1px solid #d0d0d0', color: '#333', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #eaeaea' }}>
            <div style={{ fontSize: '13px', color: '#666' }}>
              Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} users
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                disabled={page === 1} onClick={() => setPage(p => p - 1)}
                style={{ padding: '6px 12px', border: '1px solid #e0e0e0', backgroundColor: '#fff', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1} onClick={() => setPage(i + 1)}
                  style={{
                    padding: '6px 12px', border: '1px solid #e0e0e0',
                    backgroundColor: page === i + 1 ? '#111' : '#fff', color: page === i + 1 ? 'white' : '#333',
                    borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                style={{ padding: '6px 12px', border: '1px solid #e0e0e0', backgroundColor: '#fff', borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <UserFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
        currentAdminId={currentUser?.id}
      />
    </div>
  );
}
