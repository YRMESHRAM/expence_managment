import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  ArrowUpRight,
  AlertTriangle,
  AlertOctagon,
  CreditCard,
  Edit2,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import KPICard from '../components/common/KPICard';
import ExpenseFormModal from '../components/expenses/ExpenseFormModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    thisMonthExpenses: 0,
    thisWeekExpenses: 0,
    todayExpenses: 0,
    highestExpense: 0,
    averageExpense: 0,
    recentExpenses: [],
  });
  const [budgetData, setBudgetData] = useState(null);
  const [categories, setCategories] = useState([]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Dynamic time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, budgetRes, catRes] = await Promise.all([
        api.get('/api/reports/summary'),
        api.get('/api/budget'),
        api.get('/api/categories'),
      ]);

      if (summaryRes.data?.data) {
        setSummary(summaryRes.data.data);
      }
      if (budgetRes.data?.data) {
        setBudgetData(budgetRes.data.data);
      }
      if (catRes.data?.data) {
        setCategories(catRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Failed to refresh dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateOrUpdateExpense = async (data) => {
    try {
      setActionLoading(true);
      if (editingExpense) {
        await api.put(`/api/expenses/${editingExpense._id}`, data);
        toast.success('Expense updated successfully!');
      } else {
        await api.post('/api/expenses', data);
        toast.success('New expense added successfully!');
      }
      setIsAddModalOpen(false);
      setEditingExpense(null);
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deletingExpense) return;
    try {
      setActionLoading(true);
      await api.delete(`/api/expenses/${deletingExpense._id}`);
      toast.success('Expense removed successfully!');
      setDeletingExpense(null);
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete expense');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Crunching financial figures..." />;
  }

  const budget = budgetData?.budgetAmount || 0;
  const spent = summary.thisMonthExpenses || 0;
  const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const isWarning = percentage >= 80 && percentage < 100;
  const isExceeded = percentage >= 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Dynamic Greeting */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.95rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              letterSpacing: '-0.02em',
            }}
          >
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Member'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Here is your spending overview and monthly budget balance for today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsAddModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <KPICard
          title="Total Spent"
          amount={summary.totalExpenses}
          subtitle="All time logged expenses"
          icon={Wallet}
          color="indigo"
        />
        <KPICard
          title="This Month"
          amount={summary.thisMonthExpenses}
          subtitle={budget > 0 ? `${percentage}% of monthly budget` : 'No budget set yet'}
          icon={Calendar}
          color="cyan"
          trend={budget > 0 ? `${percentage}%` : null}
          trendPositive={percentage <= 80}
        />
        <KPICard
          title="This Week"
          amount={summary.thisWeekExpenses}
          subtitle="Current calendar week"
          icon={TrendingUp}
          color="emerald"
        />
        <KPICard
          title="Today's Spend"
          amount={summary.todayExpenses}
          subtitle="Expenses recorded today"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Budget Tracker Widget */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Monthly Budget Tracker</h2>
              {isExceeded ? (
                <span className="badge badge-rose">
                  <AlertOctagon size={14} /> Exceeded
                </span>
              ) : isWarning ? (
                <span className="badge badge-amber">
                  <AlertTriangle size={14} /> 80% Threshold
                </span>
              ) : budget > 0 ? (
                <span className="badge badge-emerald">On Track</span>
              ) : (
                <span className="badge badge-indigo">Not Set</span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              {budget > 0
                ? `Spent ₹${spent.toLocaleString('en-IN')} of your ₹${budget.toLocaleString('en-IN')} limit.`
                : 'Set a monthly budget to monitor savings and receive proactive alerts.'}
            </p>
          </div>

          <Link to="/budget" className="btn btn-secondary" style={{ fontSize: '0.88rem', padding: '0.55rem 1rem' }}>
            <span>Manage Budget</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Warning / Alert Notifications */}
        {isExceeded && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              borderRadius: '12px',
              color: '#fb7185',
              fontSize: '0.92rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertOctagon size={20} />
            <span>🚨 You have exceeded your monthly budget! Review your spending habits.</span>
          </div>
        )}

        {isWarning && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '12px',
              color: '#fbbf24',
              fontSize: '0.92rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertTriangle size={20} />
            <span>⚠️ You have used {percentage}% of your monthly budget. Watch out for discretionary spends.</span>
          </div>
        )}

        {/* Visual Progress Bar */}
        <div style={{ marginTop: '0.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span>Spent: ₹{spent.toLocaleString('en-IN')}</span>
            <span>
              {budget > 0 ? `${Math.min(percentage, 100)}% Used` : 'No Limit'}
            </span>
            <span>Target: ₹{budget > 0 ? budget.toLocaleString('en-IN') : '0'}</span>
          </div>

          <div
            style={{
              width: '100%',
              height: '14px',
              backgroundColor: 'var(--bg-input)',
              borderRadius: '999px',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid var(--border-color)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(percentage, 100)}%`,
                borderRadius: '999px',
                background: isExceeded
                  ? 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)'
                  : isWarning
                  ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                  : 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                boxShadow: isExceeded
                  ? '0 0 12px rgba(244, 63, 94, 0.6)'
                  : isWarning
                  ? '0 0 12px rgba(245, 158, 11, 0.6)'
                  : '0 0 12px rgba(99, 102, 241, 0.5)',
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Expenses List with Quick Edit / Delete */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Recent Transactions</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
              Your most recent expense logs and purchases.
            </p>
          </div>

          <Link to="/expenses" className="btn btn-secondary" style={{ fontSize: '0.88rem', padding: '0.55rem 1rem' }}>
            <span>View All Expenses</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {summary.recentExpenses && summary.recentExpenses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {summary.recentExpenses.map((expense) => (
              <div
                key={expense._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: '14px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s ease',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '220px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(99, 102, 241, 0.12)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {expense.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <span className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>
                        {expense.category}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(expense.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>• {expense.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <span
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => {
                        setEditingExpense(expense);
                        setIsAddModalOpen(true);
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '3rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Sparkles size={36} color="var(--accent-primary)" />
            <p style={{ fontSize: '0.95rem' }}>No expenses logged yet. Click "Add Expense" to start!</p>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      <ExpenseFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleCreateOrUpdateExpense}
        initialData={editingExpense}
        categories={categories}
        isLoading={actionLoading}
      />

      {/* Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        message={`Are you sure you want to delete "${deletingExpense?.title}" of ₹${deletingExpense?.amount}?`}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default Dashboard;
