import React, { useState, useEffect } from 'react';
import {
  Tags,
  Plus,
  Trash2,
  FolderPlus,
  Sparkles,
  Loader2,
  Tag,
  ShoppingBag,
  Coffee,
  Plane,
  Heart,
  Home,
  BookOpen,
  DollarSign,
  Tv,
} from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const PRESET_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#a855f7',
  '#14b8a6',
];

const Categories = () => {
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Category Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/categories');
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setSaving(true);
      await api.post('/api/categories', {
        name: categoryName.trim(),
        color: selectedColor,
      });
      toast.success(`Category "${categoryName.trim()}" added successfully!`);
      setIsModalOpen(false);
      setCategoryName('');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      setDeleting(true);
      await api.delete(`/api/categories/${deletingCategory._id}`);
      toast.success(`Category "${deletingCategory.name}" removed!`);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your expense categories..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.95rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Categories
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Personalize tags and categories to organize and label your expenses.
          </p>
        </div>

        <button
          onClick={() => {
            setCategoryName('');
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Add Custom Category</span>
        </button>
      </div>

      {/* Category Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {categories.map((cat, idx) => {
          const catColor = cat.color || PRESET_COLORS[idx % PRESET_COLORS.length];
          return (
            <div
              key={cat._id}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '16px',
                borderLeft: `4px solid ${catColor}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: `${catColor}22`,
                    color: catColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Tag size={18} />
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                  {cat.name}
                </span>
              </div>

              {/* Only allow deleting if not default/protected */}
              <button
                onClick={() => setDeletingCategory(cat)}
                title="Delete Category"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-rose)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Category"
        maxWidth="460px"
      >
        <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
              Category Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Subscriptions, Gym, Pet Care"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              Accent Color
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {PRESET_COLORS.map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: col,
                    border: selectedColor === col ? '3px solid #ffffff' : 'none',
                    cursor: 'pointer',
                    boxShadow: selectedColor === col ? '0 0 10px rgba(255, 255, 255, 0.4)' : 'none',
                    transition: 'transform 0.15s ease',
                    transform: selectedColor === col ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              <span>Create Category</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Category Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deletingCategory?.name}"? Existing expenses tagged with this category will remain intact.`}
        isLoading={deleting}
      />
    </div>
  );
};

export default Categories;
