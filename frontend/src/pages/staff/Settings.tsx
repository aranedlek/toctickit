import { useEffect, useState } from 'react';
import type { Category, RelatedSystem } from '../../types';
import { fetchApi } from '../../lib/api';

export default function Settings() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [systems, setSystems] = useState<RelatedSystem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals for add/edit
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editSystem, setEditSystem] = useState<RelatedSystem | null>(null);

  const [categoryName, setCategoryName] = useState('');
  const [systemName, setSystemName] = useState('');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, sys] = await Promise.all([
        fetchApi('/categories'),
        fetchApi('/related-systems')
      ]);
      setCategories(cats.categories || cats); // handle both array and object wrapper if any
      setSystems(sys);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Category Actions
  const openCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditCategory(cat);
      setCategoryName(cat.name);
    } else {
      setEditCategory(null);
      setCategoryName('');
    }
    setIsCategoryModalOpen(true);
  };

  const saveCategory = async () => {
    if (!categoryName.trim()) return;
    try {
      if (editCategory) {
        await fetchApi(`/categories/${editCategory.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: categoryName })
        });
      } else {
        await fetchApi('/categories', {
          method: 'POST',
          body: JSON.stringify({ name: categoryName })
        });
      }
      setIsCategoryModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error saving category');
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await fetchApi(`/categories/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  // System Actions
  const openSystemModal = (sys?: RelatedSystem) => {
    if (sys) {
      setEditSystem(sys);
      setSystemName(sys.name);
    } else {
      setEditSystem(null);
      setSystemName('');
    }
    setIsSystemModalOpen(true);
  };

  const saveSystem = async () => {
    if (!systemName.trim()) return;
    try {
      if (editSystem) {
        await fetchApi(`/related-systems/${editSystem.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: systemName })
        });
      } else {
        await fetchApi('/related-systems', {
          method: 'POST',
          body: JSON.stringify({ name: systemName })
        });
      }
      setIsSystemModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error saving system');
    }
  };

  const deleteSystem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this system?')) return;
    try {
      await fetchApi(`/related-systems/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete system');
    }
  };

  return (
    <div style={{ margin: '0 auto', padding: '16px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0', color: '#111' }}>Global Settings</h1>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Manage categories and related systems for tickets.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Categories Section */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Categories</h2>
            <button 
              onClick={() => openCategoryModal()}
              style={{ backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              + Add Category
            </button>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eaeaea', color: '#555' }}>
                <th style={{ padding: '12px 0', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 0', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={2} style={{ padding: '20px 0', textAlign: 'center', color: '#888' }}>Loading...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={2} style={{ padding: '20px 0', textAlign: 'center', color: '#888' }}>No categories found</td></tr>
              ) : (
                categories.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px 0', color: '#333', fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: '12px 0', textAlign: 'right' }}>
                      <button onClick={() => openCategoryModal(c)} style={{ backgroundColor: 'transparent', border: 'none', color: '#1565c0', cursor: 'pointer', fontWeight: 600, fontSize: '13px', marginRight: '12px' }}>Edit</button>
                      <button onClick={() => deleteCategory(c.id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#c62828', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Systems Section */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Related Systems</h2>
            <button 
              onClick={() => openSystemModal()}
              style={{ backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              + Add System
            </button>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eaeaea', color: '#555' }}>
                <th style={{ padding: '12px 0', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 0', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={2} style={{ padding: '20px 0', textAlign: 'center', color: '#888' }}>Loading...</td></tr>
              ) : systems.length === 0 ? (
                <tr><td colSpan={2} style={{ padding: '20px 0', textAlign: 'center', color: '#888' }}>No systems found</td></tr>
              ) : (
                systems.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px 0', color: '#333', fontWeight: 500 }}>{s.name}</td>
                    <td style={{ padding: '12px 0', textAlign: 'right' }}>
                      <button onClick={() => openSystemModal(s)} style={{ backgroundColor: 'transparent', border: 'none', color: '#1565c0', cursor: 'pointer', fontWeight: 600, fontSize: '13px', marginRight: '12px' }}>Edit</button>
                      <button onClick={() => deleteSystem(s.id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#c62828', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '400px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>{editCategory ? 'Edit Category' : 'New Category'}</h3>
            <input 
              type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} 
              placeholder="Category Name"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsCategoryModalOpen(false)} style={{ padding: '8px 16px', border: 'none', backgroundColor: '#f5f5f5', borderRadius: '24px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveCategory} style={{ padding: '8px 16px', border: 'none', backgroundColor: '#2e7d32', color: 'white', borderRadius: '24px', cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* System Modal */}
      {isSystemModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '400px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>{editSystem ? 'Edit System' : 'New System'}</h3>
            <input 
              type="text" value={systemName} onChange={e => setSystemName(e.target.value)} 
              placeholder="System Name"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsSystemModalOpen(false)} style={{ padding: '8px 16px', border: 'none', backgroundColor: '#f5f5f5', borderRadius: '24px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveSystem} style={{ padding: '8px 16px', border: 'none', backgroundColor: '#2e7d32', color: 'white', borderRadius: '24px', cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
