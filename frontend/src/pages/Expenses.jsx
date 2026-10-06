import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Download,
  Calendar,
  CreditCard,
  Edit2,
  Trash2,
  RotateCcw,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import ExpenseFormModal from '../components/expenses/ExpenseFormModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const PAYMENT_METHODS = ['All', 'UPI', 'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other'];
const DATE_RANGES = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'day' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Quarter', value: 'quarterly' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom Range', value: 'custom' },
];

const Expenses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Check query params for auto-open add modal
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsFormModalOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  // Load Categories
  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories');
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch categories:', err.message);
    }
  };

  // Fetch Expenses with all active query params
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedPaymentMethod !== 'All') params.paymentMethod = selectedPaymentMethod;
      if (selectedDateRange !== 'all' && selectedDateRange !== 'custom') {
        params.dateRange = selectedDateRange;
      }
      if (selectedDateRange === 'custom') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }
      if (sortOption) params.sort = sortOption;

      const res = await api.get('/api/expenses', { params });
      if (res.data?.data) {
        setExpenses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedPaymentMethod, selectedDateRange, startDate, endDate, sortOption, toast]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedPaymentMethod('All');
    setSelectedDateRange('all');
    setStartDate('');
    setEndDate('');
    setSortOption('newest');
  };

  // Create or Update
  const handleSaveExpense = async (formData) => {
    try {
      setActionLoading(true);
      if (editingExpense) {
        await api.put(`/api/expenses/${editingExpense._id}`, formData);
        toast.success('Expense updated successfully!');
      } else {
        await api.post('/api/expenses', formData);
        toast.success('Expense recorded successfully!');
      }
      setIsFormModalOpen(false);
      setEditingExpense(null);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete
  const handleDeleteExpense = async () => {
    if (!deletingExpense) return;
    try {
      setActionLoading(true);
      await api.delete(`/api/expenses/${deletingExpense._id}`);
      toast.success('Expense deleted!');
      setDeletingExpense(null);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete expense');
    } finally {
      setActionLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (expenses.length === 0) {
      toast.info('No expenses available to export');
      return;
    }

    const headers = ['Title', 'Amount (INR)', 'Category', 'Date', 'Payment Method', 'Description'];
    const rows = expenses.map((exp) => [
      `"${exp.title.replace(/"/g, '""')}"`,
      exp.amount,
      `"${exp.category}"`,
      `"${new Date(exp.date).toISOString().split('T')[0]}"`,
      `"${exp.paymentMethod}"`,
      `"${(exp.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinTrack_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Expenses exported to CSV successfully!');
  };

  // Calculate filtered totals
  const totalFilteredAmount = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header & Main Actions */}
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
            Expense Manager
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Search, filter, and review all your transactions with real-time totals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ fontSize: '0.88rem' }}
            title="Download CSV"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingExpense(null);
              setIsFormModalOpen(true);
            }}
            className="btn btn-primary"
            style={{ fontSize: '0.88rem' }}
          >
            <Plus size={18} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Fuzzy Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search expenses, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '38px' }}
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
              style={{ cursor: 'pointer' }}
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Dropdown */}
          <div>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="input-field"
              style={{ cursor: 'pointer' }}
            >
              <option value="All">All Payment Methods</option>
              {PAYMENT_METHODS.filter((m) => m !== 'All').map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Dropdown */}
          <div>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="input-field"
              style={{ cursor: 'pointer' }}
            >
              {DATE_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="input-field"
              style={{ cursor: 'pointer' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {selectedDateRange === 'custom' && (
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
                style={{ width: 'auto' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
                style={{ width: 'auto' }}
              />
            </div>
          </div>
        )}

        {/* Filter Summary & Reset Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{expenses.length}</strong> transactions
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-muted)' }}>
              Filtered Sum:{' '}
              <strong style={{ color: 'var(--accent-primary)', fontSize: '1rem' }}>
                ₹{totalFilteredAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>

          <button
            onClick={handleResetFilters}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
          >
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Expenses Table (Desktop) / Cards (Mobile) */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner text="Loading your records..." />
        ) : expenses.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div style={{ overflowX: 'auto', display: 'block' }} className="expenses-table-wrapper">
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '0.92rem',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-glass)',
                    }}
                  >
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Title</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Payment</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr
                      key={expense._id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background-color 0.15s ease',
                      }}
                      className="expense-table-row"
                    >
                      <td style={{ padding: '1.1rem 1.5rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{expense.title}</div>
                        {expense.description && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {expense.description}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1.1rem 1.5rem' }}>
                        <span className="badge badge-indigo">{expense.category}</span>
                      </td>
                      <td style={{ padding: '1.1rem 1.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CreditCard size={15} color="var(--text-muted)" />
                          {expense.paymentMethod}
                        </span>
                      </td>
                      <td style={{ padding: '1.1rem 1.5rem', color: 'var(--text-secondary)' }}>
                        {new Date(expense.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td
                        style={{
                          padding: '1.1rem 1.5rem',
                          textAlign: 'right',
                          fontWeight: 700,
                          fontSize: '1.05rem',
                          fontFamily: "'Outfit', sans-serif",
                          color: 'var(--text-primary)',
                        }}
                      >
                        ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '1.1rem 1.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              setEditingExpense(expense);
                              setIsFormModalOpen(true);
                            }}
                            title="Edit Expense"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '8px',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingExpense(expense)}
                            title="Delete Expense"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '8px',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-rose)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div
            style={{
              padding: '4rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              color: 'var(--text-muted)',
            }}
          >
            <Receipt size={40} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>No Matching Expenses Found</h3>
            <p style={{ maxWidth: '400px', fontSize: '0.9rem' }}>
              Try adjusting your search criteria, clearing the filters, or recording a new expense.
            </p>
            <button
              onClick={() => {
                setEditingExpense(null);
                setIsFormModalOpen(true);
              }}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>Record Expense</span>
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      <ExpenseFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleSaveExpense}
        initialData={editingExpense}
        categories={categories}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleDeleteExpense}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${deletingExpense?.title}" for ₹${deletingExpense?.amount}? This record cannot be recovered.`}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default Expenses;
