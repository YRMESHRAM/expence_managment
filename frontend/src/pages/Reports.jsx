import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
  Calendar,
  Wallet,
  TrendingUp,
  Award,
} from 'lucide-react';
import KPICard from '../components/common/KPICard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Reports = () => {
  const toast = useToast();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState('all');

  const [summaryData, setSummaryData] = useState({
    totalExpenses: 0,
    thisMonthExpenses: 0,
    highestExpense: 0,
    averageExpense: 0,
  });

  const [categoryData, setCategoryData] = useState([]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [sumRes, catRes] = await Promise.all([
        api.get('/api/reports/summary'),
        api.get('/api/reports/category', { params: { dateRange: selectedDateRange } }),
      ]);

      if (sumRes.data?.data) {
        setSummaryData(sumRes.data.data);
      }
      if (catRes.data?.data) {
        setCategoryData(catRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast.error('Failed to load analytical reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedDateRange]);

  // Chart.js Theme aware colors
  const textColor = isDark ? '#94a3b8' : '#64748b';

  // Category Doughnut chart configuration
  const categoryPalette = [
    '#6366f1',
    '#8b5cf6',
    '#06b6d4',
    '#10b981',
    '#f59e0b',
    '#f43f5e',
    '#ec4899',
    '#3b82f6',
    '#14b8a6',
    '#84cc16',
  ];

  const doughnutConfig = {
    labels: categoryData.map((c) => c.category),
    datasets: [
      {
        data: categoryData.map((c) => c.total),
        backgroundColor: categoryPalette.slice(0, categoryData.length),
        borderColor: isDark ? '#111625' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          padding: 14,
          font: { family: 'Inter', size: 12 },
          boxWidth: 14,
          boxHeight: 14,
          borderRadius: 4,
          useBorderRadius: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            return ` ₹${val.toLocaleString('en-IN')}`;
          },
        },
      },
    },
    cutout: '68%',
  };

  if (loading) {
    return <LoadingSpinner text="Generating analytical graphs..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.95rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
          Analytics & Insights
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Visual breakdowns, spending habits, and historical financial trends.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <KPICard
          title="Total Expenditure"
          amount={summaryData.totalExpenses}
          subtitle="All transactions recorded"
          icon={Wallet}
          color="indigo"
        />
        <KPICard
          title="Current Month"
          amount={summaryData.thisMonthExpenses}
          subtitle="Spend logged this month"
          icon={Calendar}
          color="cyan"
        />
        <KPICard
          title="Highest Transaction"
          amount={summaryData.highestExpense}
          subtitle="Single maximum expense"
          icon={Award}
          color="rose"
        />
        <KPICard
          title="Average Transaction"
          amount={summaryData.averageExpense}
          subtitle="Mean amount per expense"
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Category Breakdown Doughnut Chart */}
      <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Expenses by Category</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Distribution and proportional category split
            </p>
          </div>

          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.82rem', cursor: 'pointer' }}
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarterly">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <div style={{ height: '340px', width: '100%', position: 'relative' }}>
          {categoryData.length > 0 ? (
            <Doughnut data={doughnutConfig} options={doughnutOptions} />
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
              }}
            >
              No categories logged in this timeframe.
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Table / Detailed Breakdown */}
      {categoryData.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Detailed Category Allocations
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {categoryData.map((cat, idx) => (
              <div
                key={cat.category}
                style={{
                  padding: '1.2rem',
                  borderRadius: '14px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '4px',
                        backgroundColor: categoryPalette[idx % categoryPalette.length],
                      }}
                    />
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {cat.category}
                    </span>
                  </div>
                  <span className="badge badge-indigo">{cat.percentage}%</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                    ₹{cat.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {cat.count} {cat.count === 1 ? 'transaction' : 'transactions'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
