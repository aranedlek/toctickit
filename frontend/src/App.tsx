import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

interface Category {
  id: number;
  name: string;
}

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch categories`);
      }
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <header className="mb-4 text-center">
        <h1 className="display-4 fw-bold text-primary">TokTickIT</h1>
        <p className="lead text-secondary">Ticketing System Categories</p>
      </header>

      <main className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          {loading && (
            <div className="alert alert-info text-center" role="status">
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Loading categories...
            </div>
          )}

          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">Categories</h5>
              </div>
              <ul className="list-group list-group-flush" aria-label="Category list">
                {categories.map((category) => (
                  <li key={category.id} className="list-group-item d-flex align-items-center">
                    <span className="badge bg-secondary me-3">#{category.id}</span>
                    <span className="fw-medium">{category.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
