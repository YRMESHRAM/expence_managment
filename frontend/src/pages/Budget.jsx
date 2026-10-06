import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Calendar,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import KPICard from '../components/common/KPICard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const Budget = () => {
  const toast = useToast();
  const currentDate = new Date();

  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [budgetInfo, setBudgetInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set budget form state
  const [budgetInput, setBudgetInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/budget', {
        params: { month: selectedMonth, year: selectedYear },
      });
      if (res.data?.data) {
        setBudgetInfo(res.data.data);
        if (res.data.data.budgetAmount) {
          setBudgetInput(res.data.data.budgetAmount.toString());
        } else {
          setBudgetInput('');
        }
      }
    } catch (err) {
      console.error('Failed to load budget:', err);
      toast.error('Failed to load budget details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [selectedMonth, selectedYear]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(budgetInput);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid budget limit greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/api/budget', {
        month: selectedMonth,
        year: selectedYear,
        amount: amountNum,
      });
      toast.success('Monthly budget updated successfully!');
      fetchBudget();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set budget');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving budget analysis..." />;
  }

  const budget = budgetInfo?.budgetAmount || 0;
  const spent = budgetInfo?.spent || 0;
  const remaining = budget > spent ? budget - spent : 0;
  const overspent = spent > budget ? spent - budget : 0;
  const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const isWarning = percentage >= 80 && percentage < 100;
  const isExceeded = percentage >= 100;

  // Calculate days remaining in the selected month
  const totalDaysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const currentDay = currentDate.getDate();
  const isCurrentMonth = selectedMonth === currentDate.getMonth() + 1 && selectedYear === currentDate.getFullYear();
  const daysRemaining = isCurrentMonth ? Math.max(1, totalDaysInMonth - currentDay) : totalDaysInMonth;
  const dailyAllowance = remaining > 0 ? (remaining / daysRemaining).toFixed(0) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header & Month Picker */}
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
            Budget Planning & Control
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Set spending caps, analyze utilization, and maintain discipline.
          </p>
        </div>

        {/* Month & Year Selectors */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            className="input-field"
            style={{ width: 'auto', minWidth: '140px', cursor: 'pointer' }}
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="input-field"
            style={{ width: 'auto', minWidth: '100px', cursor: 'pointer' }}
          >
            {[2024, 2025, 2026, 2027].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Budget Grid: Gauge & Input Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Visual Gauge Card */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear} Status
              </h2>
              {isExceeded ? (
                <span className="badge badge-rose">
                  <AlertOctagon size={14} /> Exceeded ({percentage}%)
                </span>
              ) : isWarning ? (
                <span className="badge badge-amber">
                  <AlertTriangle size={14} /> Warning ({percentage}%)
                </span>
              ) : budget > 0 ? (
                <span className="badge badge-emerald">
                  <CheckCircle size={14} /> On Target ({percentage}%)
                </span>
              ) : (
                <span className="badge badge-indigo">Unset</span>
              )}
            </div>

            {/* Visual Gauge / Circular Stats */}
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  fontFamily: "'Outfit', sans-serif",
                  background: isExceeded
                    ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
                    : isWarning
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {percentage}%
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {budget > 0
                  ? `₹${spent.toLocaleString('en-IN')} of ₹${budget.toLocaleString('en-IN')} allocated`
                  : 'No budget defined for this month'}
              </div>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '14px',
                backgroundColor: 'var(--bg-input)',
                borderRadius: '999px',
                overflow: 'hidden',
                margin: '1rem 0 1.5rem',
                border: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(percentage, 100)}%`,
                  background: isExceeded
                    ? 'linear-gradient(90deg, #f43f5e, #e11d48)'
                    : isWarning
                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                    : 'var(--gradient-primary)',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>

          {/* Warning / Notification Banners */}
          {isExceeded && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                fontSize: '0.88rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertOctagon size={18} />
              <span>🚨 You have exceeded your monthly budget by ₹{overspent.toLocaleString('en-IN')}!</span>
            </div>
          )}

          {isWarning && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fbbf24',
                fontSize: '0.88rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertTriangle size={18} />
              <span>⚠️ You have used {percentage}% of your monthly budget. Slow down on non-essentials.</span>
            </div>
          )}
        </div>

        {/* Set / Update Budget Form Card */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, marginBottom: '0.5rem' }}>
              Set Monthly Limit
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Define the maximum amount you want to spend in {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.
            </p>

            <form onSubmit={handleSaveBudget} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                  Budget Limit (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 35000"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  onKeyDown={(e) => {
                    // Block minus sign and 'e' (scientific notation)
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
                  className="input-field"
                  style={{ fontSize: '1.1rem', fontWeight: 600 }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ padding: '0.85rem', fontSize: '0.95rem' }}
              >
                {submitting ? (
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <span>Save Monthly Budget</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Daily Recommended Spend Advice */}
          {budget > 0 && remaining > 0 && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.88rem' }}>
                <ShieldCheck size={18} />
                <span>Recommended Daily Allowance</span>
              </div>
              <div style={{ marginTop: '0.4rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ₹{parseInt(dailyAllowance).toLocaleString('en-IN')}{' '}
                <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                  / day ({daysRemaining} days left)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Period Aggregations Grid */}
      {budgetInfo?.periods && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <KPICard
            title="Today"
            amount={budgetInfo.periods.day}
            subtitle="Expenses recorded today"
            color="amber"
          />
          <KPICard
            title="This Week"
            amount={budgetInfo.periods.week}
            subtitle="Current calendar week"
            color="indigo"
          />
          <KPICard
            title="This Quarter"
            amount={budgetInfo.periods.quarterly}
            subtitle="Current 3-month cycle"
            color="cyan"
          />
          <KPICard
            title="This Year"
            amount={budgetInfo.periods.year}
            subtitle="Cumulative year-to-date"
            color="emerald"
          />
        </div>
      )}
    </div>
  );
};

export default Budget;
